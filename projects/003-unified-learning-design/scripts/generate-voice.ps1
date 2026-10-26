$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$projectDir = Split-Path -Parent $PSScriptRoot
$voiceDir = Join-Path $projectDir 'app/voice'
New-Item -ItemType Directory -Path $voiceDir -Force | Out-Null
Push-Location -LiteralPath $projectDir
try {
  # ASCII transport avoids PowerShell 5.1 decoding UTF-8 Chinese as the system code page.
  $encoded = & node --input-type=module -e "import {narrationClips} from './app/replica-script.js'; console.log(Buffer.from(JSON.stringify(narrationClips),'utf8').toString('base64'));"
  if ($LASTEXITCODE -ne 0) { throw 'Unable to read narration script.' }
  $json = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($encoded))
} finally { Pop-Location }
$steps = $json | ConvertFrom-Json
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $speaker.SelectVoice('Microsoft Huihui Desktop')
  $speaker.Rate = 0
  $speaker.Volume = 100
  foreach ($step in $steps) {
    $speaker.SetOutputToWaveFile((Join-Path $voiceDir ($step.id + '.wav')))
    $speaker.Speak($step.text)
    $speaker.SetOutputToNull()
  }
} finally { $speaker.Dispose() }
Write-Output ('Generated {0} local Mandarin narration clips.' -f $steps.Count)
