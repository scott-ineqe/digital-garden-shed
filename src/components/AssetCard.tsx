import { Download, FileImage, FileAudio, FileVideo, FileCode, MoreHorizontal, Check, FolderInput, Eye, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Asset = {
  id: string;
  name: string;
  file_type: string;
  file_url: string;
  size: number;
  project_id: string | null;
  created_at: string;
};

export type ProjectOption = { id: string; name: string };

function formatSize(bytes: number) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(1)} ${units[i]}`;
}

function getKind(type: string) {
  if (type.startsWith("image/svg")) return { label: "SVG", icon: FileCode };
  if (type.startsWith("image/")) return { label: "Image", icon: FileImage };
  if (type.startsWith("audio/")) return { label: "Audio", icon: FileAudio };
  if (type.startsWith("video/")) return { label: "Video", icon: FileVideo };
  return { label: "File", icon: FileImage };
}

export function AssetCard({
  asset,
  projects,
  onChanged,
}: {
  asset: Asset;
  projects: ProjectOption[];
  onChanged?: () => void;
}) {
  const kind = getKind(asset.file_type);
  const Icon = kind.icon;
  const isImage = asset.file_type.startsWith("image/");
  const isAudio = asset.file_type.startsWith("audio/");
  const isVideo = asset.file_type.startsWith("video/");
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    try {
      const res = await fetch(asset.file_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = asset.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(asset.file_url, "_blank");
    }
  };

  const moveTo = async (projectId: string | null) => {
    if (projectId === asset.project_id) return;
    setBusy(true);
    const { error } = await supabase
      .from("assets")
      .update({ project_id: projectId })
      .eq("id", asset.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(projectId ? "Moved to project" : "Removed from project");
    onChanged?.();
  };

  return (
    <div className="glass rounded-2xl overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-[var(--shadow-glow)]">
      <div className="aspect-video bg-black/20 flex items-center justify-center relative overflow-hidden">
        {isImage ? (
          <img src={asset.file_url} alt={asset.name} className="w-full h-full object-cover" />
        ) : isVideo ? (
          <video src={asset.file_url} className="w-full h-full object-cover" muted />
        ) : isAudio ? (
          <div className="flex flex-col items-center gap-3 p-4 w-full">
            <Icon className="w-10 h-10 text-primary" />
            <audio controls src={asset.file_url} className="w-full max-w-full" />
          </div>
        ) : (
          <Icon className="w-12 h-12 text-muted-foreground" />
        )}
        <span className="absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded-full glass-strong">
          {kind.label}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={busy}
            className="absolute top-3 right-3 w-8 h-8 rounded-full glass-strong flex items-center justify-center hover:bg-aurora hover:text-primary-foreground transition disabled:opacity-50"
            aria-label="Asset options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-strong border-glass-border min-w-56">
            <DropdownMenuLabel className="flex items-center gap-2">
              <FolderInput className="w-4 h-4" /> Move to project
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => moveTo(null)} className="cursor-pointer">
              <span className="flex-1">No project</span>
              {asset.project_id === null && <Check className="w-4 h-4" />}
            </DropdownMenuItem>
            {projects.length > 0 && <DropdownMenuSeparator />}
            {projects.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onClick={() => moveTo(p.id)}
                className="cursor-pointer"
              >
                <span className="flex-1 truncate">{p.name}</span>
                {asset.project_id === p.id && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            ))}
            {projects.length === 0 && (
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                No projects yet — create one in the Upload tab
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="p-4">
        <h3 className="font-medium truncate">{asset.name}</h3>
        <p className="text-xs text-muted-foreground mt-1">{formatSize(asset.size)}</p>
        <button
          onClick={handleDownload}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl glass-strong hover:bg-aurora hover:text-primary-foreground transition-all py-2 text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
}
