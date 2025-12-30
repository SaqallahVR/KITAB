import { cn } from "@/lib/utils";

export function Badge({ children, className = "", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[#D4AF37]/20 px-2.5 py-0.5 text-xs font-semibold text-[#D4AF37]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
