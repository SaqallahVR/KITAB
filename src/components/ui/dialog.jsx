import React, { createContext, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const DialogContext = createContext({ open: false, onOpenChange: () => {} });

export function Dialog({ open = false, onOpenChange, children }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ asChild = false, children }) {
  const { open, onOpenChange } = useContext(DialogContext);

  const handleClick = () => onOpenChange?.(!open);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (event) => {
        children.props.onClick?.(event);
        handleClick();
      },
    });
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
}

export function DialogContent({ className, children }) {
  const { open, onOpenChange } = useContext(DialogContext);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onOpenChange?.(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange?.(false)}
        aria-label="Close dialog"
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl",
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export function DialogHeader({ className, children }) {
  return <div className={cn("mb-4 space-y-1", className)}>{children}</div>;
}

export function DialogTitle({ className, children }) {
  return <h3 className={cn("text-lg font-bold", className)}>{children}</h3>;
}
