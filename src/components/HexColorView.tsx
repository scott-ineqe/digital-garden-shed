import { useEffect, useState } from "react";
import { Copy, Folder, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type HexColor = {
  id: string;
  name: string;
  hex_code: string;
  created_at: string;
  project_id: string | null;
};

type Project = {
  id: string;
  name: string;
  description: string | null;
};

type ProjectWithColors = Project & {
  colors: HexColor[];
};

export function HexColorView() {
  const [projectsWithColors, setProjectsWithColors] = useState<ProjectWithColors[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [{ data: projects, error: pErr }, { data: colors, error: cErr }] = await Promise.all([
      supabase.from("projects").select("id, name, description").order("created_at", { ascending: false }),
      supabase.from("hex_colors").select("id, name, hex_code, created_at, project_id").order("created_at", { ascending: false }),
    ]);

    if (pErr || cErr) {
      toast.error("Failed to load colors");
      setLoading(false);
      return;
    }

    const data = (projects || []).map((project) => ({
      ...project,
      colors: (colors || []).filter((c) => c.project_id === project.id),
    }));

    setProjectsWithColors(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const copyToClipboard = (hex: string, name: string) => {
    navigator.clipboard.writeText(hex);
    toast.success(`Copied ${name} (${hex})`);
  };

  const deleteColor = async (colorId: string) => {
    const { error } = await supabase.from("hex_colors").delete().eq("id", colorId);
    if (error) {
      toast.error("Failed to delete color");
      return;
    }
    toast.success("Color deleted");
    loadData();
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
      ) : projectsWithColors.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-lg font-medium">No projects yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a project and add colors in the section above.
          </p>
        </div>
      ) : (
        projectsWithColors.map((project) => (
          <div key={project.id} className="glass rounded-2xl overflow-hidden">
            <button
              onClick={() =>
                setExpandedProject(expandedProject === project.id ? null : project.id)
              }
              className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-3 text-left">
                <Folder className="w-5 h-5 text-accent flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {project.colors.length} color{project.colors.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              {expandedProject === project.id ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {expandedProject === project.id && project.colors.length > 0 && (
              <div className="border-t border-white/10">
                <div className="p-6 space-y-3">
                  {project.colors.map((color) => (
                    <div
                      key={color.id}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-4 hover:bg-white/10 transition group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className="w-12 h-12 rounded-lg border border-white/20 shadow-md flex-shrink-0"
                          style={{ backgroundColor: color.hex_code }}
                        />
                        <div>
                          <p className="font-medium">{color.name}</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {color.hex_code.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => copyToClipboard(color.hex_code, color.name)}
                          className="flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg text-sm font-medium transition"
                        >
                          <Copy className="w-4 h-4" />
                          Copy
                        </button>
                        <button
                          onClick={() => deleteColor(color.id)}
                          className="p-2 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expandedProject === project.id && project.colors.length === 0 && (
              <div className="border-t border-white/10 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No colors in this project yet
                </p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
