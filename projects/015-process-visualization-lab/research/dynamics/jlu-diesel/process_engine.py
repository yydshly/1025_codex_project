"""Build or check a local research replay from the verified Jilin University ETC ZIP."""
import argparse
import hashlib
import io
import json
from pathlib import Path
from urllib.request import urlopen
from zipfile import ZipFile

import numpy as np
from scipy.io import loadmat

DIRECTORY = Path(__file__).resolve().parent
ROOT = DIRECTORY.parents[2]
ARCHIVE = DIRECTORY / "datafile.zip"
OUTPUT = ROOT / "app" / "data" / "engine-jlu-diesel-dynamic.local.json"
ROWS = 18000
CHANNELS = [
    {"id": "rpm", "field": "rpm", "sourceField": "speed", "sourceUnit": "r/min", "label": "发动机转速", "unit": "rpm", "method": "台架实测"},
    {"id": "torque", "field": "torqueNm", "sourceField": "torque", "sourceUnit": "N·m", "label": "发动机扭矩", "unit": "N·m", "method": "台架实测"},
    {"id": "railPressure", "field": "railPressureMpa", "sourceField": "RP", "sourceUnit": "hPa", "label": "燃油轨压", "unit": "MPa", "method": "台架原档通道"},
]
SOURCE_FIELDS = {"speed", "torque", "APS", "FIR", "SOI", "AIM", "RP"}


def verify_bytes(data, length, digest, label):
    if len(data) != length or hashlib.sha256(data).hexdigest() != digest:
        raise ValueError(f"{label} does not match the Jilin University source receipt")


def read_source(archive, receipt):
    verify_bytes(archive, receipt["archiveBytes"], receipt["archiveSha256"], "ZIP")
    with ZipFile(io.BytesIO(archive)) as source:
        if source.namelist() != [receipt["member"]]:
            raise ValueError("Unexpected archive contents")
        mat = source.read(receipt["member"])
    verify_bytes(mat, receipt["matBytes"], receipt["matSha256"], "MAT")
    source = {key: value for key, value in loadmat(io.BytesIO(mat)).items() if not key.startswith("__")}
    if source.keys() != SOURCE_FIELDS or any(
        array.shape != (ROWS, 1) or not np.isfinite(array).all() for array in source.values()
    ):
        raise ValueError("The ETC source must contain seven finite 18000-row columns")
    return source


def build_replay(source, receipt):
    samples = [
        {"t": index / 10, "rpm": float(speed), "torqueNm": float(torque), "railPressureMpa": int(rp) / 10000}
        for index, (speed, torque, rp) in enumerate(zip(
            source["speed"][:, 0], source["torque"][:, 0], source["RP"][:, 0], strict=True,
        ))
    ]
    watch = samples[300:901]
    moments = {
        "watchStart": watch[0]["t"],
        "firstZeroTorque": next(row["t"] for row in watch if row["torqueNm"] == 0),
        "watchMinRailPressure": min(watch, key=lambda row: row["railPressureMpa"])["t"],
        "minSpeed": min(samples, key=lambda row: row["rpm"])["t"],
        "watchEnd": watch[-1]["t"],
        "minRailPressure": min(samples, key=lambda row: row["railPressureMpa"])["t"],
        "maxRailPressure": max(samples, key=lambda row: row["railPressureMpa"])["t"],
    }
    return {
        "schemaVersion": 1,
        "id": "jlu-diesel-etc-bench",
        "kind": "engine",
        "title": "吉林大学 · 柴油机 ETC 台架",
        "subtitle": "2.7 L 四缸柴油机 · 10 Hz 台架记录",
        "description": "回放欧洲瞬态循环（ETC）台架试验，比较转速、扭矩与燃油轨压在相同时间的变化。",
        "focus": None,
        "clock": {"kind": "elapsed", "intervalSeconds": 0.1, "startSeconds": 0, "endSeconds": 1799.9, "durationSeconds": 1800},
        "channels": CHANNELS,
        "phases": [
            {"id": "urban", "label": "城区工况", "from": 0, "toExclusive": 600},
            {"id": "suburban", "label": "郊区工况", "from": 600, "toExclusive": 1200},
            {"id": "highway", "label": "高速工况", "from": 1200, "toExclusive": 1800},
        ],
        "samples": samples,
        "ranges": {channel["field"]: {
            "min": min(row[channel["field"]] for row in samples),
            "max": max(row[channel["field"]] for row in samples),
        } for channel in CHANNELS},
        "moments": moments,
        "sources": [
            {"id": "scis-paper", "name": "Zhao 等 · 论文图 1 与实验方法", "url": receipt["paperUrl"],
             "doi": receipt["doi"], "sha256": receipt["paperSha256"]},
            {"id": "jlu-catalog", "name": "吉林大学 · 数据集说明", "url": receipt["datasetPage"].replace("http://", "https://", 1)},
        ],
        "archive": {"pageUrl": receipt["datasetPage"], "url": receipt["archiveUrl"],
                    "member": receipt["member"], "sha256": receipt["matSha256"]},
        "limitations": [
            "时间按原档行号和论文给出的 0.1 秒采样周期重建，首行记为 0 秒。文件未提供试验日期、绝对时钟或台架坐标。",
            "转速、扭矩由论文明确列为实测。轨压取自原档 RP（hPa），除以 10000 换算为 MPa。论文未说明 RP 来自传感器反馈还是控制器目标值。",
            "城区、郊区、高速是电力测功机复现的试验工况。发动机内部结构及机械动作是示意，原档仅记录各通道数值。",
            "论文说明数据开放给学术研究。回放数据仅在本地生成。",
        ],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--zip", type=Path, default=ARCHIVE, help="Path to the JLU datafile.zip")
    parser.add_argument("--download", action="store_true", help="Fetch the original ZIP from JLU if missing")
    parser.add_argument("--check", action="store_true", help="Compare the replay byte for byte without changing it")
    args = parser.parse_args()
    receipt = json.loads((DIRECTORY / "source-receipt.json").read_text(encoding="utf-8"))
    download = args.download and not args.zip.exists()
    if download:
        with urlopen(receipt["archiveUrl"], timeout=30) as response:
            raw = response.read(receipt["archiveBytes"] + 1)
    else:
        raw = args.zip.read_bytes()
    data = build_replay(read_source(raw, receipt), receipt)
    payload = (json.dumps(data, ensure_ascii=False, separators=(",", ":"), allow_nan=False) + "\n").encode("utf-8")
    if args.check:
        if OUTPUT.read_bytes() != payload:
            raise ValueError("The local replay does not match the verified ETC source")
    else:
        staging = OUTPUT.with_suffix(".tmp")
        staging.write_bytes(payload)
        staging.replace(OUTPUT)
    if download:
        args.zip.write_bytes(raw)
    print(f"Verified {len(data['samples'])} native ETC rows, replay SHA-256 {hashlib.sha256(payload).hexdigest()}")


if __name__ == "__main__":
    main()
