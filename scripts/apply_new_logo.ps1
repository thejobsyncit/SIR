Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Admin\.gemini\antigravity-ide\brain\749834a6-cb38-41fb-bcbc-f946ab735ea2\.user_uploaded\media_1793015632694.png"
$backupPath = "c:\Users\Admin\Downloads\SIR-main\SIR-main\public\images\logo_businessman_backup.png"
$destPath = "c:\Users\Admin\Downloads\SIR-main\SIR-main\public\images\logo.png"
$destFavicon = "c:\Users\Admin\Downloads\SIR-main\SIR-main\public\favicon.png"

# Backup old logo if not already backed up
if (-not (Test-Path $backupPath)) {
    Copy-Item $destPath $backupPath
    Write-Output "Backed up old logo to $backupPath"
}

$srcBmp = New-Object System.Drawing.Bitmap($srcPath)

# Bounding box is minX=37, maxX=784, minY=154, maxY=902 (748 x 749)
# Add a small padding of 12px around the rounded frame
$padding = 12
$cropX = [Math]::Max(0, 37 - $padding)
$cropY = [Math]::Max(0, 154 - $padding)
$cropW = [Math]::Min($srcBmp.Width - $cropX, 748 + ($padding * 2))
$cropH = [Math]::Min($srcBmp.Height - $cropY, 749 + ($padding * 2))

# Make it perfectly square
$squareSize = [Math]::Max($cropW, $cropH)

Write-Output "Cropping to square size: $squareSize x $squareSize at ($cropX, $cropY)"

$targetBmp = New-Object System.Drawing.Bitmap($squareSize, $squareSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($targetBmp)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

# Clear with pure white
$graphics.Clear([System.Drawing.Color]::White)

# Draw the cropped region centered in target
$offsetX = ($squareSize - $cropW) / 2
$offsetY = ($squareSize - $cropH) / 2
$srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$destRect = New-Object System.Drawing.Rectangle($offsetX, $offsetY, $cropW, $cropH)

$graphics.DrawImage($srcBmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$targetBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved high-res square logo to $destPath"

# Also create high-res favicon (128x128)
$favBmp = New-Object System.Drawing.Bitmap(128, 128, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$favG = [System.Drawing.Graphics]::FromImage($favBmp)
$favG.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$favG.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$favG.Clear([System.Drawing.Color]::White)
$favG.DrawImage($targetBmp, 0, 0, 128, 128)
$favBmp.Save($destFavicon, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved favicon to $destFavicon"

$graphics.Dispose()
$targetBmp.Dispose()
$favG.Dispose()
$favBmp.Dispose()
$srcBmp.Dispose()
