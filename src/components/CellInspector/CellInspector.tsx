import type { CellData, SheetData } from '../../types'
import styles from './CellInspector.module.css'

interface Props {
  cell: CellData | null
  cellRef: string | null
  sheet: SheetData | null
}

function ColorSwatch({ hex }: { hex: string }) {
  return (
    <span
      className={styles.colorSwatch}
      style={{ background: hex }}
      title={hex}
      aria-label={`Couleur ${hex}`}
    />
  )
}

function Prop({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={styles.prop}>
      <span className={styles.propLabel}>{label}</span>
      <span className={styles.propValue}>{value}</span>
    </div>
  )
}

function Section({ title, children, empty }: { title: string; children: React.ReactNode; empty?: boolean }) {
  return (
    <details className={styles.section} open>
      <summary className={styles.sectionTitle}>{title}</summary>
      <div className={styles.sectionBody}>
        {empty ? (
          <p className={styles.emptyMsg}>Aucune propriété définie</p>
        ) : (
          children
        )}
      </div>
    </details>
  )
}

export function CellInspector({ cell, cellRef, sheet }: Props) {
  if (!cell || !cellRef || !sheet) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>👆</span>
        <p>Cliquez sur une cellule pour inspecter ses propriétés</p>
      </div>
    )
  }

  const s = cell.style
  const font = s?.font
  const fill = s?.fill
  const border = s?.border
  const alignment = s?.alignment
  const protection = s?.protection

  // Find column/row info from sheet
  const colLetter = cellRef.match(/([A-Z]+)/)?.[1] ?? ''
  const rowNum = parseInt(cellRef.match(/(\d+)/)?.[1] ?? '1', 10)
  const colInfo = sheet.columns.find((c) => c.letter === colLetter)
  const rowInfo = sheet.rows.find((r) => r.index === rowNum - 1)

  const hasBorders =
    border?.top || border?.right || border?.bottom || border?.left || border?.diagonal ||
    border?.diagonalUp || border?.diagonalDown

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.cellRef}>{cellRef}</span>
        <span className={styles.sheetName}>{sheet.name}</span>
      </div>

      {/* Valeur */}
      <Section title="Valeur">
        <Prop label="Valeur brute" value={String(cell.rawValue ?? '')} />
        <Prop label="Valeur formatée" value={cell.formattedValue} />
        <Prop label="Type" value={<code className={styles.code}>{cell.type}</code>} />
        {cell.formula && <Prop label="Formule" value={<code className={styles.code}>={cell.formula}</code>} />}
      </Section>

      {/* Police */}
      <Section title="Police" empty={!font}>
        {font && (
          <>
            {font.name && <Prop label="Nom" value={font.name} />}
            {font.sz !== undefined && <Prop label="Taille" value={`${font.sz}pt`} />}
            <Prop label="Gras" value={font.bold ? '✓ Oui' : 'Non'} />
            <Prop label="Italique" value={font.italic ? '✓ Oui' : 'Non'} />
            <Prop label="Souligné" value={font.underline ? '✓ Oui' : 'Non'} />
            <Prop label="Barré" value={font.strike ? '✓ Oui' : 'Non'} />
            {font.color && (
              <Prop
                label="Couleur"
                value={
                  <span className={styles.colorRow}>
                    <ColorSwatch hex={font.color} />
                    {font.color}
                  </span>
                }
              />
            )}
          </>
        )}
      </Section>

      {/* Remplissage */}
      <Section title="Remplissage" empty={!fill || fill.patternType === 'none' || (!fill.fgColor && !fill.bgColor)}>
        {fill && fill.patternType !== 'none' && (fill.fgColor || fill.bgColor) && (
          <>
            {fill.patternType && <Prop label="Type" value={fill.patternType} />}
            {fill.fgColor && (
              <Prop
                label="Couleur de fond"
                value={
                  <span className={styles.colorRow}>
                    <ColorSwatch hex={fill.fgColor} />
                    {fill.fgColor}
                  </span>
                }
              />
            )}
            {fill.bgColor && (
              <Prop
                label="Couleur de motif"
                value={
                  <span className={styles.colorRow}>
                    <ColorSwatch hex={fill.bgColor} />
                    {fill.bgColor}
                  </span>
                }
              />
            )}
          </>
        )}
      </Section>

      {/* Bordures */}
      <Section title="Bordures" empty={!hasBorders}>
        {hasBorders && (
          <>
            {(['top', 'right', 'bottom', 'left', 'diagonal'] as const).map((side) => {
              const b = border?.[side]
              return (
                <div key={side} className={styles.borderRow}>
                  <span className={styles.borderSide}>{side}</span>
                  {b ? (
                    <span className={styles.borderDetail}>
                      <code className={styles.code}>{b.style}</code>
                      {b.color && <ColorSwatch hex={b.color} />}
                      {b.color && <span>{b.color}</span>}
                    </span>
                  ) : (
                    <span className={styles.noValue}>—</span>
                  )}
                </div>
              )
            })}
            {border?.diagonalUp !== undefined && (
              <Prop label="Diagonale montante" value={border.diagonalUp ? '✓ Oui' : 'Non'} />
            )}
            {border?.diagonalDown !== undefined && (
              <Prop label="Diagonale descendante" value={border.diagonalDown ? '✓ Oui' : 'Non'} />
            )}
          </>
        )}
      </Section>

      {/* Alignement */}
      <Section title="Alignement" empty={!alignment}>
        {alignment && (
          <>
            {alignment.horizontal && <Prop label="Horizontal" value={alignment.horizontal} />}
            {alignment.vertical && <Prop label="Vertical" value={alignment.vertical} />}
            <Prop label="Word wrap" value={alignment.wrapText ? '✓ Activé' : 'Désactivé'} />
            {alignment.indent !== undefined && alignment.indent > 0 && (
              <Prop label="Retrait" value={String(alignment.indent)} />
            )}
            {alignment.shrinkToFit && <Prop label="Shrink to fit" value="✓ Oui" />}
            {alignment.textRotation !== undefined && alignment.textRotation !== 0 && (
              <Prop label="Rotation" value={`${alignment.textRotation}°`} />
            )}
          </>
        )}
      </Section>

      {/* Format */}
      <Section title="Format numérique" empty={!s?.numFmt && s?.numFmtId === undefined}>
        {(s?.numFmt || s?.numFmtId !== undefined) && (
          <>
            <Prop label="Code" value={<code className={styles.code}>{s.numFmt ?? 'General'}</code>} />
            {s.numFmtId !== undefined && <Prop label="ID" value={String(s.numFmtId)} />}
          </>
        )}
      </Section>

      {/* Dimensions */}
      <Section title="Dimensions">
        <Prop
          label="Largeur colonne"
          value={
            colInfo
              ? `${colInfo.width.toFixed(2)} chars · ~${colInfo.widthPx}px`
              : 'Par défaut'
          }
        />
        <Prop
          label="Hauteur ligne"
          value={
            rowInfo
              ? `${rowInfo.height.toFixed(1)}pt · ~${rowInfo.heightPx}px`
              : 'Par défaut'
          }
        />
      </Section>

      {/* Protection */}
      <Section title="Protection" empty={!protection}>
        {protection && (
          <>
            <Prop label="Verrouillée" value={protection.locked ? '✓ Oui' : 'Non'} />
            <Prop label="Masquée" value={protection.hidden ? '✓ Oui' : 'Non'} />
          </>
        )}
      </Section>
    </div>
  )
}
