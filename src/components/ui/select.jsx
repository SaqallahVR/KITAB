import React from "react";
import { cn } from "@/lib/utils";

const SelectContext = React.createContext(null);

export function Select({ value, onValueChange, children }) {
  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      {children}
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className, children }) {
  return (
    <div
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SelectValue({ placeholder }) {
  const ctx = React.useContext(SelectContext);
  return (
    <span className={cn(!ctx?.value && "text-gray-400")}>
      {ctx?.value || placeholder || "اختر"}
    </span>
  );
}

export function SelectContent({ children, className }) {
  const ctx = React.useContext(SelectContext);
  return (
    <select
      className={cn(
        "h-10 w-full rounded-md border border-input bg-white px-3 text-sm",
        className
      )}
      value={ctx?.value || ""}
      onChange={(event) => ctx?.onValueChange?.(event.target.value)}
    >
      {children}
    </select>
  );
}

export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}
