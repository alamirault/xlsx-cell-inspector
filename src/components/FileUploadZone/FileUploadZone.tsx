import { useRef, useState, DragEvent, ChangeEvent } from 'react'
import styles from './FileUploadZone.module.css'

const ACCEPTED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
]
const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls']

interface Props {
  onFile: (file: File) => void
  isLoading?: boolean
  error?: string | null
}

function isExcelFile(file: File): boolean {
  const extMatch = ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
  const typeMatch = ACCEPTED_TYPES.includes(file.type)
  return extMatch || typeMatch
}

export function FileUploadZone({ onFile, isLoading = false, error = null }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleFile = (file: File) => {
    if (!isExcelFile(file)) {
      setLocalError('Format non supporté. Utilisez un fichier .xlsx ou .xls')
      return
    }
    setLocalError(null)
    onFile(file)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const displayError = localError ?? error

  return (
    <div
      className={`${styles.zone} ${isDragging ? styles.dragging : ''} ${isLoading ? styles.loading : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isLoading && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Zone de dépôt de fichier Excel"
      onKeyDown={(e) => e.key === 'Enter' && !isLoading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(',')}
        onChange={handleChange}
        className={styles.hiddenInput}
        aria-hidden
        disabled={isLoading}
      />

      {isLoading ? (
        <div className={styles.spinner} role="status" aria-label="Chargement en cours">
          <div className={styles.spinnerCircle} />
          <span>Analyse du fichier…</span>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.icon}>📊</div>
          <p className={styles.title}>Déposez votre fichier Excel ici</p>
          <p className={styles.subtitle}>ou cliquez pour sélectionner un fichier</p>
          <span className={styles.badge}>.xlsx / .xls</span>
        </div>
      )}

      {displayError && (
        <p className={styles.error} role="alert">
          {displayError}
        </p>
      )}
    </div>
  )
}
