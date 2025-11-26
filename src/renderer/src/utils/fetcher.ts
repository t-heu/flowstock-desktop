export const ipcFetcher = async (key: string) => {
  switch (key) {
    case "branches":
      return (await window.api.getBranches()).data || []
    case "users":
      return (await window.api.getUsers()).data || []
    default:
      throw new Error("Unknown SWR key: " + key)
  }
}
