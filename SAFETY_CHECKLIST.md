# 🛡️ GaryV2 Repository Safety Checklist

## ⚠️ NEVER DO THESE THINGS

- ❌ **NEVER** add upstream remote pointing to Vercel repositories
- ❌ **NEVER** use `git push` directly (use `git safepush`)
- ❌ **NEVER** merge from or push to `github.com/vercel/*` repositories
- ❌ **NEVER** work directly on main branch without safety checks

## ✅ ALWAYS DO THESE THINGS

- ✅ **ALWAYS** use `git safepush` instead of `git push`
- ✅ **ALWAYS** create feature branches for new work
- ✅ **ALWAYS** run `./scripts/check-repo-safety.sh` before major operations
- ✅ **ALWAYS** verify you're in the right repository before pushing

## 🔧 Safe Git Commands

| Command | Purpose | Usage |
|---------|---------|-------|
| `git safepush` | Safe push to your fork | `git safepush origin branch-name` |
| `git safepull` | Safe pull from your fork | `git safepull origin branch-name` |
| `git safebranch` | Create new branch safely | `git safebranch feature-name` |
| `git safemerge` | Merge with confirmation | `git safemerge branch-name` |
| `git status` | Enhanced status check | `git status` |

## 🚨 Emergency Procedures

### If you accidentally push to Vercel:
1. **STOP** - Don't panic
2. **DON'T** make more commits
3. **Contact** GitHub support immediately
4. **Document** what happened
5. **Use** git hooks to prevent future accidents

### If you're unsure about a repository:
1. Run `./scripts/check-repo-safety.sh`
2. Check `git remote -v`
3. Verify the URL contains `ArkMaster123/garyhomorzipro`

## 📋 Pre-Operation Checklist

Before any major git operation:

- [ ] Run `./scripts/check-repo-safety.sh`
- [ ] Verify current repository URL
- [ ] Check current branch
- [ ] Use safe git commands
- [ ] Create feature branch if needed

## 🔍 Repository Verification

Your repository should be:
- **URL**: `https://github.com/ArkMaster123/garyhomorzipro.git`
- **Owner**: `ArkMaster123`
- **Name**: `garyhomorzipro`

If you see anything different, STOP and verify!

## 🆘 Getting Help

If you're ever unsure:
1. Run the safety check script
2. Check this checklist
3. Ask for help before proceeding
4. Better safe than sorry!

---

**Remember**: It's always better to be cautious and double-check than to accidentally push to the wrong repository! 🛡️
