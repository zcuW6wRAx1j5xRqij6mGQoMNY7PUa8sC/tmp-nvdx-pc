export type ThemeMode = 'dark' | 'light'

const KEY = 'theme-mode'

export function getTheme(): ThemeMode {
  return (localStorage.getItem(KEY) as ThemeMode) || 'dark'
}

export function setTheme(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', mode)
  localStorage.setItem(KEY, mode)
}

export function toggleTheme(): ThemeMode {
  const next: ThemeMode = getTheme() === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}