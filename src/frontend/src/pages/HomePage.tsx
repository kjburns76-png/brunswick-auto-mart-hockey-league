import { Link } from "@tanstack/react-router";
import { CalendarDays, Trophy, Newspaper } from "lucide-react";
import { useLatestNews } from "../hooks/useQueries";
import { useTeamInfo } from "../hooks/useQueries";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function NewsCard({ title, body, date }: { title: string; body: string; date: string }) {
  return (
    <article className="relative bg-card border border-border rounded-lg p-5 overflow-hidden group hover:border-gold/40 transition-colors duration-300">
      <div className="absolute top-0 left-0 w-1 h-full bg-gold rounded-l-lg" />
      <div className="pl-3">
        <div className="flex items-center gap-2 mb-2">
          <Newspaper className="w-3.5 h-3.5 text-gold" />
          <time className="text-xs text-muted-foreground font-body">{date}</time>
        </div>
        <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-gold transition-colors duration-200">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground font-body leading-relaxed line-clamp-3">{body}</p>
      </div>
    </article>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center px-4 py-3 bg-card/50 rounded-lg border border-border/50">
      <span className="font-display text-2xl font-black text-gold">{value}</span>
      <span className="font-display text-xs font-semibold text-muted-foreground tracking-widest">{label}</span>
    </div>
  );
}

export default function HomePage() {
  const { data: news, isLoading: newsLoading } = useLatestNews(2n);
  const { data: teamInfo, isLoading: teamLoading } = useTeamInfo();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient grain-overlay">
        {/* Decorative ice lines */}
        <div className="absolute inset-0 ice-texture pointer-events-none" />

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full border border-gold/5 pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full border border-gold/8 pointer-events-none" />
        <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-forest/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10 md:gap-16">
          {/* Logo */}
          <div className="shrink-0 animate-slide-up">
            <div className="relative w-52 h-52 md:w-72 md:h-72">
              <div className="absolute inset-0 rounded-full bg-gold/10 blur-2xl" />
              <img
                src="/assets/generated/triceratops-logo-transparent.dim_400x400.png"
                alt="Triceratops Hockey"
                className="relative w-full h-full object-contain drop-shadow-[0_0_30px_oklch(0.78_0.16_80/0.4)]"
              />
            </div>
          </div>

          {/* Hero Text */}
          <div className="text-center md:text-left animate-slide-up animate-stagger-1">
            <Badge className="mb-3 bg-forest/60 text-gold border-gold/30 font-display font-bold tracking-widest text-xs">
              BAMHL
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl font-black leading-none mb-3">
              <span className="shimmer-text">TRICERATOPS</span>
              <br />
              <span className="text-foreground">HOCKEY</span>
            </h1>
            {/* Quick nav buttons */}
            <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
              <Link to="/roster">
                <button type="button" className="font-display font-bold uppercase tracking-wider text-sm px-5 py-2.5 bg-gold text-background rounded hover:bg-gold/90 transition-colors">
                  View Roster
                </button>
              </Link>
              <Link to="/schedule">
                <button type="button" className="font-display font-bold uppercase tracking-wider text-sm px-5 py-2.5 border border-gold/40 text-gold rounded hover:bg-gold/10 transition-colors">
                  Schedule
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-deep-purple border-y border-border">
        <div className="max-w-5xl mx-auto px-4 py-4">
          {teamLoading ? (
            <div className="flex gap-4 justify-center">
              {(["w", "l", "otl", "pts", "rank"] as const).map((k) => <Skeleton key={k} className="h-16 w-20" />)}
            </div>
          ) : teamInfo ? (
            <div className="flex flex-wrap gap-3 justify-center items-center">
              <div className="flex items-center gap-2 mr-2">
                <Trophy className="w-4 h-4 text-gold" />
                <span className="font-display font-bold text-sm text-muted-foreground tracking-widest">STANDINGS</span>
              </div>
              <StatPill label="W" value={Number(teamInfo.wins)} />
              <StatPill label="L" value={Number(teamInfo.losses)} />
              <StatPill label="OTL" value={Number(teamInfo.overtimeLosses)} />
              <StatPill label="PTS" value={Number(teamInfo.points)} />
              <div className="flex flex-col items-center px-4 py-3 bg-card/50 rounded-lg border border-gold/30">
                <span className="font-display text-2xl font-black text-gold">#{Number(teamInfo.leaguePosition)}</span>
                <span className="font-display text-xs font-semibold text-muted-foreground tracking-widest">RANK</span>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* News Section */}
      <section className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="w-4 h-4 text-gold" />
              <span className="font-display font-bold text-xs tracking-widest text-gold">LATEST NEWS</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-black text-foreground">
              FROM THE LOCKER ROOM
            </h2>
          </div>
        </div>

        {newsLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {(["a", "b"] as const).map((k) => (
              <div key={k} className="bg-card rounded-lg p-5">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : news && news.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 animate-fade-in">
            {news.map((post) => (
              <NewsCard key={String(post.id)} title={post.title} body={post.body} date={post.date} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-display text-xl font-bold text-muted-foreground">No news yet</p>
            <p className="font-body text-sm text-muted-foreground mt-1">Check back soon for team updates.</p>
          </div>
        )}
      </section>
    </main>
  );
}
