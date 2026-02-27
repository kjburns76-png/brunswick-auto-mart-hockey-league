import { useState } from "react";
import { BarChart2, Trophy } from "lucide-react";
import { usePlayers, useTeamInfo, usePlayerStats } from "../hooks/useQueries";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Player, PlayerStats } from "../backend.d";

type SortKey = "pts" | "goals" | "assists" | "gp";

interface PlayerRow {
  player: Player;
  gp: number;
  goals: number;
  assists: number;
  pts: number;
}

function buildRow(player: Player, statsMap: Map<string, PlayerStats>): PlayerRow {
  const stats = statsMap.get(String(player.number));
  const goals = stats ? Number(stats.goals) : 0;
  const assists = stats ? Number(stats.assists) : 0;
  const gp = stats ? Number(stats.gamesPlayed) : 0;
  return { player, gp, goals, assists, pts: goals + assists };
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center px-4 py-3 bg-card/50 rounded-lg border border-border/50">
      <span className="font-display text-2xl font-black text-gold">{value}</span>
      <span className="font-display text-xs font-semibold text-muted-foreground tracking-widest">{label}</span>
    </div>
  );
}

function SortableHead({
  label,
  sortKey,
  current,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  onClick: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <TableHead
      className={`font-display font-bold text-xs tracking-widest cursor-pointer select-none transition-colors ${active ? "text-gold" : "text-muted-foreground hover:text-foreground"}`}
      onClick={() => onClick(sortKey)}
    >
      {label} {active ? "↓" : ""}
    </TableHead>
  );
}

const POSITION_COLORS: Record<string, string> = {
  C: "bg-gold/20 text-gold border-gold/30",
  LW: "bg-secondary/60 text-secondary-foreground border-secondary/30",
  RW: "bg-secondary/60 text-secondary-foreground border-secondary/30",
  D: "bg-forest/60 text-foreground border-forest/40",
  G: "bg-destructive/20 text-destructive border-destructive/30",
};

function getPositionBadgeClass(position: string): string {
  return POSITION_COLORS[position.toUpperCase()] ?? "bg-muted text-muted-foreground border-border";
}

export default function PlayerStatsPage() {
  const { data: players, isLoading: playersLoading } = usePlayers();
  const { data: teamInfo, isLoading: teamLoading } = useTeamInfo();
  const { data: allStats, isLoading: statsLoading } = usePlayerStats();
  const [sortKey, setSortKey] = useState<SortKey>("pts");

  const statsMap = new Map<string, PlayerStats>(
    (allStats ?? []).map((s) => [String(s.playerNumber), s])
  );

  const rows: PlayerRow[] = (players ?? [])
    .map((p) => buildRow(p, statsMap))
    .sort((a, b) => b[sortKey] - a[sortKey]);

  const isLoading = playersLoading || statsLoading;

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      {/* Page Header */}
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 className="w-4 h-4 text-gold" />
          <span className="font-display font-bold text-xs tracking-widest text-gold">BAMHL</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-black text-foreground">PLAYER STATS</h1>
        <div className="h-1 w-20 bg-gold mt-3" />
      </div>

      {/* Team Stats Bar */}
      <section className="bg-deep-purple border border-border rounded-lg mb-8 animate-slide-up animate-stagger-1">
        <div className="px-4 py-4">
          {teamLoading ? (
            <div className="flex gap-4 justify-center">
              {(["w", "l", "otl", "pts", "rank"] as const).map((k) => (
                <Skeleton key={k} className="h-16 w-20" />
              ))}
            </div>
          ) : teamInfo ? (
            <div className="flex flex-wrap gap-3 justify-center items-center">
              <div className="flex items-center gap-2 mr-2">
                <Trophy className="w-4 h-4 text-gold" />
                <span className="font-display font-bold text-sm text-muted-foreground tracking-widest">
                  TEAM RECORD
                </span>
              </div>
              <StatPill label="W" value={Number(teamInfo.wins)} />
              <StatPill label="L" value={Number(teamInfo.losses)} />
              <StatPill label="OTL" value={Number(teamInfo.overtimeLosses)} />
              <StatPill label="PTS" value={Number(teamInfo.points)} />
              <div className="flex flex-col items-center px-4 py-3 bg-card/50 rounded-lg border border-gold/30">
                <span className="font-display text-2xl font-black text-gold">
                  #{Number(teamInfo.leaguePosition)}
                </span>
                <span className="font-display text-xs font-semibold text-muted-foreground tracking-widest">
                  RANK
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Individual Stats Table */}
      <div className="rounded-lg border border-border overflow-hidden card-glow animate-slide-up animate-stagger-2">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {(["a", "b", "c", "d", "e", "f", "g", "h"] as const).map((k) => (
              <div key={k} className="flex gap-4">
                <Skeleton className="h-10 w-12 rounded" />
                <Skeleton className="h-10 flex-1 rounded" />
                <Skeleton className="h-10 w-16 rounded" />
                <Skeleton className="h-10 w-16 rounded" />
                <Skeleton className="h-10 w-16 rounded" />
                <Skeleton className="h-10 w-16 rounded" />
              </div>
            ))}
          </div>
        ) : rows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-deep-purple/80 hover:bg-deep-purple/80 border-b border-border">
                <TableHead className="font-display font-bold text-xs tracking-widest text-gold w-14">#</TableHead>
                <TableHead className="font-display font-bold text-xs tracking-widest text-gold">PLAYER</TableHead>
                <TableHead className="font-display font-bold text-xs tracking-widest text-gold">POS</TableHead>
                <SortableHead label="GP" sortKey="gp" current={sortKey} onClick={setSortKey} />
                <SortableHead label="G" sortKey="goals" current={sortKey} onClick={setSortKey} />
                <SortableHead label="A" sortKey="assists" current={sortKey} onClick={setSortKey} />
                <SortableHead label="PTS" sortKey="pts" current={sortKey} onClick={setSortKey} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, idx) => (
                <TableRow
                  key={String(r.player.number)}
                  className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${idx % 2 === 0 ? "bg-card/30" : "bg-card/60"}`}
                >
                  <TableCell className="font-display font-black text-xl text-gold/90 py-3">
                    {String(r.player.number)}
                  </TableCell>
                  <TableCell className="font-body font-semibold text-foreground text-base py-3">
                    {r.player.name}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="outline"
                      className={`font-display font-bold text-xs ${getPositionBadgeClass(r.player.position)}`}
                    >
                      {r.player.position}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-body text-muted-foreground py-3">{r.gp}</TableCell>
                  <TableCell className="font-body text-foreground py-3">{r.goals}</TableCell>
                  <TableCell className="font-body text-foreground py-3">{r.assists}</TableCell>
                  <TableCell className="font-display font-bold text-gold py-3">{r.pts}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-16">
            <BarChart2 className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
            <p className="font-display text-2xl font-bold text-muted-foreground">No Stats Yet</p>
            <p className="font-body text-sm text-muted-foreground mt-2">
              Add players via the admin panel and set their stats to see them here.
            </p>
          </div>
        )}
      </div>

      {rows.length > 0 && (
        <p className="text-center text-xs text-muted-foreground mt-4 font-body">
          Click column headers to sort &middot; Stats set via admin panel
        </p>
      )}
    </main>
  );
}
