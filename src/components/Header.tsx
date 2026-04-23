import { useState, useRef, useEffect } from "react";
import { CircleHelp, Bell } from "lucide-react";
import appIcon from "@/assets/app-icon.svg";
import { AppHeader } from "@/components/ui/app-header";
import { AppName } from "@/components/ui/app-name";
import { ActionIconButton, ActionAvatarButton } from "@/components/ui/actions";
import { AppMenu, type AppMenuGroup } from "@/components/ui/app-menu";
import { CXoneLogo } from "@/components/ui/cxone-logo";

const appMenuGroups: AppMenuGroup[] = [
  {
    items: [
      { label: "Agent" },
      { label: "Agent Desktop Premium" },
      { label: "Congingy AI" },
    ],
  },
  {
    items: [
      { label: "Workforce Management" },
      { label: "Quality Management" },
      { label: "interaction Hub" },
      { label: "My Zone" },
    ],
  },
  {
    items: [
      { label: "Dashboard" },
      { label: "Analytics" },
    ],
  },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  /* Close on Escape */
  useEffect(() => {
    if (!menuOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  return (
    <AppHeader
      appName={
        <div className="relative">
          <AppName
            ref={triggerRef}
            icon={<img src={appIcon} alt="Desk" className="h-6 w-6" />}
            name="Agent Workspace Premium"
            onClick={() => setMenuOpen((v) => !v)}
          />
          {menuOpen && (
            <div ref={menuRef} className="absolute left-0 top-full z-50 mt-1">
              <AppMenu groups={appMenuGroups} footer={<CXoneLogo />} />
            </div>
          )}
        </div>
      }
      actions={
        <>
          <ActionIconButton title="Help">
            <CircleHelp className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </ActionIconButton>
          <ActionIconButton title="Notifications" badge={4}>
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </ActionIconButton>
          <ActionAvatarButton initials="JS" avatarColor="#5d6a79" className="ml-1" />
        </>
      }
    />
  );
}
