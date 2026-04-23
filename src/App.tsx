import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { DesktopDesignsPage } from "@/components/DesktopDesignsPage";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden bg-lyra-bg-surface-shell">
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />
        {/* Main content container — white surface on the shell background */}
        <div className="flex flex-1 overflow-hidden pr-3 pb-3">
          <div className="flex flex-1 overflow-hidden rounded-lyra-lg bg-lyra-bg-surface-base border border-lyra-border-subtle shadow-sm">
            <DesktopDesignsPage />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
