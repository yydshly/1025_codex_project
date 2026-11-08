"""Extract unchanged UHSLC station 329B hourly readings; no interpolation.

Run from any directory with Python 3. The downloaded files sit beside this script.
"""
import csv
import hashlib
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
UTC = timezone.utc
HKT = timezone(timedelta(hours=8))
START = datetime(2018, 9, 6, 12, tzinfo=UTC)
END = datetime(2018, 9, 17, 18, tzinfo=UTC)
PRIORITY_START = datetime(2018, 9, 14, 16, tzinfo=UTC)
PRIORITY_END = datetime(2018, 9, 17, 16, tzinfo=UTC)


def iso(value):
    return value.isoformat(timespec="seconds").replace("+00:00", "Z")


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


raw_path = HERE / "uhslc-h329b.csv"
records, excerpt = [], []
for line_number, raw in enumerate(raw_path.read_text(encoding="utf-8-sig").splitlines(), 1):
    year, month, day, hour, value = map(int, next(csv.reader([raw])))
    stamp = datetime(year, month, day, hour, tzinfo=UTC)
    if START <= stamp <= END:
        missing = value in (-9999, 9999)
        records.append({
            "timeUtc": iso(stamp),
            "timeHkt": iso(stamp.astimezone(HKT)),
            "seaLevelMm": None if missing else value,
            "seaLevelM": None if missing else value / 1000,
            "status": "missing" if missing else "reported",
            "sourceLine": line_number,
            "sourceValueToken": str(value),
        })
        excerpt.append(raw)

assert len(records) == int((END - START).total_seconds() / 3600) + 1
stamps = [datetime.fromisoformat(r["timeUtc"].replace("Z", "+00:00")) for r in records]
assert all(b - a == timedelta(hours=1) for a, b in zip(stamps, stamps[1:]))
assert len({r["timeUtc"] for r in records}) == len(records)
record_by_time = {r["timeUtc"]: r for r in records}
priority = [r for r, stamp in zip(records, stamps) if PRIORITY_START <= stamp < PRIORITY_END]

erddap_path = HERE / "uhslc-erddap-quarry-bay-20180915-17-hkt.csv"
with erddap_path.open(encoding="utf-8-sig", newline="") as handle:
    source_reader = csv.DictReader(handle)
    units = next(source_reader)
    reference_rows = list(source_reader)
differences = []
for row in reference_rows:
    primary = record_by_time[row["time"]]
    if primary["seaLevelMm"] != int(row["sea_level"]):
        differences.append({"timeUtc": row["time"], "primaryCsvMm": primary["seaLevelMm"], "erddapMm": int(row["sea_level"])})
assert len(reference_rows) == len(priority) == 72
assert all(row["reference_datum"] == "station zero" and row["station_name"] == "Quarry Bay" and row["version"] == "B" for row in reference_rows)

app_data_path = HERE.parents[2] / "app" / "data" / "mangkhut-jma.json"
jma = json.loads(app_data_path.read_text(encoding="utf-8-sig"))
matched = [r["timeUtc"] for r in jma["records"] if r["timeUtc"] in record_by_time and record_by_time[r["timeUtc"]]["seaLevelMm"] is not None]
assert len(matched) == len(jma["records"]) == 46

valid = [r for r in records if r["seaLevelMm"] is not None]
peak = max(valid, key=lambda r: r["seaLevelMm"])
result = {
    "schemaVersion": 1,
    "eventId": "jma-1822",
    "kind": "observed-station-sea-level",
    "station": {
        "id": "hko-QUB", "name": "鲗鱼涌", "nameEn": "Quarry Bay", "uhslcId": 329, "seriesVersion": "B",
        "lat": 22 + 17 / 60 + 28 / 3600, "lon": 114 + 12 / 60 + 48 / 3600,
        "coordinateSource": "https://www.hko.gov.hk/en/cis/stn.htm",
        "coordinateSourceValue": "Tide Gauges: Quarry Bay (QUB), 22°17′28″N 114°12′48″E",
        "coordinateNote": "HKO tide-gauge location; not the product's generic Hong Kong reference point. Older UHSLC/GLOSS catalogs contain coarser legacy coordinates.",
    },
    "measurement": {
        "quantity": "relative_sea_level", "displayLabel": "鲗鱼涌整点观测海水位",
        "classification": "quality-controlled-in-situ-observations", "unit": "m", "sourceUnit": "mm",
        "sampleIntervalMinutes": 60,
        "aggregation": "The one-minute average on the hour, according to station QA metadata; not a whole-hour average.",
        "aggregationZh": "整点 1 分钟平均，每小时一条；不是整小时平均。",
        "verticalDatum": {
            "sourceName": "station zero", "displayLabel": "UHSLC 站点零点", "displayUnit": "m · UHSLC站点零点",
            "source": "https://uhslc.soest.hawaii.edu/erddap/info/global_hourly_rqds/index.html",
            "confirmedBy": "The downloaded same-station, same-version ERDDAP subset explicitly reports reference_datum=station zero.",
            "chartDatumConversionApplied": False,
            "historicalContext": "GLOSS station 077 handbook (last updated 1997-12-04) says TGZ equals Admiralty Chart Datum. This is historical station metadata, not a verified 2018 series-specific datum conversion. No datum shift or relabeling to CD is applied.",
            "historicalContextSource": "https://www.bodc.ac.uk/resources/inventories/gloss_handbook/stations/77/",
        },
        "not": ["astronomical tide prediction", "storm-surge residual", "wave height", "inundation depth", "sea level above mean sea level"],
    },
    "time": {
        "sourceZone": "GMT/UTC", "displayZone": "Asia/Hong_Kong", "displayOffset": "+08:00",
        "startTimeUtc": iso(START), "endTimeUtc": iso(END), "endInclusive": True,
        "selection": "Hourly observations covering the complete 46-record JMA Mangkhut track already used by the app.",
        "priorityWindow": {"startTimeHkt": "2018-09-15T00:00:00+08:00", "endTimeHktExclusive": "2018-09-18T00:00:00+08:00", "recordCount": len(priority)},
    },
    "source": {
        "agency": "University of Hawaii Sea Level Center / Joint Archive for Sea Level",
        "originator": "Hong Kong Observatory",
        "dataProduct": "Research Quality Data Set; station 329, version B",
        "downloadUrl": "https://uhslc.soest.hawaii.edu/data/csv/rqds/pacific/hourly/h329b.csv",
        "localOriginal": raw_path.name, "sha256": digest(raw_path), "bytes": raw_path.stat().st_size,
        "downloadedFileModifiedAtUtc": iso(datetime.fromtimestamp(raw_path.stat().st_mtime, UTC)),
        "verifiedAtUtc": iso(datetime.now(UTC)),
        "qaUrl": "https://uhslc.soest.hawaii.edu/rqds/pacific/doc/qa329b.dmt",
        "localQa": "uhslc-qa329b.dmt", "qaMetadataUpdated": "2019-08-09", "qaSha256": digest(HERE / "uhslc-qa329b.dmt"),
        "dataInfoUrl": "https://uhslc.soest.hawaii.edu/datainfo/",
        "citation": "Caldwell, P. C., M. A. Merrifield, P. R. Thompson (2015), Sea level measured by tide gauges from global oceans — the Joint Archive for Sea Level holdings (NCEI Accession 0019568), Version 5.5, NOAA NCEI.",
        "doi": "https://doi.org/10.7289/V5V40S7W",
        "reuse": "The ERDDAP dataset metadata permits free use and redistribution with acknowledgement. Cite UHSLC/JASL, HKO originator, and the DOI. Metadata says not intended for legal use.",
        "extraction": "Selected original hourly rows, preserved integer millimeters and 1-based source line; added UTC/HKT timestamps and meters by division by 1000. No interpolation, smoothing, model values, datum shift, or peak insertion.",
        "missingPolicy": "Source flags 9999 and -9999 become null; no time or value is fabricated. Missing timestamps would fail extraction validation.",
        "perRecordQuality": "The primary legacy CSV contains no per-record QC column; no QC code has been invented for it. This is the official Research Quality series.",
    },
    "records": records,
    "summary": {
        "recordCount": len(records), "reportedCount": len(valid), "missingCount": len(records) - len(valid),
        "maximumReportedSample": {k: peak[k] for k in ("timeUtc", "timeHkt", "seaLevelMm", "seaLevelM", "sourceLine")},
        "maximumNote": "Maximum among the extracted hourly samples, not the event's higher-frequency instantaneous maximum.",
    },
    "validation": {
        "hourlyTimestampContinuity": True, "duplicateTimestamps": 0,
        "exactJmaTimestampMatches": len(matched), "jmaRecordCount": len(jma["records"]),
        "exactMatchPolicy": "JMA's 6-hour analysis timestamps all have exact hourly station observations; no nearest-time substitution is required at those times.",
        "secondaryErddapSource": erddap_path.name, "secondaryErddapSha256": digest(erddap_path),
        "secondaryComparisonCount": len(reference_rows), "identicalValueCount": len(reference_rows) - len(differences),
        "secondaryQualityCodes": sorted({row["quality"] for row in reference_rows}), "secondaryUnitsRow": units,
        "differences": differences,
        "differencePolicy": "Preserve primary legacy CSV values. The one 1 mm discrepancy is documented; its cause has not been established. Sources are not blended.",
    },
    "limitations": [
        "This is observed total sea level at Quarry Bay relative to the archive's station zero, not astronomical tide prediction or storm-surge residual.",
        "Do not call 3.73 m the official Mangkhut event peak. HKO reports 3.88 m above Chart Datum; the archive's hourly sampling and datum labeling must remain explicit.",
        "Do not infer city-wide inundation, coastal height, offshore wave height or a storm-surge field from this one station.",
        "Connecting hourly samples is a plotting aid, not evidence of measurements between samples. Show unavailable data as gaps and label differences as derived arithmetic.",
        "A storm-surge residual would require a verified contemporaneous astronomical tide series, matching timestamps and vertical datum. No residual has been calculated here.",
        "Historical station metadata may describe older instrumentation and coordinates. The product uses HKO's published tide-gauge coordinates and does not assert the old instrument description for 2018.",
    ],
}
(HERE / "quarry-bay-mangkhut-2018-hourly.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(HERE / "quarry-bay-mangkhut-2018-original-rows.csv").write_text("\n".join(excerpt) + "\n", encoding="utf-8")
print(json.dumps({"records": len(records), "missing": len(records) - len(valid), "jmaExactMatches": len(matched), "priorityRecords": len(priority), "peak": result["summary"]["maximumReportedSample"], "crossSourceDifferences": differences}, ensure_ascii=False, indent=2))
