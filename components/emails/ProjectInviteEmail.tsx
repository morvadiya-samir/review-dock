

import { Html, Body, Head, Heading, Container, Preview, Section, Text, Button, Link } from "@react-email/components";
import * as React from "react";

interface ProjectInviteEmailProps {
    invitedByUsername?: string;
    invitedByEmail?: string;
    projectName?: string;
    projectUrl?: string;
    inviteLink?: string;
    role?: string;
}

export const ProjectInviteEmail = ({
    invitedByUsername = "Someone",
    invitedByEmail = "noreply@reviewdock.com",
    projectName = "a project",
    projectUrl = "https://reviewdock.com",
    inviteLink = "https://reviewdock.com/auth/signup",
    role = "REVIEWER",
}: ProjectInviteEmailProps) => {
    const previewText = `Join ${invitedByUsername} on ReviewDock`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>
                        You&apos;ve been invited to review <strong>{projectName}</strong>
                    </Heading>
                    <Text style={text}>Hello,</Text>
                    <Text style={text}>
                        <strong>{invitedByUsername}</strong> (<Link href={`mailto:${invitedByEmail}`}>{invitedByEmail}</Link>) has invited you to join the project as a <strong>{role}</strong> on <strong>ReviewDock</strong>.
                    </Text>

                    <Section style={websiteSection}>
                        <Text style={websiteLabel}>Website to review:</Text>
                        <Link href={projectUrl} style={websiteLink}>{projectUrl}</Link>
                    </Section>

                    <Text style={text}>
                        ReviewDock is the fastest way to leave precise, pixel-perfect feedback directly on live websites.
                    </Text>

                    <Section style={buttonContainer}>
                        <Button style={button} href={inviteLink}>
                            Accept Invitation
                        </Button>
                    </Section>

                    <Text style={footer}>
                        If you were not expecting this invitation, you can ignore this email.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

// Styles
const main = {
    backgroundColor: "#020617", // slate-950
    margin: "0 auto",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
    margin: "40px auto",
    padding: "40px 30px",
    backgroundColor: "#0f172a", // slate-900
    borderRadius: "16px",
    border: "1px solid #1e293b", // slate-800
    maxWidth: "600px",
};

const h1 = {
    color: "#f8fafc", // slate-50
    fontSize: "24px",
    fontWeight: "bold",
    lineHeight: "32px",
    margin: "0 0 24px",
};

const text = {
    color: "#94a3b8", // slate-400
    fontSize: "16px",
    lineHeight: "24px",
    margin: "0 0 16px",
};

const websiteSection = {
    backgroundColor: "#1e293b", // slate-800
    borderRadius: "8px",
    padding: "16px",
    margin: "24px 0",
};

const websiteLabel = {
    color: "#cbd5e1", // slate-300
    fontSize: "12px",
    fontWeight: "bold",
    textTransform: "uppercase" as const,
    margin: "0 0 4px 0",
};

const websiteLink = {
    color: "#818cf8", // indigo-400
    fontSize: "16px",
    textDecoration: "underline",
    margin: "0",
};

const buttonContainer = {
    margin: "32px 0 24px",
    textAlign: "center" as const,
};

const button = {
    backgroundColor: "#7c3aed", // violet-600
    borderRadius: "8px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "14px 28px",
};

const footer = {
    color: "#64748b", // slate-500
    fontSize: "12px",
    lineHeight: "16px",
    margin: "32px 0 0",
};

export default ProjectInviteEmail;
