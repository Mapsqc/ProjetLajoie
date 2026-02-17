import { jsPDF } from 'jspdf'
import { invoke } from '@tauri-apps/api/core'
import { openPath } from '@tauri-apps/plugin-opener'
import type { FiscalSummary } from '@/types'
import { formatCurrency } from '@/utils/format'

export async function generateFiscalPdf(summary: FiscalSummary, monthLabel: string) {
  const doc = new jsPDF()

  doc.setFontSize(20)
  doc.text('Camping Lajoie', 105, 25, { align: 'center' })

  doc.setFontSize(14)
  doc.text('Rapport fiscal - ' + monthLabel, 105, 40, { align: 'center' })

  doc.setDrawColor(200)
  doc.line(20, 50, 190, 50)

  doc.setFontSize(12)
  doc.text('Revenus du mois :', 20, 65)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(summary.totalRevenue), 120, 65)

  doc.setFont('helvetica', 'normal')
  doc.text('Nombre de reservations :', 20, 80)
  doc.setFont('helvetica', 'bold')
  doc.text(String(summary.reservationCount), 120, 80)

  doc.setDrawColor(200)
  doc.line(20, 95, 190, 95)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(130)
  doc.text('Genere le ' + new Date().toLocaleDateString('fr-CA'), 105, 110, { align: 'center' })

  const fileName = `fiscal-${summary.year}-${String(summary.month + 1).padStart(2, '0')}.pdf`

  // Get PDF as Uint8Array, write to temp via Rust, then open with system viewer
  const arrayBuffer = doc.output('arraybuffer')
  const data = Array.from(new Uint8Array(arrayBuffer))
  const filePath = await invoke<string>('save_temp_file', { filename: fileName, data })
  await openPath(filePath)
}
