import { useEffect, useState } from "react";
import { ExternalLink, RefreshCw, AlertTriangle } from "lucide-react";

// The publish proxy only exists in the Vite dev server; production builds (e.g.
// GitHub Pages) are static and cannot make server-side Confluence calls.
const IS_DEV = import.meta.env.DEV;
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/store/toast";
import {
  publishToConfluence, updateConfluencePage, ConfluenceDuplicateError,
} from "@/lib/confluencePublish";
import type { McpConnector } from "@/types/pm";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  connector: McpConnector;
  artifactTitle: string;
  markdown: string;
}

type DialogState =
  | { kind: "form" }
  | { kind: "duplicate"; pageTitle: string }
  | { kind: "success"; url: string; updated: boolean };

export function ConfluencePublishDialog({
  open, onOpenChange, connector, artifactTitle, markdown,
}: Props) {
  const { notify } = useToast();
  const [title, setTitle] = useState(artifactTitle);
  const [spaceKey, setSpaceKey] = useState("");
  const [parentPageId, setParentPageId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<DialogState>({ kind: "form" });

  useEffect(() => {
    if (open) {
      setTitle(artifactTitle);
      setError(null);
      setState({ kind: "form" });
    }
  }, [open, artifactTitle]);

  const handleClose = () => onOpenChange(false);

  const publishParams = () => ({
    baseUrl: connector.endpoint!,
    token: connector.token!,
    title: title.trim() || artifactTitle,
    spaceKey: spaceKey.trim().toUpperCase(),
    parentPageId: parentPageId.trim() || undefined,
    markdown,
  });

  const handlePublish = async () => {
    if (!spaceKey.trim()) { setError("Space key is required."); return; }
    setError(null);
    setBusy(true);
    try {
      const result = await publishToConfluence(publishParams());
      setState({ kind: "success", url: result.url, updated: false });
      notify({ title: `Published: ${result.title}`, tone: "success" });
    } catch (e) {
      if (e instanceof ConfluenceDuplicateError) {
        setState({ kind: "duplicate", pageTitle: e.pageTitle });
      } else {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async () => {
    setError(null);
    setBusy(true);
    setState({ kind: "form" }); // return to form view while updating
    try {
      const result = await updateConfluencePage(publishParams());
      setState({ kind: "success", url: result.url, updated: true });
      notify({ title: `Updated: ${result.title}`, tone: "success" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setState({ kind: "form" });
    } finally {
      setBusy(false);
    }
  };

  const missingApi = !connector.endpoint || !connector.token;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Publish to Confluence</DialogTitle>
          <DialogDescription>
            {state.kind === "success"
              ? state.updated ? "Page updated successfully." : "Page created successfully."
              : "Creates a new page in your Confluence space using the current artifact."}
          </DialogDescription>
        </DialogHeader>

        {/* ── Success state ── */}
        {state.kind === "success" && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
              <p className="text-sm text-green-700 dark:text-green-400">
                {state.updated ? "Page updated in Confluence." : "New page created in Confluence."}
              </p>
            </div>
            <a
              href={state.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm underline underline-offset-2"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in Confluence
            </a>
            <Button className="w-full" onClick={handleClose}>Done</Button>
          </div>
        )}

        {/* ── Duplicate title state ── */}
        {state.kind === "duplicate" && (
          <div className="space-y-4 pt-1">
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-3">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Page already exists
              </p>
              <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-400/80">
                A page titled <strong>"{state.pageTitle}"</strong> already exists in this
                space. Choose what you'd like to do:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-1.5"
                onClick={handleUpdate}
                disabled={busy}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {busy ? "Updating…" : "Update existing"}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setTitle(`${title.trim()} (2)`);
                  setState({ kind: "form" });
                }}
                disabled={busy}
              >
                Change title
              </Button>
            </div>

            <Button variant="ghost" className="w-full text-xs text-muted-foreground" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        )}

        {/* ── Form state ── */}
        {state.kind === "form" && (
          <div className="space-y-4 pt-1">
            {/* Production environment warning */}
            {!IS_DEV && (
              <div className="flex gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Direct publishing requires the local dev server proxy and is not
                  available in this deployed build. Use{" "}
                  <strong>Copy markdown</strong> below and paste into Confluence manually,
                  or run the app locally with <code>npm run dev</code>.
                </p>
              </div>
            )}

            {missingApi && IS_DEV && (
              <div className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                No Confluence API configured. Go to{" "}
                <strong>Connected tools → Confluence → Add API</strong> first.
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="cf-title">Page title</Label>
              <Input
                id="cf-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={artifactTitle}
                disabled={busy}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cf-space">
                Space key <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cf-space"
                value={spaceKey}
                onChange={(e) => setSpaceKey(e.target.value)}
                placeholder="e.g. PM or ENG"
                disabled={busy}
              />
              <p className="text-xs text-muted-foreground">
                The short key shown in your Confluence space URL.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cf-parent">
                Parent page ID{" "}
                <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="cf-parent"
                value={parentPageId}
                onChange={(e) => setParentPageId(e.target.value)}
                placeholder="Leave blank to publish at space root"
                disabled={busy}
              />
              <p className="text-xs text-muted-foreground">
                Numeric page ID from the Confluence URL, e.g. 123456789.
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleClose} disabled={busy}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handlePublish}
                disabled={busy || !spaceKey.trim() || missingApi || !IS_DEV}
              >
                {busy ? "Publishing…" : "Publish"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
