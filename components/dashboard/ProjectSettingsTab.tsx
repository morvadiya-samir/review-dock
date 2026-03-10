"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Project {
    id: string;
    name: string;
    websiteUrl: string;
    description: string | null;
}

export function ProjectSettingsTab({ project }: { project: Project }) {
    const router = useRouter();
    const [name, setName] = useState(project.name);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState("");

    const saveChanges = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/projects/${project.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            const json = await res.json();
            if (!res.ok) { toast.error(json.error || "Failed to save"); return; }
            toast.success("Project updated!");
            router.refresh();
        } catch { toast.error("Something went wrong"); }
        finally { setIsSaving(false); }
    };

    const deleteProject = async () => {
        if (deleteConfirm !== project.name) {
            toast.error("Project name doesn't match");
            return;
        }
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
            if (!res.ok) { toast.error("Failed to delete project"); return; }
            toast.success("Project deleted");
            router.push("/dashboard");
            router.refresh();
        } catch { toast.error("Something went wrong"); }
        finally { setIsDeleting(false); }
    };

    return (
        <div className="space-y-6 max-w-lg">
            {/* Rename */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="text-base font-semibold text-white">Project Details</h3>
                <div className="space-y-2">
                    <Label className="text-sm text-slate-300">Project Name</Label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-slate-800/50 border-slate-700 text-white focus:border-violet-500 h-11"
                    />
                </div>
                <Button
                    onClick={saveChanges}
                    disabled={isSaving || name === project.name}
                    className="bg-violet-600 hover:bg-violet-500 text-white"
                >
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
                </Button>
            </div>

            {/* Delete zone */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 space-y-3">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-400" />
                    <h3 className="text-base font-semibold text-red-400">Danger Zone</h3>
                </div>
                <p className="text-sm text-slate-400">
                    Deleting this project will permanently remove all pages, comments, and data. This action cannot be undone.
                </p>
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30">
                            <Trash2 size={14} className="mr-1.5" /> Delete Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-700">
                        <DialogHeader>
                            <DialogTitle className="text-white">Delete Project</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Type <strong className="text-white">{project.name}</strong> to confirm deletion.
                            </DialogDescription>
                        </DialogHeader>
                        <Input
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                            placeholder={project.name}
                            className="bg-slate-800/50 border-slate-700 text-white focus:border-red-500"
                        />
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setDeleteOpen(false)} className="text-slate-400">Cancel</Button>
                            <Button
                                variant="destructive"
                                onClick={deleteProject}
                                disabled={isDeleting || deleteConfirm !== project.name}
                                className="bg-red-600 hover:bg-red-500"
                            >
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Delete Permanently
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
