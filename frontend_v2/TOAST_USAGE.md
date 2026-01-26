/**
 * Toast Notification System Documentation
 * 
 * Usage Example:
 * 
 * 1. Import the hook and container in your component:
 * ```tsx
 * import { ToastContainer } from "../../Toast";
 * import { useToast } from "../../../hooks/useToast";
 * import type { ToastItem } from "../../../hooks/useToast";
 * ```
 * 
 * 2. Initialize state and hook in your component:
 * ```tsx
 * const [toasts, setToasts] = useState<ToastItem[]>([]);
 * const { success, error, warning, info } = useToast({ toasts, setToasts });
 * ```
 * 
 * 3. Add the container at the beginning of your JSX:
 * ```tsx
 * return (
 *   <>
 *     <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
 *     {/* Your component content */}
 *   </>
 * );
 * ```
 * 
 * 4. Use the toast methods in your event handlers:
 * ```tsx
 * const handleSave = () => {
 *   try {
 *     // Your logic
 *     success("Item saved successfully!");
 *   } catch (err) {
 *     error("Failed to save item. Please try again.");
 *   }
 * };
 * ```
 * 
 * Available Methods:
 * - success(message, duration?) - Green success toast
 * - error(message, duration?) - Red error toast
 * - warning(message, duration?) - Yellow warning toast
 * - info(message, duration?) - Blue info toast
 * 
 * Parameters:
 * - message: string - The toast message to display
 * - duration: number - Time in milliseconds before auto-close (default: 3000)
 *             Set to 0 to disable auto-close
 */

export {};
