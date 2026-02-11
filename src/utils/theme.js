export function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
}

export function initTheme() {
    const theme = localStorage.getItem('theme') || 'dark'
    setTheme(theme)
}