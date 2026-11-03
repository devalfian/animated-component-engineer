param(
    [string]$Repository = "YOUR_GITHUB_USERNAME/animated-component-engineer",
    [string]$Destination = "$env:USERPROFILE\.cline\skills\animated-component-engineer"
)
$ErrorActionPreference = "Stop"
if ($Repository -like "YOUR_*") { throw "Set -Repository OWNER/REPO before using this updater." }

$release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repository/releases/latest"
$asset = $release.assets | Where-Object { $_.name -eq "animated-component-engineer.zip" } | Select-Object -First 1
if (!$asset) { throw "Latest GitHub Release has no animated-component-engineer.zip asset." }

$temp = Join-Path $env:TEMP ("ace-update-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $temp | Out-Null
$zip = Join-Path $temp "animated-component-engineer.zip"
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zip

$checksumAsset = $release.assets | Where-Object { $_.name -eq "SHA256SUMS.txt" } | Select-Object -First 1
if ($checksumAsset) {
    $checksumFile = Join-Path $temp "SHA256SUMS.txt"
    Invoke-WebRequest -Uri $checksumAsset.browser_download_url -OutFile $checksumFile
    $expected = ((Get-Content $checksumFile | Select-String "animated-component-engineer.zip").ToString() -split "\s+")[0]
    $actual = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLower()
    if ($expected -and $actual -ne $expected.ToLower()) { throw "SHA256 verification failed." }
}

$extract = Join-Path $temp "extract"
Expand-Archive -Path $zip -DestinationPath $extract -Force
$source = Join-Path $extract "animated-component-engineer"
if (!(Test-Path (Join-Path $source "SKILL.md"))) { throw "Release archive layout is invalid." }

if (Test-Path $Destination) {
    $backup = "$Destination.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $Destination $backup -Recurse
    Remove-Item $Destination -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $Destination | Out-Null
Copy-Item (Join-Path $source "*") $Destination -Recurse -Force
Remove-Item $temp -Recurse -Force
Write-Host "Updated Animated Component Engineer from $($release.tag_name)"
