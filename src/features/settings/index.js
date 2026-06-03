// Settings feature: user preferences and sync settings
export const defaultSettings = {
  theme: 'system',
  sync: true
}

export function loadSettings() {
  return Promise.resolve(defaultSettings)
}
