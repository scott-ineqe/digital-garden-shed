import { useEffect, useState } from "react";
import { FolderPlus, Loader2, Folder, Plus } from "lucide-react";
import { toast } from "sonner";

type Project = { id: string; name: string; description: string | null };

const STORAGE_KEY = "hexColorData";

export function HexColorPanel({ onAdded }: { onAdded: () => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [hexCode, setHexCode] = useState("#000000");
  const [colorName, setColorName] = useState("");
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState(false);

  const loadProjects = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    const stored = data ? JSON.parse(data) : { projects: [] };
    setProjects(stored.projects || []);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const createProject = () => {
    if (!newName.trim()) return;
    setCreating(true);

    const newProject: Project = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      description: newDesc.trim() || null,
    };

    const data = localStorage.getItem(STORAGE_KEY);
    const stored = data ? JSON.parse(data) : { projects: [], hex_colors: [] };
    stored.projects.push(newProject);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    setCreating(false);
    toast.success("Project created");
    setNewName("");
    setNewDesc("");
    setSelectedProject(newProject.id);
    loadProjects();
  };

  const addHexColor = () => {
    if (!colorName.trim()) {
      toast.error("Please enter a color name");
      return;
    }
    if (!selectedProject) {
      toast.error("Please select or create a project");
      return;
    }

    setAdding(true);

    const data = localStorage.getItem(STORAGE_KEY);
    const stored = data ? JSON.parse(data) : { projects: [], hex_colors: [] };

    stored.hex_colors.push({
      id: crypto.randomUUID(),
      name: colorName.trim(),
      hex_code: hexCode,
      project_id: selectedProject,
      created_at: new Date().toISOString(),
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    setAdding(false);
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

          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="color"
                value={hexCode}
                onChange={(e) => setHexCode(e.target.value)}
                className="w-full h-12 glass rounded-xl cursor-pointer"
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
