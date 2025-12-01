# 📤 Push Code to GitHub

Your repository is ready at: https://github.com/jkuma2335/baobab-kiosk

## Quick Setup (PowerShell)

### Option 1: Use the Setup Script

```powershell
# Run the setup script
.\setup-github.ps1

# Then push to GitHub
git push -u origin main
```

### Option 2: Manual Setup

Run these commands one by one:

```powershell
# 1. Initialize git repository
git init

# 2. Add remote repository
git remote add origin https://github.com/jkuma2335/baobab-kiosk.git

# 3. Add all files
git add .

# 4. Create initial commit
git commit -m "Initial commit: Baobab Kiosk online store"

# 5. Set main branch
git branch -M main

# 6. Push to GitHub
git push -u origin main
```

## Authentication Issues?

If you get authentication errors, you have two options:

### Option A: GitHub CLI (Recommended)

1. Install GitHub CLI: https://cli.github.com/
2. Login:
   ```powershell
   gh auth login
   ```
3. Then push:
   ```powershell
   git push -u origin main
   ```

### Option B: Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use token as password when pushing:
   ```powershell
   git push -u origin main
   # Username: your-github-username
   # Password: paste-your-token-here
   ```

## Verify Push

After pushing, check:
- Visit: https://github.com/jkuma2335/baobab-kiosk
- You should see all your files

## Next Steps After Push

1. ✅ Deploy Frontend to Vercel
   - Import from GitHub repo
   - Set root directory to `client`

2. ✅ Deploy Backend to Railway
   - Connect GitHub repo
   - Set root directory to `backend`

3. ✅ Set up environment variables (see DEPLOYMENT_GUIDE.md)

## Troubleshooting

**"remote origin already exists"**
```powershell
git remote remove origin
git remote add origin https://github.com/jkuma2335/baobab-kiosk.git
```

**"fatal: refusing to merge unrelated histories"**
```powershell
git pull origin main --allow-unrelated-histories
git push -u origin main
```

**"Authentication failed"**
- Use GitHub CLI or Personal Access Token (see above)

---

**Ready to deploy after pushing?** Follow `QUICK_DEPLOY.md` next!
