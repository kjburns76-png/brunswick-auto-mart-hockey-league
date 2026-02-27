import { Calendar, MapPin, Shield, Clock } from "lucide-react";
import { useUpcomingGames, useCompletedGames } from "../hooks/useQueries";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Game } from "../backend.d";

function formatScore(game: Game): string {
  if (game.homeScore !== undefined && game.awayScore !== undefined) {
    return `${Number(game.homeScore)}–${Number(game.awayScore)}`;
  }
  return "–";
}

function getResult(game: Game): { label: string; className: string } | null {
  if (game.homeScore === undefined || game.awayScore === undefined) return null;
  const homeScore = Number(game.homeScore);
  const awayScore = Number(game.awayScore);
  if (game.isHome) {
    if (homeScore > awayScore) return { label: "W", className: "bg-green-900/40 text-green-300 border-green-700/40" };
    if (homeScore < awayScore) return { label: "L", className: "bg-red-900/40 text-red-300 border-red-700/40" };
    return { label: "OT", className: "bg-yellow-900/40 text-yellow-300 border-yellow-700/40" };
  } else {
    if (awayScore > homeScore) return { label: "W", className: "bg-green-900/40 text-green-300 border-green-700/40" };
    if (awayScore < homeScore) return { label: "L", className: "bg-red-900/40 text-red-300 border-red-700/40" };
    return { label: "OT", className: "bg-yellow-900/40 text-yellow-300 border-yellow-700/40" };
  }
}

function UpcomingGameCard({ game }: { game: Game }) {
  return (
    <div className="group relative bg-card border border-border rounded-lg p-5 overflow-hidden hover:border-gold/30 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-forest/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={game.isHome
                ? "font-display font-bold text-xs bg-forest/30 text-green-300 border-green-700/40"
                : "font-display font-bold text-xs bg-muted text-muted-foreground border-border"
              }
            >
              {game.isHome ? "HOME" : "AWAY"}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
            <Calendar className="w-3.5 h-3.5" />
            <span>{game.date}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-gold shrink-0" />
          <div>
            <p className="font-display font-black text-xl text-foreground uppercase tracking-wide">
              {game.isHome ? `vs ${game.opponent}` : `@ ${game.opponent}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground font-body">
          <MapPin className="w-3 h-3 shrink-0" />
          <span>{game.location}</span>
        </div>
      </div>
    </div>
  );
}

function CompletedGameRow({ game }: { game: Game }) {
  const result = getResult(game);
  const score = formatScore(game);

  return (
    <div className="group flex flex-wrap items-center justify-between gap-3 py-4 px-5 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors duration-200">
      <div className="flex items-center gap-4 min-w-0">
        {result && (
          <span className={`font-display font-black text-lg w-8 text-center rounded border shrink-0 ${result.className}`}>
            {result.label}
          </span>
        )}
        <div className="min-w-0">
          <p className="font-display font-bold text-lg text-foreground uppercase truncate">
            {game.isHome ? `vs ${game.opponent}` : `@ ${game.opponent}`}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
            <Calendar className="w-3 h-3" />
            <span>{game.date}</span>
            <span>·</span>
            <Badge variant="outline" className="text-xs font-display font-bold px-1.5 py-0 h-auto">
              {game.isHome ? "HOME" : "AWAY"}
            </Badge>
          </div>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-display font-black text-2xl text-gold">{score}</p>
        <p className="text-xs text-muted-foreground font-body">
          {game.isHome ? "Home–Away" : "Away–Home"}
        </p>
      </div>
    </div>
  );
}

function LoadingRows({ count }: { count: number }) {
  return (
    <div className="p-5 space-y-3">
      {Array.from({ length: count }, (_, i) => `row-${i}`).map((key) => (
        <div key={key} className="flex justify-between items-center gap-4">
          <div className="flex gap-3 flex-1">
            <Skeleton className="h-10 w-16 rounded" />
            <Skeleton className="h-10 flex-1 rounded" />
          </div>
          <Skeleton className="h-10 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function SchedulePage() {
  const { data: upcoming, isLoading: upcomingLoading } = useUpcomingGames();
  const { data: completed, isLoading: completedLoading } = useCompletedGames();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      {/* Page Header */}
      <div className="mb-10 animate-slide-up">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-gold" />
          <span className="font-display font-bold text-xs tracking-widest text-gold">2024–25 SEASON</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-black text-foreground">
          SCHEDULE
        </h1>
        <div className="h-1 w-20 bg-gold mt-3" />
      </div>

      {/* Upcoming Games */}
      <section className="mb-10 animate-slide-up animate-stagger-1">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-4 h-4 text-gold" />
          <h2 className="font-display text-2xl font-bold text-foreground">UPCOMING GAMES</h2>
        </div>

        {upcomingLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {(["a","b","c","d"] as const).map((k) => (
              <Skeleton key={k} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : upcoming && upcoming.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((game) => (
              <UpcomingGameCard key={String(game.id)} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-display text-xl font-bold text-muted-foreground">No Games Scheduled</p>
            <p className="font-body text-sm text-muted-foreground mt-1">Check back soon for upcoming games.</p>
          </div>
        )}
      </section>

      {/* Completed Games */}
      <section className="animate-slide-up animate-stagger-2">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-4 h-4 text-gold" />
          <h2 className="font-display text-2xl font-bold text-foreground">COMPLETED GAMES</h2>
        </div>

        {completedLoading ? (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <LoadingRows count={5} />
          </div>
        ) : completed && completed.length > 0 ? (
          <div className="bg-card rounded-lg border border-border overflow-hidden card-glow">
            {completed.map((game) => (
              <CompletedGameRow key={String(game.id)} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-display text-xl font-bold text-muted-foreground">No Completed Games</p>
            <p className="font-body text-sm text-muted-foreground mt-1">Results will appear here after games are played.</p>
          </div>
        )}
      </section>
    </main>
  );
}
