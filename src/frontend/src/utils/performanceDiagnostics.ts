// Lightweight opt-in performance diagnostics utility
// Defers all initialization work until first use to avoid startup cost

let diagnosticsEnabled: boolean | null = null;
let hasInitialized = false;

function initializeDiagnostics() {
  if (hasInitialized) return;
  hasInitialized = true;

  // Check localStorage and URL params only when diagnostics are first accessed
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlFlag = urlParams.get('perfDiag');
    const storageFlag = localStorage.getItem('perfDiag');
    
    diagnosticsEnabled = urlFlag === 'true' || storageFlag === 'true';
  } catch {
    diagnosticsEnabled = false;
  }
}

function isDiagnosticsEnabled(): boolean {
  if (diagnosticsEnabled === null) {
    initializeDiagnostics();
  }
  return diagnosticsEnabled ?? false;
}

export const perfDiag = {
  log: (message: string, data?: any) => {
    if (!isDiagnosticsEnabled()) return;
    console.log(`[PerfDiag] ${message}`, data ?? '');
  },
  
  warn: (message: string, data?: any) => {
    if (!isDiagnosticsEnabled()) return;
    console.warn(`[PerfDiag] ${message}`, data ?? '');
  },
  
  time: (label: string) => {
    if (!isDiagnosticsEnabled()) return;
    console.time(`[PerfDiag] ${label}`);
  },
  
  timeEnd: (label: string) => {
    if (!isDiagnosticsEnabled()) return;
    console.timeEnd(`[PerfDiag] ${label}`);
  },
};

export async function timeOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  if (!isDiagnosticsEnabled()) {
    return operation();
  }

  const startTime = performance.now();
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    perfDiag.log(`${operationName} completed in ${duration.toFixed(2)}ms`, metadata);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    perfDiag.warn(`${operationName} failed after ${duration.toFixed(2)}ms`, { error, metadata });
    throw error;
  }
}
