export default function ReviewLayout({ children }: { children: React.ReactNode }) {
    // Full-screen layout with no dashboard sidebar
    return (
        <div className="h-screen bg-slate-950 overflow-hidden">
            {children}
        </div>
    );
}
