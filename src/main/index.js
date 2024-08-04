import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

import settings from 'electron-settings'

import iconPng from '../../resources/icon.ico?asset'
import iconIcns from '../../resources/icon.icns?asset'

const iconPath = process.platform !== 'darwin' ? iconPng : iconIcns

let mainWindow,
  flashWindow,
  formState = null,
  controller

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    // autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
  })

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript('document.body.style.display = "block"')
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Handle window closed event
  mainWindow.on('closed', async () => {
    console.log('Main window is closed')
    await settings.set('isRunning', false)
    stop()

    if (!flashWindow.isDestroyed()) {
      flashWindow.close()
    }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createFlashWindow() {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    flashWindow = new BrowserWindow({
      width: 800,
      height: 600,
      fullscreen: true,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      icon: iconPath,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        contextIsolation: true,
        enableRemoteModule: false,
        nodeIntegration: false
      }
    })

    flashWindow.setAlwaysOnTop(true, 'screen')

    flashWindow.on('ready-to-show', () => {
      flashWindow.hide()
      flashWindow.maximize()
    })

    flashWindow.webContents.on('did-finish-load', () => {
      flashWindow.webContents.executeJavaScript('window.location.hash = "#/flash";')
      flashWindow.webContents.executeJavaScript('document.body.style.display = "block"')
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      await flashWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      await flashWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    resolve(flashWindow)
  })
}

function waitFor(ms, signal) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, ms)

    signal.addEventListener('abort', () => {
      clearTimeout(timeoutId)
      reject(new Error('Operation aborted'))
    })
  })
}

async function startAsyncInterval(formState) {
  // Create a new AbortController for this interval start
  const abortController = new AbortController()
  const { signal } = abortController

  // Set the global controller reference
  controller = abortController

  console.log('Starting interval...')

  try {
    while (await settings.get('isRunning')) {
      try {
        // Wait for the interval time with abort signal
        await waitFor(formState.interval * 1000, signal)

        if (flashWindow && !flashWindow.isDestroyed()) {
          console.log('Showing window...')
          flashWindow.show()
          flashWindow.focus()

          // Wait for the specified howLong time with abort signal
          await waitFor(formState.howLong * 1000, signal)

          flashWindow.hide()
        } else {
          await settings.set('isRunning', false)
          throw new Error('Operation aborted')
        }
      } catch (error) {
        if (error.message === 'Operation aborted') {
          console.log('Interval operation was canceled')
        } else {
          console.error('An error occurred in startAsyncInterval:', error)
        }

        // Ensure flashWindow is properly handled
        if (flashWindow && !flashWindow.isDestroyed()) {
          flashWindow.blur()
          flashWindow.hide()
        }
        break // Exit the loop
      }
    }
  } finally {
    // Cleanup after exiting the loop
    if (flashWindow && !flashWindow.isDestroyed()) {
      flashWindow.blur()
      flashWindow.hide()
    }

    // Clear the controller reference
    if (controller === abortController) {
      controller = null
    }
  }

  return abortController
}

async function stop() {
  // Check if the current controller exists and is valid
  if (controller) {
    console.log('Stopping interval...')

    // Abort the current interval
    controller.abort()

    // Clear the current controller reference
    controller = null
  }

  // Set the flag to false to stop any ongoing process
  /* if (flashWindow) {
    flashWindow.destroy()
  } */
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('startTimeout', async (event, appState) => {
    if (!flashWindow) {
      flashWindow = await createFlashWindow() // Ensure this function properly initializes `flashWindow`
    }
    formState = appState
    // Start the async interval when needed

    console.log('SF')
    await settings.set('isRunning', true)
    startAsyncInterval(formState)
  })

  ipcMain.on('cancelTimeout', async () => {
    console.log('close')
    await settings.set('isRunning', false)
    stop()
  })

  ipcMain.on('close-other-windows', () => {
    try {
      stop()
    } catch (err) {
      console.log(err)
    }
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
