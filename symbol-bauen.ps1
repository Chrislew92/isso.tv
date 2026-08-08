# Baut 353L.ico — der ISSO.TV-Schriftzug aus dem Hauptmenü, im Quadrat.
#
# Exakt die Werte aus dem Spiel (#b0 .mark in der index.html):
#   Hintergrund  --nacht  #2a1258
#   Schrift      Arial Black, --gelb #ffd21e
#   Kontur       --tinte  #0d0d0d
#   Schatten     --pink   #ff3ea5, nach rechts unten versetzt
#   Neigung      -2 Grad
#
# Kein externes Werkzeug: System.Drawing liegt auf jedem Windows. Das Projekt
# hat null Abhängigkeiten, und das gilt auch für die Werkzeuge drumherum.

Add-Type -AssemblyName System.Drawing

$ordner = Split-Path -Parent $MyInvocation.MyCommand.Path
$ziel   = Join-Path $ordner '353L.ico'

$NACHT  = [System.Drawing.Color]::FromArgb(255, 0x2a, 0x12, 0x58)
$GELB   = [System.Drawing.Color]::FromArgb(255, 0xff, 0xd2, 0x1e)
$TINTE  = [System.Drawing.Color]::FromArgb(255, 0x0d, 0x0d, 0x0d)
$PINK   = [System.Drawing.Color]::FromArgb(255, 0xff, 0x3e, 0xa5)

function Zeichne([int]$px) {
  $bmp = New-Object System.Drawing.Bitmap($px, $px, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g   = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear($NACHT)

  # Der Schriftzug als Pfad, damit Kontur und Füllung getrennt gehen —
  # genau wie paint-order:stroke fill im CSS.
  $pfad = New-Object System.Drawing.Drawing2D.GraphicsPath
  $fam  = New-Object System.Drawing.FontFamily('Arial Black')
  $pfad.AddString('ISSO.TV', $fam, [int][System.Drawing.FontStyle]::Bold, ($px * 0.5),
                  (New-Object System.Drawing.PointF(0, 0)),
                  [System.Drawing.StringFormat]::GenericTypographic)

  # Auf die Kachel einpassen, Rand lassen
  $b = $pfad.GetBounds()
  if ($b.Width -gt 0 -and $b.Height -gt 0) {
    $rand  = $px * 0.10
    $platz = $px - 2 * $rand
    $skala = [Math]::Min($platz / $b.Width, ($px * 0.34) / $b.Height)
    $m = New-Object System.Drawing.Drawing2D.Matrix
    $m.Translate(($px / 2), ($px / 2))
    $m.Rotate(-2)                                   # die 2 Grad aus dem CSS
    $m.Scale($skala, $skala)
    $m.Translate((-$b.X - $b.Width / 2), (-$b.Y - $b.Height / 2))
    $pfad.Transform($m)
    $m.Dispose()
  }

  # Pinker Versatz-Schatten
  $v = [Math]::Max(1, $px * 0.045)
  $ms = New-Object System.Drawing.Drawing2D.Matrix
  $ms.Translate($v, $v)
  $schatten = $pfad.Clone()
  $schatten.Transform($ms)
  $g.FillPath((New-Object System.Drawing.SolidBrush($PINK)), $schatten)
  $schatten.Dispose(); $ms.Dispose()

  # Schwarze Kontur, dann gelbe Füllung
  $breite = [Math]::Max(1.2, $px * 0.055)
  $stift = New-Object System.Drawing.Pen($TINTE, $breite)
  $stift.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $g.DrawPath($stift, $pfad)
  $g.FillPath((New-Object System.Drawing.SolidBrush($GELB)), $pfad)

  $stift.Dispose(); $pfad.Dispose(); $fam.Dispose(); $g.Dispose()
  return $bmp
}

$groessen = @(16, 32, 48, 64, 128, 256)
$bloecke = @()
foreach ($px in $groessen) {
  $bmp = Zeichne $px
  $ms  = New-Object System.IO.MemoryStream
  $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
  $bloecke += ,@{ px = $px; daten = $ms.ToArray() }
  $ms.Dispose(); $bmp.Dispose()
}

# ICO zusammensetzen: 6 Byte Kopf, 16 Byte je Eintrag, dann die PNGs
$aus = New-Object System.IO.MemoryStream
$w   = New-Object System.IO.BinaryWriter($aus)
$w.Write([UInt16]0); $w.Write([UInt16]1); $w.Write([UInt16]$bloecke.Count)
$offset = 6 + (16 * $bloecke.Count)
foreach ($b in $bloecke) {
  $p = $b.px
  if ($p -ge 256) { $w.Write([Byte]0); $w.Write([Byte]0) }
  else            { $w.Write([Byte]$p); $w.Write([Byte]$p) }
  $w.Write([Byte]0); $w.Write([Byte]0)
  $w.Write([UInt16]1); $w.Write([UInt16]32)
  $w.Write([UInt32]$b.daten.Length); $w.Write([UInt32]$offset)
  $offset += $b.daten.Length
}
foreach ($b in $bloecke) { $w.Write($b.daten) }
$w.Flush()
[System.IO.File]::WriteAllBytes($ziel, $aus.ToArray())
$w.Dispose(); $aus.Dispose()

"353L.ico gebaut: $([Math]::Round((Get-Item $ziel).Length / 1KB, 1)) KB, Groessen $($groessen -join ', ')"
