# 🔄 Update GitHub Repository

Your repository has been changed to: **https://github.com/cursorai053-ship-it/baobab-kiosk**

## Quick Steps to Push to New Repository

### Step 1: Remove Old Remote

```powershell
# Check current remote
git remote -v

# Remove old remote (if exists)
git remote remove origin
```

### Step 2: Add New Remote

```powershell
# Add new remote repository
git remote add origin https://github.com/cursorai053-ship-it/baobab-kiosk.git

# Verify
git remote -v
```

### Step 3: Push to New Repository

```powershell
# Make sure you're on main branch
git branch -M main

# Push to new repository
git push -u origin main
```

---

## If You Get "Repository Already Exists" Error

This means the new repository isn't empty. You have two options:

### Option 1: Force Push (if you want to replace everything)

```powershell
git push -u origin main --force
```

⚠️ **Warning**: This will overwrite anything in the new repository.

### Option 2: Pull and Merge First

```powershell
# Pull existing content
git pull origin main --allow-unrelated-histories

# Resolve any conflicts, then push
git push -u origin main
```

---

## Verify

After pushing, visit: **https://github.com/cursorai053-ship-it/baobab-kiosk**

You should see all your project files!

---

## Next Steps

Once code is pushed to the new repository:

1. ✅ Update Vercel to connect to new repository
2. ✅ Update Railway to connect to new repository  
3. ✅ Continue with deployment steps

All deployment guides have been updated with the new repository URL!
