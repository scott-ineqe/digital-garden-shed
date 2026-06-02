import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Plus, Trash2, Palette, Folder, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/colors")({
  head: () => ({
    meta: [{ title: "Colors — Vault" }],
  }),
  component: ColorsRoute,
});

type Project = { id: string; name: string };
type HexCode = { id: string; project_id: string; name: string; hex: string };

function ColorsRoute() {
  const [tab, setTab] = useState<"view" | "upload">("view");
  const [projects, setProjects] = useState<Project[]>([]);
  const [hexCodes, setHexCodes] = useState<HexCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [newHex, setNewHex] = useState("");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const [p, h] = await Promise.all([
      supabase.from("projects").select("*").order("name"),
      supabase.from("hex_codes").select("*").order("created_at", { ascending: false }),
    ]);
    setProjects(p.data ?? []);
    setHexCodes((h.data ?? []) as unknown as HexCode[]);
    if (p.data?.length && !selectedProject) {
      setSelectedProject(p.data[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!selectedProject || !newName || !newHex) return;
    
    // ensure hex starts with #
    let hex = newHex.trim();
    if (!hex.startsWith("#")) hex = "#" + hex;
    
    setCreating(true);
    const { error } = await supabase.from("hex_codes").insert({
      project_id: selectedProject,
      name: newName,
      hex: hex,
    });
    setCreating(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Color added");
      setNewName("");
      setNewHex("");
      setTab("view"); // Automatically switch back to view mode after adding
      load();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("hex_codes").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Color removed");
      load();
    }
  };

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast.success(`Copied ${hex} to clipboard!`);
  };

  // Group by project
  const grouped = useMemo(() => {
    const map = new Map<string, HexCode[]>();
    projects.forEach(p => map.set(p.id, []));
    hexCodes.forEach(h => {
      if (map.has(h.project_id)) {
        map.get(h.project_id)!.push(h);
      }
    });
    return map;
  }, [hexCodes, projects]);

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" position="top-right" />
      
      {/* Hero Section */}
      <header className="max-w-6xl mx-auto px-6 pt-12 pb-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Palette className="w-3.5 h-3.5 text-primary" />
          <span>Color Palette Library</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Your <span className="text-gradient">Brand Colors</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          Organize, preview, and copy your brand hex codes by project.
        </p>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="glass rounded-2xl p-1.5 inline-flex gap-1">
          <button
            onClick={() => setTab("view")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition ${
              tab === "view" ? "bg-aurora text-primary-foreground shadow-[var(--shadow-glow)]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            View colors
          </button>
          <button
            onClick={() => setTab("upload")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition ${
              tab === "upload" ? "bg-aurora text-primary-foreground shadow-[var(--shadow-glow)]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Plus className="w-4 h-4" />
            Add new color
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-4 pb-20">
        {tab === "view" ? (
          <div className="space-y-12">
            {loading ? (
               <div className="glass rounded-2xl h-32 animate-pulse" />
            ) : projects.length === 0 ? (
               <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
                  Please create a project in the Assets tab first.
               </div>
            ) : hexCodes.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                <p className="text-lg font-medium">No colors yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Switch to the Add new color tab to build your palette.
                </p>
              </div>
            ) : (
              projects.map(p => {
                const projectColors = grouped.get(p.id) || [];
                if (projectColors.length === 0) return null;
                
                return (
                  <div key={p.id} className="space-y-5">
                    <h3 className="text-xl font-medium border-b border-glass-border pb-3">{p.name}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                      {projectColors.map(color => (
                        <div key={color.id} className="glass rounded-2xl p-3 group hover:scale-[1.02] transition-transform flex flex-col">
                          {/* Color Preview Box */}
                          <div 
                            className="w-full aspect-square rounded-xl shadow-inner mb-4 border border-white/10"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="flex-1 text-center">
                            <p className="font-medium text-sm truncate">{color.name}</p>
                            <p className="text-xs text-muted-foreground uppercase mt-0.5">{color.hex}</p>
                          </div>
                          
                          {/* Hover Actions (Copy & Delete) */}
                          <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => copyToClipboard(color.hex)}
                              className="flex-1 glass-strong rounded-lg py-2 flex items-center justify-center hover:bg-white/10 transition"
                              title="Copy Hex"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(color.id)}
                              className="glass-strong rounded-lg px-2 flex items-center justify-center hover:bg-destructive/20 text-destructive transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        ) : (
          <div className="glass rounded-2xl p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-6">Add new brand color</h2>
            <div className="space-y-4">
              <div className="relative">
                <Folder className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full rounded-xl glass-strong pl-11 pr-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring appearance-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Color name (e.g. Primary Blue)"
                className="w-full rounded-xl glass-strong px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-3 items-center">
                <div
                  className="w-12 h-12 rounded-xl border border-glass-border shadow-inner shrink-0 transition-colors"
                  style={{ backgroundColor: newHex.startsWith("#") ? newHex : newHex ? `#${newHex}` : 'transparent' }}
                />
                <input
                  value={newHex}
                  onChange={e => setNewHex(e.target.value)}
                  placeholder="#000000"
                  className="w-full rounded-xl glass-strong px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring uppercase"
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={creating || !newName || !newHex || !selectedProject}
                className="w-full bg-aurora text-primary-foreground font-medium rounded-xl py-3.5 hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
              >
                <Plus className="w-4 h-4" /> Save Color
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
