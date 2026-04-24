import { parseWorkbook } from '../utils/parseWorkbook'
import type { WorkbookData } from '../types'

type WorkerMessage =
  | { type: 'parse'; buffer: ArrayBuffer }

type WorkerResponse =
  | { type: 'success'; data: WorkbookData }
  | { type: 'error'; message: string }

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  if (e.data.type === 'parse') {
    try {
      const data = parseWorkbook(e.data.buffer)
      const response: WorkerResponse = { type: 'success', data }
      self.postMessage(response)
    } catch (err) {
      const response: WorkerResponse = {
        type: 'error',
        message: err instanceof Error ? err.message : 'Parsing failed',
      }
      self.postMessage(response)
    }
  }
}
