import type { ModalBodyProps } from "./types";

export default function ModalBody({ children, className = "" }: ModalBodyProps) {
  return (
    <div className={`px-6 py-6 ${className}`}>
      {children}
    </div>
  );
}
