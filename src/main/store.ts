import ElectronStore from 'electron-store'

export const Store = (ElectronStore as any).default || ElectronStore
export const store = new Store();
