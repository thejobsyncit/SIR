Add-Type -AssemblyName System.Drawing

$srcPath = "c:\Users\Admin\Downloads\SIR-main\SIR-main\public\images\logo.png"
$bmp = New-Object System.Drawing.Bitmap($srcPath)
$w = $bmp.Width
$h = $bmp.Height

Write-Output "Processing logo transparency for $w x $h..."

# We will do a BFS flood fill from (0,0), (w-1,0), (0,h-1), (w-1,h-1)
# To turn outer white background into transparent (Alpha = 0).
# The border is black/gold where R, G, B are significantly lower or different than pure white.

$visited = New-Object 'bool[,]' $w, $h
$queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]

function EnqueueIfValid($x, $y) {
    if ($x -ge 0 -and $x -lt $w -and $y -ge 0 -and $y -lt $h) {
        if (-not $visited[$x, $y]) {
            $c = $bmp.GetPixel($x, $y)
            # Check if it's near-white background (R > 235, G > 235, B > 235)
            # The black border has R < 50, G < 50, B < 50
            # The gold border has R ~ 200, G ~ 160, B ~ 60 (B < 150)
            # So anything where R > 230 and G > 230 and B > 230 is outer white!
            if ($c.R -gt 230 -and $c.G -gt 230 -and $c.B -gt 230) {
                $visited[$x, $y] = $true
                $queue.Enqueue((New-Object System.Drawing.Point($x, $y)))
            }
        }
    }
}

# Start from corners and edges
for ($x = 0; $x -lt $w; $x++) {
    EnqueueIfValid $x 0
    EnqueueIfValid $x ($h - 1)
}
for ($y = 0; $y -lt $h; $y++) {
    EnqueueIfValid 0 $y
    EnqueueIfValid ($w - 1) $y
}

$transparentColor = [System.Drawing.Color]::FromArgb(0, 255, 255, 255)
$count = 0

while ($queue.Count -gt 0) {
    $pt = $queue.Dequeue()
    $bmp.SetPixel($pt.X, $pt.Y, $transparentColor)
    $count++

    EnqueueIfValid ($pt.X + 1) $pt.Y
    EnqueueIfValid ($pt.X - 1) $pt.Y
    EnqueueIfValid $pt.X ($pt.Y + 1)
    EnqueueIfValid $pt.X ($pt.Y - 1)
}

Write-Output "Made $count outer pixels transparent."

$tempLogoPath = "c:\Users\Admin\Downloads\SIR-main\SIR-main\public\images\logo_trans_temp.png"
$bmp.Save($tempLogoPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved to temp path: $tempLogoPath"

# Also update favicon
$favPath = "c:\Users\Admin\Downloads\SIR-main\SIR-main\public\favicon.png"
$favBmp = New-Object System.Drawing.Bitmap(128, 128, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$favG = [System.Drawing.Graphics]::FromImage($favBmp)
$favG.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$favG.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$favG.Clear([System.Drawing.Color]::Transparent)
$favG.DrawImage($bmp, 0, 0, 128, 128)
$favG.Dispose()
$favBmp.Save($favPath, [System.Drawing.Imaging.ImageFormat]::Png)
$favBmp.Dispose()

# Dispose source bitmap so lock is released
$bmp.Dispose()

# Move temp file to overwrite logo.png
Move-Item -Path $tempLogoPath -Destination $srcPath -Force
Write-Output "Successfully replaced $srcPath with transparent-outside logo!"
