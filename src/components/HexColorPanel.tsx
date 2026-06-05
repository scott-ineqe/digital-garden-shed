import { useEffect, useState } from "react";
import { FolderPlus, Loader2, Folder, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Project = { id: string; name: string; description: string | null };

export function HexColorPanel({ onAdded, refreshKey = 0 }: { onAdded: () => void; refreshKey?: number }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [hexCode, setHexCode] = useState("#000000");
  const [colorName, setColorName] = useState("");
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState(false);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, description")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load projects");
      return;
    }
    setProjects(data || []);
  };

  useEffect(() => {
    loadProjects();
  }, [refreshKey]);

  const createProject = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("projects")
      .insert({ name: newName.trim(), description: newDesc.trim() || null })
      .select()
      .single();
    setCreating(false);
    if (error || !data) {
      toast.error("Failed to create project");
      return;
    }
    toast.success("Project created");
    setNewName("");
    setNewDesc("");
    setSelectedProject(data.id);
    await loadProjects();
  };

  const addHexColor = async () => {
    if (!colorName.trim()) {
      toast.error("Please enter a color name");
      return;
    }
    if (!selectedProject) {
      toast.error("Please select or create a project");
      return;
    }
    setAdding(true);
    const { error } = await supabase.from("hex_colors").insert({
      name: colorName.trim(),
      hex_code: hexCode,
      project_id: selectedProject,
    });
    setAdding(false);
    if (error) {
      toast.error("Failed to add color");
      return;
    }
    toast.success("Color added!");
    setColorName("");
    setHexCode("#000000");
    onAdded();
  };

  return (
    <div className="space-y-6">
      {/* Create New Project */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FolderPlus className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold">New project</h2>
        </div>
        <div className="space-y-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Project name..."
            className="w-full glass rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)..."
            className="w-full glass rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring resize-none h-20"
          />
          <button
            onClick={createProject}
            disabled={creating}
            className="w-full bg-aurora text-primary-foreground font-medium py-2.5 rounded-xl transition hover:shadow-[var(--shadow-glow)] disabled:opacity-50"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create project"
            )}
          </button>
        </div>
      </div>

      {/* Add Hex Color */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold">Add color to project</h2>
        </div>
        <div className="space-y-3">
          <div className="relative">
            <Folder className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full glass rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring appearance-none"
            >
              <option value="">Select a project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <input
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            placeholder="Color name (e.g., Primary Blue)..."
            className="w-full glass rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />

          <div className="flex gap-3 items-center">
            <div className="flex-shrink-0">
              <input
                type="color"
                value={hexCode}
                onChange={(e) => setHexCode(e.target.value)}
                className="w-12 h-12 rounded-full cursor-pointer border-0 p-0"
                style={{ background: 'none' }}
              />
            </div>
            <input
              type="text"
              value={hexCode}
              onChange={(e) => {
                const val = e.target.value;
                if (val.startsWith("#") && val.length <= 7) {
                  setHexCode(val);
                }
              }}
              placeholder="#000000"
              className="flex-1 glass rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring font-mono"
            />
          </div>

          <button
            onClick={addHexColor}
            disabled={adding}
            className="w-full bg-aurora text-primary-foreground font-medium py-2.5 rounded-xl transition hover:shadow-[var(--shadow-glow)] disabled:opacity-50"
          >
            {adding ? (
              <>
                <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add color"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
