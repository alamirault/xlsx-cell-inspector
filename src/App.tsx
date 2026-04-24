import { useState } from 'react'
import { useWorkbook } from './hooks/useWorkbook'
import { useSelectedCell } from './hooks/useSelectedCell'
import { FileUploadZone } from './components/FileUploadZone/FileUploadZone'
import { SheetTabs } from './components/SheetTabs/SheetTabs'
import { SpreadsheetGrid } from './components/SpreadsheetGrid/SpreadsheetGrid'
import { CellInspector } from './components/CellInspector/CellInspector'
import styles from './App.module.css'

export default function App() {
  const { state, load, reset } = useWorkbook()
  const { selected, select, clear } = useSelectedCell()
  const [activeSheetIndex, setActiveSheetIndex] = useState(0)

  const workbook = state.status === 'ready' ? state.data : null
  const activeSheet = workbook?.sheets[activeSheetIndex] ?? null
  const selectedCellData =
    selected && activeSheet ? activeSheet.cells[selected.ref] ?? null : null

  const handleSheetChange = (index: number) => {
    setActiveSheetIndex(index)
    clear()
  }

  const handleReset = () => {
    reset()
    clear()
    setActiveSheetIndex(0)
  }

  if (!workbook) {
    return (
      <div className={styles.uploadPage}>
        <div className={styles.uploadHeader}>
          <h1 className={styles.logo}>
            <span className={styles.logoIcon}>🔍</span> XLSX Cell Inspector
          </h1>
          <p className={styles.tagline}>
            Inspectez les propriétés OOXML de vos cellules Excel — 100% côté client
          </p>
        </div>

        <FileUploadZone
          onFile={load}
          isLoading={state.status === 'loading'}
          error={state.status === 'error' ? state.message : null}
        />

        <p className={styles.privacy}>
          🔒 Aucune donnée envoyée à un serveur — traitement local dans votre navigateur
        </p>
      </div>
    )
  }

  return (
    <div className={styles.inspectorLayout}>
      {/* Top bar */}
      <header className={styles.topBar}>
        <span className={styles.topBarLogo}>🔍 XLSX Cell Inspector</span>
        <span className={styles.sheetInfo}>
          {activeSheet?.range} · {activeSheet?.rowCount} lignes · {activeSheet?.colCount} colonnes
        </span>
        <button className={styles.resetBtn} onClick={handleReset} title="Charger un autre fichier">
          ✕ Fermer
        </button>
      </header>

      {/* Sheet tabs */}
      <SheetTabs
        sheets={workbook.sheets.map((s) => s.name)}
        activeIndex={activeSheetIndex}
        onSheetChange={handleSheetChange}
      />

      {/* Main content */}
      <div className={styles.content}>
        {/* Grid */}
        <div className={styles.gridPane}>
          {activeSheet && (
            <SpreadsheetGrid
              sheet={activeSheet}
              sheetIndex={activeSheetIndex}
              selectedCell={selected}
              onCellClick={select}
            />
          )}
        </div>

        {/* Inspector panel */}
        <div className={styles.inspectorPane}>
          <CellInspector
            cell={selectedCellData}
            cellRef={selected?.ref ?? null}
            sheet={activeSheet}
          />
        </div>
      </div>
    </div>
  )
}
