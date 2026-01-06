import React from "react";
import { cn } from "@/lib/utils";

export function Table({ className, children }) {
  return (
    <table className={cn("w-full text-sm text-right", className)}>
      {children}
    </table>
  );
}

export function TableHeader({ className, children }) {
  return <thead className={cn("bg-[#F5F1E8]", className)}>{children}</thead>;
}

export function TableBody({ className, children }) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ className, children }) {
  return <tr className={cn("border-t", className)}>{children}</tr>;
}

export function TableHead({ className, children }) {
  return <th className={cn("px-4 py-3 font-semibold", className)}>{children}</th>;
}

export function TableCell({ className, children }) {
  return <td className={cn("px-4 py-3 align-top", className)}>{children}</td>;
}
