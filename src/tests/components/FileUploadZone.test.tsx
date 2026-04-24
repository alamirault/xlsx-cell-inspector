import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileUploadZone } from '../../components/FileUploadZone/FileUploadZone'

describe('FileUploadZone — rendu initial', () => {
  it('affiche la zone de drop et le badge de format', () => {
    render(<FileUploadZone onFile={vi.fn()} />)
    expect(screen.getByRole('button', { name: /zone de dépôt/i })).toBeInTheDocument()
    expect(screen.getByText('.xlsx / .xls')).toBeInTheDocument()
  })

  it('affiche le titre et le sous-titre', () => {
    render(<FileUploadZone onFile={vi.fn()} />)
    expect(screen.getByText(/déposez votre fichier/i)).toBeInTheDocument()
    expect(screen.getByText(/cliquez pour sélectionner/i)).toBeInTheDocument()
  })
})

describe('FileUploadZone — validation du type de fichier', () => {
  it("affiche une erreur pour un fichier .pdf", () => {
    const onFile = vi.fn()
    render(<FileUploadZone onFile={onFile} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const pdfFile = new File(['content'], 'report.pdf', { type: 'application/pdf' })

    // fireEvent bypasses the accept attribute filter (unlike userEvent.upload)
    Object.defineProperty(input, 'files', { value: [pdfFile], configurable: true })
    fireEvent.change(input)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('alert').textContent).toMatch(/format non supporté/i)
    expect(onFile).not.toHaveBeenCalled()
  })

  it("appelle onFile pour un fichier .xlsx", async () => {
    const onFile = vi.fn()
    render(<FileUploadZone onFile={onFile} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const xlsxFile = new File(['content'], 'data.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    await userEvent.upload(input, xlsxFile)

    expect(onFile).toHaveBeenCalledWith(xlsxFile)
    expect(screen.queryByRole('alert')).toBeNull()
  })
})

describe('FileUploadZone — drag & drop', () => {
  it('applique la classe dragging au drag over', () => {
    render(<FileUploadZone onFile={vi.fn()} />)
    const zone = screen.getByRole('button', { name: /zone de dépôt/i })

    fireEvent.dragOver(zone, { preventDefault: vi.fn() })
    expect(zone.className).toMatch(/dragging/)
  })

  it('retire la classe dragging au drag leave', () => {
    render(<FileUploadZone onFile={vi.fn()} />)
    const zone = screen.getByRole('button', { name: /zone de dépôt/i })

    fireEvent.dragOver(zone, { preventDefault: vi.fn() })
    fireEvent.dragLeave(zone, { preventDefault: vi.fn() })
    expect(zone.className).not.toMatch(/dragging/)
  })
})

describe('FileUploadZone — état de chargement', () => {
  it('affiche le spinner quand isLoading est true', () => {
    render(<FileUploadZone onFile={vi.fn()} isLoading />)
    expect(screen.getByRole('status', { name: /chargement/i })).toBeInTheDocument()
    expect(screen.queryByText(/déposez/i)).not.toBeInTheDocument()
  })
})
