# 🔄 Update to New GitHub Repository

Your new repository: **https://github.com/jkuma2335/baobab-kiosk**

## Quick Commands to Update Repository

Run these commands in PowerShell in your project directory:

```powershell
# 1. Remove old remote (if exists)
git remote remove origin

# 2. Add new remote
git remote add origin https://github.com/jkuma2335/baobab-kiosk.git

# 3. Verify
git remote -v

# 4. Ensure you're on main branch
git branch -M main

# 5. Add all files (if not already committed)
git add .

# 6. Commit (if there are changes)
git commit -m "Update: Change repository to jkuma2335"

# 7. Push to new repository
git push -u origin main
```

## Or Use the Automated Script

```powershell
.\PUSH_TO_NEW_REPO.ps1
git push -u origin main
```

## Verify

After pushing, visit: **https://github.com/jkuma2335/baobab-kiosk**

You should see all your files!

## Authentication

If you get authentication errors:

1. **Use GitHub CLI** (recommended):
   ```powershell
   gh auth login
   git push -u origin main
   ```

2. **Or use Personal Access Token**:
   - Go to: https://github.com/settings/tokens
   - Generate new token (classic) with `repo` scope
   - Use token as password when pushing

---

**All deployment guides have been updated with the new repository URL!** ✅
