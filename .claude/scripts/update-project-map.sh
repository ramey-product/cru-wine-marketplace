#!/usr/bin/env bash
# update-project-map.sh
# Validates that all paths in PROJECT_MAP.md actually exist on disk.
# Run this after any file moves, renames, or restructuring.
#
# Usage: bash .claude/scripts/update-project-map.sh
#
# Output:
#   - Lists any broken paths found in PROJECT_MAP.md
#   - Lists any untracked .md/.docx files in docs/ not referenced in the map
#   - Exits 0 if everything is consistent, 1 if issues found

set -euo pipefail

MAP_FILE=".claude/PROJECT_MAP.md"
ISSUES=0

echo "=== PROJECT MAP VALIDATOR ==="
echo "Checking: $MAP_FILE"
echo ""

# --- Check 1: Verify all paths in the map exist on disk ---
echo "--- Checking for broken paths ---"
# Extract paths from markdown table cells (second column of tables with | Resource | Path |)
# Also catches backtick-wrapped paths in other contexts
grep -oP '`[^`]+\.(md|docx|sql|sh|ts|tsx|js)`' "$MAP_FILE" | tr -d '`' | sort -u | while read -r path; do
    if [ ! -e "$path" ]; then
        echo "  BROKEN: $path"
        ISSUES=1
    fi
done

# Check directory paths
grep -oP '`[^`]+/`' "$MAP_FILE" | tr -d '`' | sort -u | while read -r dir; do
    if [ ! -d "$dir" ]; then
        echo "  BROKEN DIR: $dir"
        ISSUES=1
    fi
done

echo ""

# --- Check 2: Find untracked docs not in the map ---
echo "--- Checking for untracked documents ---"
find docs/ -type f \( -name "*.md" -o -name "*.docx" -o -name "*.pdf" \) 2>/dev/null | sort | while read -r file; do
    if ! grep -q "$file" "$MAP_FILE"; then
        echo "  UNTRACKED: $file"
        ISSUES=1
    fi
done

echo ""

# --- Check 3: Find untracked work-plan outputs ---
echo "--- Checking for untracked work-plan files ---"
find .claude/work-plan/ -type f -name "*.md" ! -name "README.md" 2>/dev/null | sort | while read -r file; do
    if ! grep -q "$(basename "$file")" "$MAP_FILE" && ! echo "$file" | grep -q "templates/"; then
        echo "  UNTRACKED WORK-PLAN: $file"
        # These are expected to grow — informational only
    fi
done

echo ""
echo "--- Timestamp ---"
echo "Last validated: $(date -u '+%Y-%m-%d %H:%M UTC')"

if [ "$ISSUES" -eq 0 ]; then
    echo ""
    echo "All paths valid. Map is consistent."
    exit 0
else
    echo ""
    echo "Issues found. Update PROJECT_MAP.md to fix broken or untracked paths."
    exit 1
fi
