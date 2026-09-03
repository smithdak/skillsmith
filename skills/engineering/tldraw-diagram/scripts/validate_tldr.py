#!/usr/bin/env python3
"""Validate a generated .tldr / .tldraw file before handing it off.

Checks, per the tldraw-diagram skill's verify bar:
  - file parses as JSON
  - required top-level keys: tldrawFileFormatVersion, schema, records
  - every record has a typeName and a unique id
  - id prefixes are well-formed (document:, shape:, page:, binding:, asset:, plus session-state prefixes)
  - every non-null parentId resolves to an existing record
  - every arrow binding fromId/toId resolves to existing records
  - document records only (session-state records — instance:, instance_page_state:, camera:, pointer: — are reported as a warning)

Usage: validate_tldr.py <file.tldr> [more.tldr ...]
Exit 0 = clean; exit 1 = errors found. Errors and counts print to stdout.
"""
import json
import sys

REQUIRED_KEYS = ("tldrawFileFormatVersion", "schema", "records")
ALLOWED_PREFIXES = ("document:", "shape:", "page:", "binding:", "asset:", "instance:", "instance_page_state:", "camera:", "pointer:")
DOCUMENT_PREFIXES = ("document:", "shape:", "page:", "binding:", "asset:")
SESSION_PREFIXES = ("instance:", "instance_page_state:", "camera:", "pointer:")


def fail(errors, path, msg):
    errors.append(f"{path}: {msg}")


def validate(path):
    errors = []
    warnings = []
    try:
        with open(path, "r", encoding="utf-8") as fh:
            doc = json.load(fh)
    except (OSError, ValueError) as exc:
        return [f"{path}: not readable JSON ({exc})"], [], {}

    for key in REQUIRED_KEYS:
        if key not in doc:
            fail(errors, path, f"missing top-level key `{key}`")
    if "records" not in doc or not isinstance(doc.get("records"), list):
        fail(errors, path, "`records` must be an array; cannot continue checks")
        return errors, warnings, {}

    records = doc["records"]
    by_id = {}
    dupes = set()
    type_counts = {}
    instance_count = 0
    bindings = []

    for rec in records:
        if not isinstance(rec, dict):
            fail(errors, path, f"record is not an object: {str(rec)[:80]}")
            continue
        type_name = rec.get("typeName", "<missing>")
        type_counts[type_name] = type_counts.get(type_name, 0) + 1
        rid = rec.get("id")
        if not isinstance(rid, str) or ":" not in rid:
            fail(errors, path, f"{type_name} record has missing/malformed id: {str(rid)[:80]}")
            continue
        if not rid.startswith(ALLOWED_PREFIXES):
            fail(errors, path, f"id prefix not recognized: {rid}")
        if rid.startswith(SESSION_PREFIXES):
            instance_count += 1
        if rid in by_id:
            dupes.add(rid)
        by_id[rid] = rec
        if type_name == "binding":
            bindings.append(rec)

    for rid in sorted(dupes):
        fail(errors, path, f"duplicate id: {rid}")

    for rid, rec in sorted(by_id.items()):
        parent = rec.get("parentId")
        if parent in (None, ""):
            continue
        if parent not in by_id:
            fail(errors, path, f"{rid} has dangling parentId `{parent}`")

    for b in bindings:
        bid = b.get("id", "<no-id>")
        for side in ("fromId", "toId"):
            target = b.get(side)
            if target not in by_id:
                fail(errors, path, f"binding {bid} has dangling {side} `{target}`")
        btype = b.get("type")
        if btype != "arrow":
            warnings.append(f"{path}: binding {b.get('id')} has unexpected type `{btype}`")

    if instance_count:
        warnings.append(
            f"{path}: {instance_count} session-state record(s) (instance:/camera:/pointer:); "
            "generated files can omit them"
        )

    version = doc.get("tldrawFileFormatVersion")
    if version is not None and version != 1:
        warnings.append(f"{path}: tldrawFileFormatVersion is {version}, expected 1")

    summary = {
        "records": len(records),
        "shapes": type_counts.get("shape", 0),
        "pages": sum(1 for r in by_id.values() if r.get("typeName") == "page"),
        "bindings": len(bindings),
        "session_state_records": instance_count,
    }
    return errors, warnings, summary


def main(argv):
    if len(argv) < 2:
        print(__doc__.strip())
        return 2
    all_errors = []
    for path in argv[1:]:
        errors, warnings, summary = validate(path)
        status = "FAIL" if errors else "OK"
        print(f"[{status}] {path} — shapes:{summary.get('shapes', 0)} "
              f"pages:{summary.get('pages', 0)} bindings:{summary.get('bindings', 0)}")
        all_errors.extend(errors)
        for w in warnings:
            print(f"  warn: {w}")
        for e in errors:
            print(f"  error: {e}")
    if all_errors:
        print(f"\n{len(all_errors)} error(s); fix before opening in tldraw.")
        return 1
    print("\nAll files loadable: keys present, ids unique, references resolve.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
