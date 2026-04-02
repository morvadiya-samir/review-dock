"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    Avatar, AvatarFallback, AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Users, UserPlus, Mail, Loader2, X, Clock, CheckCircle2, XCircle
} from "lucide-react";

interface Member {
    id: string;
    role: string;
    user: { id: string; name: string | null; email: string; image: string | null };
}

interface Invitation {
    id: string;
    email: string;
    status: string;
    createdAt: Date;
    invitedBy: { name: string | null; email: string };
}

interface Project {
    id: string;
    members: Member[];
}

const ROLE_COLORS: Record<string, string> = {
    OWNER: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    EDITOR: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    REVIEWER: "bg-green-500/10 text-green-400 border-green-500/20",
    VIEWER: "bg-slate-700 text-slate-400 border-slate-600",
};

const STATUS_ICONS = {
    PENDING: { icon: Clock, color: "text-yellow-400" },
    ACCEPTED: { icon: CheckCircle2, color: "text-green-400" },
    DECLINED: { icon: XCircle, color: "text-red-400" },
};

export function ProjectMembersTab({
    project,
    isOwner,
}: {
    project: Project;
    isOwner: boolean;
}) {
    const router = useRouter();
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("REVIEWER");
    const [isInviting, setIsInviting] = useState(false);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [invitationsLoaded, setInvitationsLoaded] = useState(false);

    const loadInvitations = async () => {
        if (invitationsLoaded) return;
        const res = await fetch(`/api/projects/${project.id}/invitations`);
        const json = await res.json();
        if (res.ok) setInvitations(json.data);
        setInvitationsLoaded(true);
    };

    const sendInvite = async () => {
        if (!inviteEmail.trim()) return;
        setIsInviting(true);
        try {
            const res = await fetch(`/api/projects/${project.id}/invitations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
            });
            const json = await res.json();
            if (!res.ok) { toast.error(json.error || "Failed to invite"); return; }

            if (json.added) {
                toast.success(`${inviteEmail} added as ${inviteRole.toLowerCase()}!`);
                router.refresh();
            } else {
                toast.success(`Invitation sent to ${inviteEmail}`);
                setInvitations((prev) => [json.data, ...prev]);
            }
            setInviteEmail("");
            setShowInviteForm(false);
        } catch { toast.error("Something went wrong"); }
        finally { setIsInviting(false); }
    };

    const removeMember = async (memberId: string, memberName: string) => {
        if (!confirm(`Remove ${memberName} from this project?`)) return;
        const res = await fetch(`/api/projects/${project.id}/members/${memberId}`, { method: "DELETE" });
        if (res.ok) {
            toast.success("Member removed");
            router.refresh();
        } else toast.error("Failed to remove member");
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                    {project.members.length} member{project.members.length !== 1 ? "s" : ""}
                </p>
                {isOwner && (
                    <Button
                        size="sm"
                        onClick={() => { setShowInviteForm(!showInviteForm); loadInvitations(); }}
                        className="bg-violet-600 hover:bg-violet-500 text-white h-8"
                    >
                        <UserPlus size={13} className="mr-1.5" /> Invite Member
                    </Button>
                )}
            </div>

            {/* Invite form */}
            <AnimatePresence>
                {showInviteForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-white flex items-center gap-2">
                                    <Mail size={14} className="text-violet-400" /> Invite by Email
                                </p>
                                <button onClick={() => setShowInviteForm(false)} className="text-slate-500 hover:text-white">
                                    <X size={14} />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="colleague@company.com"
                                    className="flex-1 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 h-9 text-sm"
                                    onKeyDown={(e) => e.key === "Enter" && sendInvite()}
                                />
                                <Select value={inviteRole} onValueChange={setInviteRole}>
                                    <SelectTrigger className="w-32 bg-slate-900/50 border-slate-700 text-white h-9 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-700">
                                        {["EDITOR", "REVIEWER", "VIEWER"].map((r) => (
                                            <SelectItem key={r} value={r} className="text-slate-300 text-xs focus:bg-slate-800 focus:text-white">
                                                {r.charAt(0) + r.slice(1).toLowerCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button onClick={sendInvite} disabled={isInviting} size="sm" className="bg-violet-600 hover:bg-violet-500 h-9 px-4">
                                    {isInviting ? <Loader2 size={13} className="animate-spin" /> : "Send"}
                                </Button>
                            </div>
                            <p className="text-[11px] text-slate-500">
                                If the user has an account, they&apos;ll be added immediately. Otherwise, a pending invitation will be created.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Members list */}
            {project.members.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                    <Users size={28} className="mx-auto mb-2 text-slate-700" />
                    <p className="text-sm">No members yet.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {project.members.map((member) => {
                        const initials = member.user.name
                            ?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "U";

                        return (
                            <div
                                key={member.id}
                                className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                        <AvatarImage src={member.user.image ?? undefined} />
                                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs font-bold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{member.user.name ?? "Unknown"}</p>
                                        <p className="text-xs text-slate-500 truncate">{member.user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Badge variant="secondary" className={`text-[10px] border ${ROLE_COLORS[member.role] ?? "bg-slate-700 text-slate-400"}`}>
                                        {member.role.toLowerCase()}
                                    </Badge>
                                    {isOwner && member.role !== "OWNER" && (
                                        <button
                                            onClick={() => removeMember(member.id, member.user.name ?? member.user.email)}
                                            className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                                            title="Remove member"
                                        >
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pending invitations */}
            {invitationsLoaded && invitations.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Invitations</p>
                    {invitations
                        .filter((inv) => inv.status === "PENDING")
                        .map((inv) => {
                            const StatusInfo = STATUS_ICONS[inv.status as keyof typeof STATUS_ICONS];
                            return (
                                <div key={inv.id} className="flex items-center justify-between bg-slate-900/40 border border-slate-800/60 border-dashed rounded-xl p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                                            <Mail size={13} className="text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-300">{inv.email}</p>
                                            <p className="text-[11px] text-slate-600">Invited by {inv.invitedBy.name}</p>
                                        </div>
                                    </div>
                                    {StatusInfo && <StatusInfo.icon size={14} className={StatusInfo.color} />}
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
}
