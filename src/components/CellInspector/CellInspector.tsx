import { useState } from 'react'
import type { CellData, SheetData } from '../../types'
import { RawStyleView } from './RawStyleView'
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
  const [viewMode, setViewMode] = useState<'structured' | 'json'>('structured')

  if (!cell || !cellRef || !sheet) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>👆</span>
        <p>Cliquez sur une cellule pour inspecter ses propriétés</p>
      </div>
    )
  }

  const rs = cell.resolvedStyle
  const font = rs?.font
  const fill = rs?.fill
  const border = rs?.border
  const alignment = rs?.alignment
  const protection = rs?.protection

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
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'structured' ? styles.toggleActive : ''}`}
            onClick={() => setViewMode('structured')}
            title="Vue structurée"
          >
            ≡
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'json' ? styles.toggleActive : ''}`}
            onClick={() => setViewMode('json')}
            title="Vue JSON"
          >
            {'{ }'}
          </button>
        </div>
      </div>

      {viewMode === 'json' ? (
        <RawStyleView resolvedStyle={rs} />
      ) : (
        <>
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
                {font.name && <Prop label="Nom" value={font.name.value} />}
                {font.size !== undefined && <Prop label="Taille" value={`${font.size.value}pt`} />}
                <Prop label="Gras" value={font.bold?.value ? '✓ Oui' : 'Non'} />
                <Prop label="Italique" value={font.italic?.value ? '✓ Oui' : 'Non'} />
                <Prop label="Souligné" value={font.underline?.value ? '✓ Oui' : 'Non'} />
                <Prop label="Barré" value={font.strike?.value ? '✓ Oui' : 'Non'} />
                {font.family !== undefined && <Prop label="Famille" value={String(font.family.value)} />}
                {font.charset !== undefined && <Prop label="Charset" value={String(font.charset.value)} />}
                {font.vertAlign && <Prop label="Alignement vertical" value={font.vertAlign.value} />}
                {font.color && (
                  <Prop
                    label="Couleur"
                    value={
                      <span className={styles.colorRow}>
                        {font.color.value.startsWith('#') && <ColorSwatch hex={font.color.value} />}
                        {font.color.value}
                      </span>
                    }
                  />
                )}
              </>
            )}
          </Section>

          {/* Remplissage */}
          <Section title="Remplissage" empty={!fill}>
            {fill && (
              <>
                {fill.patternType && <Prop label="Type" value={fill.patternType.value} />}
                {fill.fgColor && (
                  <Prop
                    label="Couleur de fond"
                    value={
                      <span className={styles.colorRow}>
                        {fill.fgColor.value.startsWith('#') && <ColorSwatch hex={fill.fgColor.value} />}
                        {fill.fgColor.value}
                      </span>
                    }
                  />
                )}
                {fill.bgColor && (
                  <Prop
                    label="Couleur de motif"
                    value={
                      <span className={styles.colorRow}>
                        {fill.bgColor.value.startsWith('#') && <ColorSwatch hex={fill.bgColor.value} />}
                        {fill.bgColor.value}
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
                      {b?.style || b?.color ? (
                        <span className={styles.borderDetail}>
                          {b.style && <code className={styles.code}>{b.style.value}</code>}
                          {b.color && b.color.value.startsWith('#') && <ColorSwatch hex={b.color.value} />}
                          {b.color && <span>{b.color.value}</span>}
                        </span>
                      ) : (
                        <span className={styles.noValue}>—</span>
                      )}
                    </div>
                  )
                })}
                {border?.diagonalUp !== undefined && (
                  <Prop label="Diagonale montante" value={border.diagonalUp.value ? '✓ Oui' : 'Non'} />
                )}
                {border?.diagonalDown !== undefined && (
                  <Prop label="Diagonale descendante" value={border.diagonalDown.value ? '✓ Oui' : 'Non'} />
                )}
              </>
            )}
          </Section>

          {/* Alignement */}
          <Section title="Alignement" empty={!alignment}>
            {alignment && (
              <>
                {alignment.horizontal && <Prop label="Horizontal" value={alignment.horizontal.value} />}
                {alignment.vertical && <Prop label="Vertical" value={alignment.vertical.value} />}
                {alignment.wrapText !== undefined && (
                  <Prop label="Word wrap" value={alignment.wrapText.value ? '✓ Activé' : 'Désactivé'} />
                )}
                {alignment.indent !== undefined && alignment.indent.value > 0 && (
                  <Prop label="Retrait" value={String(alignment.indent.value)} />
                )}
                {alignment.shrinkToFit?.value && <Prop label="Shrink to fit" value="✓ Oui" />}
                {alignment.textRotation !== undefined && alignment.textRotation.value !== 0 && (
                  <Prop label="Rotation" value={`${alignment.textRotation.value}°`} />
                )}
              </>
            )}
          </Section>

          {/* Format */}
          <Section title="Format numérique" empty={!rs?.numFmt && rs?.numFmtId === undefined}>
            {(rs?.numFmt || rs?.numFmtId !== undefined) && (
              <>
                <Prop label="Code" value={<code className={styles.code}>{rs.numFmt?.value ?? 'General'}</code>} />
                {rs.numFmtId !== undefined && <Prop label="ID" value={String(rs.numFmtId.value)} />}
              </>
            )}
          </Section>

          {/* Dimensions */}
          <Section title="Dimensions">
            <Prop
              label="Largeur colonne"
              value={colInfo ? `${colInfo.width.toFixed(2)} chars · ~${colInfo.widthPx}px` : 'Par défaut'}
            />
            <Prop
              label="Hauteur ligne"
              value={rowInfo ? `${rowInfo.height.toFixed(1)}pt · ~${rowInfo.heightPx}px` : 'Par défaut'}
            />
          </Section>

          {/* Protection */}
          <Section title="Protection" empty={!protection}>
            {protection && (
              <>
                <Prop label="Verrouillée" value={protection.locked?.value ? '✓ Oui' : 'Non'} />
                <Prop label="Masquée" value={protection.hidden?.value ? '✓ Oui' : 'Non'} />
              </>
            )}
          </Section>
        </>
      )}
    </div>
  )
}
