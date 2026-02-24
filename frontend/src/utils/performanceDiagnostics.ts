/**
 * Lightweight performance diagnostics utility
 * Opt-in via localStorage flag: localStorage.setItem('perf_diagnostics', 'true')
 * Or URL param: ?perf_diagnostics=true
 */

interface TimingEntry {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceDiagnostics {
  private enabled: boolean | null = null;
  private timings: Map<string, TimingEntry> = new Map();

  // Lazy initialization - only check enabled state when first needed
  private checkEnabled() {
    if (this.enabled !== null) return;

    // Check localStorage
    const localStorageFlag = localStorage.getItem('perf_diagnostics') === 'true';
    
    // Check URL param
    const urlParams = new URLSearchParams(window.location.search);
    const urlFlag = urlParams.get('perf_diagnostics') === 'true';
    
    this.enabled = localStorageFlag || urlFlag;
    
    if (this.enabled) {
      console.log('[PerfDiag] Performance diagnostics enabled');
    }
  }

  isEnabled(): boolean {
    this.checkEnabled();
    return this.enabled === true;
  }

  startTiming(operationId: string, operation: string, metadata?: Record<string, any>) {
    if (!this.isEnabled()) return;

    this.timings.set(operationId, {
      operation,
      startTime: performance.now(),
      metadata,
    });
  }

  endTiming(operationId: string, additionalMetadata?: Record<string, any>) {
    if (!this.isEnabled()) return;

    const entry = this.timings.get(operationId);
    if (!entry) return;

    entry.endTime = performance.now();
    entry.duration = entry.endTime - entry.startTime;
    
    if (additionalMetadata) {
      entry.metadata = { ...entry.metadata, ...additionalMetadata };
    }

    console.log(
      `[PerfDiag] ${entry.operation} completed in ${entry.duration.toFixed(2)}ms`,
      entry.metadata || ''
    );

    this.timings.delete(operationId);
  }

  logOperation(operation: string, duration: number, metadata?: Record<string, any>) {
    if (!this.isEnabled()) return;

    console.log(
      `[PerfDiag] ${operation} took ${duration.toFixed(2)}ms`,
      metadata || ''
    );
  }
}

// Singleton instance
export const perfDiag = new PerformanceDiagnostics();

/**
 * Helper to time an async operation
 */
export async function timeOperation<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  if (!perfDiag.isEnabled()) {
    return fn();
  }

  const operationId = `${operation}-${Date.now()}-${Math.random()}`;
  perfDiag.startTiming(operationId, operation, metadata);

  try {
    const result = await fn();
    perfDiag.endTiming(operationId, { success: true });
    return result;
  } catch (error) {
    perfDiag.endTiming(operationId, { success: false, error: String(error) });
    throw error;
  }
}
