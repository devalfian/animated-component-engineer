$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$SkillRoot = Join-Path $RepoRoot "skills\animated-component-engineer"
$Dist = Join-Path $RepoRoot "dist"
$Version = (Get-Content (Join-Path $RepoRoot "VERSION") -Raw).Trim()
$PackageRoot = Join-Path $Dist "package\animated-component-engineer"

if (!(Test-Path (Join-Path $SkillRoot "SKILL.md"))) { throw "Skill package missing SKILL.md" }
if (Test-Path $Dist) { Remove-Item $Dist -Recurse -Force }
New-Item -ItemType Directory -Force -Path $PackageRoot | Out-Null
Copy-Item (Join-Path $SkillRoot "*") $PackageRoot -Recurse -Force

$zip = Join-Path $Dist "animated-component-engineer.zip"
Compress-Archive -Path $PackageRoot -DestinationPath $zip -Force
$hash = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLower()
"$hash  animated-component-engineer.zip" | Set-Content (Join-Path $Dist "SHA256SUMS.txt")
Write-Host "Packaged v$Version -> $zip"
Write-Host "SHA256: $hash"
