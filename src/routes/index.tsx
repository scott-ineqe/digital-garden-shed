import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AssetCard, type Asset } from "@/components/AssetCard";
import { UploadPanel } from "@/components/UploadPanel";
import { Sparkles, LayoutGrid, UploadCloud, Search, Folder } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vault — Liquid asset library" },
      { name: "description", content: "Hold, browse, and download your assets — organized into projects." },
    ],
  }),
  component: Index,
});

type Project = { id: string; name: string; description: string | null };

function Index() {
  const [tab, setTab] = useState<"view" | "upload">("view");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "az" | "za">("newest");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [a, p] = await Promise.all([
      supabase.from("assets").select("*").order("created_at", { ascending: false }),
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
    ]);
    setAssets((a.data ?? []) as Asset[]);
    setProjects(p.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const typeMap: Record<string, string[]> = {
      image: ["image/svg+xml", "image/png", "image/jpeg", "image/jpg"],
      svg: ["image/svg+xml"],
      png: ["image/png"],
      jpg: ["image/jpeg", "image/jpg"],
      audio: ["audio/mpeg", "audio/mp3"],
      video: ["video/quicktime", "video/mov"],
    };
    const list = assets.filter((a) => {
      if (projectFilter === "none") {
        if (a.project_id) return false;
      } else if (projectFilter !== "all" && a.project_id !== projectFilter) {
        return false;
      }
      if (typeFilter !== "all") {
        const allowed = typeMap[typeFilter] ?? [];
        if (!allowed.some((t) => a.file_type.toLowerCase().includes(t.split("/")[1]))) return false;
      }
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    const sorted = [...list].sort((a, b) => {
      if (sortBy === "az") return a.name.localeCompare(b.name);
      if (sortBy === "za") return b.name.localeCompare(a.name);
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return sortBy === "newest" ? tb - ta : ta - tb;
    });
    return sorted;
  }, [assets, projectFilter, typeFilter, sortBy, search]);

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" position="top-right" />

      {/* Hero */}
      <header className="max-w-6xl mx-auto px-6 pt-12 pb-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Liquid asset vault</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Your <span className="text-gradient">creative library</span>,
          <br className="hidden md:block" /> beautifully organized.
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          Browse and download assets, or upload new files into projects — SVG, PNG, JPG, MP3, MOV.
        </p>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="glass rounded-2xl p-1.5 inline-flex gap-1">
          <button
            onClick={() => setTab("view")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition ${
              tab === "view" ? "bg-aurora text-primary-foreground shadow-[var(--shadow-glow)]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            View assets
          </button>
          <button
            onClick={() => setTab("upload")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition ${
              tab === "upload" ? "bg-aurora text-primary-foreground shadow-[var(--shadow-glow)]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Upload & projects
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {tab === "view" ? (
          <>
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search assets..."
                  className="w-full glass rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="relative">
                <Folder className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="glass rounded-xl pl-11 pr-8 py-3 text-sm outline-none focus:ring-2 focus:ring-ring appearance-none min-w-[200px]"
                >
                  <option value="all">All projects</option>
                  <option value="none">Unassigned</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="glass rounded-2xl h-64 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <p className="text-lg font-medium">No assets yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Switch to the Upload tab to add your first file.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((a) => (
                  <AssetCard key={a.id} asset={a} projects={projects} onChanged={load} />
                ))}
              </div>
            )}
          </>
        ) : (
          <UploadPanel onUploaded={load} />
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-10 text-center text-xs text-muted-foreground">
        Built with Lovable · Liquid glass aesthetic
      </footer>
    </div>
  );
}
