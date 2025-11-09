import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fetch from 'node-fetch'; // se estiver no Node 18+ pode usar global fetch
import { store } from "./store";

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

import { authenticated } from "./authMiddleware";

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

  // IPC test
  //ipcMain.on('ping', () => console.log('pong'))
  // Salvar token
  ipcMain.handle("auth:set-token", (_, token) => {
    store.set("auth.token", token);
  });

  // Obter token
  ipcMain.handle("auth:get-token", () => {
    return store.get("auth.token");
  });

  // Remover token (logout)
  ipcMain.handle("auth:logout", () => {
    store.delete("auth.token");
    return { success: true };
  });

  ipcMain.handle("auth:login", async (_event, username, password) => {
    const result = await loginUser(username, password);

     if (!result || !result.success) {
      throw new Error("Credenciais inválidas");
    }

    // 🔥 Salva token seguro no main
    store.set("auth.token", result.token);

    return result;
  });

  ipcMain.handle("get-stats", authenticated(async (user, branch) => {
    return await getStats(user, branch);
  }));

  ipcMain.handle("get-current-user", authenticated(async (user) => {
    return await getCurrentUser(user.id);
  }));

  ipcMain.handle("get-products", authenticated(async (user) => {
    return await getProducts(user);
  }));
  ipcMain.handle("create-product", authenticated(async (user, product) => {
    if (user.role !== "admin") throw new Error("Sem permissão");
    return await createProduct(user, product);
  }));

  ipcMain.handle("update-product", authenticated(async (user, { id, updates }) => {
    return await updateProduct(user, id, updates);
  }));

  ipcMain.handle("delete-product", authenticated(async (user, id) => {
    return await deleteProduct(user, id);
  }));

  ipcMain.handle("get-branches", authenticated(async () => await getBranches()));
  ipcMain.handle("add-branch", authenticated(async (_, branch) => await addBranch(branch)));
  ipcMain.handle("delete-branch", authenticated(async (_, id) => await deleteBranch(id)));

  ipcMain.handle("get-movements", authenticated(async (user, typeFilter) => {
    return await getMovements(user, typeFilter);
  }));
  ipcMain.handle("create-movement", authenticated(async (_, movement) => await createMovement(movement)));
  ipcMain.handle("delete-movement", authenticated(async (_, id) => await deleteMovement(id)));

  ipcMain.handle("get-branch-stock", authenticated(async () => await getBranchStock()));

  ipcMain.handle("get-users", authenticated(async () => await getUsers()));
  ipcMain.handle("create-user", authenticated(async (_, data) => await createUser(data)));
  ipcMain.handle("update-user", authenticated(async (_, { id, updates }) => await updateUser(id, updates)));
  ipcMain.handle("delete-user", authenticated(async (_, id) => await deleteUser(id)));

  ipcMain.handle("get-detailed-report", authenticated(async (_, { branchId, startDate, endDate }) =>
    await getDetailedReport(branchId, startDate, endDate)
  ));

  // 🔔 Buscar aviso remoto
  ipcMain.handle('fetch-notice', async (_event): Promise<Notice | null> => {
    try {
      const res = await fetch('https://raw.githubusercontent.com/t-heu/flowstock-desktop/refs/heads/main/noticeApp.json');

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
