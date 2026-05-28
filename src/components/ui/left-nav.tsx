import * as React from "react";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ── */

export interface NavChild {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export interface NavItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  expandable?: boolean;
  defaultOpen?: boolean;
  children?: NavChild[];
  onClick?: () => void;
}

/* ── LeftNav ── */

interface LeftNavProps extends React.HTMLAttributes<HTMLElement> {
  /** Navigation items to render */
  items: NavItem[];
  /** Whether the nav is expanded or collapsed */
  open?: boolean;
  /** Called when the toggle button is clicked */
  onToggle?: () => void;
  /** Show/hide the collapse toggle button */
  collapsible?: boolean;
}

const LeftNav = React.forwardRef<HTMLElement, LeftNavProps>(
  (
    {
      className,
      items,
      open = true,
      onToggle,
      collapsible = true,
      ...props
    },
    ref
  ) => (
    <aside
      ref={ref}
      className={cn(
        "relative flex flex-shrink-0 flex-col overflow-visible bg-lyra-bg-surface-shell transition-all duration-200",
        open ? "w-[256px]" : "w-[52px]",
        className
      )}
      {...props}
    >
      {/* Toggle button */}
      {collapsible && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-[22px] z-10 flex h-5 w-5 items-center justify-center rounded-full border border-lyra-border-default bg-lyra-bg-surface-base text-lyra-fg-secondary shadow-sm hover:bg-lyra-bg-surface-shell transition-colors"
          title={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          {open ? (
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          )}
        </button>
      )}

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden px-2 py-3">
        {items.map((item, i) => (
          <NavItemRow key={i} item={item} collapsed={!open} />
        ))}
      </nav>
    </aside>
  )
);
LeftNav.displayName = "LeftNav";

/* ── NavItemRow (internal) ── */

function NavItemRow({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(item.defaultOpen ?? false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive =
    item.active || (hasChildren && item.children!.some((c) => c.active));

  return (
    <div>
      <button
        onClick={() => {
          if (item.expandable && !collapsed) setOpen((v) => !v);
          item.onClick?.();
        }}
        title={collapsed ? item.label : undefined}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lyra-sm px-2.5 py-[7px] lyra-body-md transition-colors",
          collapsed && "justify-center px-0",
          isActive
            ? "bg-lyra-fg-active-subtle text-lyra-fg-active-strong lyra-body-md-emphasis"
            : "text-lyra-fg-default hover:bg-lyra-state-hover active:bg-lyra-state-pressed"
        )}
      >
        <span className="flex-shrink-0 text-lyra-fg-secondary">
          {item.icon}
        </span>
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.label}</span>
            {item.expandable && (
              <span className="text-lyra-fg-disabled">
                {open ? (
                  <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.5} />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} />
                )}
              </span>
            )}
          </>
        )}
      </button>

      {/* Children (expanded) — hidden when collapsed */}
      {!collapsed && hasChildren && open && (
        <div className="ml-[18px] mt-0.5 flex flex-col gap-0.5 border-l border-lyra-border-subtle pl-3">
          {item.children!.map((child, j) => (
            <button
              key={j}
              onClick={child.onClick}
              className={cn(
                "w-full rounded-lyra-sm px-2.5 py-[6px] text-left lyra-body-md transition-colors",
                child.active
                  ? "bg-lyra-fg-active-subtle text-lyra-fg-active-strong lyra-body-md-emphasis"
                  : "text-lyra-fg-secondary hover:bg-lyra-state-hover hover:text-lyra-fg-default active:bg-lyra-state-pressed"
              )}
            >
              {child.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { LeftNav };
