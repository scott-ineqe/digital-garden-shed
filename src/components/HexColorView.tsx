import { useEffect, useState } from "react";
import { Copy, Folder, Trash2, ChevronDown, ChevronUp, Pencil, Check, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ContrastBadges } from "@/components/ContrastBadges";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

function SortableProjectCard({
  project,
  expandedProject,
  editingProject,
  editName,
  editDesc,
  saving,
  deleting,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onToggleExpand,
  onCopyColor,
  onDeleteColor,
  setEditName,
  setEditDesc,
}: {
  project: ProjectWithColors;
  expandedProject: string | null;
  editingProject: string | null;
  editName: string;
  editDesc: string;
  saving: boolean;
  deleting: string | null;
  onEdit: (p: Project) => void;
  onCancel: () => void;
  onSave: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleExpand: (id: string) => void;
  onCopyColor: (hex: string, name: string) => void;
  onDeleteColor: (id: string) => Promise<void>;
  setEditName: (name: string) => void;
  setEditDesc: (desc: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass rounded-2xl overflow-hidden group"
    >
      <div className="flex items-center justify-between p-6 hover:bg-white/5 transition">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="p-1 hover:bg-white/10 rounded-lg transition cursor-grab active:cursor-grabbing flex-shrink-0"
            title="Drag to reorder"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={() =>
              onToggleExpand(expandedProject === project.id ? "" : project.id)
            }
            className="flex-1 flex items-center gap-3 text-left"
          >
            <Folder className="w-5 h-5 text-accent flex-shrink-0" />
            <div className="min-w-0">
              {editingProject === project.id ? (
                <div className="space-y-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Project name..."
                    className="w-full glass rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                  />
                  <input
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Description (optional)..."
                    className="w-full glass rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ) : (
                <>
                  <h3 className="font-semibold">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {project.colors.length} color{project.colors.length !== 1 ? "s" : ""}
                  </p>
                </>
              )}
            </div>
          </button>
        </div>

        <div className="flex items-center gap-1 ml-3">
          {editingProject === project.id ? (
            <>
              <button
                onClick={() => onSave(project.id)}
                disabled={saving}
                className="p-2 hover:bg-green-500/20 text-muted-foreground hover:text-green-400 rounded-lg transition"
                title="Save"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-white/10 text-muted-foreground hover:text-foreground rounded-lg transition"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEdit(project)}
                className="p-2 hover:bg-white/10 text-muted-foreground hover:text-foreground rounded-lg transition opacity-0 group-hover:opacity-100"
                title="Edit project"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(project.id)}
                disabled={deleting === project.id}
                className="p-2 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 rounded-lg transition opacity-0 group-hover:opacity-100"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() =>
              onToggleExpand(expandedProject === project.id ? "" : project.id)
            }
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            {expandedProject === project.id ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {expandedProject === project.id && project.colors.length > 0 && (
        <div className="border-t border-white/10">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.colors.map((color) => (
              <div
                key={color.id}
                className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition flex flex-col group"
              >
                <div className="flex items-start gap-4 mb-3">
                  <div
                    className="w-16 h-16 rounded-lg border border-white/20 shadow-md flex-shrink-0"
                    style={{ backgroundColor: color.hex_code }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{color.name}</p>
                    <p className="text-sm text-muted-foreground font-mono mt-1">
                      {color.hex_code.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <ContrastBadges hex={color.hex_code} />
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <button
                    onClick={() => onCopyColor(color.hex_code, color.name)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg text-sm font-medium transition"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={() => onDeleteColor(color.id)}
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
  );
}

export function HexColorView({ onProjectsChanged }: { onProjectsChanged?: () => void }) {
  const [projectsWithColors, setProjectsWithColors] = useState<ProjectWithColors[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

    let data = (projects || []).map((project) => ({
      ...project,
      colors: (colors || []).filter((c) => c.project_id === project.id),
    }));

    // Load saved order from localStorage
    const savedOrder = localStorage.getItem("projectsOrder");
    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder);
        data = data.sort((a, b) => {
          const aIndex = orderIds.indexOf(a.id);
          const bIndex = orderIds.indexOf(b.id);
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
      } catch (e) {
        // If parsing fails, just use default order
      }
    }

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

  const startEdit = (project: Project) => {
    setEditingProject(project.id);
    setEditName(project.name);
    setEditDesc(project.description || "");
  };

  const cancelEdit = () => {
    setEditingProject(null);
    setEditName("");
    setEditDesc("");
  };

  const saveProject = async (projectId: string) => {
    if (!editName.trim()) {
      toast.error("Project name is required");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("projects")
      .update({ name: editName.trim(), description: editDesc.trim() || null })
      .eq("id", projectId);
    setSaving(false);
    if (error) {
      toast.error("Failed to update project");
      return;
    }
    toast.success("Project updated");
    setEditingProject(null);
    await loadData();
    onProjectsChanged?.();
  };

  const deleteProject = async (projectId: string) => {
    if (!window.confirm("Delete this project and all its colors? This cannot be undone.")) return;
    setDeleting(projectId);
    const { error: colorErr } = await supabase.from("hex_colors").delete().eq("project_id", projectId);
    if (colorErr) {
      toast.error("Failed to delete project colors");
      setDeleting(null);
      return;
    }
    const { error: projErr } = await supabase.from("projects").delete().eq("id", projectId);
    setDeleting(null);
    if (projErr) {
      toast.error("Failed to delete project");
      return;
    }
    toast.success("Project deleted");
    setExpandedProject((prev) => (prev === projectId ? null : prev));
    await loadData();
    onProjectsChanged?.();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = projectsWithColors.findIndex((p) => p.id === active.id);
      const newIndex = projectsWithColors.findIndex((p) => p.id === over.id);
      const newOrder = arrayMove(projectsWithColors, oldIndex, newIndex);
      setProjectsWithColors(newOrder);
      
      // Save order to localStorage
      const orderIds = newOrder.map((p) => p.id);
      localStorage.setItem("projectsOrder", JSON.stringify(orderIds));
    }
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => setActiveId(event.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div>
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl h-48 animate-pulse" />
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
          <SortableContext
            items={projectsWithColors.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 gap-4">
              {projectsWithColors.map((project) => (
                <SortableProjectCard
                  key={project.id}
                  project={project}
                  expandedProject={expandedProject}
                  editingProject={editingProject}
                  editName={editName}
                  editDesc={editDesc}
                  saving={saving}
                  deleting={deleting}
                  onEdit={startEdit}
                  onCancel={cancelEdit}
                  onSave={saveProject}
                  onDelete={deleteProject}
                  onToggleExpand={(id) =>
                    setExpandedProject(expandedProject === id ? null : id)
                  }
                  onCopyColor={copyToClipboard}
                  onDeleteColor={deleteColor}
                  setEditName={setEditName}
                  setEditDesc={setEditDesc}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
      <DragOverlay>
        {activeId ? (
          <div className="glass rounded-2xl p-6 w-96 shadow-2xl">
            <p className="font-semibold">
              {projectsWithColors.find((p) => p.id === activeId)?.name}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
