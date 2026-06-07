/**
 * electron/main.js — Electron main process
 *
 * Wraps the Vite-built web app in a native Electron window.
 * In development it loads http://localhost:5173 (Vite dev server).
 * In production it loads dist/index.html via the file:// protocol.
 *
 * Security:
 *   - contextIsolation: true (renderer cannot access Node APIs directly)
 *   - nodeIntegration: false  (no direct Node.js in renderer)
 *   - All native access goes through the preload.js contextBridge API
 */

const { app, BrowserWindow, shell, ipcMain } = require('electron')
const path = require('path')
const http = require('http')

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Book Reader',
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    // Frameless look — remove if you prefer native title bar
    backgroundColor: '#0f0f13',
    show: false, // shown after 'ready-to-show' to avoid white flash
  })

  // Show only when fully rendered
  win.once('ready-to-show', () => win.show())

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Open external links in the default browser, not inside Electron
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  ipcMain.handle('app:version', () => app.getVersion())

  ipcMain.handle('firebase:google-sign-in', async () => {
    return new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

        if (req.method === 'OPTIONS') {
          res.writeHead(200)
          res.end()
          return
        }

        const url = new URL(req.url, `http://${req.headers.host}`)
        if (url.pathname === '/callback') {
          const token = url.searchParams.get('token')

          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end('<h1>Login successful! You can close this browser tab and return to the app.</h1>')

          clearTimeout(timeout)
          server.close()
          resolve({ token })
        } else {
          res.writeHead(404)
          res.end('Not Found')
        }
      })

      const timeout = setTimeout(() => {
        server.close()
        reject(new Error('Sign-in timed out. Please try again.'))
      }, 5 * 60 * 1000)

      server.listen(0, '127.0.0.1', () => {
        const { port } = server.address()
        const authUrl = `https://book-reader-e882b.firebaseapp.com/login-bridge.html?port=${port}`
        shell.openExternal(authUrl)
      })

      server.on('error', (err) => {
        clearTimeout(timeout)
        reject(err)
      })
    })
  })

  createWindow()

  // macOS: re-create window when dock icon is clicked and no windows are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
