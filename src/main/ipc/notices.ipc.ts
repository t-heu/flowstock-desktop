import { ipcMain } from "electron";

import { Notice } from "../../shared/types";

export function registerNoticeIPC() {
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
}
