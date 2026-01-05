import React from "react";
import { cn } from "@/lib/utils";

const DropdownMenuContext = React.createContext(null);

export function DropdownMenu({ children }) {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={menuRef} className="relative inline-block">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ children }) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) return <>{children}</>;
  const child = React.Children.only(children);

  const handleClick = (event) => {
    child.props.onClick?.(event);
    context.setOpen(!context.open);
  };

  return React.cloneElement(child, {
    onClick: handleClick,
    "aria-expanded": context.open,
  });
}

export function DropdownMenuContent({ children, className = "", align = "start" }) {
  const context = React.useContext(DropdownMenuContext);
  if (!context?.open) return null;

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
  const context = React.useContext(DropdownMenuContext);

  const handleClick = (event) => {
    onClick?.(event);
    context?.setOpen(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100",
        className
      )}
    >
      {children}
    </button>
  );
}
