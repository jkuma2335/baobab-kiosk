# Push to New GitHub Repository
# jkuma2335/baobab-kiosk

Write-Host "🔄 Updating GitHub repository to jkuma2335/baobab-kiosk..." -ForegroundColor Green

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "📦 Initializing git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# Remove old remote if exists
Write-Host "🔗 Removing old remote (if exists)..." -ForegroundColor Yellow
git remote remove origin 2>$null

# Add new remote
Write-Host "🔗 Adding new remote repository..." -ForegroundColor Yellow
git remote add origin https://github.com/jkuma2335/baobab-kiosk.git

# Verify remote
Write-Host "✅ Remote configured:" -ForegroundColor Green
git remote -v

# Check if there are changes to commit
Write-Host "`n📝 Checking for changes..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "📦 Adding all files..." -ForegroundColor Yellow
    git add .
    
    Write-Host "💾 Creating commit..." -ForegroundColor Yellow
    git commit -m "Initial commit: Baobab Kiosk - Ready for deployment"
} else {
    Write-Host "✅ No changes to commit" -ForegroundColor Green
}

Write-Host "`n✅ Ready to push!" -ForegroundColor Green
Write-Host "`nNext step: Run this command to push:" -ForegroundColor Cyan
Write-Host "  git push -u origin main" -ForegroundColor White
Write-Host "`nIf you get authentication errors, use:" -ForegroundColor Yellow
Write-Host "  gh auth login  (GitHub CLI)" -ForegroundColor White
Write-Host "  OR use Personal Access Token" -ForegroundColor White
