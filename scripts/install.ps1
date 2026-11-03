param(
    [switch]$Force,
    [string]$Destination = "$env:USERPROFILE\.cline\skills\animated-component-engineer"
)
$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$Source = Join-Path $RepoRoot "skills\animated-component-engineer"

if (!(Test-Path (Join-Path $Source "SKILL.md"))) {
    throw "Skill source not found: $Source"
}
if ((Test-Path $Destination) -and !$Force) {
    throw "Destination exists. Re-run with -Force to back it up and replace it."
}
if (Test-Path $Destination) {
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backup = "$Destination.backup-$stamp"
    Copy-Item $Destination $backup -Recurse
    Write-Host "Backup created: $backup"
}
New-Item -ItemType Directory -Force -Path $Destination | Out-Null
Copy-Item (Join-Path $Source "*") $Destination -Recurse -Force
Write-Host "Installed Animated Component Engineer to $Destination"
