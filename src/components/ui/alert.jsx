import { cn } from "@/lib/utils";

export function Alert({ children, className = "", ...props }) {
  return (
    <div
      className={cn("relative w-full rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertDescription({ children, className = "", ...props }) {
  return (
    <p className={cn("text-sm text-gray-600", className)} {...props}>
      {children}
    </p>
  );
}
