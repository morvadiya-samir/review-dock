import { Resend } from "resend";
import { ProjectInviteEmail } from "@/components/emails/ProjectInviteEmail";

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

export const sendProjectInvitationEmail = async ({
    email,
    invitedByUsername,
    invitedByEmail,
    projectName,
    projectUrl,
    role,
}: {
    email: string;
    invitedByUsername: string;
    invitedByEmail: string;
    projectName: string;
    projectUrl: string;
    role: string;
}) => {
    if (!resend) {
        console.warn(`[Mock Email] Resend API Key missing. Would have sent invitation to: ${email}`);
        return { success: true, mock: true };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: "ReviewDock <invites@reviewdock.com>", // Update this to your verified domain
            to: email,
            subject: `You've been invited to review ${projectName}`,
            react: ProjectInviteEmail({
                invitedByUsername,
                invitedByEmail,
                projectName,
                projectUrl,
                role,
                inviteLink: `${process.env.NEXTAUTH_URL}/auth/signup?email=${encodeURIComponent(email)}`,
            }),
        });

        if (error) {
            console.error("Resend error:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (err) {
        console.error("Failed to send email:", err);
        return { success: false, error: err };
    }
};
