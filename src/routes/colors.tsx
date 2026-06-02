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
