param([int]$Port=8011,[string]$LibraryRoot='')
$ErrorActionPreference='Stop'
$poseProject=Split-Path $PSScriptRoot -Parent
$poseUrl="http://127.0.0.1:$Port"
$poseExisting=Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
if ($poseExisting) {
  try { $poseInfo=Invoke-RestMethod "$poseUrl/api/local-library" -TimeoutSec 4; if ($poseInfo.mode -eq 'local-private') { Write-Output "Local workspace already running: $poseUrl/app/#gallery"; exit 0 } } catch {}
  throw "Port $Port is in use. Choose another port with -Port."
}
$poseState=Join-Path $poseProject '.local'
New-Item -ItemType Directory -Path $poseState -Force | Out-Null
$poseNode=(Get-Command node -ErrorAction Stop).Source
$poseServe=Join-Path $PSScriptRoot 'serve.mjs'
$env:POSE_LOOK_PORT=[string]$Port
if ($LibraryRoot) { $env:POSE_LOOK_LIBRARY=$LibraryRoot }
$poseProcess=Start-Process -FilePath $poseNode -ArgumentList @(('"'+$poseServe+'"')) -WorkingDirectory $poseProject -WindowStyle Hidden -RedirectStandardOutput (Join-Path $poseState 'server.stdout.log') -RedirectStandardError (Join-Path $poseState 'server.stderr.log') -PassThru
@{pid=$poseProcess.Id;port=$Port;url="$poseUrl/app/#gallery";script=$poseServe} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $poseState 'server-state.json') -Encoding UTF8
for ($poseAttempt=0;$poseAttempt -lt 20;$poseAttempt++) {
  try { $poseResponse=Invoke-WebRequest "$poseUrl/app/" -UseBasicParsing -TimeoutSec 2; if ($poseResponse.StatusCode -eq 200) { Write-Output "Local workspace ready: $poseUrl/app/#gallery"; exit 0 } } catch {}
  Start-Sleep -Milliseconds 250
}
throw "Local server did not become ready. See .local/server.stderr.log."
