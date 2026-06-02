import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Plus, Trash2, Palette, Folder } from "lucide-react";
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
    <div className="min-h-screen max-w-6xl mx-auto px-6 py-12">
      <Toaster theme="dark" position="top-right" />
      <header className="mb-10">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Palette className="w-3.5 h-3.5 text-primary" />
          <span>Color Palette Library</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Your <span className="text-gradient">Brand Colors</span>
        </h1>
      </header>

      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        <div className="glass rounded-2xl p-6 h-fit sticky top-24">
          <h2 className="text-lg font-semibold mb-4">Add new color</h2>
          <div className="space-y-3">
            <div className="relative">
              <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full rounded-xl glass-strong pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring appearance-none"
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
              placeholder="Color name (e.g. Primary)"
              className="w-full rounded-xl glass-strong px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-2 items-center">
              <div
                className="w-10 h-10 rounded-lg border border-glass-border shadow-inner shrink-0"
                style={{ backgroundColor: newHex.startsWith("#") ? newHex : `#${newHex}` }}
              />
              <input
                value={newHex}
                onChange={e => setNewHex(e.target.value)}
                placeholder="#000000"
                className="w-full rounded-xl glass-strong px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring uppercase"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={creating || !newName || !newHex || !selectedProject}
              className="w-full bg-aurora text-primary-foreground font-medium rounded-xl py-3 hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              <Plus className="w-4 h-4" /> Add Color
            </button>
          </div>
        </div>

        <div className="space-y-10">
          {loading ? (
             <div className="glass rounded-2xl h-32 animate-pulse" />
          ) : projects.length === 0 ? (
             <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
                Please create a project in the Assets tab first.
             </div>
          ) : (
            projects.map(p => {
              const projectColors = grouped.get(p.id) || [];
              if (projectColors.length === 0) return null;
              
              return (
                <div key={p.id} className="space-y-4">
                  <h3 className="text-xl font-medium border-b border-glass-border pb-2">{p.name}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {projectColors.map(color => (
                      <div key={color.id} className="glass rounded-2xl p-3 group hover:scale-[1.02] transition-transform flex flex-col">
                        <div 
                          className="w-full aspect-video rounded-xl shadow-inner mb-3 border border-white/10"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm truncate">{color.name}</p>
                          <p className="text-xs text-muted-foreground uppercase mt-0.5">{color.hex}</p>
                        </div>
                        <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyToClipboard(color.hex)}
                            className="flex-1 glass-strong rounded-lg py-1.5 flex items-center justify-center hover:bg-white/10 transition"
                            title="Copy Hex"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(color.id)}
                            className="glass-strong rounded-lg px-2 flex items-center justify-center hover:bg-destructive/20 text-destructive transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      </div>
    </div>
  );
}
