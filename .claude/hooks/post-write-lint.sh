#!/bin/bash
# Hook: PostToolUse (Write|Edit)
# Auto-format TypeScript/TSX files after write/edit operations
# Works correctly in both main repo and worktree contexts

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//' | sed 's/"$//')

# If we couldn't extract a file path, skip silently
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only lint TypeScript files
if [[ "$FILE_PATH" == *.ts || "$FILE_PATH" == *.tsx ]]; then
  # Resolve the git worktree root (works in both main repo and worktrees)
  REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)

  # Only attempt formatting if we can find node_modules
  if [ -n "$REPO_ROOT" ] && [ -d "$REPO_ROOT/node_modules/.bin" ]; then
    # Try prettier if available
    if [ -x "$REPO_ROOT/node_modules/.bin/prettier" ]; then
      "$REPO_ROOT/node_modules/.bin/prettier" --write "$FILE_PATH" 2>/dev/null
    fi
  fi
  # If node_modules doesn't exist (e.g., fresh worktree), skip silently
fi

exit 0  # Post hooks should always succeed
