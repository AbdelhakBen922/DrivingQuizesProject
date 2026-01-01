import type { ModalBodyProps } from "./types";

export default function ModalBody({ children, className = "" }: ModalBodyProps) {
  return (
    <div className={`px-4 sm:px-6 py-4 sm:py-6 ${className}`}>
      {children}
    </div>
  );
}
