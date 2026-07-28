$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8000/')
$listener.Start()
Write-Host 'Server started on http://localhost:8000/'
$root = $PSScriptRoot
while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    $p = $req.Url.LocalPath
    if ($p -eq '/') { $p = '/index.html' }
    $fp = Join-Path $root $p.TrimStart('/')
    if (Test-Path -LiteralPath $fp -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($fp)
      switch ($ext) {
        '.html' { $res.ContentType = 'text/html; charset=utf-8' }
      '.css'  { $res.ContentType = 'text/css; charset=utf-8' }
      '.js'   { $res.ContentType = 'application/javascript; charset=utf-8' }
      '.png'  { $res.ContentType = 'image/png' }
      '.jpg'  { $res.ContentType = 'image/jpeg' }
      '.jpeg' { $res.ContentType = 'image/jpeg' }
      '.mp3'  { $res.ContentType = 'audio/mpeg' }
      '.flac' { $res.ContentType = 'audio/flac' }
        default { $res.ContentType = 'application/octet-stream' }
      }
      $bytes = [System.IO.File]::ReadAllBytes($fp)
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $res.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
      $res.OutputStream.Write($msg, 0, $msg.Length)
    }
    $res.Close()
  } catch {
    break
  }
}
