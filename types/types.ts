interface ToasterService {
  success(message: string, title: string, options?: ToastOptions): void;
  error(message: string, title: string, options?: ToastOptions): void;
}
interface ToastOptions {
  type?: 'info' | 'success' | 'warning' | 'error';
  icon?: string;
  timeOut?: number;
  closable?: boolean;
}
