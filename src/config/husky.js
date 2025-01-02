const huskyHooks = {
  preCommit: `#!/usr/bin/env sh

# Check if it's a merge
git merge HEAD &> /dev/null

IS_MERGE_PROCESS=$?

if [ $IS_MERGE_PROCESS -ne 0 ];
  then
    exit $?
  fi

# Get staged files
STAGED_FILES=$(git diff --cached --name-only)

# Abort if staging area is empty
if [[ "$STAGED_FILES" = "" ]];
  then
    exit 0
  fi

echo "🔍 Running pre-commit checks..."

# Format code with Prettier
echo "💅 Formatting code..."
npm run prettier

git add $STAGED_FILES

echo "✅ Pre-commit checks completed!"`,

  prepareCommitMsg: `exec < /dev/tty && node_modules/.bin/cz --hook || true`,

  commitMsg: `#!/usr/bin/env sh
npx --no -- commitlint --edit $1`,

  prePush: `#!/usr/bin/env sh
echo "🔍 Running pre-push checks..."

# Check formatting with Prettier
echo "💅 Checking formatting..."
npm run format:check

echo "✅ Pre-push checks completed!"`,
};
