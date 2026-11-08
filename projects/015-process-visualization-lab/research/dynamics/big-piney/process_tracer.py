"""Rebuild and check the offline Big Piney replay against the archived USGS data."""

import argparse
import csv
import hashlib
import json
import math
import xml.etree.ElementTree as ET
from collections import defaultdict
from datetime import datetime
from decimal import Decimal
from pathlib import Path


HERE = Path(__file__).resolve().parent
ASSET = HERE.parents[2] / "app/data/river-big-piney-dynamic.json"
CATALOG = "https://doi.org/10.5066/P14DAOJF"
CSV_URL = "https://www.sciencebase.gov/catalog/file/get/68519976d4be027dac17ddd1?f=__disk__60%2F40%2F91%2F6040912b0f880057e48b51dca8d05c79265cc5a0"
XML_URL = "https://data.usgs.gov/datacatalog/metadata/USGS.68519976d4be027dac17ddd1.xml"
RELEASE_MINUTE = datetime.fromisoformat("2021-08-25T15:07:00")
CADENCE = 30
DISTANCES = {"1": 1485, "2": 2650, "3": 3670}
BANKS = {"LB": "left", "RB": "right"}
SIGNAL_THRESHOLD = 3
SIGNAL_COUNT = 3


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def lon_lat(easting, northing):
    # Inverse Transverse Mercator series, Snyder USGS PP 1395, equations 8-17 to 8-26.
    # NAD83 UTM zone 15N parameters (EPSG:26915), then geographic NAD83 to
    # WGS84 (EPSG:1188, zero offset, nominal 4 m accuracy).
    semi_major = 6_378_137
    flattening = 1 / 298.257222101
    eccentricity_sq = flattening * (2 - flattening)
    eccentricity_prime_sq = eccentricity_sq / (1 - eccentricity_sq)
    utm_scale = 0.9996
    meridian = northing / utm_scale
    mu = meridian / (semi_major * (1 - eccentricity_sq / 4 - 3 * eccentricity_sq**2 / 64 - 5 * eccentricity_sq**3 / 256))
    root = math.sqrt(1 - eccentricity_sq)
    e1 = (1 - root) / (1 + root)
    footpoint = (mu + (3 * e1 / 2 - 27 * e1**3 / 32) * math.sin(2 * mu)
                 + (21 * e1**2 / 16 - 55 * e1**4 / 32) * math.sin(4 * mu)
                 + 151 * e1**3 / 96 * math.sin(6 * mu) + 1097 * e1**4 / 512 * math.sin(8 * mu))
    sin_lat, cos_lat = math.sin(footpoint), math.cos(footpoint)
    tan_lat = math.tan(footpoint)
    curvature = 1 - eccentricity_sq * sin_lat**2
    prime_vertical = semi_major / math.sqrt(curvature)
    meridional_radius = semi_major * (1 - eccentricity_sq) / curvature**1.5
    c = eccentricity_prime_sq * cos_lat**2
    t = tan_lat**2
    d = (easting - 500_000) / (prime_vertical * utm_scale)
    lat = footpoint - prime_vertical * tan_lat / meridional_radius * (
        d**2 / 2 - (5 + 3*t + 10*c - 4*c**2 - 9*eccentricity_prime_sq) * d**4 / 24
        + (61 + 90*t + 298*c + 45*t**2 - 252*eccentricity_prime_sq - 3*c**2) * d**6 / 720
    )
    lon = -93 + math.degrees(
        (d - (1 + 2*t + c) * d**3 / 6
         + (5 - 2*c + 28*t - 3*c**2 + 8*eccentricity_prime_sq + 24*t**2) * d**5 / 120) / cos_lat
    )
    return lon, math.degrees(lat)


def find_sustained_signal(samples):
    count = 0
    for index, sample in enumerate(samples):
        if sample["elapsedSeconds"] >= 0 and sample["value"] >= SIGNAL_THRESHOLD:
            count += 1
            if count == SIGNAL_COUNT:
                return samples[index - count + 1]
        else:
            count = 0
    raise ValueError("Expected an observed sustained signal in every bank series")


def parse_source():
    csv_file = HERE / "raw/observations.csv"
    xml_file = HERE / "raw/metadata.xml"
    receipt = json.loads((HERE / "source-receipt.json").read_text(encoding="utf-8"))
    for name, path in [("csv", csv_file), ("metadata", xml_file)]:
        assert receipt[name]["sha256"] == digest(path), f"Archived {name} hash changed"
        assert receipt[name]["bytes"] == path.stat().st_size
    assert receipt["csv"]["url"] == CSV_URL and receipt["metadata"]["url"] == XML_URL
    metadata = ET.parse(xml_file).getroot()
    assert metadata.findtext(".//enttypl") == "BigPiney_RWTFluorometers.csv"
    assert any("15:07 CDT on August 25, 2021" in item.text for item in metadata.findall(".//procdesc"))
    positions, rows, clock = {}, defaultdict(list), {}
    with csv_file.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        assert reader.fieldnames == ["date", "time", "transect_ID", "bank_side", "easting_m",
                                     "northing_m", "distdnst_m", "hrs_pst_rel", "rwt_ppb", "turb_ntu"]
        for row in reader:
            key = row["transect_ID"], row["bank_side"]
            position = float(row["easting_m"]), float(row["northing_m"])
            assert int(row["distdnst_m"]) == DISTANCES[key[0]] and key[1] in BANKS
            assert positions.setdefault(key, position) == position, f"Station moved on line {reader.line_num}"
            stamp = datetime.strptime(row["date"] + " " + row["time"], "%m/%d/%Y %H:%M:%S")
            seconds = int((stamp - RELEASE_MINUTE).total_seconds())
            source_hours = Decimal(row["hrs_pst_rel"])
            assert abs(source_hours * 3600 - seconds) <= 18, f"Release clock mismatch on line {reader.line_num}"
            local_time = stamp.isoformat()
            assert clock.setdefault(seconds, local_time) == local_time and seconds % CADENCE == 0
            concentration, turbidity = float(row["rwt_ppb"]), float(row["turb_ntu"])
            assert math.isfinite(concentration) and concentration >= 0
            assert math.isfinite(turbidity) and turbidity >= 0
            samples = rows[key]
            if samples:
                assert seconds == samples[-1]["elapsedSeconds"] + CADENCE, f"Non-native cadence in {key}"
            samples.append({"elapsedSeconds": seconds, "value": concentration, "sourceLine": reader.line_num,
                            "localTime": local_time, "sourceElapsedHours": float(source_hours),
                            "turbidityNtu": turbidity})
    assert len(rows) == 6 and sum(map(len, rows.values())) == 21_575
    assert sorted(clock) == list(range(min(clock), max(clock) + CADENCE, CADENCE))
    assert all(samples[0]["elapsedSeconds"] == min(clock) for samples in rows.values())
    return positions, rows, clock, receipt


def build():
    positions, rows, clock, receipt = parse_source()
    transects = []
    for transect_id, distance in DISTANCES.items():
        banks = []
        for source_bank, bank in BANKS.items():
            key = transect_id, source_bank
            samples = rows[key]
            easting, northing = positions[key]
            lon, lat = lon_lat(easting, northing)
            baseline_max = max(sample["value"] for sample in samples if sample["elapsedSeconds"] < 0)
            assert baseline_max < SIGNAL_THRESHOLD
            banks.append({
                "id": f"t{transect_id}-{bank}", "bank": bank, "sourceBank": source_bank,
                "lat": round(lat, 9), "lon": round(lon, 9), "eastingM": easting, "northingM": northing,
                "coverage": {"startSeconds": samples[0]["elapsedSeconds"], "endSeconds": samples[-1]["elapsedSeconds"],
                             "samples": len(samples), "missingTicks": len(clock) - len(samples)},
                "baselineMax": baseline_max, "peak": max(samples, key=lambda sample: sample["value"]),
                "sustainedSignal": find_sustained_signal(samples), "samples": samples,
            })
        transects.append({"id": f"t{transect_id}", "label": f"断面 {transect_id}",
                          "sourceTransectId": int(transect_id), "distanceM": distance, "banks": banks})
    banks = [bank for transect in transects for bank in transect["banks"]]
    focus = {axis: round((min(bank[axis] for bank in banks) + max(bank[axis] for bank in banks)) / 2, 9)
             for axis in ("lat", "lon")}
    return {
        "schemaVersion": 1, "id": "big-piney-2021-tracer", "kind": "river",
        "title": "Big Piney 河实地染料示踪",
        "subtitle": "美国密苏里州 · 2021 年 8 月 · 三个下游断面、六支荧光计",
        "description": "在同一时钟下比较三个断面左右岸的罗丹明 WT 浓度，观察信号先后出现、达峰与回落。",
        "unit": "ppb", "focus": focus, "release": None,
        "clockOrigin": {"localTime": RELEASE_MINUTE.isoformat(), "approximate": True, "timezone": None},
        "cadenceSeconds": CADENCE, "plotRange": {"startSeconds": -600, "endSeconds": 21600},
        "signalRule": {"thresholdPpb": SIGNAL_THRESHOLD, "consecutiveSamples": SIGNAL_COUNT},
        "clock": [{"elapsedSeconds": seconds, "localTime": clock[seconds]} for seconds in sorted(clock)],
        "transects": transects,
        "processing": {
            "sourceCrs": "EPSG:26915", "displayCrs": "EPSG:4326",
            "coordinateTransform": "Inverse UTM zone 15N on GRS80 then EPSG:1188, nominal datum accuracy 4 m",
            "concentration": "Published USGS rwt_ppb, background fluorescence corrected and despiked by USGS",
            "elapsedClock": "CSV local datetime minus approximate release minute, checked against hrs_pst_rel rounding",
            "sampling": "Native exact samples; no temporal or spatial interpolation",
        },
        "sources": [
            {"name": "USGS · Big Piney 染料示踪数据发布", "url": CATALOG, "license": "CC0-1.0"},
            {"name": "USGS ScienceBase · 原始观测 CSV", **receipt["csv"]},
            {"name": "USGS · FGDC 元数据", **receipt["metadata"]},
        ],
        "limitations": [
            "这是实地控制示踪实验，观测值来自断面两岸附近的荧光计。标记高度与颜色为读数的编码，站间浓度没有连续观测。",
            "时间轴从 CSV 当地钟表时间减去文献所述约 15:07 的投放时刻，保留 30 秒采样顺序。源摘要与处理说明的时区标签不一致，未转换为 UTC。",
            "首次连续三次达到 3 ppb 的记录用于回放标记。3 ppb 高于六支仪器在投放前的最大记录 2.98 ppb；此规则不代表仪器检出限或染料首次到达。",
            "三处距离来自 USGS 发布记录。原文件未列明投放断面坐标，左右岸以面向下游判定。",
        ],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check existing output byte-for-byte without writing")
    args = parser.parse_args()
    asset = build()
    encoded = (json.dumps(asset, ensure_ascii=False, separators=(",", ":"), allow_nan=False) + "\n").encode("utf-8")
    if args.check:
        assert ASSET.read_bytes() == encoded, "Published river replay differs from the archived source"
    else:
        ASSET.write_bytes(encoded)
    assert len(asset["clock"]) == 3670
    print(f"Big Piney: 21,575 source observations, {len(asset['clock'])} ticks, six banks, SHA-256 {hashlib.sha256(encoded).hexdigest()}")


if __name__ == "__main__":
    main()
