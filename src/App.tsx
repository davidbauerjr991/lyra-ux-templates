import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { DesktopDesignsPage } from "@/components/DesktopDesignsPage";
import { ContentArea, Container } from "@nicecxone/lyra-ui";

/* ── Session cookie helpers ── */
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
        <ContentArea>
          <Container className="relative flex flex-1 overflow-hidden">
            <DesktopDesignsPage />
          </Container>
        </ContentArea>
      </div>
    </div>
  );
}

export default App;
