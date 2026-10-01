// Simple Node static server to serve build with security headers
// eslint-disable-next-line @typescript-eslint/no-var-requires
const http = require('http')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')

const port = process.env.PORT || 3000
const buildDir = path.join(__dirname, 'build')

// Precompute path to AASA file in public/.well-known (copied to build at build time)
const aasaRelative = path.join('.well-known', 'apple-app-site-association')
const aasaPath = path.join(buildDir, aasaRelative)

function sendFile(res, filePath) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.statusCode = 404
      res.end('Not found')
      return
    }
    const stream = fs.createReadStream(filePath)
    stream.on('error', () => {
      res.statusCode = 500
      res.end('Server error')
    })
    stream.pipe(res)
  })
}

// Security headers function
function setSecurityHeaders(res) {
  // 1. Content Security Policy (CSP) - Mitigate XSS attacks
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://in.fw-cdn.com https://dentalstackcom.wchat.webpush.in.myfreshworks.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://dentalstackcom.wchat.webpush.in.myfreshworks.com https://firebaseinstallations.googleapis.com https://firebase.googleapis.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  )

  // 2. HTTP Strict Transport Security (HSTS) - Force HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')

  // 3. Cross-Origin-Opener-Policy (COOP) - Origin isolation
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')

  // 4. X-Frame-Options (XFO) - Mitigate clickjacking
  res.setHeader('X-Frame-Options', 'DENY')

  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
}

const server = http.createServer((req, res) => {
  // Set security headers for all responses
  setSecurityHeaders(res)

  // Normalize URL path
  let urlPath = decodeURIComponent(req.url.split('?')[0])
  if (urlPath === '/' || urlPath === '') {
    urlPath = 'index.html'
  } else if (urlPath.startsWith('/')) {
    urlPath = urlPath.slice(1)
  }

  // Special case for AASA file: always serve with application/json and no extension
  if (req.url === '/.well-known/apple-app-site-association') {
    if (fs.existsSync(aasaPath)) {
      res.setHeader('Content-Type', 'application/json')
      // Per Apple docs must not be gzipped; ensure no content-encoding
      res.removeHeader && res.removeHeader('Content-Encoding')
      sendFile(res, aasaPath)
      return
    }
  }

  const filePath = path.join(buildDir, urlPath)
  if (!filePath.startsWith(buildDir)) {
    // basic path traversal guard
    res.statusCode = 403
    res.end('Forbidden')
    return
  }

  // Fallback: if file missing, serve index.html (SPA routing)
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // fallback to index.html
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      sendFile(res, path.join(buildDir, 'index.html'))
    } else {
      // Set minimal content type for common types
      if (filePath.endsWith('.js')) res.setHeader('Content-Type', 'text/javascript')
      else if (filePath.endsWith('.css')) res.setHeader('Content-Type', 'text/css')
      else if (filePath.endsWith('.json')) res.setHeader('Content-Type', 'application/json')
      else if (filePath.endsWith('.svg')) res.setHeader('Content-Type', 'image/svg+xml')
      else if (filePath.endsWith('.png')) res.setHeader('Content-Type', 'image/png')
      else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg'))
        res.setHeader('Content-Type', 'image/jpeg')
      else if (filePath.endsWith('.webp')) res.setHeader('Content-Type', 'image/webp')
      else if (filePath.endsWith('.html')) res.setHeader('Content-Type', 'text/html; charset=utf-8')
      sendFile(res, filePath)
    }
  })
})

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Static server running on port ${port}`)
  // eslint-disable-next-line no-console
  console.log('Security headers enabled:')
  // eslint-disable-next-line no-console
  console.log('  ✓ Content-Security-Policy (CSP)')
  // eslint-disable-next-line no-console
  console.log('  ✓ Strict-Transport-Security (HSTS)')
  // eslint-disable-next-line no-console
  console.log('  ✓ Cross-Origin-Opener-Policy (COOP)')
  // eslint-disable-next-line no-console
  console.log('  ✓ X-Frame-Options (XFO)')
  // eslint-disable-next-line no-console
  console.log('  ✓ Additional security headers')
})
