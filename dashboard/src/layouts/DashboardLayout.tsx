import { type ReactNode, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Plus, Sun, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  type ClientContext,
  type ProjectContext,
  type McpConnector,
  type SkillId,
  type SkillMeta,
  SKILL_TAXONOMY,
} from "@/types/pm";
import { cn } from "@/lib/utils";
import { useTheme } from "@/store/theme";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

/**
 * DashboardLayout - the 3-column workspace shell.
 *
 *   [ Left: Navigation & Context ] [ Center: Execution Console ] [ Right: Artifact Canvas ]
 *
 * The shell owns the left rail (context switchers, lifecycle-grouped skill nav,
 * MCP status). Center and canvas are injected so routes/pages stay decoupled.
 * Theme tokens come from styles/theme.css (main_design.png palette).
 */
export interface DashboardLayoutProps {
  clients: ClientContext[];
  projects: ProjectContext[];
  connectors: McpConnector[];
  activeClientId?: string;
  activeProjectId?: string;
  activeSkill?: SkillId;
  skillIndex: Record<SkillId, SkillMeta>;
  onClientChange: (clientId: string) => void;
  onProjectChange: (projectId: string) => void;
  onSelectSkill: (skill: SkillId) => void;
  /** Add a project to the active client inline (name only). */
  onAddProject?: (name: string) => void;
  /** Add a client inline (name only). */
  onAddClient?: (name: string) => void;
  onManageConnectors?: () => void;
  /** Reveal the skill nav once the project's first orchestration has finished. */
  skillsUnlocked?: boolean;
  /** Per-skill orchestration outcome for the active project (nav indicators). */
  skillStatus?: Partial<Record<SkillId, "approved" | "skipped">>;
  /** Center column - the OrchestratorConsole / skill form. */
  console: ReactNode;
  /** Right column - the ArtifactViewer. */
  canvas: ReactNode;
}

export function DashboardLayout({
  clients, projects, connectors,
  activeClientId, activeProjectId, activeSkill, skillIndex,
  onClientChange, onProjectChange, onSelectSkill, onAddProject, onAddClient, onManageConnectors,
  skillsUnlocked, skillStatus, console: consoleSlot, canvas,
}: DashboardLayoutProps) {
  const projectsForClient = useMemo(
    () => projects.filter((p) => p.clientId === activeClientId),
    [projects, activeClientId],
  );

  // Inline add - translucent fields instead of dialogs. Any non-empty name is allowed.
  const [addingClient, setAddingClient] = useState(false);
  const [clientDraft, setClientDraft] = useState("");
  const [addingProject, setAddingProject] = useState(false);
  const [projectDraft, setProjectDraft] = useState("");

  const submitClient = () => {
    const v = clientDraft.trim();
    if (v) onAddClient?.(v);
    setClientDraft("");
    setAddingClient(false);
  };
  const submitProject = () => {
    const v = projectDraft.trim();
    if (v) onAddProject?.(v);
    setProjectDraft("");
    setAddingProject(false);
  };

  // A client with no projects: prompt to add one straight away.
  const noProjects = !!activeClientId && projectsForClient.length === 0;
  useEffect(() => {
    if (noProjects) setAddingProject(true);
  }, [activeClientId, noProjects]);

  return (
    <div className="grid h-dvh grid-cols-[280px_minmax(440px,1fr)_minmax(420px,640px)] bg-background text-foreground">
      {/* ---------------- LEFT: Navigation & Context ---------------- */}
      <aside className="flex min-h-0 flex-col border-r border-border bg-surface">
        <BrandHeader />

        <div className="space-y-3 px-4 py-4">
          <ContextSelect
            label="Client"
            value={activeClientId}
            placeholder="Select client"
            options={clients.map((c) => ({ value: c.id, label: c.name }))}
            onChange={onClientChange}
          />

          {/* Inline client add - translucent box, right above the Project section */}
          {addingClient && (
            <InlineAdd
              label="New client"
              value={clientDraft}
              onChange={setClientDraft}
              onSubmit={submitClient}
              onCancel={() => { setAddingClient(false); setClientDraft(""); }}
            />
          )}

          <ContextSelect
            label="Project"
            value={activeProjectId}
            placeholder={!activeClientId ? "Pick a client first" : noProjects ? "No projects yet" : "Select project"}
            disabled={!activeClientId || noProjects}
            options={projectsForClient.map((p) => ({ value: p.id, label: p.name }))}
            onChange={onProjectChange}
          />

          {/* Inline project add - translucent box */}
          {addingProject && (
            <InlineAdd
              label="New project"
              value={projectDraft}
              onChange={setProjectDraft}
              onSubmit={submitProject}
              onCancel={() => { setAddingProject(false); setProjectDraft(""); }}
            />
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 justify-center gap-1.5 transition-transform hover:-translate-y-0.5"
              onClick={() => { if (activeClientId) setAddingProject((v) => !v); }}
              disabled={!activeClientId}
              title={activeClientId ? "Add a project to this client" : "Select a client first"}
            >
              <Plus className="h-3.5 w-3.5" /> Project
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 justify-center gap-1.5 transition-transform hover:-translate-y-0.5"
              onClick={() => setAddingClient((v) => !v)}
            >
              <Plus className="h-3.5 w-3.5" /> Client
            </Button>
          </div>
        </div>

        <Separator className="bg-border" />

        {!skillsUnlocked ? (
          <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-3">
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              {!activeClientId
                ? "Select a client and project to begin."
                : !activeProjectId
                ? "Select a project to begin."
                : "Run the orchestrator to unlock this project's PM skills."}
            </p>
          </div>
        ) : (
        <ScrollArea className="min-h-0 flex-1 px-2 py-3">
          <nav aria-label="PM skills" className="space-y-5">
            {SKILL_TAXONOMY.map((category) => (
              <div key={category.id}>
                <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {category.title}
                </p>
                <ul className="space-y-0.5">
                  {category.skillIds.map((id) => {
                    const meta = skillIndex[id];
                    const active = id === activeSkill;
                    const status = skillStatus?.[id];
                    const skipped = status === "skipped";
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => onSelectSkill(id)}
                          aria-current={active ? "page" : undefined}
                          title={skipped ? "Skipped - empty. Open to add this section." : undefined}
                          className={cn(
                            "group relative flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground/80 hover:bg-muted",
                            skipped && !active && "opacity-55",
                          )}
                        >
                          {active && (
                            <motion.span
                              layoutId="skill-active"
                              className="absolute inset-0 -z-10 rounded-md bg-primary"
                              transition={{ type: "spring", stiffness: 500, damping: 40 }}
                            />
                          )}
                          <span className="truncate">{meta?.title}</span>
                          {skipped && (
                            <span className={cn(
                              "ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                              active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-status-na-bg text-status-na",
                            )}>
                              Skipped
                            </span>
                          )}
                          {status === "approved" && !active && (
                            <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-status-success" aria-hidden />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </ScrollArea>
        )}

        <Separator className="bg-border" />
        <ConnectorStatusBar connectors={connectors} onManage={onManageConnectors} />

        <Separator className="bg-border" />
        <CurrentUser name="Erica J." role="Product Manager" />
      </aside>

      {/* ---------------- CENTER: Execution Console ---------------- */}
      <main className="flex min-h-0 flex-col overflow-hidden">
        <ColumnHeader title="Execution Console" subtitle="Paste anything - the orchestrator plans the run" />
        <div className="min-h-0 flex-1 overflow-auto px-6 py-5">{consoleSlot}</div>
      </main>

      {/* ---------------- RIGHT: Artifact Canvas ---------------- */}
      <section className="flex min-h-0 flex-col overflow-hidden border-l border-border bg-surface/60">
        <ColumnHeader title="Artifact" subtitle="Editable, visual, ready to publish" />
        <div className="min-h-0 flex-1 overflow-auto px-5 py-5">{canvas}</div>
      </section>
    </div>
  );
}

/* ----------------------------- internals ----------------------------- */

function BrandHeader() {
  const { theme, toggle } = useTheme();
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <span className="text-sm font-bold">PM</span>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">AI PM Assistant</p>
          <p className="text-[11px] text-muted-foreground">PM Dashboard</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={toggle} title="Toggle theme" aria-label="Toggle theme">
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </div>
  );
}

/** Translucent inline add field (client / project) - no dialog. */
function InlineAdd({
  label, value, onChange, onSubmit, onCancel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-md border border-dashed border-border/60 bg-muted/30 p-2">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <button
          type="button"
          onClick={onCancel}
          title="Close"
          className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-1.5">
        <Input
          autoFocus
          value={value}
          placeholder="Name"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); if (e.key === "Escape") onCancel(); }}
          className="h-8 border-border/50 bg-background/50 text-sm"
        />
        <Button size="sm" variant="ghost" className="shrink-0 px-2 text-xs" onClick={onSubmit}>Add</Button>
      </div>
    </div>
  );
}

/** Current-user chip pinned to the bottom of the left rail. */
function CurrentUser({ name, role }: { name: string; role: string }) {
  const initials = name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="flex items-center gap-2.5 px-4 py-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
        {initials}
      </div>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-[11px] text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}

function ColumnHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="flex items-baseline justify-between border-b border-border bg-background/80 px-6 py-3.5 backdrop-blur">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </header>
  );
}

function ContextSelect({
  label, value, placeholder, options, disabled, onChange,
}: {
  label: string;
  value?: string;
  placeholder: string;
  disabled?: boolean;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-9 w-full rounded-md border-border bg-card text-sm">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

const STATUS_DOT: Record<McpConnector["status"], string> = {
  connected: "bg-status-success",
  disconnected: "bg-status-na",
  error: "bg-status-danger",
  checking: "bg-status-warning animate-pulse",
};

function ConnectorStatusBar({ connectors, onManage }: { connectors: McpConnector[]; onManage?: () => void }) {
  const connectedCount = connectors.filter((c) => c.status === "connected").length;
  return (
    <div className="px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Connected Tools
        </p>
        <span className="flex items-center gap-2 text-[11px] tabular-nums text-muted-foreground">
          {connectedCount}/{connectors.length}
          {onManage && (
            <button
              type="button"
              onClick={onManage}
              className="rounded px-1.5 py-0.5 font-medium text-foreground hover:bg-muted"
            >
              Manage
            </button>
          )}
        </span>
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {connectors.map((c) => (
          <li
            key={c.id}
            title={`${c.label}: ${c.status}${c.detail ? ` - ${c.detail}` : ""}`}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-1 text-[11px]"
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[c.status])} />
            {c.label}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
        Not connected? Skills fall back to paste-in &amp; copy-ready output.
      </p>
    </div>
  );
}
