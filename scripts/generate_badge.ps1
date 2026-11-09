Add-Type -AssemblyName System.Drawing
$srcPath = Join-Path $PSScriptRoot "..\temp_zip\app-icon-192.png"
$bmp = [System.Drawing.Bitmap]::FromFile((Resolve-Path $srcPath))
$badge = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height)

for ($x = 0; $x -lt $bmp.Width; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $c = $bmp.GetPixel($x, $y)
        $badge.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($c.A, 255, 255, 255))
    }
}

$destPath = Join-Path $PSScriptRoot "..\temp_zip\badge-silhouette.png"
$badge.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$badge.Dispose()
Write-Host "Badge generated successfully at $destPath"

