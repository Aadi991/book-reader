/**
 * electron/preload.js — Electron preload script
 *
 * Runs in a privileged context with access to Node.js APIs,
 * but exposes only a controlled surface to the renderer via contextBridge.
 *
 * Add IPC channels here as the app grows (e.g. native file save dialogs).
 */

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  /** App version from package.json */
  getVersion: () => ipcRenderer.invoke('app:version'),

  /** Platform identifier — 'win32' | 'darwin' | 'linux' */
  platform: process.platform,

  /** True when running inside Electron (renderer check) */
  isElectron: true,

  /** Triggers the loopback OAuth browser sign-in flow */
  googleLogin: () => ipcRenderer.invoke('firebase:google-sign-in'),
})
