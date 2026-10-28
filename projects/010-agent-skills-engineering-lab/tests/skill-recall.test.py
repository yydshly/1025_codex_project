#!/usr/bin/env python3
"""Behavioral tests use synthetic workspaces retained for inspection; no cleanup."""
import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.dont_write_bytecode = True
SCRIPT = Path(__file__).resolve().parents[1] / "skill/research-recall/scripts/recall.py"
spec = importlib.util.spec_from_file_location("recall_skill", SCRIPT)
recall = importlib.util.module_from_spec(spec)
spec.loader.exec_module(recall)
FIXTURES = Path(tempfile.mkdtemp(prefix="research-recall-tests-"))


class RecallBehavior(unittest.TestCase):
    def setUp(self):
        self.root = FIXTURES / self._testMethodName
        self.root.mkdir()
        self.projects = [
            {"id": "001", "slug": "agent-notes", "name": "Agent Skills 研究", "summary": "工程方法，效果待验证", "source": "https://github.com/addyosmani/agent-skills", "tags": ["AI", "研究"], "status": "researching"},
            {"id": "002", "slug": "retrieval-notes", "name": "资料检索", "summary": "跨日回顾", "source": "https://github.com/example/retrieval", "tags": ["知识"], "status": "completed"},
        ]
        self.registry()
        self.source("001-agent-notes/README.md", "# Agent Skills\n\n研究控制流程。\n它不是运行效果证明。\n来源：https://github.com/addyosmani/agent-skills\n")
        self.source("002-retrieval-notes/README.md", "# 资料检索\n\n当前这里只记录方向。\n")
        self.source("002-retrieval-notes/research/findings.md", "# 独立研究记录\n\nGraphiti 时间关系支持跨日回顾。\n原文：https://github.com/getzep/graphiti\nＡＢＣ 支持检索。\n")

    def registry(self):
        (self.root / "projects.json").write_text(json.dumps({"schemaVersion": 1, "projects": self.projects}, ensure_ascii=False, indent=2), encoding="utf-8")

    def source(self, relative, text):
        path = self.root / "projects" / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
        return path

    def artifact(self, name, value):
        path = self.root / "records" / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(value, ensure_ascii=False), encoding="utf-8")
        return path

    def cli(self, *args):
        result = subprocess.run([sys.executable, "-X", "utf8", str(SCRIPT), *args, "--root", str(self.root)], capture_output=True, encoding="utf-8")
        self.assertEqual(result.stderr, "", result.stderr)
        return result.returncode, json.loads(result.stdout)

    def assert_error(self, code, fn, *args):
        with self.assertRaises(recall.RecallError) as context:
            fn(*args)
        self.assertEqual(context.exception.code, code)

    def packet(self):
        return recall.search(self.root, "https://github.com/addyosmani/agent-skills")

    def test_repository_identity_normalization(self):
        for query in ("https://github.com/addyosmani/agent-skills", "HTTPS://GITHUB.COM/ADDYOSMANI/AGENT-SKILLS.git/?tab=readme#section", "github.com/addyosmani/agent-skills/issues/4"):
            packet = recall.search(self.root, query)
            self.assertEqual([r["projectId"] for r in packet["results"]], ["001"])
            self.assertEqual(packet["results"][0]["matchKind"], "repository")

    def test_repository_prefix_is_not_a_match(self):
        packet = recall.search(self.root, "https://github.com/addyosmani/agent")
        self.assertEqual(packet["totalMatches"], 0)
        self.assertEqual(packet["results"], [])

    def test_research_markdown_and_embedded_repository_url_are_searchable(self):
        packet = recall.search(self.root, "https://github.com/getzep/graphiti")
        self.assertEqual(packet["results"][0]["projectId"], "002")
        quote = packet["results"][0]["evidence"][0]
        self.assertEqual(quote["path"], "projects/002-retrieval-notes/research/findings.md")
        self.assertIn("Graphiti", quote["text"])

    def test_nfkc_casefold_and_chinese_literal_and(self):
        packet = recall.search(self.root, "abc 时间关系")
        self.assertEqual([r["projectId"] for r in packet["results"]], ["002"])
        self.assertEqual(recall.search(self.root, "abc 不存在词")["results"], [])

    def test_evidence_equals_source_lines_and_hash(self):
        for result in recall.search(self.root, "Graphiti")["results"]:
            for quote in result["evidence"]:
                path = self.root / quote["path"]
                self.assertEqual(quote["text"], "\n".join(path.read_text(encoding="utf-8").splitlines()[quote["startLine"]-1:quote["endLine"]]))
                self.assertEqual(quote["sha256"], hashlib.sha256(path.read_bytes()).hexdigest())

    def test_read_bounded_original_lines(self):
        code, output = self.cli("read", "--path", "projects/002-retrieval-notes/research/findings.md", "--start", "3", "--end", "4")
        self.assertEqual(code, 0)
        self.assertIn("Graphiti", output["evidence"]["text"])
        code, output = self.cli("read", "--path", "projects/002-retrieval-notes/research/findings.md", "--start", "0", "--end", "4")
        self.assertNotEqual(code, 0)
        self.assertEqual(output["error"]["code"], "INVALID_RANGE")

    def test_read_past_end_reports_total_lines_without_silent_truncation(self):
        code, output = self.cli("read", "--path", "projects/002-retrieval-notes/research/findings.md", "--start", "1", "--end", "60")
        self.assertNotEqual(code, 0)
        self.assertFalse(output["ok"])
        self.assertEqual(output["error"]["code"], "INVALID_RANGE")
        self.assertIn("source has 5 lines", output["error"]["message"])
        self.assertNotIn("evidence", output)

    def test_missing_source_and_size_skip_are_explicit(self):
        self.projects.append({"id": "003", "slug": "missing", "name": "Missing", "summary": "missing", "source": "", "tags": [], "status": "researching"})
        self.registry()
        self.source("002-retrieval-notes/research/oversize.md", "x" * (recall.MAX_FILE_BYTES + 1))
        packet = recall.search(self.root, "Graphiti")
        self.assertIn("SOURCE_MISSING", [w["code"] for w in packet["warnings"]])
        self.assertIn("SOURCE_TOO_LARGE", [w["code"] for w in packet["warnings"]])
        self.assertEqual(packet["scope"]["filesSkipped"], 1)

    def test_hidden_vendor_and_generated_material_excluded(self):
        for folder in ("upstream", "skill-creation", "recall-records", ".private"):
            self.source("002-retrieval-notes/research/" + folder + "/excluded.md", "SHOULDNEVERMATCH")
        self.source("002-retrieval-notes/research/.hidden.md", "SHOULDNEVERMATCH")
        self.assertEqual(recall.search(self.root, "SHOULDNEVERMATCH")["results"], [])
        code, output = self.cli("read", "--path", "projects/002-retrieval-notes/research/upstream/excluded.md", "--start", "1", "--end", "1")
        self.assertNotEqual(code, 0)
        self.assertEqual(output["error"]["code"], "OUT_OF_SCOPE")

    def test_source_path_traversal_and_unregistered_source_rejected(self):
        self.assert_error("UNSAFE_PATH", recall.safe_path, self.root, "../outside.txt")
        self.assert_error("OUT_OF_SCOPE", recall.source_project, "projects/999-other/README.md", self.projects)
        code, output = self.cli("read", "--path", "projects/001-agent-notes/../../projects.json", "--start", "1", "--end", "1")
        self.assertNotEqual(code, 0)
        self.assertEqual(output["error"]["code"], "UNSAFE_PATH")

    def test_invalid_slug_and_duplicate_project_rejected_before_source_read(self):
        self.projects[0]["slug"] = "../../private"
        self.registry()
        self.assert_error("INVALID_REGISTRY", recall.search, self.root, "Graphiti")
        self.projects[0]["slug"] = "agent-notes"
        self.projects.append(copy.deepcopy(self.projects[0]))
        self.registry()
        self.assert_error("INVALID_REGISTRY", recall.search, self.root, "Graphiti")

    def test_duplicate_json_keys_are_rejected(self):
        (self.root / "projects.json").write_text('{"schemaVersion":1,"projects":[],"projects":[]}', encoding="utf-8")
        self.assert_error("INVALID_JSON", recall.search, self.root, "Graphiti")

    def test_packet_verifies_and_output_does_not_pollute_search(self):
        packet = self.packet()
        path = recall.write_new(self.root, "records/evidence.json", packet)
        code, output = self.cli("verify", "--report", path)
        self.assertEqual(code, 0)
        self.assertTrue(output["verified"])

    def test_forged_quote_metadata_and_unknown_fields_fail(self):
        for mutate in (
            lambda p: p["results"][0]["evidence"][0].update(text="fabricated"),
            lambda p: p["results"][0].update(projectName="forged"),
            lambda p: p.update(verified=True),
            lambda p: p["results"][0]["evidence"][0].update(path="../../external.txt"),
        ):
            packet = self.packet()
            mutate(packet)
            with self.assertRaises(recall.RecallError):
                recall.verify_packet(self.root, packet)

    def test_changed_source_blocks_verification_and_save(self):
        path = self.artifact("evidence.json", self.packet())
        self.source("001-agent-notes/README.md", "# Agent Skills\nThe source changed.\n")
        (self.root / "judgment.txt").write_text("This is a judgment.", encoding="utf-8")
        code, output = self.cli("save", "--report", str(path), "--judgment-file", "judgment.txt", "--output", "records/blocked.json")
        self.assertNotEqual(code, 0)
        self.assertEqual(output["error"]["code"], "EVIDENCE_CHANGED")
        self.assertFalse((self.root / "records/blocked.json").exists())

    def test_save_roundtrip_keeps_judgment_separate_and_preserves_sources(self):
        before = {p: p.read_bytes() for p in self.root.rglob("*.md")}
        path = self.artifact("evidence.json", self.packet())
        judgment = "我的判断：适合学习工程约束，效率收益仍待验证。"
        (self.root / "judgment.txt").write_text(judgment, encoding="utf-8")
        code, output = self.cli("save", "--report", str(path), "--judgment-file", "judgment.txt", "--output", "records/judgment.json")
        self.assertEqual(code, 0)
        record = json.loads((self.root / output["output"]).read_text(encoding="utf-8"))
        self.assertEqual(record["judgment"], judgment)
        self.assertEqual(record["packet"]["kind"], "research-recall")
        code, verified = self.cli("verify", "--report", output["output"])
        self.assertEqual(code, 0)
        self.assertTrue(verified["verified"])
        self.assertTrue(all(p.read_bytes() == data for p, data in before.items()))

    def test_saved_verified_flag_cannot_bypass_source_or_schema_checks(self):
        packet = self.packet()
        record = {"schemaVersion": 1, "kind": "research-recall-record", "createdAt": recall.now(), "judgment": "判断", "verification": recall.verify_packet(self.root, packet), "packet": packet}
        record["verification"]["verified"] = 1
        self.assert_error("INVALID_SCHEMA", recall.verify_artifact, self.root, record)
        record["verification"]["verified"] = True
        record["packet"]["results"][0]["evidence"][0]["text"] = "forged"
        self.assert_error("EVIDENCE_CHANGED", recall.verify_artifact, self.root, record)

    def test_existing_output_is_never_overwritten(self):
        original = b'{"existing":true}'
        output = self.root / "preserve.json"
        output.write_bytes(original)
        self.assert_error("OUTPUT_EXISTS", recall.write_new, self.root, "preserve.json", self.packet())
        self.assertEqual(output.read_bytes(), original)

    def test_write_failure_and_oversize_artifact_do_not_claim_success(self):
        with patch.object(Path, "open", side_effect=PermissionError("synthetic denial")):
            self.assert_error("WRITE_FAILED", recall.write_new, self.root, "records/denied.json", {})
        self.assertFalse((self.root / "records/denied.json").exists())
        with patch.object(recall, "MAX_PACKET_BYTES", 10):
            self.assert_error("OUTPUT_TOO_LARGE", recall.write_new, self.root, "records/large.json", {"large": "x" * 100})
        self.assertFalse((self.root / "records/large.json").exists())

    def test_outside_artifact_and_source_links_are_rejected(self):
        outside = FIXTURES / (self._testMethodName + "-outside")
        outside.mkdir()
        (outside / "secret.md").write_text("OUTSIDESECRET", encoding="utf-8")
        self.assert_error("UNSAFE_PATH", recall.write_new, self.root, str(outside / "x.json"), {})
        linked = self.root / "projects/002-retrieval-notes/research/linked"
        if os.name == "nt":
            command = "New-Item -ItemType Junction -Path '" + str(linked).replace("'", "''") + "' -Target '" + str(outside).replace("'", "''") + "' | Out-Null"
            result = subprocess.run(["powershell", "-NoProfile", "-Command", command], capture_output=True)
            self.assertEqual(result.returncode, 0, result.stderr)
        else:
            linked.symlink_to(outside, target_is_directory=True)
        packet = recall.search(self.root, "OUTSIDESECRET")
        self.assertEqual(packet["results"], [])
        self.assertIn("UNSAFE_PATH", [w["code"] for w in packet["warnings"]])
        code, output = self.cli("read", "--path", "projects/002-retrieval-notes/research/linked/secret.md", "--start", "1", "--end", "1")
        self.assertNotEqual(code, 0)
        self.assertNotIn("OUTSIDESECRET", json.dumps(output))

    def test_limit_project_filter_and_invalid_cli_are_explicit(self):
        packet = recall.search(self.root, "研究", limit=1)
        self.assertEqual(len(packet["results"]), 1)
        self.assertTrue(packet["truncated"])
        self.assertEqual(recall.search(self.root, "Graphiti", "001")["results"], [])
        for extra in (("--query", ""), ("--query", "a", "--limit", "0"), ("--query", "a", "--project", "999")):
            code, output = self.cli("search", *extra)
            self.assertNotEqual(code, 0)
            self.assertFalse(output["ok"])

    def test_file_budget_marks_coverage_partial(self):
        with patch.object(recall, "MAX_FILES", 2):
            packet = recall.search(self.root, "Graphiti")
        self.assertEqual(packet["results"], [])
        self.assertTrue(packet["warnings"])
        self.assertGreater(packet["scope"]["filesSkipped"], 0)


if __name__ == "__main__":
    print("Retained synthetic fixtures: " + str(FIXTURES), flush=True)
    unittest.main(verbosity=2)
