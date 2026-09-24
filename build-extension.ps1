param(
    [string]$Version = "1.0.0"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $root "extension"
$build = Join-Path $root "dist\build"
$dist = Join-Path $root "dist"
$zipName = "tecnoincubadora-extension-v$Version.zip"
$zipPath = Join-Path $dist $zipName

if (Test-Path $build) { Remove-Item -Recurse -Force $build }
New-Item -ItemType Directory -Force -Path $dist | Out-Null
New-Item -ItemType Directory -Force -Path $build | Out-Null

Copy-Item -Recurse -Force "$src\*" $build

$manifestPath = Join-Path $build "manifest.json"
$manifest = Get-Content -Raw $manifestPath | ConvertFrom-Json

$manifest.host_permissions = @($manifest.host_permissions | Where-Object {
    $_ -notmatch "localhost|127\.0\.0\.1"
})

($manifest | ConvertTo-Json -Depth 10) | Set-Content -Encoding UTF8 $manifestPath

if (Test-Path $zipPath) { Remove-Item -Force $zipPath }

Push-Location $build
try {
    Compress-Archive -Path * -DestinationPath $zipPath -Force
} finally {
    Pop-Location
}

Remove-Item -Recurse -Force $build

Write-Output "Build OK: $zipPath"
Write-Output "Manifest: version $($manifest.version) | name: $($manifest.name)"
Write-Output "host_permissions:"
$manifest.host_permissions | ForEach-Object { Write-Output "  - $_" }