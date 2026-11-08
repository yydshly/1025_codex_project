"""Build the Hualien data package from archived EarthScope GeoCSV counts."""

import csv
import hashlib
import json
import statistics
from datetime import datetime, timedelta, timezone
from pathlib import Path

DIRECTORY = Path(__file__).resolve().parent
PROJECT = DIRECTORY.parents[2]
RESEARCH_PATH = "research/dynamics/hualien/"
ASSET = PROJECT / "app/data/quake-hualien-dynamic.json"
SECOND = timedelta(seconds=1)


def time(value):
    value = value.strip()
    if value.endswith("Z"):
        return datetime.fromisoformat(value[:-1] + "+00:00")
    # Station text metadata uses UTC with four fractional digits and no suffix.
    return datetime.strptime(value, "%Y-%m-%dT%H:%M:%S.%f").replace(tzinfo=timezone.utc)


def iso(value):
    precision = "auto"
    if value.microsecond and value.microsecond % 1000 == 0:
        precision = "milliseconds"
    return value.isoformat(timespec=precision).replace("+00:00", "Z")


def epoch_ms(value):
    return datetime(1970, 1, 1, tzinfo=timezone.utc) + timedelta(milliseconds=value)


def text_rows(file):
    return [
        line.strip().split("|")
        for line in (DIRECTORY / file).read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.startswith("#")
    ]


def waveform_rows(file, station_id, channel):
    rows = []
    blocks = []
    for line_number, line in enumerate((DIRECTORY / file).read_text(encoding="utf-8").splitlines(), 1):
        if line.startswith("# dataset:"):
            blocks.append({"records": 0})
        if line.startswith("# "):
            if ":" in line:
                key, value = line[2:].split(":", 1)
                blocks[-1][key.strip()] = value.strip()
        elif line.strip() and not line.startswith("Time,"):
            timestamp, counts = next(csv.reader([line]))
            rows.append((time(timestamp), int(counts), line_number))
            blocks[-1]["records"] += 1
    assert rows and all(a[0] < b[0] for a, b in zip(rows, rows[1:])), station_id
    for block in blocks:
        assert block["SID"] == station_id.replace(".", "_"), station_id
        assert block["field_unit"] == "UTC, Counts", station_id
        assert block["records"] == int(block["sample_count"]), station_id
        assert float(block["sample_rate_hz"]) == float(channel[14]), station_id
        assert abs(float(block["latitude_deg"]) - float(channel[4])) < 1e-6, station_id
        assert abs(float(block["longitude_deg"]) - float(channel[5])) < 1e-6, station_id
    return rows


def window_sample(rows, start, baseline, rate):
    end = start + SECOND
    result = {
        "timeUtc": iso(end), "windowStartUtc": iso(start), "windowEndUtc": iso(end),
        "sampleCount": len(rows),
    }
    if not rows:
        return dict(result, value=None, min=None, max=None, peakTimeUtc=None,
                    rawValue=None, sourceLine=None, status="missing")
    peak = max(rows, key=lambda row: abs(row[1] - baseline))
    counts = [row[1] for row in rows]
    return dict(
        result, value=peak[1] - baseline, min=min(counts) - baseline, max=max(counts) - baseline,
        peakTimeUtc=iso(peak[0]), rawValue=peak[1], sourceLine=peak[2],
        firstSampleTimeUtc=iso(rows[0][0]), lastSampleTimeUtc=iso(rows[-1][0]),
        status="complete" if len(rows) == round(rate) else "partial",
    )


def build_station(code, channel, name, downloads, start, end, baseline_end):
    station_id = ".".join(channel[:4])
    file = "raw/" + station_id + ".geocsv"
    rows = [row for row in waveform_rows(file, station_id, channel) if start <= row[0] < end]
    assert rows and channel[:4] == ["IU", code, "00", "BHZ"]
    assert time(channel[15]) <= start and (not channel[16] or end <= time(channel[16]))
    rate = float(channel[14])
    baseline_values = [row[1] for row in rows if row[0] < baseline_end]
    assert len(baseline_values) >= rate * 30, station_id
    baseline = statistics.median(baseline_values)
    windows = [[] for _ in range((end - start) // SECOND)]
    for row in rows:
        windows[(row[0] - start) // SECOND].append(row)
    samples = [window_sample(window, start + i * SECOND, baseline, rate) for i, window in enumerate(windows)]
    gaps = []
    for a, b in zip(rows, rows[1:]):
        seconds = (b[0] - a[0]).total_seconds()
        if seconds > 1.5 / rate:
            gaps.append({"afterUtc": iso(a[0]), "beforeUtc": iso(b[0]), "durationSeconds": seconds - 1 / rate})
    source = downloads[file]
    return {
        "id": station_id, "name": name, "stationCode": code, "network": "IU", "location": "00",
        "lat": float(channel[4]), "lon": float(channel[5]), "channel": "BHZ", "unit": "counts",
        "sampleIntervalSeconds": 1, "nativeSampleRateHz": rate, "nativeSampleIntervalSeconds": 1 / rate,
        "baselineCounts": baseline, "baselineWindow": {
            "startUtc": iso(start), "endUtc": iso(baseline_end), "sampleCount": len(baseline_values),
            "method": "median of actual native counts in the 60-second pre-event window",
        },
        "valueMeaning": "Signed, actual baseline-subtracted sample of greatest absolute magnitude within the preceding second.",
        "normalization": "Independent per-station display scale only; no cross-station amplitude or intensity comparison.",
        "displayScaleMaxAbsCounts": max(abs(row[1] - baseline) for row in rows),
        "samples": samples, "rawSampleCount": len(rows), "firstRawTimeUtc": iso(rows[0][0]),
        "lastRawTimeUtc": iso(rows[-1][0]), "gaps": gaps,
        "partialWindowCount": sum(sample["status"] == "partial" for sample in samples),
        "emptyWindowCount": sum(sample["status"] == "missing" for sample in samples),
        "channelMetadata": {
            "elevationM": float(channel[6]), "sensorDepthM": float(channel[7]),
            "azimuthDegrees": float(channel[8]), "dipDegrees": float(channel[9]), "sensor": channel[10],
            "sensitivity": float(channel[11]), "sensitivityFrequencyHz": float(channel[12]),
            "sensitivityInputUnit": channel[13], "responseCorrectionApplied": False,
        },
        "sourceUrl": source["url"], "rawFile": RESEARCH_PATH + file,
        "rawSHA256": source["sha256"], "rawBytes": source["bytes"], "retrievedAtUtc": source["retrievedAtUtc"],
        "stationMetadataUrl": downloads["raw/channels.txt"]["url"],
        "stationMetadataSHA256": downloads["raw/channels.txt"]["sha256"],
    }


def main():
    receipt = json.loads((DIRECTORY / "fetch-results.json").read_text(encoding="utf-8"))
    downloads = {entry["file"]: entry for entry in receipt["results"]}
    for file, entry in downloads.items():
        body = (DIRECTORY / file).read_bytes()
        assert entry["status"] == 200 and len(body) == entry["bytes"], file
        assert hashlib.sha256(body).hexdigest() == entry["sha256"], file
    start, end = time(receipt["startUtc"]), time(receipt["endUtc"])
    baseline_end = start + 60 * SECOND
    event = json.loads((DIRECTORY / "raw/event-usgs.geojson").read_text(encoding="utf-8"))
    properties = event["properties"]
    origin = epoch_ms(properties["time"])
    lon, lat, depth = event["geometry"]["coordinates"]
    assert event["id"] == "us7000m9g4" and baseline_end < origin < end
    codes = receipt["stationCodes"]
    channels = {row[1]: row for row in text_rows("raw/channels.txt")}
    names = {row[1]: row[5] for row in text_rows("raw/stations.txt")}
    stations = [build_station(code, channels[code], names[code], downloads, start, end, baseline_end) for code in codes]
    assert len(stations) >= 2
    event_source = downloads["raw/event-usgs.geojson"]
    data = {
        "schemaVersion": 1, "id": "hualien-2024-observed-stations", "kind": "quake",
        "title": "2024年花莲地震 · 三站实测波形",
        "subtitle": "BHZ垂直通道 · 20／40 Hz原始计数 · 1秒窗包络",
        "description": "以同一时刻对照台北、仁川和松代三座台站的实测波形。每座台站采用自己的显示尺度。",
        "focus": {"lat": lat, "lon": lon},
        "startUtc": iso(start + SECOND), "endUtc": iso(end),
        "requestedStartUtc": iso(start), "requestedEndUtc": iso(end), "originUtc": iso(origin),
        "magnitude": properties["mag"], "magnitudeType": properties["magType"], "depthKm": depth,
        "eventSourceId": event["id"], "eventSourceUrl": properties["url"],
        "eventMetadataUrl": event_source["url"], "eventRawSHA256": event_source["sha256"],
        "eventUpdatedUtc": iso(epoch_ms(properties["updated"])), "retrievedAtUtc": receipt["retrievedAtUtc"],
        "stations": stations,
        "processing": {
            "kind": "derived one-second envelopes from observed digital waveform samples",
            "responseCorrectionApplied": False, "physicalUnitConversionApplied": False,
            "temporalInterpolation": False, "filterApplied": False,
            "baseline": "median of raw counts from 2024-04-02T23:57:00Z through the following 60 seconds, exclusive end",
            "windowSeconds": 1, "timeUtcMeaning": "exclusive window end",
            "value": "signed actual sample of largest absolute deviation from the pre-event median, first sample on a tie",
            "minMax": "observed minimum and maximum of the same one-second window, with the same baseline removed",
            "missingPolicy": "empty window null; partial window keeps actual samples and sampleCount",
            "display": "per-station normalization; marker size represents relative waveform amplitude at that station",
        },
        "sources": [
            {"name": "USGS · 花莲地震震源记录", "url": properties["url"]},
            {"name": "EarthScope · FDSN dataselect 原始波形", "url": "https://service.earthscope.org/fdsnws/dataselect/1/"},
            {"name": "EarthScope · FDSN station 台站元数据", "url": "https://service.earthscope.org/fdsnws/station/1/"},
            {"name": "FDSN · IU Global Seismograph Network", "url": "https://www.fdsn.org/networks/detail/IU/"},
        ],
        "limitations": [
            "数值为仪器原始计数减去震前60秒中位数。计数未经仪器响应校正，不能换算为地面运动或当地烈度。",
            "各站灵敏度和显示尺度独立，振幅大小只在同一台站的记录内对照。",
            "每个时刻对应刚结束的一秒窗，保留实际峰值样本、原始行号与最小—最大范围。实际样本数与原采样率不一致的窗标为不完整，空窗保留缺测。",
            "三座台站只使用BHZ垂直通道。记录未作专业削波评估或P波、S波到时判定。",
        ],
    }
    ASSET.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":"), allow_nan=False) + "\n", encoding="utf-8")
    print(ASSET.relative_to(PROJECT), ASSET.stat().st_size, hashlib.sha256(ASSET.read_bytes()).hexdigest())
    for station in stations:
        peak = max((sample for sample in station["samples"] if sample["value"] is not None), key=lambda sample: abs(sample["value"]))
        print(station["id"], "windows", len(station["samples"]), "raw", station["rawSampleCount"],
              "partial", station["partialWindowCount"], "missing", station["emptyWindowCount"],
              "peak window end", peak["timeUtc"], "peak counts", peak["value"])


if __name__ == "__main__":
    main()
