import styles from './SheetTabs.module.css'

interface Props {
  sheets: string[]
  activeIndex: number
  onSheetChange: (index: number) => void
}

export function SheetTabs({ sheets, activeIndex, onSheetChange }: Props) {
  return (
    <div className={styles.tabBar} role="tablist" aria-label="Feuilles du classeur">
      {sheets.map((name, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === activeIndex}
          className={`${styles.tab} ${i === activeIndex ? styles.active : ''}`}
          onClick={() => onSheetChange(i)}
          title={name}
        >
          {name}
        </button>
      ))}
    </div>
  )
}
