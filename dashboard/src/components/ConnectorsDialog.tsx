import { useState } from "react";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/store/workspace";
import { useToast } from "@/store/toast";
import { cn } from "@/lib/utils";
import type { McpConnector } from "@/types/pm";

export function ConnectorsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { connectors } = useWorkspace();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connected tools</DialogTitle>
          <DialogDescription>
            Connect a tool to read live data and publish. Add an API endpoint per tool, or leave it disconnected to fall back to paste-in.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2">
          {connectors.map((c) => <ConnectorRow key={c.id} connector={c} />)}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

function ConnectorRow({ connector: c }: { connector: McpConnector }) {
  const { setConnectorStatus, setConnectorApi } = useWorkspace();
  const { notify } = useToast();
  const connected = c.status === "connected";
  const hasApi = !!c.token;

  const [open, setOpen] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [endpoint, setEndpoint] = useState(c.endpoint ?? "");
  const [token, setToken] = useState(c.token ?? "");

  const toggleConnect = async () => {
    if (connected) {
      setConnectorStatus(c.id, "disconnected");
      notify({ title: `${c.label} disconnected`, tone: "info" });
      return;
    }
    if (!c.endpoint || !c.token) {
      setConnectorStatus(c.id, "connected");
      notify({ title: `${c.label} connected (add an API for a live connection)`, tone: "success" });
      return;
    }
    setBusy(true);
    setConnectorStatus(c.id, "checking");
    try {
      const res = await fetch(c.endpoint, { headers: { Authorization: `Bearer ${c.token}` } });
      if (res.ok) { setConnectorStatus(c.id, "connected"); notify({ title: `${c.label} connected`, tone: "success" }); }
      else { setConnectorStatus(c.id, "error"); notify({ title: `${c.label} responded ${res.status}`, tone: "danger" }); }
    } catch {
      setConnectorStatus(c.id, "error");
      notify({ title: `${c.label} unreachable (network or CORS - needs a server-side proxy)`, tone: "danger" });
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    const url = endpoint.trim();
    if (!url || !/^https:\/\//i.test(url)) { notify({ title: "Endpoint must be a valid HTTPS URL", tone: "danger" }); return; }
    if (!token.trim()) { notify({ title: "Add an API token", tone: "danger" }); return; }
    setConnectorApi(c.id, { endpoint: url, token: token.trim() });
    setOpen(false);
    setReveal(false);
    notify({ title: `${c.label} API saved`, tone: "success" });
  };

  const remove = () => {
    setConnectorApi(c.id, { endpoint: undefined, token: undefined });
    setEndpoint("");
    setToken("");
    setOpen(false);
    notify({ title: `${c.label} API removed`, tone: "info" });
  };

  const dot = connected ? "bg-status-success"
    : c.status === "error" ? "bg-status-danger"
    : c.status === "checking" ? "bg-status-warning animate-pulse"
    : "bg-status-na";

  return (
    <li className="rounded-xl border border-border px-3 py-2.5">
      {/* Compact header: identity + a single colored connection action */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="flex items-center gap-2 text-sm font-medium">
            <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", dot)} />
            {c.label}
            <span className="text-xs font-normal text-muted-foreground">{c.detail ?? c.status}</span>
          </span>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
            {hasApi ? "API configured" : "Add API"}
          </button>
        </div>
        <Button
          size="sm"
          onClick={toggleConnect}
          disabled={busy}
          className={cn(
            "text-white",
            connected ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600",
          )}
        >
          {busy ? "Connecting..." : connected ? "Disconnect" : "Connect"}
        </Button>
      </div>

      {/* Collapsible API form - hidden by default to keep the list clean */}
      {open && (
        <div className="mt-2.5 space-y-2 border-t border-border pt-2.5">
          <Input value={endpoint} placeholder="https://api.example.com/mcp" onChange={(e) => setEndpoint(e.target.value)} className="h-9" />
          <div className="relative">
            <Input
              type={reveal ? "text" : "password"}
              value={token}
              placeholder="API token"
              onChange={(e) => setToken(e.target.value)}
              className="h-9 pr-9"
            />
            <button
              type="button"
              onClick={() => setReveal((r) => !r)}
              title={reveal ? "Hide" : "View"}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex gap-2">
            {hasApi && <Button size="sm" variant="ghost" className="flex-1 text-status-danger" onClick={remove}>Remove</Button>}
            <Button size="sm" className="flex-1" onClick={save}>Save API</Button>
          </div>
        </div>
      )}
    </li>
  );
}
