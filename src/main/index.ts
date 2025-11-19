import { app, shell, BrowserWindow, dialog, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

import icon from '../../resources/icon.png?asset'

import { initRealtimeCache } from "./realtime-cache";

import { registerProductIPC } from "./ipc/products.ipc";
import { registerBranchesIPC } from "./ipc/branches.ipc";
import { registerMovementsIPC } from "./ipc/movements.ipc";
import { registerRomaneioIPC } from "./ipc/shipping.ipc";
import { registerUserIPC } from "./ipc/users.ipc";
import { registerReportIPC } from "./ipc/reports.ipc";
import { registerNoticeIPC } from "./ipc/notices.ipc";
import { registerAuthIPC } from "./ipc/auth.ipc";
import { registerStatsIPC } from "./ipc/stats.ipc";

app.disableHardwareAcceleration();

function createWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  // Define tamanho máximo, mas ajusta para telas pequenas
  const windowWidth = Math.min(1200, width);
  const windowHeight = Math.min(680, height);
  
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()

     // 🧠 Abre o DevTools automaticamente em ambiente de desenvolvimento
    if (is.dev) {
      mainWindow.webContents.openDevTools()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

process.on("uncaughtException", (error) => {
  dialog.showErrorBox(
    "Erro inesperado",
    "Ocorreu um erro interno. O aplicativo pode precisar ser reiniciado.\n\n" +
    (error?.message || error)
  );
});

process.on("unhandledRejection", (reason: any) => {
  dialog.showErrorBox(
    "Erro inesperado",
    "Ocorreu um erro interno. O aplicativo pode precisar ser reiniciado.\n\n" +
    (reason?.message ?? String(reason))
  );
});

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

  // Inicializa Realtime para produtos
  initRealtimeCache();

  // IPC HANDLERS
  registerAuthIPC();
  registerStatsIPC();
  registerBranchesIPC();
  registerProductIPC();
  registerMovementsIPC();
  registerRomaneioIPC();
  registerUserIPC();
  registerReportIPC();
  registerNoticeIPC();

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
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('render-process-gone', (_, webContents) => {
  const win = BrowserWindow.fromWebContents(webContents);
  if (win && !win.isDestroyed()) {
    win.destroy();
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
