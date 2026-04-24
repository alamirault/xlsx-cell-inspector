import { useState, useCallback } from 'react'
import type { SelectedCell } from '../types'

export function useSelectedCell() {
  const [selected, setSelected] = useState<SelectedCell | null>(null)

  const select = useCallback((cell: SelectedCell) => {
    setSelected(cell)
  }, [])

  const clear = useCallback(() => {
    setSelected(null)
  }, [])

  return { selected, select, clear }
}
