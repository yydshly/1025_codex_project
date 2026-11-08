"""Build or check the browser package from the archived NASA MATLAB source."""
import argparse
import hashlib
import json
import math
from datetime import datetime, timedelta
from pathlib import Path

from scipy.io import loadmat

DIRECTORY = Path(__file__).resolve().parent
ROOT = DIRECTORY.parents[2]
DATASET = "https://data.nasa.gov/dataset/li-ion-battery-aging-datasets"
SOURCE_FILE = DIRECTORY / "raw" / "B0005.mat"
OUTPUT = ROOT / "app" / "data" / "battery-b0005-dynamic.json"
CHANNELS = (
    {"id": "voltage", "field": "voltageV", "sourceField": "Voltage_measured", "label": "电芯端电压", "unit": "V"},
    {"id": "current", "field": "currentA", "sourceField": "Current_measured", "label": "电芯输出电流", "unit": "A"},
    {"id": "temperature", "field": "temperatureC", "sourceField": "Temperature_measured", "label": "电芯温度", "unit": "°C"},
)


def read_data():
    receipt = json.loads((DIRECTORY / "source-receipt.json").read_text(encoding="utf-8"))
    raw = SOURCE_FILE.read_bytes()
    if len(raw) != receipt["matBytes"] or hashlib.sha256(raw).hexdigest() != receipt["matSha256"]:
        raise ValueError("The archived MAT file does not match the download receipt")

    cycles = loadmat(SOURCE_FILE, simplify_cells=True)["B0005"]["cycle"]
    index, cycle = next((i, row) for i, row in enumerate(cycles) if row["type"] == "discharge")
    record = cycle["data"]
    fields = {item["field"]: item["sourceField"] for item in CHANNELS}
    fields.update({"elapsedSeconds": "Time", "loadCurrentA": "Current_load", "loadVoltageV": "Voltage_load"})
    samples = []
    for row_number, values in enumerate(zip(*(record[field] for field in fields.values()), strict=True), start=1):
        row = {field: float(value) for field, value in zip(fields, values, strict=True)}
        if any(not math.isfinite(value) for value in row.values()):
            raise ValueError(f"Nonfinite data in native row {row_number}")
        samples.append({"sourceRow": row_number, **row})
    clock = [row["elapsedSeconds"] for row in samples]
    if index != 1 or len(samples) != 197 or clock[0] != 0 or any(a >= b for a, b in zip(clock, clock[1:])):
        raise ValueError("Unexpected B0005 first-discharge window")

    source_clock = [float(part) for part in cycle["time"]]
    local_time = datetime(*(int(part) for part in source_clock[:5])) + timedelta(seconds=source_clock[5])
    moments = {
        "first": samples[0]["elapsedSeconds"],
        "firstUnderLoad": next(row["elapsedSeconds"] for row in samples if row["currentA"] <= -1),
        "halfway": min(samples, key=lambda row: abs(row["elapsedSeconds"] - clock[-1] / 2))["elapsedSeconds"],
        "minVoltage": min(samples, key=lambda row: row["voltageV"])["elapsedSeconds"],
        "maxTemperature": max(samples, key=lambda row: row["temperatureC"])["elapsedSeconds"],
        "last": samples[-1]["elapsedSeconds"],
    }
    return {
        "schemaVersion": 1,
        "id": "nasa-b0005-first-discharge",
        "kind": "battery",
        "title": "NASA B0005 首次放电实测",
        "subtitle": "NASA Ames 电池老化实验 · 197 条原始采样",
        "description": "沿原始放电经过时间查看端电压、输出电流和电芯温度。",
        "focus": None,
        "sampleId": "B0005",
        "sourceCycleIndex": index,
        "sourceCycleType": cycle["type"],
        "sourceLocalTime": local_time.isoformat(timespec="milliseconds"),
        "sourceStartTime": source_clock,
        "ambientTemperatureC": float(cycle["ambient_temperature"]),
        "capacityAh": float(record["Capacity"]),
        "channels": CHANNELS,
        "samples": samples,
        "moments": moments,
        "sources": [
            {"id": "nasa-catalog", "name": "NASA 电池老化实验与字段说明", "url": DATASET},
            {"id": "nasa-mat", "name": "NASA B0005 原始测量档案", "url": receipt["archiveUrl"],
             "file": SOURCE_FILE.relative_to(ROOT).as_posix(), "bytes": receipt["matBytes"],
             "sha256": receipt["matSha256"], "member": receipt["member"], "matFile": receipt["matFile"]},
        ],
        "limitations": [
            "回放以实验经过时间为轴。源日期未标时区，采样间隔随记录变化。",
            "电流保留原始正负号，负值对应本次放电方向。端电压、电芯输出电流和电芯温度来自电池实测通道。",
            "NASA 资料将实验归于 Ames PCoE 测试台。源文件未提供本电芯测试台的地理坐标。",
            "电芯剖面为通用圆柱电芯结构示意。实测温度为单个电芯温度通道的读数。",
        ],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Compare the existing app data with the MAT source")
    args = parser.parse_args()
    data = read_data()
    package = (json.dumps(data, ensure_ascii=False, indent=2, allow_nan=False) + "\n").encode()
    if args.check:
        if OUTPUT.read_bytes() != package:
            raise ValueError("The checked-in replay does not match the first native discharge")
    else:
        OUTPUT.write_bytes(package)
    print(f"{data['sampleId']}: verified {len(data['samples'])} rows, SHA-256 {hashlib.sha256(package).hexdigest()}")
    for name, elapsed in data["moments"].items():
        sample = next(row for row in data["samples"] if row["elapsedSeconds"] == elapsed)
        print(name, sample)


if __name__ == "__main__":
    main()
