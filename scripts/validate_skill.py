#!/usr/bin/env python3
"""Validate the installable Agent Skill and repository release metadata."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "skills" / "animated-component-engineer"
errors = []

def require(condition, message):
    if not condition:
        errors.append(message)

skill_file = SKILL / "SKILL.md"
require(skill_file.is_file(), "Missing skills/animated-component-engineer/SKILL.md")
if skill_file.is_file():
    content = skill_file.read_text(encoding="utf-8")
    require(content.startswith("---\n"), "SKILL.md must begin with YAML frontmatter")
    match = re.match(r"---\n(.*?)\n---\n", content, re.S)
    require(bool(match), "SKILL.md frontmatter is not closed")
    if match:
        frontmatter = match.group(1)
        require(re.search(r"(?m)^name:\s*animated-component-engineer\s*$", frontmatter) is not None,
                "Frontmatter name must be animated-component-engineer")
        require(re.search(r"(?m)^description:\s*.+$", frontmatter) is not None,
                "Frontmatter description is required")

for folder in ("docs", "templates", "scripts"):
    require((SKILL / folder).is_dir(), f"Missing skill folder: {folder}")

for relative in (
    "docs/exploration-and-design.md",
    "docs/engine-selection.md",
    "docs/motion-patterns.md",
    "docs/motion-vocabulary.md",
    "docs/per-frame-architecture.md",
    "docs/text-motion.md",
    "docs/perf-budget.md",
    "docs/assets-and-illustrations.md",
    "docs/component-architecture.md",
    "docs/performance-accessibility.md",
    "docs/visual-qa.md",
    "templates/animation-brief.md",
    "templates/acceptance-checklist.md",
    "templates/prompt-recipes.md",
    "templates/verification-report.md",
    "templates/decision-record.md",
    "scripts/audit-motion.mjs",
):
    require((SKILL / relative).is_file(), f"Missing required file: {relative}")

audit = SKILL / "scripts" / "audit-motion.mjs"
if audit.is_file():
    audit_text = audit.read_text(encoding="utf-8")
    require(audit_text.startswith("#!/usr/bin/env node"),
            "scripts/audit-motion.mjs must start with a node shebang")
    require("process.exit(fails.length > 0 ? 1 : 0)" in audit_text,
            "scripts/audit-motion.mjs must exit non-zero when there are FAILs")

test_dir = ROOT / "tests" / "test-scenarios"
require(test_dir.is_dir(), "Missing tests/test-scenarios")
if test_dir.is_dir():
    require(len(list(test_dir.glob("*.md"))) >= 5,
            "tests/test-scenarios must contain at least five scenarios")

for fixture in ("tests/fixtures/dirty", "tests/fixtures/clean"):
    require((ROOT / fixture).is_dir(), f"Missing auditor fixture: {fixture}")

version_path = ROOT / "VERSION"
changelog_path = ROOT / "CHANGELOG.md"
require(version_path.is_file(), "Missing VERSION")
require(changelog_path.is_file(), "Missing CHANGELOG.md")
if version_path.is_file() and changelog_path.is_file():
    version = version_path.read_text(encoding="utf-8").strip()
    require(re.fullmatch(r"\d+\.\d+\.\d+", version) is not None, "VERSION must be semantic x.y.z")
    changelog = changelog_path.read_text(encoding="utf-8")
    require(f"## [{version}]" in changelog, "CHANGELOG.md must contain the current VERSION heading")

# Validate local markdown links within the skill package.
for md in SKILL.rglob("*.md"):
    text = md.read_text(encoding="utf-8")
    for target in re.findall(r"\]\(([^)]+)\)", text):
        if target.startswith(("http://", "https://", "#", "mailto:")):
            continue
        path_part = target.split("#", 1)[0]
        if path_part:
            require((md.parent / path_part).resolve().exists(),
                    f"Broken markdown link in {md.relative_to(ROOT)}: {target}")

if errors:
    print("VALIDATION FAILED")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print(f"VALIDATION PASSED — Animated Component Engineer v{version}")
