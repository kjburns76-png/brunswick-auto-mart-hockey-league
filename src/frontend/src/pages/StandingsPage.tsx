import { Trophy, TrendingUp, Star } from "lucide-react";
import { useTeamInfo } from "../hooks/useQueries";
import { Skeleton } from "@/components/ui/skeleton";

function RecordStat({
  label,
  value,
  description,
  highlight = false,
}: {
  label: string;
  value: string | number;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div className={`relative flex flex-col items-center justify-center p-6 rounded-lg border transition-all duration-300 ${
      highlight
        ? "bg-gold/10 border-gold/40 shadow-[0_0_20px_oklch(0.78_0.16_80/0.15)]"
        : "bg-card border-border"
    }`}>
      {highlight && (
        <div className="absolute top-2 right-2">
          <Star className="w-3 h-3 text-gold fill-gold" />
        </div>
      )}
      <span className={`font-display font-black text-5xl md:text-6xl leading-none ${highlight ? "text-gold" : "text-foreground"}`}>
        {value}
      </span>
      <span className="font-display font-bold text-base tracking-widest text-muted-foreground mt-1">{label}</span>
      <span className="font-body text-xs text-muted-foreground/60 mt-1">{description}</span>
    </div>
  );
}

export default function StandingsPage() {
  const { data: teamInfo, isLoading } = useTeamInfo();

  const wins = teamInfo ? Number(teamInfo.wins) : 0;
  const losses = teamInfo ? Number(teamInfo.losses) : 0;
  const otl = teamInfo ? Number(teamInfo.overtimeLosses) : 0;
  const pts = teamInfo ? Number(teamInfo.points) : 0;
  const position = teamInfo ? Number(teamInfo.leaguePosition) : 0;
  const gamesPlayed = wins + losses + otl;
  const winPct = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(1) : "0.0";

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      {/* Page Header */}
      <div className="mb-10 animate-slide-up">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-4 h-4 text-gold" />
          <span className="font-display font-bold text-xs tracking-widest text-gold">BAMHL</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-black text-foreground">
          STANDINGS
        </h1>
        <div className="h-1 w-20 bg-gold mt-3" />
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(["a","b","c","d"] as const).map((k) => <Skeleton key={k} className="h-36 rounded-lg" />)}
          </div>
          <Skeleton className="h-32 rounded-lg" />
        </div>
      ) : teamInfo ? (
        <>
          {/* League Position Hero */}
          <div className="relative overflow-hidden rounded-xl border border-gold/30 bg-gradient-to-br from-deep-purple to-card p-8 mb-6 animate-slide-up animate-stagger-1">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-forest/20 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="font-display text-sm font-bold tracking-widest text-gold mb-1">LEAGUE POSITION</p>
                <div className="flex items-baseline gap-3">
                  <span className="font-display font-black text-8xl text-foreground leading-none">
                    #{position}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-display font-bold text-xl text-gold">TRICERATOPS</span>
                    <span className="font-display text-sm text-muted-foreground">BAMHL</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-gold" />
                <div>
                  <p className="font-display font-black text-3xl text-foreground">{winPct}%</p>
                  <p className="font-body text-xs text-muted-foreground">Win Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up animate-stagger-2">
            <RecordStat label="W" value={wins} description="Wins" />
            <RecordStat label="L" value={losses} description="Losses" />
            <RecordStat label="OTL" value={otl} description="Overtime Losses" />
            <RecordStat label="PTS" value={pts} description="Points" highlight />
          </div>

          {/* Games Played */}
          <div className="mt-6 bg-card border border-border rounded-lg p-5 animate-slide-up animate-stagger-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display font-bold text-xs tracking-widest text-muted-foreground mb-1">GAMES PLAYED</p>
                <p className="font-display font-black text-4xl text-foreground">{gamesPlayed}</p>
              </div>
              <div className="flex-1 max-w-xs">
                <p className="font-display font-bold text-xs tracking-widest text-muted-foreground mb-2">WIN / LOSS RATIO</p>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  {gamesPlayed > 0 && (
                    <div
                      className="h-full bg-gradient-to-r from-forest to-gold rounded-full transition-all duration-700"
                      style={{ width: `${(wins / gamesPlayed) * 100}%` }}
                    />
                  )}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground font-body mt-1">
                  <span>{wins}W</span>
                  <span>{losses + otl}L+OTL</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-card rounded-lg border border-border">
          <Trophy className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
          <p className="font-display text-2xl font-bold text-muted-foreground">Season Not Started</p>
          <p className="font-body text-sm text-muted-foreground mt-2">Team standings will appear here once the season begins.</p>
        </div>
      )}
    </main>
  );
}
