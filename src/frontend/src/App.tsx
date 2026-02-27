import { Link, RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import HomePage from "./pages/HomePage";
import RosterPage from "./pages/RosterPage";
import SchedulePage from "./pages/SchedulePage";
import StandingsPage from "./pages/StandingsPage";
import AdminPage from "./pages/AdminPage";
import PlayerStatsPage from "./pages/PlayerStatsPage";

// ── Triceratops SVG Logo ──────────────────────────────────────────────────────

function TriceratopsLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Triceratops logo"
    >
      {/* Body */}
      <ellipse cx="52" cy="62" rx="28" ry="18" fill="#0d9488" />
      {/* Head */}
      <ellipse cx="72" cy="50" rx="18" ry="14" fill="#0d9488" />
      {/* Frill (neck shield) */}
      <ellipse cx="56" cy="44" rx="14" ry="10" fill="#14b8a6" />
      {/* Eye */}
      <circle cx="78" cy="47" r="2.5" fill="white" />
      <circle cx="78.8" cy="47" r="1.2" fill="#111" />
      {/* Nose horn */}
      <polygon points="90,48 96,42 92,50" fill="white" />
      {/* Top horn 1 */}
      <polygon points="76,36 80,24 82,37" fill="white" />
      {/* Top horn 2 */}
      <polygon points="67,34 68,21 73,35" fill="white" />
      {/* Front leg */}
      <rect x="58" y="76" width="8" height="14" rx="3" fill="#0f766e" />
      {/* Back leg */}
      <rect x="36" y="76" width="8" height="14" rx="3" fill="#0f766e" />
      {/* Hockey stick */}
      <line x1="30" y1="68" x2="18" y2="84" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="18" y1="84" x2="10" y2="82" stroke="white" strokeWidth="3" strokeLinecap="round" />
      {/* Tail */}
      <path d="M24 64 Q12 60 10 68" stroke="#0d9488" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── Root Layout ──────────────────────────────────────────────────────────────

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <Toaster />
    </div>
  );
}

// ── Header / Nav ─────────────────────────────────────────────────────────────

function Header() {
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/roster", label: "Roster" },
    { to: "/schedule", label: "Schedule" },
    { to: "/standings", label: "Standings" },
    { to: "/stats", label: "Stats" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo + Name */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <TriceratopsLogo className="w-9 h-9" />
          <span className="font-display font-black text-lg text-foreground tracking-wider group-hover:text-teal-400 transition-colors">
            TRICERATOPS
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="font-display font-bold text-sm tracking-wider px-2.5 py-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors whitespace-nowrap [&.active]:text-gold [&.active]:bg-gold/10"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 py-6 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <TriceratopsLogo className="w-5 h-5 opacity-70" />
          <span className="font-display font-bold tracking-wide">TRICERATOPS HOCKEY</span>
          <span className="font-display text-gold/70">· BAMHL</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-body text-xs flex items-center gap-1">
            © 2026. Built with <Heart className="w-3 h-3 text-gold fill-gold" /> using{" "}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold/80 transition-colors"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

// ── Routes ───────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({ component: RootLayout });

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const rosterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/roster",
  component: RosterPage,
});

const scheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/schedule",
  component: SchedulePage,
});

const standingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/standings",
  component: StandingsPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const statsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/stats",
  component: PlayerStatsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  rosterRoute,
  scheduleRoute,
  standingsRoute,
  adminRoute,
  statsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return <RouterProvider router={router} />;
}
