import Link from "next/link";
import { Metadata } from "next";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "ReviewDock — Website Review & Feedback Platform",
  description: "The fastest way to collect, annotate and manage website feedback. Click any element on a live webpage to leave precise comments, bugs, and suggestions.",
};

const FEATURES = [
  {
    icon: "🎯",
    title: "Pixel-Perfect Annotations",
    desc: "Click any element on a live website to leave precise, context-aware feedback. No more vague email threads.",
  },
  {
    icon: "⚡",
    title: "Instant Review Mode",
    desc: "Switch from Preview to Review mode in one click. Hover to highlight, click to annotate — zero setup required.",
  },
  {
    icon: "🔍",
    title: "Smart CSS Selectors",
    desc: "Every comment automatically captures the CSS selector path, so developers know exactly what to fix.",
  },
  {
    icon: "🏷️",
    title: "Priority & Type Labels",
    desc: "Tag comments as Bug, Note, Suggestion, or Design Change. Set priority from Low to Critical.",
  },
  {
    icon: "👥",
    title: "Team Collaboration",
    desc: "Invite teammates, assign roles (Editor, Reviewer, Viewer), and keep feedback organized by project.",
  },
  {
    icon: "📦",
    title: "Export Anywhere",
    desc: "Download all comments as CSV or JSON. Plug into your workflow — Jira, Linear, Notion, you name it.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Add your website URL",
    desc: "Create a project and paste the URL of any website — your own site, a client's, or a competitor's.",
  },
  {
    num: "02",
    title: "Switch to Review Mode",
    desc: "Toggle Review Mode in the toolbar. Hover over any element to see it highlighted instantly.",
  },
  {
    num: "03",
    title: "Click & annotate",
    desc: "Click any element to open the annotation dialog. Add your note, set a type and priority, and save.",
  },
  {
    num: "04",
    title: "Share & resolve",
    desc: "Share the project with your team, resolve comments as you go, and export when done.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Perfect for solo reviewers",
    features: ["3 projects", "10 pages per project", "50 comments/month", "CSV export", "1 team member"],
    cta: "Get Started Free",
    href: "/auth/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    desc: "For growing teams",
    features: ["Unlimited projects", "Unlimited pages", "Unlimited comments", "CSV + JSON export", "Up to 10 members", "Priority support"],
    cta: "Start Free Trial",
    href: "/auth/signup",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large organizations",
    features: ["Everything in Pro", "Unlimited members", "SSO / SAML", "Custom integrations", "SLA guarantee", "Dedicated support"],
    cta: "Contact Sales",
    href: "mailto:hello@reviewdock.com",
    highlight: false,
  },
];

export default async function LandingPage() {
  // Redirect authenticated users to dashboard
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold">
              RD
            </div>
            <span className="font-bold text-lg tracking-tight">ReviewDock</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin" className="text-sm text-slate-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-lg shadow-violet-500/20"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-indigo-600/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-6">
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
            Now in Early Access — Free Forever Plan Available
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
            Website Feedback,{" "}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Finally Done Right
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            No more vague screenshots or confusing email threads. Click any element on a live website
            to leave precise, pixel-perfect feedback — exactly where it matters.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-2xl shadow-violet-500/30 text-base"
            >
              Start Reviewing for Free →
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto border border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white font-medium px-8 py-4 rounded-xl transition-all text-base"
            >
              See How It Works
            </a>
          </div>

          {/* Mock UI preview */}
          <div className="relative mx-auto max-w-3xl">
            <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
              {/* Browser chrome */}
              <div className="h-10 bg-slate-800/80 flex items-center px-4 gap-3 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 bg-slate-700/50 rounded-md h-6 flex items-center justify-center">
                  <span className="text-[11px] text-slate-500">reviewdock.com/review/abc123/home</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-slate-700 text-slate-400 text-[10px] px-2 py-0.5 rounded">Preview</div>
                  <div className="bg-violet-600 text-white text-[10px] px-2 py-0.5 rounded">Review</div>
                </div>
              </div>
              {/* Mock website preview */}
              <div className="relative h-56 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236366f1' fill-opacity='0.3'%3E%3Crect x='0' y='0' width='1' height='1'/%3E%3C/g%3E%3C/svg%3E\")",
                }}>
                </div>
                {/* Highlighted element simulation */}
                <div className="relative">
                  <div className="border-2 border-dashed border-violet-400 rounded-lg px-8 py-4 text-center">
                    <div className="text-white font-bold text-xl mb-1">Welcome to Our Platform</div>
                    <div className="text-slate-400 text-sm">Empowering teams to build better products</div>
                  </div>
                  {/* Comment pin */}
                  <div className="absolute -top-3 -right-3 w-6 h-6 bg-orange-500 border-2 border-orange-400 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg">
                    1
                  </div>
                </div>
                {/* Comment bubble */}
                <div className="absolute bottom-4 left-4 bg-slate-800 border border-slate-700 rounded-xl p-3 max-w-xs shadow-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full" />
                    <span className="text-xs text-slate-300 font-medium">Sarah K.</span>
                    <span className="text-[9px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded text-[9px]">HIGH</span>
                  </div>
                  <p className="text-[11px] text-slate-400">&ldquo;Headline needs to be more action-oriented. Try: &lsquo;Build Better Products, Together&rsquo;&rdquo;</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Social Proof ─── */}
      <section className="py-12 border-y border-slate-800/60">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500 mb-6 uppercase tracking-wider font-medium">Trusted by design & dev teams at</p>
          <div className="flex flex-wrap justify-center gap-8 text-slate-600 font-semibold text-lg">
            {["Acme Corp", "PixelStudio", "DevFlow", "Launchbase", "Craftwork"].map((name) => (
              <span key={name} className="opacity-40 hover:opacity-70 transition-opacity cursor-default">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything your review flow needs</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Built for designers, PMs, and developers who care about precision.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-violet-500/40 hover:bg-slate-900/80 transition-all duration-200"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-slate-400 text-lg">From URL to comprehensive feedback in minutes.</p>
          </div>
          <div className="space-y-8">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex gap-6 items-start group">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 rounded-2xl flex items-center justify-center group-hover:border-violet-400/40 transition-colors">
                  <span className="text-sm font-bold text-violet-400">{step.num}</span>
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute left-7 mt-14 w-px h-8 bg-slate-800" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-400 text-lg">Start free. Scale as you grow. No hidden fees.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 border flex flex-col transition-all ${plan.highlight
                    ? "bg-gradient-to-b from-violet-600/10 to-indigo-600/5 border-violet-500/40 shadow-xl shadow-violet-500/10"
                    : "bg-slate-900/60 border-slate-800"
                  }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{plan.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    {plan.period && <span className="text-slate-500 text-sm mb-1">/{plan.period}</span>}
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-violet-400 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center font-semibold py-3 rounded-xl transition-all text-sm ${plan.highlight
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20"
                      : "border border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white"
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-violet-600/20 via-indigo-600/15 to-violet-600/20 border border-violet-500/20 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent pointer-events-none" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4 relative">Ready to review smarter?</h2>
            <p className="text-slate-400 mb-8 text-lg relative">
              Join thousands of designers and developers who&apos;ve replaced messy feedback with ReviewDock.
            </p>
            <Link
              href="/auth/signup"
              className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-10 py-4 rounded-xl text-lg shadow-2xl shadow-violet-500/30 transition-all relative"
            >
              Get Started — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-800/60 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-md flex items-center justify-center text-[9px] font-bold">
              RD
            </div>
            <span className="font-bold text-sm">ReviewDock</span>
            <span className="text-slate-600 text-sm">© 2026</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="mailto:hello@reviewdock.com" className="hover:text-white transition-colors">Contact</a>
            <Link href="/auth/signin" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
