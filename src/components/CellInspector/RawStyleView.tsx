import type { ResolvedStyle, ResolvedProperty } from '../../types'
import styles from './RawStyleView.module.css'

interface Props {
  resolvedStyle: ResolvedStyle | undefined
}

function ColorSwatch({ hex }: { hex: string }) {
  return (
    <span
      className={styles.swatch}
      style={{ background: hex }}
      title={hex}
    />
  )
}

function PropRow({ name, prop }: { name: string; prop: ResolvedProperty<unknown> }) {
  const val = prop.value
  const isHex = typeof val === 'string' && val.startsWith('#')
  return (
    <div className={styles.propRow}>
      <span className={styles.key}>{name}</span>
      <span className={styles.colon}>:</span>
      <span className={styles.value}>
        {isHex && <ColorSwatch hex={val as string} />}
        {typeof val === 'boolean' ? (val ? 'true' : 'false') : String(val)}
      </span>
      <span className={styles.source}>{prop.source.element}</span>
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className={styles.group} open>
      <summary className={styles.groupTitle}>{title}</summary>
      <div className={styles.groupBody}>{children}</div>
    </details>
  )
}

export function RawStyleView({ resolvedStyle }: Props) {
  if (!resolvedStyle) {
    return <div className={styles.empty}>Aucune donnée de style</div>
  }

  const { font, fill, border, alignment, protection, numFmt, numFmtId } = resolvedStyle

  return (
    <div className={styles.root}>
      {font && (
        <Group title="font">
          {Object.entries(font).map(([k, p]) => (
            <PropRow key={k} name={k} prop={p as ResolvedProperty<unknown>} />
          ))}
        </Group>
      )}

      {fill && (
        <Group title="fill">
          {Object.entries(fill).map(([k, p]) => (
            <PropRow key={k} name={k} prop={p as ResolvedProperty<unknown>} />
          ))}
        </Group>
      )}

      {border && (
        <Group title="border">
          {(['top', 'right', 'bottom', 'left', 'diagonal'] as const).map((side) => {
            const b = border[side]
            if (!b) return null
            return (
              <details key={side} className={styles.subGroup} open>
                <summary className={styles.subGroupTitle}>{side}</summary>
                <div className={styles.groupBody}>
                  {b.style && <PropRow name="style" prop={b.style} />}
                  {b.color && <PropRow name="color" prop={b.color} />}
                </div>
              </details>
            )
          })}
          {border.diagonalUp && <PropRow name="diagonalUp" prop={border.diagonalUp} />}
          {border.diagonalDown && <PropRow name="diagonalDown" prop={border.diagonalDown} />}
        </Group>
      )}

      {alignment && (
        <Group title="alignment">
          {Object.entries(alignment).map(([k, p]) => (
            <PropRow key={k} name={k} prop={p as ResolvedProperty<unknown>} />
          ))}
        </Group>
      )}

      {protection && (
        <Group title="protection">
          {Object.entries(protection).map(([k, p]) => (
            <PropRow key={k} name={k} prop={p as ResolvedProperty<unknown>} />
          ))}
        </Group>
      )}

      {(numFmt || numFmtId) && (
        <Group title="numFmt">
          {numFmt && <PropRow name="numFmt" prop={numFmt} />}
          {numFmtId && <PropRow name="numFmtId" prop={numFmtId} />}
        </Group>
      )}
    </div>
  )
}
