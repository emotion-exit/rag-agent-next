Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Error "pnpm is required but was not found in PATH. Install it first with: npm install -g pnpm"
}

Set-Location $scriptDir

Write-Host "Installing pnpm workspace dependencies..."
pnpm install

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host "Install completed for the Next.js app and services workspace packages."