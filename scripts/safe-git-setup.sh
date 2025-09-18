#!/bin/bash

# Safe Git Setup Script for GaryV2 Project
# This script helps ensure you never accidentally push to Vercel repositories

echo "🛡️  Setting up safe Git configuration for GaryV2..."

# Function to check if we're in the right repository
check_repository() {
    local current_repo=$(git remote get-url origin 2>/dev/null)
    local expected_repo="https://github.com/ArkMaster123/garyhomorzipro.git"
    
    if [[ "$current_repo" != "$expected_repo" ]]; then
        echo "🚨 WARNING: You're not in the expected repository!"
        echo "Expected: $expected_repo"
        echo "Current:  $current_repo"
        echo ""
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Setup cancelled."
            exit 1
        fi
    fi
}

# Check repository
check_repository

# Set up git aliases for safer operations
echo "📝 Setting up safe Git aliases..."

# Safe push alias that always pushes to origin with verification
git config alias.safepush '!f() { 
    echo "🔄 Safe push to your fork..."; 
    git push origin "$@"; 
}; f'

# Safe pull alias that only pulls from your fork
git config alias.safepull '!f() { 
    echo "📥 Safe pull from your fork..."; 
    git pull origin "$@"; 
}; f'

# Branch creation alias with safety check
git config alias.safebranch '!f() { 
    echo "🌿 Creating branch: $1"; 
    git checkout -b "$1"; 
    echo "✅ Branch created. Remember to push with: git safepush -u origin $1"; 
}; f'

# Status check alias
git config alias.status '!f() { 
    echo "📊 Repository Status:"; 
    echo "Repository: $(git remote get-url origin)"; 
    echo "Branch: $(git rev-parse --abbrev-ref HEAD)"; 
    git status; 
}; f'

# Safe merge alias with confirmation
git config alias.safemerge '!f() { 
    echo "🔀 Safe merge of $1 into $(git rev-parse --abbrev-ref HEAD)"; 
    echo "This will merge $1 into your current branch."; 
    read -p "Continue? (y/N): " -n 1 -r; 
    echo; 
    if [[ $REPLY =~ ^[Yy]$ ]]; then 
        git merge "$1"; 
    else 
        echo "Merge cancelled."; 
    fi; 
}; f'

echo "✅ Safe Git aliases configured!"
echo ""
echo "Available safe commands:"
echo "  git safepush    - Safe push to your fork"
echo "  git safepull    - Safe pull from your fork"
echo "  git safebranch  - Create new branch safely"
echo "  git safemerge   - Merge branches with confirmation"
echo "  git status      - Enhanced status with repo info"
echo ""
echo "🛡️  Git hooks installed to prevent dangerous operations!"
echo ""
echo "💡 Tips:"
echo "  - Always use 'git safepush' instead of 'git push'"
echo "  - Check 'git status' before major operations"
echo "  - Never add 'upstream' remote pointing to Vercel"
echo "  - Use feature branches for development"
