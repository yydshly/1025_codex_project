"""Build the San Francisco replay from the archived NOAA and JPL responses."""

import argparse
import csv
import hashlib
import io
import json
import math
import re
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path
from urllib.parse import parse_qs, urlparse


BASE = Path(__file__).resolve().parent
PROJECT = BASE.parents[2]
OUTPUT = PROJECT / "app" / "data" / "tide-san-francisco-dynamic.json"
DAY = datetime(2025, 1, 15, tzinfo=timezone.utc)
SITE = {"lat": 37.806305, "lon": -122.46589}
STATION_ID = "9414290"
CADENCE = 360
AU_KM = Decimal("149597870.700")


def require(condition, message):
    if not condition:
        raise ValueError(message)


def iso(value):
    return value.isoformat(timespec="seconds").replace("+00:00", "Z")


def normalize_noaa_time(value):
    return iso(datetime.fromisoformat(value).replace(tzinfo=timezone.utc))


def optional_number(raw):
    if raw is None or not str(raw).strip():
        return None
    value = float(raw)
    require(math.isfinite(value), "Nonfinite value in NOAA response")
    return value


def load_sources():
    receipts = json.loads((BASE / "sources.json").read_bytes())
    bodies = {}
    for key in ("noaa-station", "noaa-observed", "noaa-predicted", "jpl-moon"):
        source = receipts[key]
        path = BASE / "raw" / (key + ".json")
        raw = path.read_bytes()
        require(source["status"] == 200 and source["file"] == path.relative_to(PROJECT).as_posix(), f"Invalid receipt: {key}")
        require(len(raw) == source["bytes"] and hashlib.sha256(raw).hexdigest() == source["sha256"], f"Archive hash mismatch: {key}")
        bodies[key] = json.loads(raw)
    for key, product in (("noaa-observed", "water_level"), ("noaa-predicted", "predictions")):
        params = parse_qs(urlparse(receipts[key]["url"]).query)
        expected = {"begin_date": "20250115", "end_date": "20250115", "station": STATION_ID,
                    "datum": "MLLW", "time_zone": "gmt", "units": "metric", "product": product}
        if product == "predictions":
            expected["interval"] = "6"
        require(all(params.get(name) == [value] for name, value in expected.items()), f"Unexpected NOAA query: {key}")
    return bodies, receipts


def noaa_tides(bodies):
    station, = bodies["noaa-station"]["stations"]
    observed = bodies["noaa-observed"]
    require(station["id"] == STATION_ID and station["lat"] == SITE["lat"] and station["lng"] == SITE["lon"],
            "Unexpected NOAA station or coordinates")
    require(observed["metadata"]["id"] == STATION_ID, "Observed tides are from the wrong station")
    return [
        {"timeUtc": normalize_noaa_time(row["t"]), "value": optional_number(row["v"]),
         "quality": row["q"], "flags": row["f"], "sigmaM": optional_number(row["s"]), "sourceRow": index}
        for index, row in enumerate(observed["data"], 1)
    ], [
        {"timeUtc": normalize_noaa_time(row["t"]), "value": optional_number(row["v"]), "sourceRow": index}
        for index, row in enumerate(bodies["noaa-predicted"]["predictions"], 1)
    ], station


def lunar_ephemeris(payload):
    require(payload["signature"]["source"] == "NASA/JPL Horizons API", "Unexpected ephemeris source")
    header, remainder = payload["result"].split("$$SOE", maxsplit=1)
    records, _ = remainder.split("$$EOE", maxsplit=1)
    longitude, latitude, altitude = (float(value) for value in re.search(r"Center geodetic\s*:\s*(\S+),(\S+),(\S+)\s+\{", header).groups())
    require(math.isclose(longitude - 360, SITE["lon"], abs_tol=1e-8) and latitude == SITE["lat"] and abs(altitude) < 1e-8,
            "Horizons observer coordinates differ from NOAA station")
    require(re.search(r"Target body name:\s*Moon \(301\).*\{source: DE441\}", header)
            and re.search(r"Center body name:\s*Earth \(399\)", header)
            and re.search(r"Step-size\s*:\s*6 minutes", header)
            and re.search(r"Atmos refraction:\s*NO \(AIRLESS\)", header)
            and "1 au= 149597870.700 km" in header
            and "Date__(UT)__HR:MN, , ,Azi_(a-app), Elev_(a-app),      Illu%,             delta,     deldot" in header,
            "Unexpected Horizons ephemeris format or calculation settings")
    result = []
    for index, row in enumerate(csv.reader(io.StringIO(records.strip())), 1):
        time, solar, lunar, azimuth, elevation, illumination, distance, range_rate, _ = (item.strip() for item in row)
        require(time.startswith("2025-Jan-15 "), "Unexpected Horizons date")
        distance_au = Decimal(distance)
        result.append({
            "timeUtc": normalize_noaa_time(time.replace("2025-Jan-15", "2025-01-15")),
            "azimuthDeg": float(azimuth),
            "elevationDeg": float(elevation),
            "illuminationPct": float(illumination),
            "rangeAu": float(distance_au),
            "rangeKm": float(distance_au * AU_KM),
            "rangeRateKmPerSec": float(range_rate),
            "solarFlag": solar,
            "lunarFlag": lunar,
            "sourceRow": index,
        })
    require(all(0 <= row["azimuthDeg"] < 360 and -90 <= row["elevationDeg"] <= 90
                and 0 <= row["illuminationPct"] <= 100 and row["rangeKm"] > 0
                and math.isfinite(row["rangeRateKmPerSec"]) for row in result), "Invalid lunar ephemeris value")
    return result


def derive_moments(observed, predicted, moon):
    result = {}
    for label, rows in (("observed", observed), ("predicted", predicted)):
        valid = [row for row in rows if row["value"] is not None]
        for name, select in (("Min", min), ("Max", max)):
            row = select(valid, key=lambda item: item["value"])
            result[label + name] = {"timeUtc": row["timeUtc"], "valueM": row["value"]}
    maximum = max(moon, key=lambda row: row["elevationDeg"])
    result["moonMaxElevation"] = {"timeUtc": maximum["timeUtc"], "elevationDeg": maximum["elevationDeg"]}
    for before, after in zip(moon, moon[1:]):
        if (before["elevationDeg"] >= 0) == (after["elevationDeg"] >= 0):
            continue
        key = "moonRiseBracket" if after["elevationDeg"] >= 0 else "moonSetBracket"
        require(key not in result, f"Unexpected second horizon crossing: {key}")
        result[key] = {
            "fromUtc": before["timeUtc"], "toUtc": after["timeUtc"],
            "fromElevationDeg": before["elevationDeg"], "toElevationDeg": after["elevationDeg"],
        }
    return result


def build():
    bodies, receipts = load_sources()
    observed, predicted, station = noaa_tides(bodies)
    moon = lunar_ephemeris(bodies["jpl-moon"])
    clock = [{"timeUtc": iso(DAY + timedelta(seconds=CADENCE * index))} for index in range(240)]
    expected = [row["timeUtc"] for row in clock]
    for channel, rows in (("observed", observed), ("predicted", predicted), ("moon", moon)):
        require([row["timeUtc"] for row in rows] == expected, f"Clock alignment failed: {channel}")
    require(all(row["quality"] == "v" and row["flags"] == "0,0,0,0" and row["value"] is not None
                and row["sigmaM"] is not None and row["sigmaM"] >= 0 for row in observed), "Unexpected NOAA observation quality")
    require(all(row["value"] is not None for row in predicted), "Missing NOAA prediction")
    names = {
        "noaa-observed": "NOAA CO-OPS · 验证实测水位",
        "noaa-predicted": "NOAA CO-OPS · 调和潮汐预报",
        "jpl-moon": "NASA/JPL Horizons · 站点月球星历",
        "noaa-station": "NOAA CO-OPS · 旧金山验潮站元数据",
    }
    return {
        "schemaVersion": 1,
        "id": "san-francisco-2025-01-15-tide",
        "kind": "tide",
        "title": "旧金山港 · 月球与潮位",
        "subtitle": "2025 年 1 月 15 日 UTC · NOAA 9414290 验潮站 · 六分钟记录",
        "description": "在旧金山验潮站看月球沿天际移动，并用同一时间轴对照 NOAA 实测水位和潮汐预报。",
        "focus": SITE,
        "station": {"id": STATION_ID, "name": station["name"], **SITE, "timezone": "America/Los_Angeles"},
        "datum": "MLLW",
        "unit": "m",
        "cadenceSeconds": CADENCE,
        "startUtc": expected[0],
        "endUtc": expected[-1],
        "clock": clock,
        "moon": moon,
        "series": [
            {"id": "observed", "label": "NOAA 实测潮位", "unit": "m", "datum": "MLLW",
             "method": "CO-OPS water_level 验证实测，六分钟采样，保留 NOAA 质控标记。", "samples": observed},
            {"id": "predicted", "label": "NOAA 潮汐预报", "unit": "m", "datum": "MLLW",
             "method": "CO-OPS predictions 调和潮汐预报，六分钟输出。", "samples": predicted},
        ],
        "moments": derive_moments(observed, predicted, moon),
        "processing": {
            "alignment": "exact 6-minute UTC timestamps",
            "ephemeris": "NASA/JPL Horizons DE441 topocentric airless apparent azimuth and elevation",
            "horizonsApiVersion": bodies["jpl-moon"]["signature"]["version"],
            "referenceHeightKm": 0,
            "astronomicalUnitKm": float(AU_KM),
            "extrema": "minimum and maximum of the archived six-minute samples",
            "horizonCrossings": "consecutive samples on opposite sides of geometric elevation 0 degrees",
        },
        "limitations": [
            "三条记录按相同 UTC 时刻并列。NOAA 水位实测与调和潮汐预报均采用当地平均较低低潮面 MLLW，单位为米。",
            "月球方向来自 JPL 星历计算，站点参考高度取 0 km。高度为无大气折射的站心视高度，地平线取 0°，不含地形、建筑遮挡或实际可见性。",
            "月出月落只标注跨越 0° 的相邻六分钟刻度。潮位极值仅指本日六分钟样本中的最低和最高读数。",
            "验潮站水位代表单站。预报差值会受多种因素影响，单日并列记录不能分解局地水位成因。",
        ],
        "sources": [{"id": key, "name": name, **receipts[key]} for key, name in names.items()],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check output byte for byte without rewriting it")
    args = parser.parse_args()
    data = build()
    output = (json.dumps(data, ensure_ascii=False, separators=(",", ":"), allow_nan=False) + "\n").encode("utf-8")
    if args.check:
        require(OUTPUT.read_bytes() == output, f"Published packet differs from archived replay: {OUTPUT.name}")
    else:
        OUTPUT.write_bytes(output)
    print(f"San Francisco: {len(data['clock'])} aligned UTC ticks, 240 observed + 240 predicted + 240 ephemeris, SHA-256 {hashlib.sha256(output).hexdigest()}")
    print(json.dumps(data["moments"], ensure_ascii=False))


if __name__ == "__main__":
    main()
