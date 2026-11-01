# ============================================================
# Локальный статический сервер для разработки (альтернатива
# `npx serve` / `python -m http.server`, без внешних зависимостей).
# Запуск:  powershell -ExecutionPolicy Bypass -File dev-server.ps1
# Адрес:   http://localhost:8123
# ============================================================

$root = $PSScriptRoot
$port = 8123

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "ЕНТ-Спринт: http://localhost:$port (Ctrl+C to stop)"

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
}

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $rel = $ctx.Request.Url.AbsolutePath.TrimStart('/')
  if ([string]::IsNullOrEmpty($rel)) { $rel = 'index.html' }
  $file = [IO.Path]::GetFullPath((Join-Path $root $rel))
  # защита от выхода за пределы проекта (.. в пути)
  if ($file.StartsWith($root, 'OrdinalIgnoreCase') -and (Test-Path $file -PathType Leaf)) {
    $bytes = [IO.File]::ReadAllBytes($file)
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $ctx.Response.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
    $ctx.Response.ContentLength64 = $bytes.Length
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $ctx.Response.StatusCode = 404
  }
  $ctx.Response.Close()
}
