$ErrorActionPreference = 'Stop'
$research = $PSScriptRoot
$rawDir = Join-Path $research 'raw'
New-Item -ItemType Directory -Path $rawDir -Force | Out-Null
$base = 'https://noaa-himawari8.s3.amazonaws.com/'
$items = [System.Collections.Generic.List[object]]::new()
foreach ($hour in @('03','04','05','06','07')) {
    $url = $base + '?list-type=2&prefix=AHI-L1b-FLDK/2022/01/15/' + $hour
    $listing = $null
    for ($attempt=1; $attempt -le 3; $attempt++) {
        try { $listing = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 40; break }
        catch { if ($attempt -eq 3) { throw }; Start-Sleep -Seconds 1 }
    }
    $listingFile = Join-Path $research ('s3-20220115T' + $hour + '-list.xml')
    [IO.File]::WriteAllText($listingFile, $listing.Content)
    [xml]$xml = $listing.Content
    if ($xml.ListBucketResult.IsTruncated -eq 'true') { throw 'Listing truncated; cannot claim complete coverage.' }
    foreach ($entry in $xml.ListBucketResult.Contents) {
        if ($entry.Key -match '/(\d{4})/HS_H08_20220115_\1_B13_FLDK_R20_S0[78]10\.DAT\.bz2$') {
            $hm = $Matches[1]
            if ([int]$hm -ge 350 -and [int]$hm -le 750) {
                $items.Add([pscustomobject]@{key=[string]$entry.Key; bytes=[long]$entry.Size; sourceUrl=$base+[string]$entry.Key; nominalTimeUtc=('2022-01-15T'+$hm.Substring(0,2)+':'+$hm.Substring(2,2)+':00Z')})
            }
        }
    }
}
$items | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $research 'listed-objects.json') -Encoding utf8NoBOM
$results = $items | ForEach-Object -Parallel {
    $entry = $_
    $file = Join-Path $using:rawDir ([IO.Path]::GetFileName($entry.key))
    $ok = $false
    for ($attempt=1; $attempt -le 3; $attempt++) {
        try {
            if (!(Test-Path -LiteralPath $file) -or (Get-Item -LiteralPath $file).Length -ne $entry.bytes) {
                Invoke-WebRequest -Uri $entry.sourceUrl -UseBasicParsing -TimeoutSec 90 -OutFile $file
            }
            if ((Get-Item -LiteralPath $file).Length -ne $entry.bytes) { throw 'Downloaded size differs from official listing.' }
            $ok = $true; break
        } catch { $lastError=$_.Exception.Message; if ($attempt -lt 3) { Start-Sleep -Seconds 1 } }
    }
    if ($ok) {
        [pscustomobject]@{sourceUrl=$entry.sourceUrl; nominalTimeUtc=$entry.nominalTimeUtc; file=('raw/'+[IO.Path]::GetFileName($file)); bytes=$entry.bytes; sha256=(Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLower(); retrievedAtUtc=(Get-Item -LiteralPath $file).LastWriteTimeUtc.ToString('o'); status='ok'}
    } else {
        [pscustomobject]@{sourceUrl=$entry.sourceUrl; nominalTimeUtc=$entry.nominalTimeUtc; status='error'; error=$lastError}
    }
} -ThrottleLimit 3
$results | Sort-Object sourceUrl | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $research 'download-receipt.json') -Encoding utf8NoBOM
[pscustomobject]@{listed=$items.Count; downloaded=@($results | Where-Object status -eq 'ok').Count; errors=@($results | Where-Object status -eq 'error').Count; bytes=($results | Measure-Object bytes -Sum).Sum} | ConvertTo-Json
if (@($results | Where-Object status -eq 'error').Count) { exit 1 }
