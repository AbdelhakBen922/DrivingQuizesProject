export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';
export type ModalType = 'standard' | 'success' | 'error' | 'warning';
export type FieldType = 'text' | 'number' | 'textarea' | 'select';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  centered?: boolean;
  type?: ModalType;
}

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export interface FormFieldProps {
  label: string;
  name: string;
  type?: FieldType;
  placeholder?: string;
  defaultValue?: any;
  value?: any;
  onChange?: (value: any) => void;
  options?: string[];
  rows?: number;
  required?: boolean;
  error?: string;
  className?: string;
}
