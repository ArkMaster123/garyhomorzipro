#!/bin/bash

# Repository Safety Check Script
# Run this script to verify your repository is safe from Vercel accidents

echo "🔍 Checking repository safety..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ "$1" = "OK" ]; then
        echo -e "${GREEN}✅ $2${NC}"
    elif [ "$1" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  $2${NC}"
    else
        echo -e "${RED}🚨 $2${NC}"
    fi
}

# Check current repository
current_repo=$(git remote get-url origin 2>/dev/null)
expected_repo="https://github.com/ArkMaster123/garyhomorzipro.git"

echo "📊 Repository Information:"
echo "  Current: $current_repo"
echo "  Expected: $expected_repo"
echo ""

# Check if we're in the right repository
if [[ "$current_repo" == "$expected_repo" ]]; then
    print_status "OK" "Repository is correct (your fork)"
else
    print_status "ERROR" "Repository mismatch! You might be in the wrong repo"
fi

# Check for dangerous remotes
echo ""
echo "🔗 Remote Configuration:"
git remote -v | while read remote_name remote_url direction; do
    if [[ "$remote_url" == *"vercel"* ]] && [[ "$remote_url" != *"ArkMaster123"* ]]; then
        print_status "ERROR" "Dangerous remote found: $remote_name -> $remote_url"
    else
        print_status "OK" "$remote_name -> $remote_url"
    fi
done

# Check current branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
echo ""
echo "🌿 Current Branch: $current_branch"

# Check for upstream tracking
upstream_branch=$(git rev-parse --abbrev-ref @{upstream} 2>/dev/null)
if [[ -n "$upstream_branch" ]]; then
    echo "  Upstream: $upstream_branch"
    if [[ "$upstream_branch" == *"vercel"* ]]; then
        print_status "ERROR" "Upstream branch points to Vercel repository!"
    else
        print_status "OK" "Upstream branch is safe"
    fi
else
    print_status "WARN" "No upstream branch set"
fi

# Check for git hooks
echo ""
echo "🪝 Git Hooks Status:"
if [[ -f ".git/hooks/pre-push" ]]; then
    print_status "OK" "Pre-push hook installed"
else
    print_status "WARN" "Pre-push hook missing"
fi

if [[ -f ".git/hooks/pre-commit" ]]; then
    print_status "OK" "Pre-commit hook installed"
else
    print_status "WARN" "Pre-commit hook missing"
fi

# Check git aliases
echo ""
echo "🔧 Safe Git Aliases:"
aliases=("safepush" "safepull" "safebranch" "safemerge")
for alias in "${aliases[@]}"; do
    if git config --get "alias.$alias" >/dev/null 2>&1; then
        print_status "OK" "Alias '$alias' configured"
    else
        print_status "WARN" "Alias '$alias' not configured"
    fi
done

echo ""
echo "📋 Safety Recommendations:"
echo "  1. Always use 'git safepush' instead of 'git push'"
echo "  2. Never add upstream remote pointing to Vercel"
echo "  3. Use feature branches for development"
echo "  4. Run this check before major operations"
echo "  5. Keep your fork synchronized with your own changes only"

echo ""
echo "🔍 Safety check complete!"
