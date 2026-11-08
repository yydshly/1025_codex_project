"""Independently check each Hualien envelope against archived source samples."""

import csv
import hashlib
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from statistics import median

DIRECTORY = Path(__file__).resolve().parent
ASSET = DIRECTORY.parents[2] / "app/data/quake-hualien-dynamic.json"
SECOND = timedelta(seconds=1)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def parse(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def load_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def metadata(file):
    lines = (DIRECTORY / file).read_text(encoding="utf-8").splitlines()
    return {row[1]: row for row in csv.reader(lines[1:], delimiter="|")}


def source_samples(path, start, end):
    records = []
    with path.open(encoding="utf-8", newline="") as source:
        for line_no, row in enumerate(csv.reader(source), 1):
            if not row or row[0].startswith("#") or row[0] == "Time":
                continue
            timestamp, count = row
            time = parse(timestamp)
            if start <= time < end:
                records.append((time, int(count), line_no))
    return records


def verify_station(station, downloads, channel, station_row, start, end, origin):
    file = f"raw/{station['id']}.geocsv"
    source = source_samples(DIRECTORY / file, start, end)
    download = downloads[file]
    assert station["sourceUrl"] == download["url"] and station["rawSHA256"] == download["sha256"]
    assert station["rawBytes"] == download["bytes"]
    assert station["id"] == ".".join(channel[:4]) and station["name"] == station_row[5]
    assert station["lat"] == float(channel[4]) and station["lon"] == float(channel[5])
    assert station["nativeSampleRateHz"] == float(channel[14])
    assert station["sampleIntervalSeconds"] == 1 and station["unit"] == "counts"
    assert len(source) == station["rawSampleCount"]
    assert parse(station["firstRawTimeUtc"]) == source[0][0]
    assert parse(station["lastRawTimeUtc"]) == source[-1][0]
    assert all(first[0] < second[0] for first, second in zip(source, source[1:]))
    baseline_window = station["baselineWindow"]
    assert parse(baseline_window["startUtc"]) == start
    baseline_end = parse(baseline_window["endUtc"])
    assert baseline_end == start + 60 * SECOND and baseline_end < origin
    baseline_values = [value for time, value, _ in source if time < baseline_end]
    baseline = median(baseline_values)
    assert len(baseline_values) == baseline_window["sampleCount"] and baseline == station["baselineCounts"]

    cursor = partial = missing = 0
    left = start
    for window in station["samples"]:
        right = left + SECOND
        assert parse(window["windowStartUtc"]) == left
        assert parse(window["windowEndUtc"]) == parse(window["timeUtc"]) == right
        window_start = cursor
        while cursor < len(source) and source[cursor][0] < right:
            assert source[cursor][0] >= left
            cursor += 1
        records = source[window_start:cursor]
        left = right
        assert window["sampleCount"] == len(records)
        if not records:
            assert window["status"] == "missing"
            assert all(window[key] is None for key in ("value", "min", "max", "peakTimeUtc", "rawValue", "sourceLine"))
            missing += 1
            continue
        is_complete = len(records) == station["nativeSampleRateHz"]
        assert window["status"] == ("complete" if is_complete else "partial")
        partial += not is_complete
        assert parse(window["firstSampleTimeUtc"]) == records[0][0]
        assert parse(window["lastSampleTimeUtc"]) == records[-1][0]
        values = [value for _, value, _ in records]
        assert window["min"] + baseline == min(values) and window["max"] + baseline == max(values)
        peak_index = max(range(len(values)), key=lambda index: abs(values[index] - baseline))
        chosen_time, chosen_value, chosen_line = records[peak_index]
        assert parse(window["peakTimeUtc"]) == chosen_time and window["sourceLine"] == chosen_line
        assert window["rawValue"] == chosen_value and window["value"] + baseline == chosen_value

    assert cursor == len(source) and left == end
    assert partial == station["partialWindowCount"] and missing == station["emptyWindowCount"]
    assert station["displayScaleMaxAbsCounts"] == max(abs(value - baseline) for _, value, _ in source)
    peak = max(
        (window for window in station["samples"] if window["value"] is not None),
        key=lambda window: abs(window["value"]),
    )
    return {
        "id": station["id"], "nativeRateHz": station["nativeSampleRateHz"],
        "sourceSamples": len(source), "verifiedEnvelopeWindows": len(station["samples"]),
        "partialWindows": partial, "missingWindows": missing,
        "absolutePeak": {key: peak[key] for key in ("timeUtc", "peakTimeUtc", "value", "rawValue", "sourceLine")},
    }


def main():
    data = load_json(ASSET)
    receipt = load_json(DIRECTORY / "fetch-results.json")
    downloads = {item["file"]: item for item in receipt["results"]}
    for file, item in downloads.items():
        path = DIRECTORY / file
        assert item["status"] == 200 and path.stat().st_size == item["bytes"], file
        assert sha(path) == item["sha256"], file

    event = load_json(DIRECTORY / "raw/event-usgs.geojson")
    properties = event["properties"]
    lon, lat, depth = event["geometry"]["coordinates"]
    start, end, origin = (parse(data[key]) for key in ("requestedStartUtc", "requestedEndUtc", "originUtc"))
    assert (start, end) == (parse(receipt["startUtc"]), parse(receipt["endUtc"]))
    assert parse(data["startUtc"]) == start + SECOND and parse(data["endUtc"]) == end
    assert data["eventSourceId"] == event["id"] == "us7000m9g4"
    assert data["eventSourceUrl"] == properties["url"]
    assert data["eventRawSHA256"] == downloads["raw/event-usgs.geojson"]["sha256"]
    assert origin - datetime(1970, 1, 1, tzinfo=timezone.utc) == timedelta(milliseconds=properties["time"])
    assert data["focus"] == {"lat": lat, "lon": lon} and data["depthKm"] == depth
    assert data["magnitude"] == properties["mag"] and data["magnitudeType"] == properties["magType"]

    channels, stations = metadata("raw/channels.txt"), metadata("raw/stations.txt")
    assert [station["stationCode"] for station in data["stations"]] == receipt["stationCodes"]
    checks = [
        verify_station(station, downloads, channels[code], stations[code], start, end, origin)
        for station in data["stations"]
        for code in [station["stationCode"]]
    ]
    report = {
        "status": "passed", "assetSHA256": sha(ASSET), "sourceFilesVerified": len(downloads),
        "eventMetadata": "matched archived USGS GeoJSON",
        "stationMetadata": "matched archived EarthScope station and channel responses",
        "verifiedAtUtc": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "totalVerifiedRawSamples": sum(check["sourceSamples"] for check in checks),
        "totalVerifiedEnvelopes": sum(check["verifiedEnvelopeWindows"] for check in checks),
        "stations": checks,
    }
    serialized = json.dumps(report, indent=2) + "\n"
    (DIRECTORY / "verification.json").write_text(serialized, encoding="utf-8")
    print(serialized, end="")


if __name__ == "__main__":
    main()
