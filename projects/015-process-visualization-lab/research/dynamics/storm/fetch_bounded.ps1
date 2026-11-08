$ErrorActionPreference = 'Stop'
$rawDirectory = Join-Path $PSScriptRoot 'raw'
New-Item -ItemType Directory -Path $rawDirectory -Force | Out-Null
$trackArchive = Join-Path $rawDirectory 'bst_all.zip'
if (!(Test-Path -LiteralPath $trackArchive)) {
    Invoke-WebRequest -Uri 'https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/Besttracks/bst_all.zip' -OutFile $trackArchive -TimeoutSec 90
}
# Final window: 23 actual scans, B13 segments 2 and 3 only (about 114 MB).
# Official 10:00 is absent: select 09:50 and 10:10, never manufacture the gap.
# The preliminary 14:00–15:00 source frames had sun/eclipse flags and are excluded.
$start = [datetime]::Parse('2022-09-05T03:00:00Z').ToUniversalTime()
$selections = @(0..21 | ForEach-Object { $start.AddMinutes($_ * 30).ToString('HHmm') } | Where-Object { $_ -ne '1000' }) + @('0950', '1010')
$selections = $selections | Sort-Object
$selections | ForEach-Object -Parallel {
    $ErrorActionPreference = 'Stop'
    $hm = $_
    foreach ($segment in 2, 3) {
        $name = 'HS_H08_20220905_{0}_B13_FLDK_R20_S{1:00}10.DAT.bz2' -f $hm, $segment
        $output = Join-Path $using:rawDirectory $name
        if (Test-Path -LiteralPath $output) { continue }
        $uri = "https://noaa-himawari8.s3.amazonaws.com/AHI-L1b-FLDK/2022/09/05/$hm/$name"
        $temporary = $output + '.part'
        for ($attempt = 1; $attempt -le 3; $attempt++) {
            try {
                Invoke-WebRequest -Uri $uri -OutFile $temporary -TimeoutSec 120
                Move-Item -LiteralPath $temporary -Destination $output
                break
            } catch {
                if ($attempt -eq 3) { throw }
                Start-Sleep -Seconds 2
            }
        }
    }
    Write-Output "Downloaded 2022-09-05 $hm UTC, B13 source segments 2+3."
} -ThrottleLimit 3
