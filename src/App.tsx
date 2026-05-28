import { useState, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { DesktopDesignsPage } from "@/components/DesktopDesignsPage";
import { Container, ContentArea, SidePanel, TreeMenu } from "@nicecxone/lyra-ui";

const panelItems = [
  { label: "Desktop Library", active: true },
  { label: "Forms" },
  { label: "Scripter" },
  { label: "Call Details" },
  { label: "Functions" },
  { label: "Themes" },
  { label: "Images" },
  { label: "AI Tasks" },
];

/* ── Session cookie helpers (expire when browser closes) ── */

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
}

function readBoolCookie(name: string, fallback: boolean): boolean {
  const val = getCookie(name);
  if (val === "true") return true;
  if (val === "false") return false;
  return fallback;
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(() => readBoolCookie("lyra_sidebar_open", false));
  const [panelPinned, setPanelPinned] = useState(() => readBoolCookie("lyra_panel_pinned", false));
  const [panelOpen, setPanelOpen] = useState(() => {
    const pinned = readBoolCookie("lyra_panel_pinned", false);
    /* If pinned, open the panel; if unpinned, start closed (overlay on hover) */
    return pinned;
  });
  const hoverTimeout = useRef<ReturnType<typeof setTimeout>>();

  /* When pinned: click toggles open/close */
  const handlePanelToggle = useCallback(() => {
    if (panelPinned) {
      setPanelOpen((v) => !v);
    }
  }, [panelPinned]);

  /* When unpinned: hover shows overlay */
  const handleHoverStart = useCallback(() => {
    clearTimeout(hoverTimeout.current);
    setPanelOpen(true);
  }, []);

  const handleHoverEnd = useCallback(() => {
    hoverTimeout.current = setTimeout(() => setPanelOpen(false), 300);
  }, []);

  /* Pin/unpin toggle — persist to cookie */
  const handlePinToggle = useCallback(() => {
    setPanelPinned((prev) => {
      const next = !prev;
      setCookie("lyra_panel_pinned", String(next));
      if (prev) {
        /* Unpinning — close the panel so it only shows on hover */
        setPanelOpen(false);
      } else {
        /* Pinning — open and keep it open */
        setPanelOpen(true);
      }
      return next;
    });
  }, []);

  /* Sidebar toggle — persist to cookie */
  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen((prev) => {
      const next = !prev;
      setCookie("lyra_sidebar_open", String(next));
      return next;
    });
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden bg-lyra-bg-surface-shell">
        <Sidebar open={sidebarOpen} onToggle={handleSidebarToggle} />
        {/* Main content container — white surface on the shell background */}
        <ContentArea>
          <Container className="relative flex flex-1 overflow-hidden">
            <SidePanel
              open={panelOpen}
              pinned={panelPinned}
              headerTitle="Designer"
              onPinToggle={handlePinToggle}
              onMouseEnter={!panelPinned ? handleHoverStart : undefined}
              onMouseLeave={!panelPinned ? handleHoverEnd : undefined}
            >
              <TreeMenu className="px-2" items={panelItems} />
            </SidePanel>
            <DesktopDesignsPage
              panelOpen={panelOpen && panelPinned}
              panelPinned={panelPinned}
              onPanelToggle={handlePanelToggle}
              onPanelHoverStart={handleHoverStart}
              onPanelHoverEnd={handleHoverEnd}
            />
          </Container>
        </ContentArea>
      </div>
    </div>
  );
}

export default App;
