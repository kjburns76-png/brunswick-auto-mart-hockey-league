import { useState } from "react";
import { Users, MapPin, Ruler, Weight, CalendarDays, ExternalLink } from "lucide-react";
import { usePlayers } from "../hooks/useQueries";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Player } from "../backend.d";

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

function PlayerCard({ player, onOpenBio }: { player: Player; onOpenBio: () => void }) {
  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden hover:border-teal/50 hover:shadow-lg hover:shadow-teal/5 transition-all duration-300">
      {/* Avatar area */}
      <div className="relative bg-deep-purple/80 pt-6 pb-4 flex flex-col items-center">
        {/* Jersey number badge */}
        <div className="absolute top-3 left-3">
          <span className="font-display font-black text-2xl text-gold leading-none">
            #{String(player.number)}
          </span>
        </div>

        {player.photo ? (
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-teal/40 group-hover:border-teal/70 transition-colors shadow-lg shadow-black/40">
            <img
              src={player.photo}
              alt={player.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-muted/30 border-2 border-border/60 group-hover:border-teal/40 transition-colors flex items-center justify-center">
            <Users className="w-10 h-10 text-muted-foreground/50" />
          </div>
        )}

        <div className="mt-3 text-center px-3">
          <h3 className="font-display font-black text-lg text-foreground leading-tight">{player.name}</h3>
          <Badge
            variant="outline"
            className={`mt-1 font-display font-bold text-xs ${getPositionBadgeClass(player.position)}`}
          >
            {player.position}
          </Badge>
        </div>
      </div>

      {/* Player details */}
      <div className="px-4 py-3 space-y-1.5">
        {player.hometown && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0 text-teal/70" />
            <span className="font-body truncate">{player.hometown}</span>
          </div>
        )}
        <div className="flex items-center gap-4">
          {player.height && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Ruler className="w-3 h-3 shrink-0 text-teal/70" />
              <span className="font-body">{player.height}</span>
            </div>
          )}
          {player.weight && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Weight className="w-3 h-3 shrink-0 text-teal/70" />
              <span className="font-body">{player.weight}</span>
            </div>
          )}
          {Number(player.age) > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="w-3 h-3 shrink-0 text-teal/70" />
              <span className="font-body">Age {String(player.age)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Full Bio button */}
      <div className="px-4 pb-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenBio}
          className="w-full font-display font-bold text-xs border-teal/30 text-teal hover:bg-teal/10 hover:border-teal/60 hover:text-teal transition-colors"
        >
          Full Bio
        </Button>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="bg-deep-purple/80 pt-6 pb-4 flex flex-col items-center gap-3">
        <Skeleton className="w-24 h-24 rounded-full" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
      <div className="px-4 py-3 space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export default function RosterPage() {
  const { data: players, isLoading } = usePlayers();
  const [bioPlayer, setBioPlayer] = useState<Player | null>(null);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 md:py-14">
      {/* Page Header */}
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4 text-gold" />
          <span className="font-display font-bold text-xs tracking-widest text-gold">BAMHL</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-black text-foreground">
          TEAM ROSTER
        </h1>
        <div className="h-1 w-20 bg-gold mt-3" />
      </div>

      {/* Position Legend */}
      <div className="flex flex-wrap gap-2 mb-8 animate-slide-up animate-stagger-1">
        {(["C", "LW", "RW", "D", "G"] as const).map((pos) => (
          <span
            key={pos}
            className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-display font-bold border ${getPositionBadgeClass(pos)}`}
          >
            {pos === "C" ? "Center" : pos === "LW" ? "Left Wing" : pos === "RW" ? "Right Wing" : pos === "D" ? "Defence" : "Goalie"}
          </span>
        ))}
      </div>

      {/* Card Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(["sk1","sk2","sk3","sk4","sk5","sk6","sk7","sk8"] as const).map((k) => (
            <LoadingSkeleton key={k} />
          ))}
        </div>
      ) : players && players.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-slide-up animate-stagger-2">
          {players.map((player: Player) => (
            <PlayerCard
              key={String(player.number)}
              player={player}
              onOpenBio={() => setBioPlayer(player)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Users className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
          <p className="font-display text-2xl font-bold text-muted-foreground">Roster Coming Soon</p>
          <p className="font-body text-sm text-muted-foreground mt-2">Players will be listed here once added via the admin panel.</p>
        </div>
      )}

      {players && players.length > 0 && (
        <p className="text-center text-xs text-muted-foreground mt-6 font-body">
          {players.length} player{players.length !== 1 ? "s" : ""} on the roster
        </p>
      )}

      {/* Full Bio Dialog */}
      <Dialog open={bioPlayer !== null} onOpenChange={() => setBioPlayer(null)}>
        <DialogContent className="bg-card border-border max-w-sm w-full">
          {bioPlayer && (
            <>
              <DialogHeader>
                <DialogTitle className="sr-only">{bioPlayer.name} — Full Bio</DialogTitle>
              </DialogHeader>

              {/* Photo */}
              <div className="flex flex-col items-center pt-2 pb-4">
                {bioPlayer.photo ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-teal/50 shadow-lg shadow-black/40 mb-3">
                    <img src={bioPlayer.photo} alt={bioPlayer.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted/30 border-2 border-border/60 flex items-center justify-center mb-3">
                    <Users className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                )}

                <h2 className="font-display font-black text-2xl text-foreground text-center leading-tight">
                  {bioPlayer.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-display font-black text-gold text-lg">#{String(bioPlayer.number)}</span>
                  <Badge
                    variant="outline"
                    className={`font-display font-bold text-xs ${getPositionBadgeClass(bioPlayer.position)}`}
                  >
                    {bioPlayer.position}
                  </Badge>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {bioPlayer.hometown && (
                  <div className="bg-muted/20 rounded-lg px-3 py-2 col-span-2">
                    <p className="font-display font-bold text-xs tracking-wide text-muted-foreground mb-0.5">HOMETOWN</p>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal/70 shrink-0" />
                      <p className="font-body text-sm text-foreground">{bioPlayer.hometown}</p>
                    </div>
                  </div>
                )}
                {bioPlayer.height && (
                  <div className="bg-muted/20 rounded-lg px-3 py-2">
                    <p className="font-display font-bold text-xs tracking-wide text-muted-foreground mb-0.5">HEIGHT</p>
                    <div className="flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-teal/70 shrink-0" />
                      <p className="font-body text-sm text-foreground">{bioPlayer.height}</p>
                    </div>
                  </div>
                )}
                {bioPlayer.weight && (
                  <div className="bg-muted/20 rounded-lg px-3 py-2">
                    <p className="font-display font-bold text-xs tracking-wide text-muted-foreground mb-0.5">WEIGHT</p>
                    <div className="flex items-center gap-1.5">
                      <Weight className="w-3.5 h-3.5 text-teal/70 shrink-0" />
                      <p className="font-body text-sm text-foreground">{bioPlayer.weight}</p>
                    </div>
                  </div>
                )}
                {Number(bioPlayer.age) > 0 && (
                  <div className="bg-muted/20 rounded-lg px-3 py-2">
                    <p className="font-display font-bold text-xs tracking-wide text-muted-foreground mb-0.5">AGE</p>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-teal/70 shrink-0" />
                      <p className="font-body text-sm text-foreground">{String(bioPlayer.age)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* External profile links */}
              {(bioPlayer.maxPrepsUrl || bioPlayer.eliteProspectsUrl) && (
                <div className="flex flex-col gap-2">
                  {bioPlayer.maxPrepsUrl && (
                    <a
                      href={bioPlayer.maxPrepsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-gold/10 border border-gold/30 text-gold font-display font-bold text-sm hover:bg-gold/20 hover:border-gold/50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on MaxPreps
                    </a>
                  )}
                  {bioPlayer.eliteProspectsUrl && (
                    <a
                      href={bioPlayer.eliteProspectsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-teal/10 border border-teal/30 text-teal font-display font-bold text-sm hover:bg-teal/20 hover:border-teal/50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Elite Prospects
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
