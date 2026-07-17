import { useState, useRef, useEffect } from 'react'
import type { Report } from '@shared/types'

type MenuItem =
  | { label: string; accelerator?: string; onClick?: () => void; enabled?: boolean; separator?: never; submenu?: never }
  | { separator: true; label?: never; accelerator?: never; onClick?: never; enabled?: never; submenu?: never }
  | { label: string; submenu: MenuItem[]; onClick?: never; accelerator?: string; enabled?: boolean; separator?: never }

interface MenuBarProps {
  onNewReport: () => void
  onOpenReport: () => void
  onOpenReportById: (id: string) => void
  onSaveReport: () => void
  onExportPdf: () => void
  onPrint: () => void
  onSettings: () => void
  onAbout: () => void
  onKeyboardShortcuts: () => void
  activeReport: Report | null
  isEditing: boolean
  hasReports: boolean
  reports: Report[]
}

function parseMenuLabel(label: string): React.JSX.Element {
  const ampersandIndex = label.indexOf('&')
  if (ampersandIndex === -1) {
    return <>{label}</>
  }
  const before = label.substring(0, ampersandIndex)
  const shortcutChar = label[ampersandIndex + 1]
  const after = label.substring(ampersandIndex + 2)
  return (
    <>
      {before}
      <u>{shortcutChar}</u>
      {after}
    </>
  )
}

function MenuDropdown({
  items,
  onClose
}: {
  items: MenuItem[]
  onClose: () => void
}): React.JSX.Element {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div ref={dropdownRef} className="menu-dropdown">
      {items.map((item, i) =>
        item.separator ? (
          <div key={`sep-${i}`} className="menu-separator" />
        ) : 'submenu' in item && item.submenu ? (
          <div key={i} className="menu-item-with-submenu">
            <div
              className={`menu-item ${item.enabled === false ? 'disabled' : ''}`}
              onClick={() => setOpenSubmenu(openSubmenu === i ? null : i)}
            >
              <span className="menu-label">{parseMenuLabel(item.label)}</span>
              <span className="menu-submenu-arrow">▶</span>
            </div>
            {openSubmenu === i && (
              <MenuDropdown items={item.submenu} onClose={onClose} />
            )}
          </div>
        ) : (
          <div
            key={i}
            className={`menu-item ${item.enabled === false ? 'disabled' : ''}`}
            onClick={() => {
              if (item.enabled !== false && item.onClick) {
                item.onClick()
                onClose()
              }
            }}
          >
            <span className="menu-label">{parseMenuLabel(item.label)}</span>
            {item.accelerator && <span className="menu-accelerator">{item.accelerator}</span>}
          </div>
        )
      )}
    </div>
  )
}

export function MenuBar({
  onNewReport,
  onOpenReport,
  onOpenReportById,
  onSaveReport,
  onExportPdf,
  onPrint,
  onSettings,
  onAbout,
  onKeyboardShortcuts,
  activeReport,
  isEditing,
  hasReports,
  reports
}: MenuBarProps): React.JSX.Element {
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const recentReportItems: MenuItem[] = hasReports
    ? [
        ...reports.slice(-5).reverse().map((report) => ({
          label: `${report.seed.substring(0, 40)}${report.seed.length > 40 ? '…' : ''} (${report.id})`,
          onClick: () => onOpenReportById(report.id)
        })),
        { separator: true as const },
        { label: '&Browse All Reports', onClick: onOpenReport }
      ]
    : [{ label: '(No reports)', enabled: false }]

  const fileItems: MenuItem[] = [
    { label: '&New Report', accelerator: 'Ctrl+N', onClick: onNewReport },
    { label: '&Open Report', accelerator: 'Ctrl+O', submenu: recentReportItems, enabled: hasReports },
    { separator: true },
    { label: '&Save Report', accelerator: 'Ctrl+S', onClick: onSaveReport, enabled: !!activeReport && isEditing },
    { label: '&Export as PDF', accelerator: 'Ctrl+E', onClick: onExportPdf, enabled: !!activeReport && isEditing },
    { label: '&Print', accelerator: 'Ctrl+P', onClick: onPrint, enabled: !!activeReport },
    { separator: true },
    { label: 'Se&ttings', accelerator: 'Ctrl+,', onClick: onSettings },
    { separator: true },
    { label: 'E&xit', accelerator: 'Ctrl+Q', onClick: () => window.close() }
  ]

  const helpItems: MenuItem[] = [
    { label: '&Keyboard Shortcuts', onClick: onKeyboardShortcuts },
    { separator: true },
    { label: '&About', onClick: onAbout }
  ]

  return (
    <div className="menu-bar">
      <div className="menu-item-container">
        <span
          className={openMenu === 'file' ? 'active' : ''}
          onClick={() => setOpenMenu(openMenu === 'file' ? null : 'file')}
        >
          <u>F</u>ile
        </span>
        {openMenu === 'file' && <MenuDropdown items={fileItems} onClose={() => setOpenMenu(null)} />}
      </div>

      <div className="menu-item-container">
        <span
          className={openMenu === 'help' ? 'active' : ''}
          onClick={() => setOpenMenu(openMenu === 'help' ? null : 'help')}
        >
          <u>H</u>elp
        </span>
        {openMenu === 'help' && <MenuDropdown items={helpItems} onClose={() => setOpenMenu(null)} />}
      </div>
    </div>
  )
}
