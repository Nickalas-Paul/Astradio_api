# Setup API Repository Script
# This script helps push the API deployment to GitHub

Write-Host "🚀 Setting up API repository..." -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

# Get the repository URL from user
$repoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/astradio-api.git)"

if (-not $repoUrl) {
    Write-Host "❌ No repository URL provided. Please run the script again." -ForegroundColor Red
    exit 1
}

# Add remote and push
Write-Host "📦 Adding remote repository..." -ForegroundColor Cyan
git remote add origin $repoUrl

Write-Host "🔄 Setting branch to main..." -ForegroundColor Cyan
git branch -M main

Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host ""
Write-Host "✅ API repository setup complete!" -ForegroundColor Green
Write-Host "📁 Repository: $repoUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Go to Railway.app and create new project" -ForegroundColor White
Write-Host "2. Connect to your astradio-api repository" -ForegroundColor White
Write-Host "3. Configure build settings" -ForegroundColor White
Write-Host "4. Deploy!" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Your API is now ready for Railway deployment!" -ForegroundColor Green 