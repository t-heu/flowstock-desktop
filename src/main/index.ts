import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fetch from 'node-fetch'; // se estiver no Node 18+ pode usar global fetch

export type Notice = {
  id: string;
  title?: string;
  message: string;
  level?: 'info' | 'warning' | 'critical';
  showOnce?: boolean;
  expiresAt?: string;
};

import icon from '../../resources/icon.png?asset'

import {getStats} from './services/stats';
import {getCurrentUser} from './services/auth/profile';
import {loginUser} from './services/auth/login';
import {deleteProduct,getProducts,createProduct,updateProduct} from './services/products';
import { getBranches, addBranch, deleteBranch } from "./services/branches"
import { createMovement, getMovements, deleteMovement } from "./services/movements"
import { getBranchStock } from "./services/branchStock"
import { createUser, updateUser, getUsers, deleteUser } from "./services/users"
import { getDetailedReport } from "./services/reports"

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 680,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
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
  //ipcMain.on('ping', () => console.log('pong'))
  ipcMain.handle("get-stats", async () => await getStats());
  //ipcMain.handle("logout-user", async (_event, token: string) => await logoutUser(token));
  ipcMain.handle("get-current-user", async (_event, token: string) => await getCurrentUser(token))
  ipcMain.handle("login", async (_event, username, password) =>  await loginUser(username, password))

  ipcMain.handle("get-products", async () => {
    return await getProducts()
  })

  ipcMain.handle("create-product", async (_event, product) => {
    return await createProduct(product)
  })

  ipcMain.handle("update-product", async (_event, id, updates) => {
    return await updateProduct(id, updates)
  })

  ipcMain.handle("delete-product", async (_event, id) => {
    return await deleteProduct(id)
  })

  ipcMain.handle("get-branches", async () => {
    return await getBranches()
  })

  ipcMain.handle("add-branch", async (_event, branch) => {
    return await addBranch(branch)
  })

  ipcMain.handle("delete-branch", async (_event, id) => {
    return await deleteBranch(id)
  })

  // 🔹 Buscar lista de movimentos
  ipcMain.handle("get-movements", async (_event, typeFilter) => {
    return await getMovements(typeFilter)
  })

  // 🔹 Criar novo movimento (entrada ou saída)
  ipcMain.handle("create-movement", async (_event, movement) => {
    return await createMovement(movement)
  })

  // 🔹 Excluir movimento
  ipcMain.handle("delete-movement", async (_event, id) => {
    return await deleteMovement(id)
  })

  ipcMain.handle("get-branch-stock", async () => {
    return await getBranchStock()
  })

  ipcMain.handle("get-users", async () => {
    return await getUsers()
  })

  ipcMain.handle("create-user", async (_event, data) => {
    return await createUser(data)
  })

  ipcMain.handle("update-user", async (_event, id, updates) => {
    return await updateUser(id, updates)
  })

  ipcMain.handle("delete-user", async (_event, id) => {
    return await deleteUser(id)
  })
  
  ipcMain.handle("get-detailed-report", async (_event, branchId, startDate, endDate) => {
    return await getDetailedReport(branchId, startDate, endDate)
  })

  // 🔔 Buscar aviso remoto
  ipcMain.handle('fetch-notice', async (_event, url: string): Promise<Notice | null> => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.warn('Invalid JSON received:', text);
        return null;
      }

      return data as Notice;
    } catch (err) {
      console.warn('fetch-notice failed:', err);
      return null;
    }
  });

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
