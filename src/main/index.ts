import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fetch from 'node-fetch'; // se estiver no Node 18+ pode usar global fetch

import icon from '../../resources/icon.png?asset'

import { safeIpc } from "./ipc-utils";

import { Notice } from "../shared/types";
import { setTokenForWindow, getTokenForWindow, clearTokenForWindow } from "./authSession";
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
import { 
  ProductSchema, UpdateProductSchema, BranchSchema, IdSchema,
  MovementSchema, CreateUserSchema, ReportFilterSchema, LoginSchema
} from "./schemas";

app.disableHardwareAcceleration();

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

  // IPC test
  /*
  ipcMain.handle("get-stats", authenticated(async (user, branch) => {
    return await getStats(user, branch);
  }));

  ipcMain.handle("get-current-user", authenticated(async (user) => {
    return await getCurrentUser(user.id);
  }));

  // LOGIN
  ipcMain.handle("auth:login", async (event, data) => {
    const { username, password } = LoginSchema.parse(data);

    const result = await loginUser(username, password);
    if (!result || !result.success) throw new Error("Credenciais inválidas");

    setTokenForWindow(event.sender.id, result.token);
    return result;
  });

  // LOGOUT
  ipcMain.handle("auth:logout", (event) => {
    clearTokenForWindow(event.sender.id);
    return { success: true };
  });

  // GET TOKEN (apenas se realmente precisar no renderer — se não, REMOVA)
  ipcMain.handle("auth:get-token", (event) => {
    return getTokenForWindow(event.sender.id) ?? null;
  });

  // PRODUTOS
  ipcMain.handle("get-products", authenticated(async (user) => {
    return await getProducts(user);
  }));

  ipcMain.handle("create-product", authenticated(async (user, data) => {
    try {
      if (user.role !== "admin") throw new Error("Sem permissão");
  
      const product = ProductSchema.parse(data);
  
      return await createProduct(user, product);
    } catch (err: any) {
      if (err instanceof ZodError) {
        return { success: false, message: err.issues[0].message ?? "Dados inválidos" };
      }
      return { success: false, message: err?.message ?? "Erro ao criar produto" };
    }
  }));

  ipcMain.handle("update-product", authenticated(async (user, payload) => {
    const { id, updates } = UpdateProductSchema.parse(payload);
    return await updateProduct(user, id, updates);
  }));

  ipcMain.handle("delete-product", authenticated(async (user, id) => {
    const validId = IdSchema.parse(id);
    return await deleteProduct(user, validId);
  }));

  // FILIAIS
  ipcMain.handle("get-branches", authenticated(async () => await getBranches()));
  ipcMain.handle("add-branch", authenticated(async (_, data) => {
    const branch = BranchSchema.parse(data); // ✅ valida aqui
    return await addBranch(branch);
  }));
  ipcMain.handle("delete-branch", authenticated(async (_, id) => await deleteBranch(IdSchema.parse(id))));

  // MOVIMENTOS
  ipcMain.handle("get-movements", authenticated(async (user, filter) => {
    return await getMovements(user, filter);
  }));

  ipcMain.handle("create-movement", authenticated(async (_, movement) => {
    const valid = MovementSchema.parse(movement);
    return await createMovement(valid);
  }));

  ipcMain.handle("delete-movement", authenticated(async (_, id) => {
    return await deleteMovement(IdSchema.parse(id));
  }));

  ipcMain.handle("get-branch-stock", authenticated(async () => await getBranchStock()));

  // USERS
  ipcMain.handle("get-users", authenticated(async () => await getUsers()));
  ipcMain.handle("create-user", authenticated(async (_, data) => {
    try {
      const parsed = CreateUserSchema.parse(data);

      await createUser(parsed);

      return { success: true };
    } catch (err: any) {
      if (err instanceof ZodError) {
        return { success: false, message: err.issues[0].message ?? "Dados inválidos" };
      }
      return { success: false, message: err?.message ?? "Erro ao criar usuário" };
    }
  }));

  ipcMain.handle("update-user", authenticated(async (_, { id, updates }) => await updateUser(IdSchema.parse(id), updates)));
  ipcMain.handle("delete-user", authenticated(async (_, id) => await deleteUser(IdSchema.parse(id))));

  // RELATÓRIOS
  ipcMain.handle(
    "get-detailed-report",
    authenticated(async (_, raw) => {
      const { branchId, startDate, endDate } = ReportFilterSchema.parse(raw);
      return await getDetailedReport(branchId, startDate, endDate);
    })
  );*/
  // STATS
  ipcMain.handle("get-stats", authenticated(safeIpc(getStats, "Erro ao obter estatísticas")));
  ipcMain.handle("get-current-user", authenticated(safeIpc(getCurrentUser, "Erro ao obter usuário atual")));

  // LOGIN / LOGOUT
  ipcMain.handle("auth:login", safeIpc(async (event, data) => {
    const { username, password } = LoginSchema.parse(data);
    const result = await loginUser(username, password);
    if (!result || !result.success) throw new Error("Credenciais inválidas");
    setTokenForWindow(event.sender.id, result.token);
    return result;
  }, "Erro ao fazer login"));

  ipcMain.handle("auth:logout", safeIpc(async (event) => {
    clearTokenForWindow(event.sender.id);
    return { success: true };
  }, "Erro ao fazer logout"));

  ipcMain.handle("auth:get-token", safeIpc(async (event) => {
    return getTokenForWindow(event.sender.id) ?? null;
  }, "Erro ao obter token"));

  // PRODUTOS
  ipcMain.handle("get-products", authenticated(safeIpc(getProducts, "Erro ao carregar produtos")));

  ipcMain.handle("create-product", authenticated(safeIpc(async (user, data) => {
    const product = ProductSchema.parse(data);
    return await createProduct(user, product);
  }, "Erro ao criar produto")));

  ipcMain.handle("update-product", authenticated(safeIpc(async (user, payload) => {
    const { id, updates } = UpdateProductSchema.parse(payload);
    
    return await updateProduct(user, id, updates);
  }, "Erro ao atualizar produto")));

  ipcMain.handle("delete-product", authenticated(safeIpc(async (user, id) => {
    const validId = IdSchema.parse(id);
    return await deleteProduct(user, validId);
  }, "Erro ao excluir produto")));

  // FILIAIS
  ipcMain.handle("get-branches", authenticated(safeIpc(getBranches, "Erro ao obter filiais")));
  ipcMain.handle("add-branch", authenticated(safeIpc(async (_, data) => {
    const branch = BranchSchema.parse(data);
    return await addBranch(branch);
  }, "Erro ao adicionar filial")));
  ipcMain.handle("delete-branch", authenticated(safeIpc(async (_, id) => {
    const validId = IdSchema.parse(id);
    return await deleteBranch(validId);
  }, "Erro ao excluir filial")));

  // MOVIMENTOS
  ipcMain.handle("get-movements", authenticated(safeIpc(getMovements, "Erro ao obter movimentos")));
  ipcMain.handle("create-movement", authenticated(safeIpc(async (_, movement) => {
    const valid = MovementSchema.parse(movement);
    return await createMovement(valid);
  }, "Erro ao criar movimento")));
  ipcMain.handle("delete-movement", authenticated(safeIpc(async (_, id) => {
    const validId = IdSchema.parse(id);
    return await deleteMovement(validId);
  }, "Erro ao excluir movimento")));
  ipcMain.handle("get-branch-stock", authenticated(safeIpc(getBranchStock, "Erro ao obter estoque")));

  // USERS
  ipcMain.handle("get-users", authenticated(safeIpc(getUsers, "Erro ao carregar usuários")));
  ipcMain.handle("create-user", authenticated(safeIpc(async (_, data) => {
    const parsed = CreateUserSchema.parse(data);
    await createUser(parsed);
    return { success: true };
  }, "Erro ao criar usuário")));
  ipcMain.handle("update-user", authenticated(safeIpc(async (_, { id, updates }) => {
    const validId = IdSchema.parse(id);
    return await updateUser(validId, updates);
  }, "Erro ao atualizar usuário")));
  ipcMain.handle("delete-user", authenticated(safeIpc(async (_, id) => {
    const validId = IdSchema.parse(id);
    return await deleteUser(validId);
  }, "Erro ao excluir usuário")));

  // RELATÓRIOS
  ipcMain.handle("get-detailed-report", authenticated(safeIpc(async (_, raw) => {
    const { branchId, startDate, endDate } = ReportFilterSchema.parse(raw);
    return await getDetailedReport(branchId, startDate, endDate);
  }, "Erro ao gerar relatório detalhado")));

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

app.on('render-process-gone', (_, webContents) => {
  const win = BrowserWindow.fromWebContents(webContents);
  if (win && !win.isDestroyed()) {
    win.destroy();
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
