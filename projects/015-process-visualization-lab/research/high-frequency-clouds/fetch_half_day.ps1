$ErrorActionPreference = 'Stop'
$cloudDir = $PSScriptRoot
$objects = @()
foreach ($hourNumber in 0..12) {
    $hourCode = '{0:d2}' -f $hourNumber
    $suffix = if ($hourNumber -eq 12) { '1200/' } else { $hourCode }
    $prefix = [uri]::EscapeDataString('AHI-L1b-FLDK/2018/09/16/' + $suffix)
    $listPath = Join-Path $cloudDir ('s3-20180916T' + $hourCode + '-hour-list.xml')
    if (!(Test-Path -LiteralPath $listPath)) {
        Invoke-WebRequest -Uri ('https://noaa-himawari8.s3.amazonaws.com/?list-type=2&prefix=' + $prefix + '&max-keys=200') -OutFile $listPath -TimeoutSec 60
    }
    [xml]$listing = Get-Content -LiteralPath $listPath -Raw
    if ($listing.ListBucketResult.IsTruncated -eq 'true') { throw 'Truncated listing; do not silently omit files.' }
    foreach ($entry in $listing.ListBucketResult.Contents) {
        if ($entry.Key -match '^AHI-L1b-FLDK/2018/09/16/\d{4}/HS_H08_20180916_\d{4}_B13_FLDK_R20_S0101.DAT.bz2$') {
            $objects += [pscustomobject]@{ Key = [string]$entry.Key; Size = [long]$entry.Size; ETag = [string]$entry.ETag; LastModified = [string]$entry.LastModified }
        }
    }
}
$objects = @($objects | Sort-Object Key -Unique)
if ($objects.Count -ne 72) { throw ('Expected the verified 72 observed B13 keys with 02:40 missing, got ' + $objects.Count) }
$expected = 0..72 | ForEach-Object { ([datetime]'2018-09-16T00:00:00').AddMinutes($_ * 10).ToString('HHmm') }
$seenTimes = $objects | ForEach-Object { [regex]::Match($_.Key, '_20180916_(\d{4})_').Groups[1].Value }
$missing = @($expected | Where-Object { $seenTimes -notcontains $_ })
if ($missing.Count -ne 1 -or $missing[0] -ne '0240') { throw 'Unexpected missing-time pattern; review original listings.' }
@{ timeUtc = '2018-09-16T02:40:00Z'; reason = 'No B13 object is present in the verified official S3 listing; cause not established.'; fillPolicy = 'No invented or interpolated frame.' } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $cloudDir 'missing-observations.json') -Encoding utf8
$objects | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath (Join-Path $cloudDir 'half-day-objects.json') -Encoding utf8
$objects | ForEach-Object -Parallel {
    $ErrorActionPreference = 'Stop'
    $item = $_
    $target = Join-Path (Join-Path $using:cloudDir 'raw') ([System.IO.Path]::GetFileName($item.Key))
    if ((Test-Path -LiteralPath $target) -and (Get-Item -LiteralPath $target).Length -eq $item.Size) {
        Write-Output ('cached ' + [System.IO.Path]::GetFileName($target))
        return
    }
    $partial = $target + '.part'
    for ($attempt = 1; $attempt -le 3; $attempt++) {
        try {
            Invoke-WebRequest -Uri ('https://noaa-himawari8.s3.amazonaws.com/' + $item.Key) -OutFile $partial -TimeoutSec 120
            if ((Get-Item -LiteralPath $partial).Length -ne $item.Size) { throw 'Downloaded length differs from S3 listing.' }
            Move-Item -LiteralPath $partial -Destination $target -Force
            Write-Output ('downloaded ' + [System.IO.Path]::GetFileName($target) + ' ' + $item.Size)
            break
        } catch {
            if ($attempt -eq 3) { throw }
        }
    }
} -ThrottleLimit 3
Write-Output ('Completed bounded download of ' + $objects.Count + ' B13 scans.')
