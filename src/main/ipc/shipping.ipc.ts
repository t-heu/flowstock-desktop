import { ipcMain, BrowserWindow, app } from "electron";
import fs from "fs";
import { join } from "path";

export function registerRomaneioIPC() {

  ipcMain.handle("generate-romaneio", async (_event, { romaneioNumber, items }) => {
    try {
      const win = new BrowserWindow({
        width: 800,
        height: 1000,
        show: false
      });

      const html = `
        <html>
          <head>
            <style> body { font-family: Arial, sans-serif; padding: 30px; } h1 { text-align: center; margin-bottom: 30px; } table { width: 100%; border-collapse: collapse; margin-top: 20px; } table, th, td { border: 1px solid #000; } th, td { padding: 8px; text-align: left; } .info { margin-bottom: 10px; font-size: 14px; } </style>
          </head>
          <body>
            <h1>ROMANEIO – Nº ${romaneioNumber}</h1>
            <p><b>De:</b> ${items[0].fromBranch}</p>
            <p><b>Para:</b> ${items[0].toBranch}</p>
            <table border="1">
              <tr><th>Produto</th><th>Qtd</th><th>Obs</th><th>Data</th></tr>
              ${items.map(i => `
                <tr>
                  <td>${i.product}</td>
                  <td>${i.quantity}</td>
                  <td>${i.notes}</td>
                  <td>${i.date}</td>
                </tr>`).join("")}
            </table>
          </body>
        </html>
      `;

      await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

      const pdfBuffer = await win.webContents.printToPDF({});
      
      const downloadsPath = app.getPath("downloads");
      const path  = join(downloadsPath, `romaneio_${romaneioNumber}.pdf`);
      fs.writeFileSync(path , pdfBuffer);

      win.close();
      return { success: true, path  };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("open-file", async (_ev, filePath) => {
    const { shell } = require("electron");
    return shell.openPath(filePath);
  });
}
