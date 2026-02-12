// No-op toast implementation that matches Sonner API surface
// Used to disable all toast notifications while preserving control flow

export const toast = {
  success: (_message: string) => {},
  error: (_message: string) => {},
  info: (_message: string) => {},
  warning: (_message: string) => {},
  loading: (_message: string) => {},
  promise: <T,>(promise: Promise<T>, _messages: any) => promise,
  dismiss: (_toastId?: string | number) => {},
  message: (_message: string) => {},
};
