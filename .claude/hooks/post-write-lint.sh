#!/bin/bash
# Hook: PostToolUse (Write|Edit)
# Auto-format TypeScript/TSX files after write/edit operations

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//' | sed 's/"$//')

# Only lint TypeScript files
if [[ "$FILE_PATH" == *.ts || "$FILE_PATH" == *.tsx ]]; then
  # Check if npx is available and project has prettier/eslint
  if command -v npx &> /dev/null; then
    # Try prettier first (fast formatting)
    if [ -f "node_modules/.bin/prettier" ] || [ -f ".prettierrc" ] || [ -f ".prettierrc.json" ]; then
      npx prettier --write "$FILE_PATH" 2>/dev/null
    fi
  fi
fi

exit 0  # Post hooks should always succeed
