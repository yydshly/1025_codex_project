$ErrorActionPreference='Stop'
$poseProject=Split-Path $PSScriptRoot -Parent
$poseStatePath=Join-Path $poseProject '.local/server-state.json'
if (!(Test-Path -LiteralPath $poseStatePath)) { Write-Output 'No local workspace process recorded.'; exit 0 }
$poseState=Get-Content -LiteralPath $poseStatePath -Raw | ConvertFrom-Json
$poseProcess=Get-CimInstance Win32_Process -Filter "ProcessId=$($poseState.pid)" -ErrorAction SilentlyContinue
if (!$poseProcess) { Write-Output 'Local workspace is already stopped.'; exit 0 }
$poseExpected=Join-Path $PSScriptRoot 'serve.mjs'
if ($poseProcess.Name -ne 'node.exe' -or !$poseProcess.CommandLine.Contains($poseExpected)) { throw 'Recorded process does not match this workspace; no process was stopped.' }
Stop-Process -Id $poseProcess.ProcessId
Write-Output 'Stopped this local workspace server.'
