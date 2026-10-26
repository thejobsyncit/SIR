Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Admin\.gemini\antigravity-ide\brain\749834a6-cb38-41fb-bcbc-f946ab735ea2\.user_uploaded\media_1793015632694.png"
$bmp = New-Object System.Drawing.Bitmap($srcPath)

$w = $bmp.Width
$h = $bmp.Height

Write-Output "Image size: $w x $h"

# Find non-white bounds (anything where R < 245 or G < 245 or B < 245)
$minX = $w
$maxX = 0
$minY = $h
$maxY = 0

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -lt 240 -or $c.G -lt 240 -or $c.B -lt 240) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output "Content Bounding Box: minX=$minX, maxX=$maxX, minY=$minY, maxY=$maxY"
$contentW = $maxX - $minX + 1
$contentH = $maxY - $minY + 1
Write-Output "Content Dimensions: $contentW x $contentH"

$bmp.Dispose()
