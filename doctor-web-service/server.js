// Simple Node static server to serve build and ensure correct Content-Type for AASA file
// Avoid adding extra dependencies; use built-in 'http' and 'fs'.

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

const server = http.createServer((req, res) => {
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
})
