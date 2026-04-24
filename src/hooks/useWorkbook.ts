import { useState, useCallback, useRef } from 'react'
import type { WorkbookData } from '../types'

type WorkbookState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; data: WorkbookData }
  | { status: 'error'; message: string }

export function useWorkbook() {
  const [state, setState] = useState<WorkbookState>({ status: 'idle' })
  const workerRef = useRef<Worker | null>(null)

  const load = useCallback((file: File) => {
    setState({ status: 'loading' })

    if (workerRef.current) {
      workerRef.current.terminate()
    }

    const worker = new Worker(new URL('../workers/parser.worker.ts', import.meta.url), {
      type: 'module',
    })
    workerRef.current = worker

    worker.onmessage = (e) => {
      const msg = e.data as { type: string; data?: WorkbookData; message?: string }
      if (msg.type === 'success' && msg.data) {
        setState({ status: 'ready', data: msg.data })
      } else if (msg.type === 'error') {
        setState({ status: 'error', message: msg.message ?? 'Parsing failed' })
      }
      worker.terminate()
      workerRef.current = null
    }

    worker.onerror = () => {
      setState({ status: 'error', message: 'Worker error during parsing' })
      worker.terminate()
      workerRef.current = null
    }

    file.arrayBuffer().then((buffer) => {
      worker.postMessage({ type: 'parse', buffer }, [buffer])
    })
  }, [])

  const reset = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
    setState({ status: 'idle' })
  }, [])

  return { state, load, reset }
}
