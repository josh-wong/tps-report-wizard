/**
 * US Letter in inches. Electron's `webContents.printToPDF` interprets a
 * `pageSize` object as inches, not microns; micron values make printing fail.
 */
export const PDF_PAGE_SIZE_INCHES = { width: 8.5, height: 11 } as const
