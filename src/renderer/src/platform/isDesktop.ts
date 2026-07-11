// Single detection point for desktop vs. web "lite". Everything that is
// desktop-only (Settings/provider UI, safeStorage, IPC-backed actions, AI
// generation) keys off this flag. See docs/design-doc.md §9.
export const isDesktop = typeof window !== 'undefined' && typeof window.electronAPI !== 'undefined'
