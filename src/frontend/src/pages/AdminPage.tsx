import { useState, useRef } from "react";
import { Lock, Users, Calendar, Newspaper, Trophy, Trash2, Plus, Pencil, Loader2, ChevronDown, ChevronUp, BarChart2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  usePlayers,
  useAllGames,
  useAllNews,
  useTeamInfo,
  usePlayerStats,
  useAddPlayer,
  useUpdatePlayer,
  useRemovePlayer,
  useSetPlayerStats,
  useAddGame,
  useUpdateGameScores,
  useRemoveGame,
  useAddNewsPost,
  useUpdateNewsPost,
  useRemoveNewsPost,
  useUpdateTeamInfo,
} from "../hooks/useQueries";
import type { Player, Game, NewsPost } from "../backend.d";

// ── Password Gate ────────────────────────────────────────────────────────────

const ADMIN_PASSWORD = "Bubbakellen2!";

function PasswordGate({ onAuthenticated }: { onAuthenticated: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      setError(false);
      onAuthenticated(pw);
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold/10 border border-gold/30 mb-4">
            <Lock className="w-6 h-6 text-gold" />
          </div>
          <h1 className="font-display text-3xl font-black text-foreground">ADMIN PANEL</h1>
          <p className="font-body text-sm text-muted-foreground mt-2">Enter the team password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(false); }}
            className={`bg-card border-border text-foreground placeholder:text-muted-foreground ${error ? "border-destructive" : ""}`}
          />
          {error && <p className="text-sm text-destructive font-body">Incorrect password. Please try again.</p>}
          <Button type="submit" className="w-full bg-gold text-background hover:bg-gold/90 font-display font-bold uppercase tracking-wider">
            Enter
          </Button>
        </form>
      </div>
    </div>
  );
}

// ── Section Wrapper ──────────────────────────────────────────────────────────

function AdminSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden mb-5">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-deep-purple/60 hover:bg-deep-purple/80 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="text-gold">{icon}</span>
          <span className="font-display font-bold text-lg tracking-wide text-foreground">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

// ── Photo Upload Helper ──────────────────────────────────────────────────────

function PhotoUpload({ value, onChange }: { value: string; onChange: (dataUrl: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <img
          src={value}
          alt="Player avatar preview"
          className="w-14 h-14 rounded-full object-cover border-2 border-gold/40 shrink-0"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-muted/40 border-2 border-border flex items-center justify-center shrink-0">
          <Camera className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="border-border text-muted-foreground hover:text-foreground font-display font-bold text-xs"
        >
          {value ? "Change Photo" : "Upload Photo"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            className="ml-2 text-destructive hover:bg-destructive/10 text-xs font-display font-bold"
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Inline Stats Editor ──────────────────────────────────────────────────────

function InlineStatsEditor({ playerNumber, password, onClose }: { playerNumber: bigint; password: string; onClose: () => void }) {
  const { data: allStats } = usePlayerStats();
  const setStats = useSetPlayerStats();

  const existing = allStats?.find((s) => s.playerNumber === playerNumber);
  const [form, setForm] = useState({
    gp: existing ? String(Number(existing.gamesPlayed)) : "0",
    goals: existing ? String(Number(existing.goals)) : "0",
    assists: existing ? String(Number(existing.assists)) : "0",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const gp = parseInt(form.gp);
    const g = parseInt(form.goals);
    const a = parseInt(form.assists);
    if ([gp, g, a].some(isNaN) || gp < 0 || g < 0 || a < 0) {
      toast.error("All stats must be non-negative numbers");
      return;
    }
    try {
      await setStats.mutateAsync({
        playerNumber,
        goals: BigInt(g),
        assists: BigInt(a),
        gamesPlayed: BigInt(gp),
        password,
      });
      toast.success("Stats updated");
      onClose();
    } catch {
      toast.error("Failed to update stats");
    }
  };

  return (
    <form onSubmit={handleSave} className="mt-3 bg-background/40 rounded-lg p-3 border border-gold/20">
      <p className="font-display font-bold text-xs text-gold mb-3 tracking-wide">EDIT STATS</p>
      <div className="flex gap-3 items-end flex-wrap">
        <div>
          <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">GP</Label>
          <Input
            type="number" min="0"
            value={form.gp}
            onChange={(e) => setForm((p) => ({ ...p, gp: e.target.value }))}
            className="mt-1 bg-input border-border w-20"
          />
        </div>
        <div>
          <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">G</Label>
          <Input
            type="number" min="0"
            value={form.goals}
            onChange={(e) => setForm((p) => ({ ...p, goals: e.target.value }))}
            className="mt-1 bg-input border-border w-20"
          />
        </div>
        <div>
          <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">A</Label>
          <Input
            type="number" min="0"
            value={form.assists}
            onChange={(e) => setForm((p) => ({ ...p, assists: e.target.value }))}
            className="mt-1 bg-input border-border w-20"
          />
        </div>
        <Button type="submit" disabled={setStats.isPending} className="bg-gold text-background hover:bg-gold/90 font-display font-bold text-sm">
          {setStats.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Players Section ──────────────────────────────────────────────────────────

const EMPTY_PLAYER_FORM = { number: "", name: "", position: "", photo: "", height: "", weight: "", age: "", hometown: "", maxPrepsUrl: "", eliteProspectsUrl: "" };

function PlayersSection({ password }: { password: string }) {
  const { data: players } = usePlayers();
  const addPlayer = useAddPlayer();
  const updatePlayer = useUpdatePlayer();
  const removePlayer = useRemovePlayer();

  const [form, setForm] = useState(EMPTY_PLAYER_FORM);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_PLAYER_FORM);
  const [statsOpenFor, setStatsOpenFor] = useState<bigint | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(form.number);
    const age = parseInt(form.age);
    if (isNaN(num) || !form.name.trim() || !form.position.trim()) {
      toast.error("Number, name, and position are required");
      return;
    }
    try {
      await addPlayer.mutateAsync({
        number: BigInt(num),
        name: form.name.trim(),
        position: form.position.trim(),
        photo: form.photo,
        height: form.height.trim(),
        weight: form.weight.trim(),
        age: BigInt(isNaN(age) ? 0 : age),
        hometown: form.hometown.trim(),
        maxPrepsUrl: form.maxPrepsUrl.trim() || "",
        eliteProspectsUrl: form.eliteProspectsUrl.trim() || "",
        password,
      });
      setForm(EMPTY_PLAYER_FORM);
      toast.success("Player added");
    } catch {
      toast.error("Failed to add player — check your password");
    }
  };

  const startEdit = (player: Player) => {
    setEditingPlayer(player);
    setEditForm({
      number: String(Number(player.number)),
      name: player.name,
      position: player.position,
      photo: player.photo,
      height: player.height,
      weight: player.weight,
      age: String(Number(player.age)),
      hometown: player.hometown,
      maxPrepsUrl: player.maxPrepsUrl ?? "",
      eliteProspectsUrl: player.eliteProspectsUrl ?? "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;
    const age = parseInt(editForm.age);
    try {
      await updatePlayer.mutateAsync({
        number: editingPlayer.number,
        name: editForm.name.trim(),
        position: editForm.position.trim(),
        photo: editForm.photo,
        height: editForm.height.trim(),
        weight: editForm.weight.trim(),
        age: BigInt(isNaN(age) ? 0 : age),
        hometown: editForm.hometown.trim(),
        maxPrepsUrl: editForm.maxPrepsUrl.trim() || "",
        eliteProspectsUrl: editForm.eliteProspectsUrl.trim() || "",
        password,
      });
      setEditingPlayer(null);
      toast.success("Player updated");
    } catch {
      toast.error("Failed to update player");
    }
  };

  const handleRemove = async (number: bigint, name: string) => {
    if (!confirm(`Remove ${name} (#${String(number)}) from the roster?`)) return;
    try {
      await removePlayer.mutateAsync({ number, password });
      toast.success("Player removed");
    } catch {
      toast.error("Failed to remove player");
    }
  };

  return (
    <AdminSection icon={<Users className="w-5 h-5" />} title="PLAYERS">
      {/* Edit Form */}
      {editingPlayer ? (
        <form onSubmit={handleUpdate} className="space-y-4 mb-5">
          <p className="font-display font-bold text-sm text-gold">EDITING: #{String(editingPlayer.number)} {editingPlayer.name}</p>
          <div>
            <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">PHOTO</Label>
            <div className="mt-1">
              <PhotoUpload value={editForm.photo} onChange={(url) => setEditForm((p) => ({ ...p, photo: url }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">NAME</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className="mt-1 bg-input border-border" />
            </div>
            <div>
              <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">POSITION</Label>
              <Input value={editForm.position} onChange={(e) => setEditForm((p) => ({ ...p, position: e.target.value }))} placeholder="C, LW, RW, D, G" className="mt-1 bg-input border-border" />
            </div>
            <div>
              <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">AGE</Label>
              <Input type="number" min="0" value={editForm.age} onChange={(e) => setEditForm((p) => ({ ...p, age: e.target.value }))} className="mt-1 bg-input border-border" />
            </div>
            <div>
              <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">HEIGHT</Label>
              <Input value={editForm.height} onChange={(e) => setEditForm((p) => ({ ...p, height: e.target.value }))} placeholder='e.g. 6&apos;1"' className="mt-1 bg-input border-border" />
            </div>
            <div>
              <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">WEIGHT</Label>
              <Input value={editForm.weight} onChange={(e) => setEditForm((p) => ({ ...p, weight: e.target.value }))} placeholder="e.g. 185 lbs" className="mt-1 bg-input border-border" />
            </div>
            <div>
              <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">HOMETOWN</Label>
              <Input value={editForm.hometown} onChange={(e) => setEditForm((p) => ({ ...p, hometown: e.target.value }))} placeholder="City, Province" className="mt-1 bg-input border-border" />
            </div>
            <div className="sm:col-span-3">
              <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">MAXPREPS URL</Label>
              <Input value={editForm.maxPrepsUrl} onChange={(e) => setEditForm((p) => ({ ...p, maxPrepsUrl: e.target.value }))} placeholder="https://www.maxpreps.com/..." className="mt-1 bg-input border-border" />
            </div>
            <div className="sm:col-span-3">
              <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">ELITE PROSPECTS URL</Label>
              <Input value={editForm.eliteProspectsUrl} onChange={(e) => setEditForm((p) => ({ ...p, eliteProspectsUrl: e.target.value }))} placeholder="https://www.eliteprospects.com/..." className="mt-1 bg-input border-border" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={updatePlayer.isPending} className="bg-gold text-background hover:bg-gold/90 font-display font-bold">
              {updatePlayer.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Save Changes
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditingPlayer(null)} className="text-muted-foreground">Cancel</Button>
          </div>
        </form>
      ) : (
        /* Add Form */
        <form onSubmit={handleAdd} className="space-y-4 mb-5">
          <p className="font-display font-bold text-sm text-muted-foreground tracking-wide">ADD NEW PLAYER</p>
          <div>
            <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">PHOTO</Label>
            <div className="mt-1">
              <PhotoUpload value={form.photo} onChange={(url) => setForm((p) => ({ ...p, photo: url }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground"># NUMBER</Label>
              <Input
                type="number"
                placeholder="e.g. 14"
                value={form.number}
                onChange={(e) => setForm((p) => ({ ...p, number: e.target.value }))}
                className="mt-1 bg-input border-border"
              />
            </div>
            <div>
              <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">NAME</Label>
              <Input
                placeholder="Player name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="mt-1 bg-input border-border"
              />
            </div>
            <div>
              <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">POSITION</Label>
              <Input
                placeholder="C, LW, RW, D, G"
                value={form.position}
                onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                className="mt-1 bg-input border-border"
              />
            </div>
            <div>
              <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">AGE</Label>
              <Input
                type="number"
                min="0"
                placeholder="e.g. 28"
                value={form.age}
                onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                className="mt-1 bg-input border-border"
              />
            </div>
            <div>
              <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">HEIGHT</Label>
              <Input
                placeholder='e.g. 6&apos;1"'
                value={form.height}
                onChange={(e) => setForm((p) => ({ ...p, height: e.target.value }))}
                className="mt-1 bg-input border-border"
              />
            </div>
            <div>
              <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">WEIGHT</Label>
              <Input
                placeholder="e.g. 185 lbs"
                value={form.weight}
                onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
                className="mt-1 bg-input border-border"
              />
            </div>
            <div className="sm:col-span-3">
              <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">HOMETOWN</Label>
              <Input
                placeholder="City, Province"
                value={form.hometown}
                onChange={(e) => setForm((p) => ({ ...p, hometown: e.target.value }))}
                className="mt-1 bg-input border-border"
              />
            </div>
            <div className="sm:col-span-3">
              <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">MAXPREPS URL</Label>
              <Input
                placeholder="https://www.maxpreps.com/..."
                value={form.maxPrepsUrl}
                onChange={(e) => setForm((p) => ({ ...p, maxPrepsUrl: e.target.value }))}
                className="mt-1 bg-input border-border"
              />
            </div>
            <div className="sm:col-span-3">
              <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">ELITE PROSPECTS URL</Label>
              <Input
                placeholder="https://www.eliteprospects.com/..."
                value={form.eliteProspectsUrl}
                onChange={(e) => setForm((p) => ({ ...p, eliteProspectsUrl: e.target.value }))}
                className="mt-1 bg-input border-border"
              />
            </div>
          </div>
          <Button type="submit" disabled={addPlayer.isPending} className="bg-gold text-background hover:bg-gold/90 font-display font-bold">
            {addPlayer.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Add Player
          </Button>
        </form>
      )}

      <Separator className="mb-4 bg-border" />

      {/* Player List */}
      {players && players.length > 0 ? (
        <div className="space-y-3">
          {players.map((p: Player) => (
            <div key={String(p.number)} className="bg-background/30 rounded-lg px-3 py-3 border border-border/40">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {p.photo ? (
                    <img src={p.photo} alt={p.name} className="w-10 h-10 rounded-full object-cover border border-gold/30 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted/40 border border-border flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-gold text-lg">{String(p.number)}</span>
                      <span className="font-body font-semibold text-foreground">{p.name}</span>
                      <span className="text-xs text-muted-foreground font-display bg-muted px-2 py-0.5 rounded">{p.position}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-0.5">
                      {p.hometown && <span className="text-xs text-muted-foreground">{p.hometown}</span>}
                      {p.height && <span className="text-xs text-muted-foreground">{p.height}</span>}
                      {p.weight && <span className="text-xs text-muted-foreground">{p.weight}</span>}
                      {Number(p.age) > 0 && <span className="text-xs text-muted-foreground">Age {String(p.age)}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatsOpenFor(statsOpenFor === p.number ? null : p.number)}
                    className="text-teal hover:bg-teal/10 hover:text-teal font-display font-bold text-xs"
                    title="Edit Stats"
                  >
                    <BarChart2 className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(p)}
                    className="text-gold hover:bg-gold/10"
                    title="Edit Player"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(p.number, p.name)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    title="Remove Player"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {statsOpenFor === p.number && (
                <InlineStatsEditor
                  playerNumber={p.number}
                  password={password}
                  onClose={() => setStatsOpenFor(null)}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground font-body text-center py-4">No players yet.</p>
      )}
    </AdminSection>
  );
}

// ── Games Section ────────────────────────────────────────────────────────────

function GamesSection({ password }: { password: string }) {
  const { data: games } = useAllGames();
  const addGame = useAddGame();
  const updateScores = useUpdateGameScores();
  const removeGame = useRemoveGame();

  const [form, setForm] = useState({
    date: "", opponent: "", location: "", isHome: true,
  });
  const [scoreForm, setScoreForm] = useState<{ gameId: bigint; homeScore: string; awayScore: string } | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date.trim() || !form.opponent.trim() || !form.location.trim()) {
      toast.error("All fields are required");
      return;
    }
    try {
      await addGame.mutateAsync({
        date: form.date.trim(),
        opponent: form.opponent.trim(),
        location: form.location.trim(),
        isHome: form.isHome,
        password,
      });
      setForm({ date: "", opponent: "", location: "", isHome: true });
      toast.success("Game added");
    } catch {
      toast.error("Failed to add game — check your password");
    }
  };

  const handleUpdateScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoreForm) return;
    const hs = parseInt(scoreForm.homeScore);
    const as_ = parseInt(scoreForm.awayScore);
    if (isNaN(hs) || isNaN(as_)) { toast.error("Scores must be numbers"); return; }
    try {
      await updateScores.mutateAsync({
        id: scoreForm.gameId,
        homeScore: BigInt(hs),
        awayScore: BigInt(as_),
        isCompleted: true,
        password,
      });
      setScoreForm(null);
      toast.success("Score updated");
    } catch {
      toast.error("Failed to update score");
    }
  };

  const handleRemove = async (id: bigint) => {
    if (!confirm("Remove this game?")) return;
    try {
      await removeGame.mutateAsync({ id, password });
      toast.success("Game removed");
    } catch {
      toast.error("Failed to remove game");
    }
  };

  return (
    <AdminSection icon={<Calendar className="w-5 h-5" />} title="GAMES">
      {/* Add Form */}
      <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div>
          <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">DATE</Label>
          <Input
            placeholder="e.g. Jan 15, 2025"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            className="mt-1 bg-input border-border"
          />
        </div>
        <div>
          <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">OPPONENT</Label>
          <Input
            placeholder="Team name"
            value={form.opponent}
            onChange={(e) => setForm((p) => ({ ...p, opponent: e.target.value }))}
            className="mt-1 bg-input border-border"
          />
        </div>
        <div>
          <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">LOCATION</Label>
          <Input
            placeholder="Arena name"
            value={form.location}
            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            className="mt-1 bg-input border-border"
          />
        </div>
        <div>
          <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">HOME / AWAY</Label>
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, isHome: true }))}
              className={`flex-1 py-2 rounded font-display font-bold text-sm border transition-colors ${
                form.isHome ? "bg-forest/60 text-foreground border-forest" : "bg-transparent border-border text-muted-foreground hover:border-border/80"
              }`}
            >
              HOME
            </button>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, isHome: false }))}
              className={`flex-1 py-2 rounded font-display font-bold text-sm border transition-colors ${
                !form.isHome ? "bg-muted/60 text-foreground border-muted-foreground/40" : "bg-transparent border-border text-muted-foreground hover:border-border/80"
              }`}
            >
              AWAY
            </button>
          </div>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={addGame.isPending} className="bg-gold text-background hover:bg-gold/90 font-display font-bold">
            {addGame.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Add Game
          </Button>
        </div>
      </form>

      {/* Score Update Form */}
      {scoreForm && (
        <form onSubmit={handleUpdateScore} className="mb-5 bg-background/30 rounded-lg p-4 border border-gold/20">
          <p className="font-display font-bold text-sm text-gold mb-3">UPDATE SCORE (Game #{String(scoreForm.gameId).slice(-4)})</p>
          <div className="flex gap-3 items-end">
            <div>
              <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">HOME SCORE</Label>
              <Input
                type="number"
                min="0"
                value={scoreForm.homeScore}
                onChange={(e) => setScoreForm((p) => p ? { ...p, homeScore: e.target.value } : null)}
                className="mt-1 bg-input border-border w-24"
              />
            </div>
            <span className="font-display font-black text-2xl text-muted-foreground pb-1">–</span>
            <div>
              <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">AWAY SCORE</Label>
              <Input
                type="number"
                min="0"
                value={scoreForm.awayScore}
                onChange={(e) => setScoreForm((p) => p ? { ...p, awayScore: e.target.value } : null)}
                className="mt-1 bg-input border-border w-24"
              />
            </div>
            <Button type="submit" disabled={updateScores.isPending} className="bg-gold text-background hover:bg-gold/90 font-display font-bold">
              {updateScores.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setScoreForm(null)} className="text-muted-foreground">
              Cancel
            </Button>
          </div>
        </form>
      )}

      <Separator className="mb-4 bg-border" />

      {/* Games List */}
      {games && games.length > 0 ? (
        <div className="space-y-2">
          {games.map((g: Game) => (
            <div key={String(g.id)} className="flex flex-wrap items-center justify-between gap-3 bg-background/30 rounded px-3 py-2">
              <div>
                <p className="font-body font-semibold text-foreground text-sm">
                  {g.isHome ? `vs ${g.opponent}` : `@ ${g.opponent}`}
                  <span className="ml-2 text-xs text-muted-foreground">{g.date}</span>
                </p>
                <p className="text-xs text-muted-foreground">{g.location} · {g.isHome ? "Home" : "Away"} · {g.isCompleted ? `Final: ${Number(g.homeScore ?? 0)}-${Number(g.awayScore ?? 0)}` : "Upcoming"}</p>
              </div>
              <div className="flex gap-2">
                {!g.isCompleted && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setScoreForm({ gameId: g.id, homeScore: "0", awayScore: "0" })}
                    className="text-gold hover:bg-gold/10"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(g.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground font-body text-center py-4">No games yet.</p>
      )}
    </AdminSection>
  );
}

// ── News Section ─────────────────────────────────────────────────────────────

function NewsSection({ password }: { password: string }) {
  const { data: posts } = useAllNews();
  const addNews = useAddNewsPost();
  const updateNews = useUpdateNewsPost();
  const removeNews = useRemoveNewsPost();

  const [form, setForm] = useState({ title: "", body: "", date: "" });
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [editForm, setEditForm] = useState({ title: "", body: "", date: "" });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim() || !form.date.trim()) {
      toast.error("All fields are required");
      return;
    }
    try {
      await addNews.mutateAsync({ title: form.title.trim(), body: form.body.trim(), date: form.date.trim(), password });
      setForm({ title: "", body: "", date: "" });
      toast.success("News post added");
    } catch {
      toast.error("Failed to add post — check your password");
    }
  };

  const startEdit = (post: NewsPost) => {
    setEditingPost(post);
    setEditForm({ title: post.title, body: post.body, date: post.date });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    try {
      await updateNews.mutateAsync({
        id: editingPost.id,
        title: editForm.title.trim(),
        body: editForm.body.trim(),
        date: editForm.date.trim(),
        password,
      });
      setEditingPost(null);
      toast.success("Post updated");
    } catch {
      toast.error("Failed to update post");
    }
  };

  const handleRemove = async (id: bigint) => {
    if (!confirm("Delete this news post?")) return;
    try {
      await removeNews.mutateAsync({ id, password });
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  return (
    <AdminSection icon={<Newspaper className="w-5 h-5" />} title="NEWS POSTS">
      {editingPost ? (
        <form onSubmit={handleUpdate} className="space-y-3 mb-5">
          <p className="font-display font-bold text-sm text-gold">EDITING POST</p>
          <div>
            <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">TITLE</Label>
            <Input value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} className="mt-1 bg-input border-border" />
          </div>
          <div>
            <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">DATE</Label>
            <Input value={editForm.date} onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))} className="mt-1 bg-input border-border" />
          </div>
          <div>
            <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">BODY</Label>
            <Textarea value={editForm.body} onChange={(e) => setEditForm((p) => ({ ...p, body: e.target.value }))} className="mt-1 bg-input border-border min-h-[100px]" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={updateNews.isPending} className="bg-gold text-background hover:bg-gold/90 font-display font-bold">
              {updateNews.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Save
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditingPost(null)} className="text-muted-foreground">Cancel</Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleAdd} className="space-y-3 mb-5">
          <div>
            <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">TITLE</Label>
            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Post headline" className="mt-1 bg-input border-border" />
          </div>
          <div>
            <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">DATE</Label>
            <Input value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} placeholder="e.g. Jan 15, 2025" className="mt-1 bg-input border-border" />
          </div>
          <div>
            <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">BODY</Label>
            <Textarea value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} placeholder="Write your news post..." className="mt-1 bg-input border-border min-h-[100px]" />
          </div>
          <Button type="submit" disabled={addNews.isPending} className="bg-gold text-background hover:bg-gold/90 font-display font-bold">
            {addNews.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Add Post
          </Button>
        </form>
      )}

      <Separator className="mb-4 bg-border" />

      {posts && posts.length > 0 ? (
        <div className="space-y-2">
          {posts.map((post: NewsPost) => (
            <div key={String(post.id)} className="flex items-start justify-between gap-3 bg-background/30 rounded px-3 py-2">
              <div className="min-w-0">
                <p className="font-body font-semibold text-foreground text-sm truncate">{post.title}</p>
                <p className="text-xs text-muted-foreground">{post.date}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(post)} className="text-gold hover:bg-gold/10">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleRemove(post.id)} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground font-body text-center py-4">No news posts yet.</p>
      )}
    </AdminSection>
  );
}

// ── Team Info Section ────────────────────────────────────────────────────────

function TeamInfoSection({ password }: { password: string }) {
  const { data: teamInfo } = useTeamInfo();
  const updateTeamInfo = useUpdateTeamInfo();

  const [form, setForm] = useState({
    wins: "",
    losses: "",
    overtimeLosses: "",
    points: "",
    leaguePosition: "",
  });
  const [initialized, setInitialized] = useState(false);

  if (teamInfo && !initialized) {
    setInitialized(true);
    setForm({
      wins: String(Number(teamInfo.wins)),
      losses: String(Number(teamInfo.losses)),
      overtimeLosses: String(Number(teamInfo.overtimeLosses)),
      points: String(Number(teamInfo.points)),
      leaguePosition: String(Number(teamInfo.leaguePosition)),
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseInt(form.wins);
    const l = parseInt(form.losses);
    const otl = parseInt(form.overtimeLosses);
    const pts = parseInt(form.points);
    const pos = parseInt(form.leaguePosition);
    if ([w, l, otl, pts, pos].some(isNaN)) { toast.error("All fields must be numbers"); return; }
    try {
      await updateTeamInfo.mutateAsync({
        wins: BigInt(w),
        losses: BigInt(l),
        overtimeLosses: BigInt(otl),
        points: BigInt(pts),
        leaguePosition: BigInt(pos),
        password,
      });
      toast.success("Team info updated");
    } catch {
      toast.error("Failed to update team info — check your password");
    }
  };

  const fields = [
    { key: "wins", label: "WINS" },
    { key: "losses", label: "LOSSES" },
    { key: "overtimeLosses", label: "OTL" },
    { key: "points", label: "POINTS" },
    { key: "leaguePosition", label: "LEAGUE POSITION" },
  ] as const;

  return (
    <AdminSection icon={<Trophy className="w-5 h-5" />} title="TEAM INFO">
      <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {fields.map(({ key, label }) => (
          <div key={key}>
            <Label className="font-display font-bold text-xs tracking-wide text-muted-foreground">{label}</Label>
            <Input
              type="number"
              min="0"
              value={form[key]}
              onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
              className="mt-1 bg-input border-border"
            />
          </div>
        ))}
        <div className="col-span-2 sm:col-span-3">
          <Button type="submit" disabled={updateTeamInfo.isPending} className="bg-gold text-background hover:bg-gold/90 font-display font-bold">
            {updateTeamInfo.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Update Team Info
          </Button>
        </div>
      </form>
    </AdminSection>
  );
}

// ── Admin Page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(null);

  if (!password) {
    return <PasswordGate onAuthenticated={setPassword} />;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 md:py-14">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-gold" />
            <span className="font-display font-bold text-xs tracking-widest text-gold">AUTHENTICATED</span>
          </div>
          <h1 className="font-display text-4xl font-black text-foreground">ADMIN PANEL</h1>
          <div className="h-1 w-20 bg-gold mt-3" />
        </div>
        <Button type="button" variant="ghost" onClick={() => setPassword(null)} className="text-muted-foreground hover:text-foreground font-display font-bold text-sm">
          <Lock className="w-4 h-4 mr-2" />
          Lock
        </Button>
      </div>

      <PlayersSection password={password} />
      <GamesSection password={password} />
      <NewsSection password={password} />
      <TeamInfoSection password={password} />
    </main>
  );
}
