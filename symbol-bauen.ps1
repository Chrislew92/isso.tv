# Baut 353L.ico — das ISSO.TV-Quadrat vom Startbildschirm über dem 353L.EXE-Text.
#
# Warum von Hand und nicht mit einem Werkzeug: das Projekt hat null externe
# Abhängigkeiten, und das soll auch für die Werkzeuge drumherum gelten.
# System.Drawing liegt auf jedem Windows, mehr braucht es nicht.
#
# Kleine Größen kriegen weniger Text — 16 Pixel fassen kein "353L.EXE".

Add-Type -AssemblyName System.Drawing

$ordner = Split-Path -Parent $MyInvocation.MyCommand.Path
$ziel   = Join-Path $ordner '353L.ico'

$GELB   = [System.Drawing.Color]::FromArgb(255, 255, 210, 31)
$TINTE  = [System.Drawing.Color]::FromArgb(255, 13, 13, 13)
$PAPIER = [System.Drawing.Color]::FromArgb(255, 240, 237, 225)

function Zeichne([int]$px) {
  $bmp = New-Object System.Drawing.Bitmap($px, $px, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g   = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  # Grund: schwarzes Quadrat mit gelbem Rahmen
  $g.Clear($TINTE)
  $rand = [Math]::Max(1, [int]($px * 0.06))
  $stift = New-Object System.Drawing.Pen($GELB, $rand)
  $g.DrawRectangle($stift, [int]($rand/2), [int]($rand/2), $px - $rand, $px - $rand)

  # Scanlines wie auf dem Startbildschirm
  if ($px -ge 32) {
    $dunkel = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 0, 0, 0))
    for ($y = 0; $y -lt $px; $y += 3) { $g.FillRectangle($dunkel, 0, $y, $px, 1) }
    $dunkel.Dispose()
  }

  $mitte = New-Object System.Drawing.StringFormat
  $mitte.Alignment     = [System.Drawing.StringAlignment]::Center
  $mitte.LineAlignment = [System.Drawing.StringAlignment]::Center

  $pinselP = New-Object System.Drawing.SolidBrush($PAPIER)
  $pinselG = New-Object System.Drawing.SolidBrush($GELB)

  if ($px -ge 48) {
    # Groß: ISSO.TV oben, 353L.EXE unten — genau wie gewünscht
    # 0.20 lief bei 256 px über den Rahmen hinaus — 0.165 passt in allen Größen
    $f1 = New-Object System.Drawing.Font('Arial Black', ($px * 0.165), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $f2 = New-Object System.Drawing.Font('Consolas',    ($px * 0.125), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $r1 = New-Object System.Drawing.RectangleF(0, ($px * 0.20), $px, ($px * 0.30))
    $r2 = New-Object System.Drawing.RectangleF(0, ($px * 0.56), $px, ($px * 0.24))
    $g.DrawString('ISSO.TV', $f1, $pinselP, $r1, $mitte)
    $g.DrawString('353L.EXE', $f2, $pinselG, $r2, $mitte)
    # Trennstrich zwischen beiden
    $linie = New-Object System.Drawing.Pen($GELB, [Math]::Max(1, [int]($px * 0.02)))
    $g.DrawLine($linie, ($px * 0.28), ($px * 0.53), ($px * 0.72), ($px * 0.53))
    $linie.Dispose(); $f1.Dispose(); $f2.Dispose()
  }
  elseif ($px -ge 32) {
    # Mittel: nur 353L, sonst wird es Matsch. 0.34 brach in zwei Zeilen um.
    $f = New-Object System.Drawing.Font('Arial Black', ($px * 0.24), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $r = New-Object System.Drawing.RectangleF(0, 0, $px, $px)
    $mitte.FormatFlags = [System.Drawing.StringFormatFlags]::NoWrap
    $g.DrawString('353L', $f, $pinselP, $r, $mitte)
    $f.Dispose()
  }
  else {
    # Klein: eine Ziffer, sonst ist nichts mehr zu erkennen
    $f = New-Object System.Drawing.Font('Arial Black', ($px * 0.72), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $r = New-Object System.Drawing.RectangleF(0, 0, $px, $px)
    $g.DrawString('3', $f, $pinselG, $r, $mitte)
    $f.Dispose()
  }

  $pinselP.Dispose(); $pinselG.Dispose(); $mitte.Dispose(); $stift.Dispose(); $g.Dispose()
  return $bmp
}

# Jede Größe als PNG in den Speicher. PNG-in-ICO können alle Windows ab Vista.
$groessen = @(16, 32, 48, 64, 128, 256)
$bloecke = @()
foreach ($px in $groessen) {
  $bmp = Zeichne $px
  $ms  = New-Object System.IO.MemoryStream
  $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
  $bloecke += ,@{ px = $px; daten = $ms.ToArray() }
  $ms.Dispose(); $bmp.Dispose()
}

# ICO zusammensetzen: 6 Byte Kopf, dann 16 Byte je Eintrag, dann die PNGs
$aus = New-Object System.IO.MemoryStream
$w   = New-Object System.IO.BinaryWriter($aus)
$w.Write([UInt16]0); $w.Write([UInt16]1); $w.Write([UInt16]$bloecke.Count)

$offset = 6 + (16 * $bloecke.Count)
foreach ($b in $bloecke) {
  $p = $b.px
  if ($p -ge 256) { $w.Write([Byte]0) } else { $w.Write([Byte]$p)   }   # 0 heisst 256
  if ($p -ge 256) { $w.Write([Byte]0) } else { $w.Write([Byte]$p)   }
  $w.Write([Byte]0)                 # keine Palette
  $w.Write([Byte]0)                 # reserviert
  $w.Write([UInt16]1)               # Farbebenen
  $w.Write([UInt16]32)              # Bit pro Pixel
  $w.Write([UInt32]$b.daten.Length)
  $w.Write([UInt32]$offset)
  $offset += $b.daten.Length
}
foreach ($b in $bloecke) { $w.Write($b.daten) }
$w.Flush()
[System.IO.File]::WriteAllBytes($ziel, $aus.ToArray())
$w.Dispose(); $aus.Dispose()

$kb = [Math]::Round((Get-Item $ziel).Length / 1KB, 1)
"353L.ico gebaut: $kb KB, Groessen $($groessen -join ', ')"
