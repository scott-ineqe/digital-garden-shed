import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FolderPlus, Loader2, Folder } from "lucide-react";
import { toast } from "sonner";

const ACCEPTED = ".svg,.png,.jpg,.jpeg,.mp3,.mov,image/svg+xml,image/png,image/jpeg,audio/mpeg,video/quicktime";
const ALLOWED_EXT = ["svg", "png", "jpg", "jpeg", "mp3", "mov"];

type Project = { id: string; name: string; description: string | null };

export function UploadPanel({ onUploaded }: { onUploaded: () => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    setProjects(data ?? []);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const createProject = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("projects")
      .insert({ name: newName.trim(), description: newDesc.trim() || null })
      .select()
      .single();
    setCreating(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Project created");
    setNewName("");
    setNewDesc("");
    setSelectedProject(data.id);
    await loadProjects();
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    let success = 0;
    
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!ALLOWED_EXT.includes(ext)) {
        toast.error(`${file.name}: unsupported file type`);
        continue;
      }
      
      try {
        // Upload file to Supabase storage
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("assets")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          toast.error(`Failed to upload ${file.name}: ${uploadError.message}`);
          continue;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("assets")
          .getPublicUrl(uploadData.path);

        const file_url = publicUrlData.publicUrl;

        // Save asset record to database
        const { data: asset, error: dbError } = await supabase
          .from("assets")
          .insert({
            name: file.name,
            file_type: file.type || `application/${ext}`,
            file_url: file_url,
            storage_path: uploadData.path,
            size: file.size,
            project_id: selectedProject || null,
          })
          .select()
          .single();

        if (dbError) {
          toast.error(`Failed to save asset: ${dbError.message}`);
          // Clean up the uploaded file
          await supabase.storage.from("assets").remove([uploadData.path]);
          continue;
        }

        success++;
      } catch (err) {
        toast.error(`Error uploading ${file.name}`);
        console.error(err);
      }
    }
    
    setUploading(false);
    if (success) {
      toast.success(`Uploaded ${success} file${success > 1 ? "s" : ""}`);
      onUploaded();
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FolderPlus className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Create a project</h2>
        </div>
        <div className="space-y-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Project name"
            className="w-full rounded-xl glass-strong px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="w-full rounded-xl glass-strong px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <button
            onClick={createProject}
            disabled={creating || !newName.trim()}
            className="w-full bg-aurora text-primary-foreground font-medium rounded-xl py-3 hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
            Create project
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold">Upload assets</h2>
        </div>

        <label className="block text-xs text-muted-foreground mb-2">Add to project (optional)</label>
        <div className="relative mb-4">
          <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full rounded-xl glass-strong pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="">— No project —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <label className="block">
          <input
            type="file"
            accept={ACCEPTED}
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
            className="hidden"
          />
          <div className="border-2 border-dashed border-glass-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition glass-strong">
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-primary" />
                <p className="text-sm font-medium">Click to upload</p>
                <p className="text-xs text-muted-foreground">SVG · PNG · JPG · MP3 · MOV</p>
              </div>
            )}
          </div>
        </label>
      </div>
    </div>
  );
}
