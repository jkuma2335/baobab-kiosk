# 🚀 Push Your Code to GitHub

Your GitHub repository is ready: **[https://github.com/cursorai053-ship-it/baobab-kiosk](https://github.com/cursorai053-ship-it/baobab-kiosk)**

Currently the repository is empty. Follow these steps to push your code:

## Step 1: Initialize Git (if not already done)

Open PowerShell in your project directory (`E:\Online store`) and run:

```powershell
# Initialize git repository
git init

# Add remote repository
git remote add origin https://github.com/cursorai053-ship-it/baobab-kiosk.git
```

## Step 2: Add and Commit Files

```powershell
# Add all files (respects .gitignore)
git add .

# Create initial commit
git commit -m "Initial commit: Baobab Kiosk - Full stack e-commerce platform"
```

## Step 3: Push to GitHub

```powershell
# Set main branch and push
git branch -M main
git push -u origin main
```

## 🔐 Authentication Options

If you encounter authentication issues, choose one:

### Option A: GitHub CLI (Easiest)

1. Install: https://cli.github.com/
2. Login:
   ```powershell
   gh auth login
   ```
3. Push again:
   ```powershell
   git push -u origin main
   ```

### Option B: Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Generate new token (classic) with `repo` scope
3. Copy the token
4. When pushing, use:
   - **Username**: `cursorai053-ship-it`
   - **Password**: Paste your token

## ✅ Verify

After pushing, visit: https://github.com/cursorai053-ship-it/baobab-kiosk

You should see all your project files!

## 🎯 Next Steps After Push

Once your code is on GitHub:

1. **Deploy Frontend to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import from GitHub
   - Select repository: `baobab-kiosk`
   - Root directory: `client`
   - Deploy!

2. **Deploy Backend to Railway**
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub
   - Select repository: `baobab-kiosk`
   - Root directory: `backend`
   - Add environment variables
   - Deploy!

3. **See Full Guide**
   - Open `QUICK_DEPLOY.md` for detailed deployment steps

---

**Need help?** Check `PUSH_TO_GITHUB.md` for troubleshooting!
