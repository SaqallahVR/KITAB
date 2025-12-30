import { cn } from "@/lib/utils";

export function DropdownMenu({ children }) {
  return <div className="relative inline-block">{children}</div>;
}

export function DropdownMenuTrigger({ children }) {
  return <>{children}</>;
}

export function DropdownMenuContent({ children, className = "", align = "start" }) {
  return (
    <div
      className={cn(
        "absolute z-50 mt-2 min-w-[10rem] rounded-md border border-gray-200 bg-white p-1 shadow-lg",
        align === "end" ? "left-0" : "right-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100",
        className
      )}
    >
      {children}
    </button>
  );
}
