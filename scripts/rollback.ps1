param(
    [string]$Destination = "$env:USERPROFILE\.cline\skills\animated-component-engineer"
)
$ErrorActionPreference = "Stop"
$parent = Split-Path -Parent $Destination
$name = Split-Path -Leaf $Destination
$backups = Get-ChildItem $parent -Directory -Filter "$name.backup-*" | Sort-Object LastWriteTime -Descending
if (!$backups) { throw "No backup found for $Destination" }

for ($i = 0; $i -lt $backups.Count; $i++) {
    Write-Host "[$i] $($backups[$i].FullName)"
}
$choice = Read-Host "Select backup number"
$index = 0
if (![int]::TryParse($choice, [ref]$index) -or $index -lt 0 -or $index -ge $backups.Count) {
    throw "Invalid selection."
}
if (Test-Path $Destination) { Remove-Item $Destination -Recurse -Force }
Copy-Item $backups[$index].FullName $Destination -Recurse
Write-Host "Restored $($backups[$index].FullName)"
