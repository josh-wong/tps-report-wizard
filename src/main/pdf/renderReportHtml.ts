import type { Report } from '@shared/types'
import { AUTHOR_LABELS } from '@shared/authorLabels'

export function renderReportHtml(report: Report): string {
  const coverSheetHtml = report.coverSheet
    ? `
    <div class="print-page cover-sheet-page">
      <div class="cover-sheet-content">
        <div class="cover-sheet-logo">INITECH</div>
        <div class="cover-sheet-title">T P S   R E P O R T</div>
        <div class="cover-sheet-memo">
          <p><strong>TO:</strong> All Staff</p>
          <p><strong>FROM:</strong> ${escapeHtml(AUTHOR_LABELS[report.author])}</p>
          <p><strong>DATE:</strong> ${escapeHtml(report.date)}</p>
          <p><strong>RE:</strong> TPS Report #${escapeHtml(report.id)}</p>
        </div>
        <div class="cover-sheet-memo-text">
          <p><em>Did you get the memo? This is to confirm you have received and attached the new cover sheet for your TPS report. Please ensure this cover sheet is included with all future submissions.</em></p>
        </div>
      </div>
    </div>
  `
    : ''

  const authorLabel = AUTHOR_LABELS[report.author]

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TPS Report - ${report.id}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'MS Sans Serif', 'Arial', sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #000;
    }

    @page {
      size: letter;
      margin: 0.5in;
    }

    .print-page {
      page-break-after: always;
      min-height: 9in;
      background: white;
    }

    .print-page:last-child {
      page-break-after: avoid;
    }

    .cover-sheet-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .cover-sheet-content {
      width: 100%;
    }

    .cover-sheet-logo {
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 2px;
      margin-bottom: 20px;
    }

    .cover-sheet-title {
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 4px;
      margin-bottom: 40px;
    }

    .cover-sheet-memo {
      text-align: left;
      margin-bottom: 30px;
      font-size: 12px;
    }

    .cover-sheet-memo p {
      margin: 8px 0;
    }

    .cover-sheet-memo-text {
      font-style: italic;
      font-size: 11px;
      text-align: center;
      color: #555;
    }

    .report-page {
      text-align: left;
    }

    .report-header {
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #000;
    }

    .report-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 12px;
    }

    .report-meta {
      font-size: 11px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      line-height: 1.4;
    }

    .report-body {
      font-size: 12px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  </style>
</head>
<body>
  ${coverSheetHtml}
  <div class="print-page report-page">
    <div class="report-header">
      <div class="report-title">TPS Report</div>
      <div class="report-meta">
        <div><strong>ID:</strong> ${escapeHtml(report.id)}</div>
        <div><strong>Author:</strong> ${escapeHtml(authorLabel)}</div>
        <div><strong>Department:</strong> ${escapeHtml(report.department)}</div>
        <div><strong>Date:</strong> ${escapeHtml(report.date)}</div>
      </div>
    </div>
    <div class="report-body">${escapeHtml(report.body)}</div>
  </div>
</body>
</html>
  `
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}
