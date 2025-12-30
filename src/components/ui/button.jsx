import { cn } from "@/lib/utils";

const VARIANT_CLASSES = {
  default: "bg-[#D4AF37] text-white hover:bg-[#B8941F]",
  outline: "border border-gray-300 bg-white text-[#1A1A1A] hover:bg-white hover:shadow-md",
  ghost: "bg-transparent text-[#1A1A1A] hover:bg-gray-100",
};

const SIZE_CLASSES = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  lg: "h-12 px-6 py-3 text-base",
  icon: "h-10 w-10",
};

export function Button({
  children,
  className = "",
  variant = "default",
  size = "default",
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-white",
        VARIANT_CLASSES[variant] || VARIANT_CLASSES.default,
        SIZE_CLASSES[size] || SIZE_CLASSES.default,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
