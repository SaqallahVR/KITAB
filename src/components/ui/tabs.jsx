import React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext(null);

export function Tabs({ children, className = "", value, defaultValue, onValueChange, ...props }) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const activeValue = value !== undefined ? value : internalValue;

  const setValue = (nextValue) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    if (onValueChange) onValueChange(nextValue);
  };

  return (
    <TabsContext.Provider value={{ value: activeValue, setValue }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = "", ...props }) {
  return (
    <div
      className={cn(
        "inline-flex h-10 w-full items-center justify-center rounded-md bg-gray-100 p-1 text-gray-600",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ children, className = "", value, ...props }) {
  const ctx = React.useContext(TabsContext);
  const isActive = ctx?.value === value;

  return (
    <button
      type="button"
      onClick={() => ctx?.setValue?.(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-[#D4AF37] text-white shadow-sm"
          : "text-gray-600 hover:text-[#1A1A1A]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, className = "", value, ...props }) {
  const ctx = React.useContext(TabsContext);
  if (ctx?.value !== value) return null;

  return (
    <div className={cn("mt-2", className)} {...props}>
      {children}
    </div>
  );
}
