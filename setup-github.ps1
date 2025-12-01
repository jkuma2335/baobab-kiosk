# GitHub Setup Script for Baobab Kiosk
# Run this script to push your code to GitHub

Write-Host "🚀 Setting up GitHub repository..." -ForegroundColor Green

# Check if git is installed
try {
    git --version | Out-Null
    Write-Host "✅ Git is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

# Initialize git repository
Write-Host "📦 Initializing git repository..." -ForegroundColor Yellow
git init
git branch -M main

# Add remote repository
Write-Host "🔗 Adding remote repository..." -ForegroundColor Yellow
git remote add origin https://github.com/jkuma2335/baobab-kiosk.git

# Add all files
Write-Host "📝 Adding files to git..." -ForegroundColor Yellow
git add .

# Create initial commit
Write-Host "💾 Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: Baobab Kiosk online store"

Write-Host ""
Write-Host "✅ Repository initialized successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Push to GitHub: git push -u origin main" -ForegroundColor White
Write-Host "2. If you get authentication errors, use:" -ForegroundColor White
Write-Host "   - GitHub CLI: gh auth login" -ForegroundColor White
Write-Host "   - Or use Personal Access Token" -ForegroundColor White
Write-Host ""
Write-Host "Ready to push? Run: git push -u origin main" -ForegroundColor Yellow
