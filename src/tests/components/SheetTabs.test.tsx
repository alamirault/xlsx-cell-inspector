import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SheetTabs } from '../../components/SheetTabs/SheetTabs'

describe('SheetTabs — rendu', () => {
  it('affiche un onglet par feuille', () => {
    render(
      <SheetTabs sheets={['Sheet1', 'Data', 'Summary']} activeIndex={0} onSheetChange={vi.fn()} />,
    )
    expect(screen.getByRole('tab', { name: 'Sheet1' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Data' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Summary' })).toBeInTheDocument()
  })

  it("marque l'onglet actif avec aria-selected=true", () => {
    render(
      <SheetTabs sheets={['Sheet1', 'Data']} activeIndex={1} onSheetChange={vi.fn()} />,
    )
    expect(screen.getByRole('tab', { name: 'Data' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Sheet1' })).toHaveAttribute('aria-selected', 'false')
  })
})

describe('SheetTabs — interaction', () => {
  it('appelle onSheetChange avec le bon index au clic', async () => {
    const onSheetChange = vi.fn()
    render(
      <SheetTabs sheets={['Sheet1', 'Data', 'Summary']} activeIndex={0} onSheetChange={onSheetChange} />,
    )
    await userEvent.click(screen.getByRole('tab', { name: 'Data' }))
    expect(onSheetChange).toHaveBeenCalledWith(1)
  })
})
