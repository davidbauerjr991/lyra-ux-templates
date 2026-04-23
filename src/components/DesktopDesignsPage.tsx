import { useState } from "react";
import {
  RefreshCw,
  Pencil,
  Copy,
  Trash2,
  CircleCheck,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Minus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TabList, Tab } from "@/components/ui/tabs";
import { SearchInput } from "@/components/ui/search-input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

/* ── Mock data ── */
interface DesktopRecord {
  id: number;
  name: string;
  published: boolean;
  customerCard: string;
  description: string;
  createdBy: string;
  createdDate: string;
  modifiedDate: string;
  version: number;
}

const records: DesktopRecord[] = [
  { id: 1, name: "Agent Desktop #1", published: true, customerCard: "—", description: "Back office", createdBy: "Jim Smith", createdDate: "02/23/2025 02:32...", modifiedDate: "02/23/2025 02:32...", version: 27 },
  { id: 2, name: "Agent Desktop #2", published: true, customerCard: "—", description: "Custom", createdBy: "Jim Smith", createdDate: "02/23/2025 02:32...", modifiedDate: "02/23/2025 02:32...", version: 27 },
  { id: 3, name: "Agent Desktop #3", published: true, customerCard: "—", description: "Knowledge Worker", createdBy: "Jim Smith", createdDate: "02/23/2025 02:32...", modifiedDate: "02/23/2025 02:32...", version: 27 },
  { id: 4, name: "Agent Desktop #4", published: true, customerCard: "—", description: "BPO", createdBy: "Jim Smith", createdDate: "02/23/2025 02:32...", modifiedDate: "02/23/2025 02:32...", version: 27 },
  { id: 5, name: "Agent Desktop #5", published: true, customerCard: "—", description: "Collections", createdBy: "Jim Smith", createdDate: "02/23/2025 02:32...", modifiedDate: "02/23/2025 02:32...", version: 27 },
  { id: 6, name: "Agent Desktop #6", published: true, customerCard: "—", description: "Collections - Finan...", createdBy: "Jim Smith", createdDate: "02/23/2025 02:32...", modifiedDate: "02/23/2025 02:32...", version: 27 },
  { id: 7, name: "Agent Desktop #7", published: true, customerCard: "—", description: "Retail Agents", createdBy: "Jim Smith", createdDate: "02/23/2025 02:32...", modifiedDate: "02/23/2025 02:32...", version: 27 },
  { id: 8, name: "Agent Desktop #8", published: true, customerCard: "—", description: "Beverages", createdBy: "Jim Smith", createdDate: "02/23/2025 02:32...", modifiedDate: "02/23/2025 02:32...", version: 27 },
  { id: 9, name: "Agent Desktop #9", published: true, customerCard: "—", description: "Customer Service 1", createdBy: "Jim Smith", createdDate: "02/23/2025 02:32...", modifiedDate: "02/23/2025 02:32...", version: 27 },
  { id: 10, name: "Agent Desktop #10", published: true, customerCard: "—", description: "Customer Service 2", createdBy: "Jim Smith", createdDate: "02/23/2025 02:32...", modifiedDate: "02/23/2025 02:32...", version: 27 },
  { id: 11, name: "Agent Desktop #11", published: true, customerCard: "—", description: "Front Office", createdBy: "Jim Smith", createdDate: "02/23/2025 02:32...", modifiedDate: "02/23/2025 02:32...", version: 27 },
  { id: 12, name: "Agent Desktop #12", published: true, customerCard: "—", description: "Payments", createdBy: "Jim Smith", createdDate: "02/23/2025 02:32...", modifiedDate: "02/23/2025 02:32...", version: 27 },
  { id: 13, name: "Agent Desktop #13", published: true, customerCard: "—", description: "Air Travel", createdBy: "Jim Smith", createdDate: "02/23/2025 02:32...", modifiedDate: "02/23/2025 02:32...", version: 27 },
  { id: 14, name: "Agent Desktop #14", published: true, customerCard: "—", description: "Healthcare", createdBy: "Jim Smith", createdDate: "02/23/2025 02:32...", modifiedDate: "02/23/2025 02:32...", version: 27 },
  { id: 15, name: "Agent Desktop #15", published: true, customerCard: "—", description: "Insurance", createdBy: "Jim Smith", createdDate: "02/23/2025 02:32...", modifiedDate: "02/23/2025 02:32...", version: 27 },
  { id: 16, name: "Agent Desktop #16", published: true, customerCard: "—", description: "Utilities", createdBy: "Jim Smith", createdDate: "02/23/2025 02:32...", modifiedDate: "02/23/2025 02:32...", version: 27 },
];

export function DesktopDesignsPage() {
  const [activeTab, setActiveTab] = useState<"library" | "templates">(
    "library"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRecords = records.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * rowsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + rowsPerPage);
  const displayStart = filteredRecords.length > 0 ? startIndex + 1 : 0;
  const displayEnd = Math.min(startIndex + rowsPerPage, filteredRecords.length);

  const allSelected =
    paginatedRecords.length > 0 &&
    paginatedRecords.every((r) => selectedIds.has(r.id));
  const someSelected =
    !allSelected && paginatedRecords.some((r) => selectedIds.has(r.id));

  function toggleAll(checked: boolean) {
    if (checked) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedRecords.forEach((r) => next.add(r.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedRecords.forEach((r) => next.delete(r.id));
        return next;
      });
    }
  }

  function toggleRow(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-lyra-bg-surface-base">
      {/* ════ Lyra Component Header ════ */}
      <div className="flex items-center justify-between border-b border-lyra-border-subtle px-6 py-4">
        <h1 className="lyra-heading-lg text-lyra-fg-default">
          Desktop Designs
        </h1>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Publish
          </Button>
          <Button size="sm">Add</Button>
          <Button variant="icon" size="icon" title="AI Assist">
            <Sparkles className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {/* ════ Tabs ════ */}
      <TabList className="px-6">
        <Tab
          active={activeTab === "library"}
          onClick={() => setActiveTab("library")}
        >
          Desktop Library
        </Tab>
        <Tab
          active={activeTab === "templates"}
          onClick={() => setActiveTab("templates")}
        >
          Templates
        </Tab>
      </TabList>

      {/* ════ Toolbar: Search + Record Count + Actions ════ */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <SearchInput
            placeholder="Quick Search"
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="w-[260px]"
          />
          <span className="lyra-body-md text-lyra-fg-secondary">
            {filteredRecords.length} Records
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="icon" size="icon" title="Refresh">
            <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
          </Button>
          <Button variant="icon" size="icon" title="Edit">
            <Pencil className="h-4 w-4" strokeWidth={1.5} />
          </Button>
          <Button variant="icon" size="icon" title="Copy">
            <Copy className="h-4 w-4" strokeWidth={1.5} />
          </Button>
          <Button variant="icon" size="icon" title="Delete">
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {/* ════ Data Table ════ */}
      <div className="flex-1 overflow-hidden px-6">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40px] shrink-0">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={(checked) => toggleAll(!!checked)}
                  />
                </TableHead>
                <TableHead className="flex-[2] min-w-[140px]">Name</TableHead>
                <TableHead className="flex-1 min-w-[80px]">Published</TableHead>
                <TableHead className="flex-[1.3] min-w-[100px]">Customer Card</TableHead>
                <TableHead className="flex-[2] min-w-[140px]">Description</TableHead>
                <TableHead className="flex-[1.3] min-w-[100px]">Created By</TableHead>
                <TableHead className="flex-[2] min-w-[140px]">Created Date</TableHead>
                <TableHead className="flex-[2] min-w-[140px]">Modified Date</TableHead>
                <TableHead className="flex-1 min-w-[60px]">Version</TableHead>
                <TableHead className="w-[48px] shrink-0"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRecords.map((record) => (
                <TableRow
                  key={record.id}
                  data-state={selectedIds.has(record.id) ? "selected" : undefined}
                >
                  <TableCell className="w-[40px] shrink-0">
                    <Checkbox
                      checked={selectedIds.has(record.id)}
                      onCheckedChange={() => toggleRow(record.id)}
                    />
                  </TableCell>
                  <TableCell className="flex-[2] min-w-[140px] text-lyra-fg-link cursor-pointer hover:underline">
                    {record.name}
                  </TableCell>
                  <TableCell className="flex-1 min-w-[80px]">
                    {record.published ? (
                      <CircleCheck className="h-5 w-5 text-lyra-status-success-strong" strokeWidth={1.5} />
                    ) : (
                      <Minus className="h-5 w-5 text-lyra-fg-disabled" strokeWidth={1.5} />
                    )}
                  </TableCell>
                  <TableCell className="flex-[1.3] min-w-[100px]">
                    {record.customerCard}
                  </TableCell>
                  <TableCell className="flex-[2] min-w-[140px]">{record.description}</TableCell>
                  <TableCell className="flex-[1.3] min-w-[100px]">{record.createdBy}</TableCell>
                  <TableCell className="flex-[2] min-w-[140px]">
                    {record.createdDate}
                  </TableCell>
                  <TableCell className="flex-[2] min-w-[140px]">
                    {record.modifiedDate}
                  </TableCell>
                  <TableCell className="flex-1 min-w-[60px]">{record.version}</TableCell>
                  <TableCell className="w-[48px] shrink-0">
                    <button className="flex h-7 w-7 items-center justify-center rounded-lyra-sm text-lyra-fg-secondary hover:bg-lyra-bg-surface-shell transition-colors">
                      <MoreVertical className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </div>

      {/* ════ Pagination ════ */}
      <div className="flex items-center justify-between border-t border-lyra-border-subtle px-6 py-2.5">
        <div className="flex items-center gap-2 lyra-body-sm text-lyra-fg-secondary">
          <span>
            Displaying {displayStart}-{displayEnd} of {filteredRecords.length}
          </span>
          <span className="text-lyra-border-default">|</span>
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="appearance-none rounded-lyra-sm border border-lyra-border-default bg-lyra-bg-control px-2 py-0.5 pr-6 lyra-body-sm text-lyra-fg-default hover:bg-lyra-bg-surface-shell transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-lyra-border-active bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22rgba(0%2C0%2C0%2C0.56)%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_4px_center] bg-no-repeat"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center gap-1 lyra-body-sm text-lyra-fg-secondary">
          <span>Page</span>
          <button
            onClick={() => setCurrentPage(1)}
            disabled={safePage <= 1}
            className="flex h-6 w-6 items-center justify-center rounded-lyra-sm hover:bg-lyra-bg-surface-shell transition-colors disabled:text-lyra-fg-disabled disabled:hover:bg-transparent text-lyra-fg-secondary"
          >
            <ChevronsLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="flex h-6 w-6 items-center justify-center rounded-lyra-sm hover:bg-lyra-bg-surface-shell transition-colors disabled:text-lyra-fg-disabled disabled:hover:bg-transparent text-lyra-fg-secondary"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <input
            type="text"
            value={safePage}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 1 && val <= totalPages) {
                setCurrentPage(val);
              }
            }}
            className="h-6 w-8 rounded-lyra-sm border border-lyra-border-default bg-lyra-bg-field text-center lyra-body-sm text-lyra-fg-default focus:outline-none focus:ring-1 focus:ring-lyra-border-active"
          />
          <span>of {totalPages}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="flex h-6 w-6 items-center justify-center rounded-lyra-sm hover:bg-lyra-bg-surface-shell transition-colors disabled:text-lyra-fg-disabled disabled:hover:bg-transparent text-lyra-fg-secondary"
          >
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={safePage >= totalPages}
            className="flex h-6 w-6 items-center justify-center rounded-lyra-sm hover:bg-lyra-bg-surface-shell transition-colors disabled:text-lyra-fg-disabled disabled:hover:bg-transparent text-lyra-fg-secondary"
          >
            <ChevronsRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </main>
  );
}
