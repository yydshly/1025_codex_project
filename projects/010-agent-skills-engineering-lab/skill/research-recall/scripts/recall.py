#!/usr/bin/env python3
"""Bounded, source-backed recall for a numbered research hub. Standard library only."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import sys
import unicodedata
from datetime import datetime, timezone
from urllib.parse import urlparse

VERSION = 1
MAX_FILE_BYTES = 1_000_000
MAX_REGISTRY_BYTES = 2_000_000
MAX_PACKET_BYTES = 8_000_000
MAX_TOTAL_BYTES = 20_000_000
MAX_FILES = 500
MAX_DIRECTORIES = 2000
EXCLUDED = {"upstream", "skill-creation", "recall-records"}
SCOPE = "projects.json and registered project README.md/research/**/*.md; excludes hidden paths, links, research/upstream, research/skill-creation, research/recall-records; literal AND or exact GitHub owner/repo; no network"
REPO_URL = re.compile(r"https?://(?:www\.)?github\.com/[a-z0-9_.-]+/[a-z0-9_.-]+", re.I)


class RecallError(Exception):
    def __init__(self, code, message):
        self.code, self.message = code, message
        super().__init__(message)


def fail(code, message):
    raise RecallError(code, message)


def exact_keys(value, keys, label):
    if not isinstance(value, dict) or set(value) != set(keys):
        fail("INVALID_SCHEMA", f"Invalid fields in {label}.")


def unique_pairs(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            fail("INVALID_JSON", "Duplicate JSON keys are not supported.")
        result[key] = value
    return result


def decode_json(text):
    try:
        return json.loads(text, object_pairs_hook=unique_pairs)
    except (ValueError, RecursionError):
        fail("INVALID_JSON", "Input is not valid JSON.")


def now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def sha(data):
    return hashlib.sha256(data).hexdigest()


def fold(text):
    return unicodedata.normalize("NFKC", text).casefold()


def repo_identity(value):
    text = fold(value.strip())
    if text.startswith(("github.com/", "www.github.com/")):
        text = "https://" + text
    try:
        parsed = urlparse(text)
        parts = parsed.path.strip("/").split("/")
        if parsed.scheme not in ("http", "https") or parsed.hostname not in ("github.com", "www.github.com") or len(parts) < 2:
            return None
        owner, repository = parts[:2]
        if repository.endswith(".git"):
            repository = repository[:-4]
        if not re.fullmatch(r"[a-z0-9_.-]+", owner) or not re.fullmatch(r"[a-z0-9_.-]+", repository):
            return None
        return owner + "/" + repository
    except ValueError:
        return None


def repositories(text):
    return {repo_identity(match.group()) for match in REPO_URL.finditer(text)} - {None}


def linklike(path):
    info = path.lstat()
    return path.is_symlink() or bool(getattr(info, "st_file_attributes", 0) & getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 1024))


def root_path(value):
    try:
        root = Path(value).resolve(strict=True)
        if not root.is_dir():
            fail("INVALID_ROOT", "Research root must be an existing directory.")
        return root
    except OSError:
        fail("INVALID_ROOT", "Research root is not accessible.")


def within(path, root):
    try:
        path.relative_to(root)
        return True
    except ValueError:
        return False


def safe_relative(value):
    if not isinstance(value, str) or not value or "\\" in value or ":" in value:
        fail("UNSAFE_PATH", "Use a root-relative path with forward slashes.")
    path = Path(value)
    if path.is_absolute() or any(part in ("..", ".") or part.startswith(".") for part in value.split("/")):
        fail("UNSAFE_PATH", "Hidden, absolute and parent-traversal source paths are not allowed.")
    return path


def safe_path(root, relative, must_exist=True):
    path = root / safe_relative(relative)
    current = root
    try:
        for part in path.relative_to(root).parts:
            current = current / part
            if current.exists() or current.is_symlink():
                if linklike(current):
                    fail("UNSAFE_PATH", "Linked or reparse-point paths are excluded.")
            elif must_exist:
                fail("SOURCE_MISSING", "Requested source is missing.")
        resolved = path.resolve(strict=must_exist)
        if not within(resolved, root):
            fail("UNSAFE_PATH", "Path is outside the authorized research root.")
        return resolved
    except OSError:
        fail("SOURCE_UNREADABLE", "Requested path is inaccessible.")


def read_text(path, maximum=MAX_FILE_BYTES):
    try:
        if not path.is_file():
            fail("SOURCE_UNREADABLE", "Expected a regular file.")
        if path.stat().st_size > maximum:
            fail("SOURCE_TOO_LARGE", f"File exceeds the {maximum}-byte limit.")
        with path.open("rb") as handle:
            data = handle.read(maximum + 1)
        if len(data) > maximum:
            fail("SOURCE_TOO_LARGE", f"File exceeds the {maximum}-byte limit.")
        return data.decode("utf-8-sig"), sha(data), len(data)
    except UnicodeDecodeError:
        fail("SOURCE_ENCODING", "Source must be UTF-8 text.")
    except OSError:
        fail("SOURCE_UNREADABLE", "File could not be read.")


def project_line_ranges(text):
    """Use JSON token offsets rather than matching id-looking text in prose."""
    decoder = json.JSONDecoder(object_pairs_hook=unique_pairs)
    i = text.index("{") + 1
    while True:
        while text[i].isspace():
            i += 1
        key, i = decoder.raw_decode(text, i)
        while text[i].isspace() or text[i] == ":":
            i += 1
        start = i
        _, i = decoder.raw_decode(text, i)
        if key == "projects":
            j = start + 1
            ranges = []
            while True:
                while text[j].isspace() or text[j] == ",":
                    j += 1
                if text[j] == "]":
                    return ranges
                begin = j
                _, j = decoder.raw_decode(text, j)
                ranges.append((text.count("\n", 0, begin) + 1, text.count("\n", 0, j - 1) + 1))
        while text[i].isspace():
            i += 1
        if text[i] == "}":
            fail("INVALID_REGISTRY", "Registry must contain projects.")
        i += 1


def load_registry(root):
    text, digest, size = read_text(safe_path(root, "projects.json"), MAX_REGISTRY_BYTES)
    data = decode_json(text)
    if not isinstance(data, dict) or type(data.get("schemaVersion")) is not int or data["schemaVersion"] != 1 or not isinstance(data.get("projects"), list):
        fail("INVALID_REGISTRY", "Expected schemaVersion 1 and a projects array.")
    if len(data["projects"]) > 1000:
        fail("INVALID_REGISTRY", "Registry exceeds 1000 projects.")
    ids = set()
    for project in data["projects"]:
        if not isinstance(project, dict) or not isinstance(project.get("id"), str) or not re.fullmatch(r"\d{3}", project["id"]) or project["id"] in ids:
            fail("INVALID_REGISTRY", "Project ids must be unique three-digit strings.")
        if not isinstance(project.get("slug"), str) or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", project["slug"]):
            fail("INVALID_REGISTRY", "Project slug is invalid.")
        for key in ("name", "summary", "source", "status"):
            if not isinstance(project.get(key), str):
                fail("INVALID_REGISTRY", f"Project {key} must be text.")
        if not isinstance(project.get("tags"), list) or any(not isinstance(tag, str) for tag in project["tags"]):
            fail("INVALID_REGISTRY", "Project tags must be a list of strings.")
        ids.add(project["id"])
    ranges = project_line_ranges(text)
    return {"text": text, "sha256": digest, "bytes": size, "projects": data["projects"], "ranges": ranges}


def project_dir(project):
    return f"projects/{project['id']}-{project['slug']}"


def source_project(relative, projects):
    path = safe_relative(relative)
    if relative == "projects.json":
        return None
    for project in projects:
        prefix = project_dir(project) + "/"
        if relative.startswith(prefix):
            suffix = relative[len(prefix):]
            parts = Path(suffix).parts
            allowed = suffix == "README.md" or (len(parts) >= 2 and parts[0] == "research" and parts[1] not in EXCLUDED and path.suffix.lower() == ".md")
            if allowed:
                return project
    fail("OUT_OF_SCOPE", "Source is not a registered README or allowed research Markdown file.")


def warning(code, path, message):
    return {"code": code, "path": path, "message": message}


def enumerate_sources(root, project, warnings):
    prefix = project_dir(project)
    try:
        directory = safe_path(root, prefix)
        if not directory.is_dir():
            fail("SOURCE_MISSING", "Registered project directory is missing.")
    except RecallError as error:
        warnings.append(warning(error.code, prefix, error.message))
        return []
    paths = [prefix + "/README.md"]
    research = directory / "research"
    if not research.exists() and not research.is_symlink():
        return paths
    try:
        research = safe_path(root, prefix + "/research")
        if not research.is_dir():
            fail("SOURCE_UNREADABLE", "Research path is not a directory.")
    except RecallError as error:
        warnings.append(warning(error.code, prefix + "/research", error.message))
        return paths
    seen = 0
    def on_error(_error):
        warnings.append(warning("SOURCE_UNREADABLE", prefix + "/research", "A research directory could not be enumerated."))
    for directory_name, dirs, files in os.walk(research, followlinks=False, onerror=on_error):
        seen += 1
        if seen > MAX_DIRECTORIES:
            warnings.append(warning("DIRECTORY_LIMIT", prefix + "/research", "Directory scan limit reached; coverage is partial."))
            break
        here = Path(directory_name)
        keep = []
        for name in sorted(dirs):
            candidate = here / name
            if name.startswith(".") or (here == research and name in EXCLUDED):
                continue
            try:
                if linklike(candidate):
                    warnings.append(warning("UNSAFE_PATH", candidate.relative_to(root).as_posix(), "Linked directory excluded."))
                else:
                    keep.append(name)
            except OSError:
                warnings.append(warning("SOURCE_UNREADABLE", candidate.relative_to(root).as_posix(), "Directory could not be inspected."))
        dirs[:] = keep
        for name in sorted(files):
            if not name.startswith(".") and name.lower().endswith(".md"):
                paths.append((here / name).relative_to(root).as_posix())
    return paths


def evidence(relative, text, digest, start, end):
    lines = text.splitlines()
    if type(start) is not int or type(end) is not int or start < 1 or end < start or end > len(lines):
        fail("INVALID_RANGE", f"Line range is outside the source; source has {len(lines)} lines.")
    return {"path": relative, "startLine": start, "endLine": end, "text": "\n".join(lines[start - 1:end]), "sha256": digest}


def search(root, query, project_filter=None, limit=5):
    if not isinstance(query, str) or not query.strip() or len(query) > 512:
        fail("INVALID_QUERY", "Query must contain 1–512 characters.")
    if type(limit) is not int or not 1 <= limit <= 20:
        fail("INVALID_LIMIT", "Limit must be between 1 and 20.")
    registry = load_registry(root)
    if project_filter is not None and project_filter not in {p["id"] for p in registry["projects"]}:
        fail("UNKNOWN_PROJECT", "Requested project is not registered.")
    target_repo = repo_identity(query)
    terms = fold(query).split()
    warnings, results, selected_ids = [], [], []
    count, skipped, total_bytes = 1, 0, registry["bytes"]
    for project, line_range in zip(registry["projects"], registry["ranges"]):
        if project_filter is not None and project["id"] != project_filter:
            continue
        selected_ids.append(project["id"])
        metadata = "\n".join([project["id"], project["slug"], project["name"], project["summary"], project["source"], *project["tags"]])
        sources = []
        for relative in enumerate_sources(root, project, warnings):
            if count >= MAX_FILES:
                warnings.append(warning("FILE_LIMIT", relative, "File scan limit reached; source skipped."))
                skipped += 1
                continue
            try:
                path = safe_path(root, relative)
                source_project(relative, registry["projects"])
                # Check the remaining byte budget before opening a potentially large source.
                if path.stat().st_size > MAX_TOTAL_BYTES - total_bytes:
                    fail("BYTE_LIMIT", "Total source byte budget reached; source skipped.")
                text, digest, size = read_text(path)
                sources.append((relative, text, digest))
                count += 1
                total_bytes += size
            except RecallError as error:
                warnings.append(warning(error.code, relative, error.message))
                skipped += 1
            except OSError:
                warnings.append(warning("SOURCE_UNREADABLE", relative, "Source could not be inspected."))
                skipped += 1
        haystack = fold(metadata + "\n" + "\n".join(item[1] for item in sources))
        metadata_repo = repo_identity(project["source"])
        all_repositories = repositories(metadata + "\n" + "\n".join(item[1] for item in sources))
        if target_repo:
            matched = target_repo in all_repositories
        else:
            matched = all(term in haystack for term in terms)
        if not matched:
            continue
        quotes = []
        metadata_score = int(target_repo == metadata_repo) * 1000 if target_repo else sum(term in fold(metadata) for term in terms)
        if metadata_score:
            quotes.append((metadata_score + 10, evidence("projects.json", registry["text"], registry["sha256"], *line_range)))
        for relative, text, digest in sources:
            lines = text.splitlines()
            matches = []
            for index, line in enumerate(lines):
                score = int(target_repo in repositories(line)) if target_repo else sum(term in fold(line) for term in terms)
                if score:
                    matches.append((score, index))
            # At most one excerpt per source keeps the result useful while read expands context.
            if matches:
                score, index = max(matches, key=lambda pair: (pair[0], -pair[1]))
                quotes.append((score, evidence(relative, text, digest, max(1, index - 2), min(len(lines), index + 4))))
        quotes.sort(key=lambda pair: (-pair[0], pair[1]["path"], pair[1]["startLine"]))
        score = metadata_score * 10 + sum(term in fold(project["name"]) for term in terms)
        results.append((score, {"projectId": project["id"], "projectName": project["name"], "registeredStatus": project["status"], "registeredSource": project["source"], "matchKind": "repository" if target_repo else "literal", "evidence": [q[1] for q in quotes[:3]]}))
    results.sort(key=lambda pair: (-pair[0], pair[1]["projectId"]))
    return {"schemaVersion": VERSION, "kind": "research-recall", "query": query, "projectFilter": project_filter, "limit": limit, "generatedAt": now(), "registry": {"path": "projects.json", "sha256": registry["sha256"]}, "scope": {"description": SCOPE, "projectIds": selected_ids, "filesScanned": count, "filesSkipped": skipped}, "warnings": warnings, "totalMatches": len(results), "truncated": len(results) > limit, "results": [item[1] for item in results[:limit]]}


def artifact_path(root, value, suffix=None, must_exist=True):
    candidate = Path(value)
    if candidate.is_absolute():
        try:
            relative = candidate.relative_to(root).as_posix()
        except ValueError:
            fail("UNSAFE_PATH", "Artifact must stay inside the authorized research root.")
    else:
        relative = candidate.as_posix()
    path = safe_path(root, relative, must_exist)
    if suffix and path.suffix.lower() != suffix:
        fail("INVALID_OUTPUT", f"Expected a {suffix} artifact.")
    return path


def write_new(root, destination, payload):
    path = artifact_path(root, destination, ".json", False)
    data = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    if len(data.encode("utf-8")) > MAX_PACKET_BYTES:
        fail("OUTPUT_TOO_LARGE", "Result exceeds the artifact size limit; narrow the project or lower the result limit.")
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        path = artifact_path(root, destination, ".json", False)
        with path.open("x", encoding="utf-8", newline="\n") as handle:
            handle.write(data)
    except FileExistsError:
        fail("OUTPUT_EXISTS", "Output already exists; no file was overwritten.")
    except OSError:
        fail("WRITE_FAILED", "Output could not be completed; no success is claimed. Inspect any incomplete new artifact before retrying.")
    return path.relative_to(root).as_posix()


def validate_packet(packet):
    exact_keys(packet, {"schemaVersion", "kind", "query", "projectFilter", "limit", "generatedAt", "registry", "scope", "warnings", "totalMatches", "truncated", "results"}, "packet")
    if type(packet["schemaVersion"]) is not int or packet["schemaVersion"] != VERSION or packet["kind"] != "research-recall":
        fail("INVALID_SCHEMA", "Unsupported packet version or kind.")
    if not isinstance(packet["generatedAt"], str):
        fail("INVALID_SCHEMA", "Packet generation timestamp is invalid.")
    try:
        if datetime.fromisoformat(packet["generatedAt"]).tzinfo is None:
            fail("INVALID_SCHEMA", "Packet timestamp requires a timezone.")
    except ValueError:
        fail("INVALID_SCHEMA", "Packet generation timestamp is invalid.")
    if packet["projectFilter"] is not None and (not isinstance(packet["projectFilter"], str) or not re.fullmatch(r"\d{3}", packet["projectFilter"])):
        fail("INVALID_SCHEMA", "Invalid project filter.")
    exact_keys(packet["registry"], {"path", "sha256"}, "registry")
    exact_keys(packet["scope"], {"description", "projectIds", "filesScanned", "filesSkipped"}, "scope")
    if not isinstance(packet["results"], list) or len(packet["results"]) > 20 or not isinstance(packet["warnings"], list):
        fail("INVALID_SCHEMA", "Invalid results or warnings.")
    for item in packet["warnings"]:
        exact_keys(item, {"code", "path", "message"}, "warning")
        if any(not isinstance(v, str) for v in item.values()):
            fail("INVALID_SCHEMA", "Invalid warning values.")
    for result in packet["results"]:
        exact_keys(result, {"projectId", "projectName", "registeredStatus", "registeredSource", "matchKind", "evidence"}, "result")
        if not isinstance(result["evidence"], list) or not 1 <= len(result["evidence"]) <= 3:
            fail("INVALID_SCHEMA", "Each result requires source evidence.")
        for quote in result["evidence"]:
            exact_keys(quote, {"path", "startLine", "endLine", "text", "sha256"}, "evidence")
            safe_relative(quote["path"])
            if type(quote["startLine"]) is not int or type(quote["endLine"]) is not int or not isinstance(quote["text"], str) or not isinstance(quote["sha256"], str):
                fail("INVALID_SCHEMA", "Invalid evidence values.")


def verify_packet(root, packet):
    validate_packet(packet)
    current = search(root, packet["query"], packet["projectFilter"], packet["limit"])
    for key in packet:
        if key == "generatedAt":
            continue
        # Serialized comparison distinguishes JSON booleans from integers and checks nested fields.
        if json.dumps(packet[key], ensure_ascii=False, sort_keys=True) != json.dumps(current[key], ensure_ascii=False, sort_keys=True):
            fail("EVIDENCE_CHANGED", f"Packet no longer matches current sources or parameters ({key}). Run a new search and review it.")
    return {"schemaVersion": VERSION, "kind": "verification", "verified": True, "verifiedAt": now(), "results": len(packet["results"]), "evidenceCount": sum(len(result["evidence"]) for result in packet["results"]), "scopePartial": bool(packet["warnings"]), "meaning": "Source consistency only; interpretation and real-world claims require human/model review."}


def load_packet(root, value):
    text, _, _ = read_text(artifact_path(root, value, ".json"), MAX_PACKET_BYTES)
    return decode_json(text)


def verify_artifact(root, value):
    if isinstance(value, dict) and value.get("kind") == "research-recall-record":
        exact_keys(value, {"schemaVersion", "kind", "createdAt", "judgment", "verification", "packet"}, "record")
        if type(value["schemaVersion"]) is not int or value["schemaVersion"] != VERSION or not isinstance(value["judgment"], str) or not value["judgment"].strip() or len(value["judgment"]) > 5000:
            fail("INVALID_SCHEMA", "Invalid judgment record.")
        try:
            if not isinstance(value["createdAt"], str) or datetime.fromisoformat(value["createdAt"]).tzinfo is None:
                fail("INVALID_SCHEMA", "Record timestamp requires a timezone.")
        except ValueError:
            fail("INVALID_SCHEMA", "Invalid record timestamp.")
        verification = verify_packet(root, value["packet"])
        exact_keys(value["verification"], verification, "saved verification")
        for key, expected in verification.items():
            if key == "verifiedAt":
                timestamp = value["verification"][key]
                try:
                    if not isinstance(timestamp, str) or datetime.fromisoformat(timestamp).tzinfo is None:
                        fail("INVALID_SCHEMA", "Invalid verification timestamp.")
                except ValueError:
                    fail("INVALID_SCHEMA", "Invalid verification timestamp.")
            elif json.dumps(value["verification"][key], sort_keys=True) != json.dumps(expected, sort_keys=True):
                fail("INVALID_SCHEMA", "Saved verification is inconsistent with current evidence.")
        return verification
    return verify_packet(root, value)


class Parser(argparse.ArgumentParser):
    def error(self, message):
        fail("INVALID_ARGUMENT", message)


def main(argv=None):
    parser = Parser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True, parser_class=Parser)
    search_cmd = commands.add_parser("search", help="Search authorized research sources")
    search_cmd.add_argument("--root", required=True)
    search_cmd.add_argument("--query", required=True)
    search_cmd.add_argument("--project")
    search_cmd.add_argument("--limit", type=int, default=5)
    search_cmd.add_argument("--output")
    read_cmd = commands.add_parser("read", help="Read a bounded source line range")
    read_cmd.add_argument("--root", required=True)
    read_cmd.add_argument("--path", required=True)
    read_cmd.add_argument("--start", type=int, required=True)
    read_cmd.add_argument("--end", type=int, required=True)
    for command in ("verify", "save"):
        sub = commands.add_parser(command)
        sub.add_argument("--root", required=True)
        sub.add_argument("--report", required=True)
        if command == "save":
            sub.add_argument("--judgment-file", required=True)
            sub.add_argument("--output", required=True)
    args = parser.parse_args(argv)
    root = root_path(args.root)
    if args.command == "search":
        packet = search(root, args.query, args.project, args.limit)
        if args.output:
            output = write_new(root, args.output, packet)
            return {"ok": True, "kind": "packet-saved", "output": output, "totalMatches": packet["totalMatches"], "results": len(packet["results"]), "warnings": packet["warnings"]}
        return packet
    if args.command == "read":
        if args.end - args.start + 1 > 200:
            fail("INVALID_RANGE", "Read at most 200 lines per call.")
        registry = load_registry(root)
        project = source_project(args.path, registry["projects"])
        text, digest, _ = read_text(safe_path(root, args.path), MAX_REGISTRY_BYTES if args.path == "projects.json" else MAX_FILE_BYTES)
        return {"schemaVersion": VERSION, "kind": "source", "projectId": project["id"] if project else None, "evidence": evidence(args.path, text, digest, args.start, args.end)}
    packet = load_packet(root, args.report)
    if args.command == "verify":
        return verify_artifact(root, packet)
    verification = verify_packet(root, packet)
    judgment, _, _ = read_text(artifact_path(root, args.judgment_file), 20_000)
    if not judgment.strip() or len(judgment) > 5000:
        fail("INVALID_JUDGMENT", "Judgment must contain 1–5000 characters.")
    # The caller's own judgment remains separate from source evidence and is never certified true.
    record = {"schemaVersion": VERSION, "kind": "research-recall-record", "createdAt": now(), "judgment": judgment, "verification": verification, "packet": packet}
    output = write_new(root, args.output, record)
    return {"ok": True, "kind": "judgment-saved", "output": output, "verification": verification}


if __name__ == "__main__":
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8")
        result = main()
        output = json.dumps(result, ensure_ascii=False, indent=2)
        if len(output.encode("utf-8")) > MAX_PACKET_BYTES:
            fail("OUTPUT_TOO_LARGE", "Result exceeds the output size limit; narrow the project or lower the result limit.")
        print(output)
    except RecallError as error:
        print(json.dumps({"ok": False, "error": {"code": error.code, "message": error.message}}, ensure_ascii=False))
        sys.exit(2)
    except (OSError, ValueError, TypeError, KeyError, RecursionError):
        print(json.dumps({"ok": False, "error": {"code": "INVALID_INPUT", "message": "Input or filesystem state is unsupported; no success is claimed."}}, ensure_ascii=False))
        sys.exit(2)
