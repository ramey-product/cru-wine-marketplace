#!/bin/bash
# Hook: PreToolUse (Edit|Write)
# Prevents agents from modifying auto-generated or critical files

# Read the tool input from stdin
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//' | sed 's/"$//')

# Protected file patterns
PROTECTED_FILES=(
  "types/database.ts"
  "package-lock.json"
  "pnpm-lock.yaml"
  "yarn.lock"
  ".env"
  ".env.local"
  ".env.production"
)

for pattern in "${PROTECTED_FILES[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "BLOCKED: $FILE_PATH is a generated/protected file. Do not edit directly."
    echo "  - database.ts: Run 'supabase gen types' instead"
    echo "  - Lock files: Run package manager install instead"
    echo "  - .env files: Configure through environment variable management"
    exit 2  # Exit code 2 = block the tool use
  fi
done

exit 0  # Allow the operation
