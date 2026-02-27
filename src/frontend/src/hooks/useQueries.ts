import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { Player, Game, TeamInfo, NewsPost, PlayerStats } from "../backend.d";

// ── Queries ─────────────────────────────────────────────────────────────────

export function usePlayers() {
  const { actor, isFetching } = useActor();
  return useQuery<Player[]>({
    queryKey: ["players"],
    queryFn: async () => {
      if (!actor) return [];
      const players = await actor.getPlayers();
      return [...players].sort((a, b) => Number(a.number) - Number(b.number));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpcomingGames() {
  const { actor, isFetching } = useActor();
  return useQuery<Game[]>({
    queryKey: ["upcomingGames"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUpcomingGames();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCompletedGames() {
  const { actor, isFetching } = useActor();
  return useQuery<Game[]>({
    queryKey: ["completedGames"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCompletedGames();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllGames() {
  const { actor, isFetching } = useActor();
  return useQuery<Game[]>({
    queryKey: ["allGames"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGames();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTeamInfo() {
  const { actor, isFetching } = useActor();
  return useQuery<TeamInfo>({
    queryKey: ["teamInfo"],
    queryFn: async () => {
      if (!actor) return { wins: 0n, losses: 0n, overtimeLosses: 0n, points: 0n, leaguePosition: 0n };
      return actor.getTeamInfo();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLatestNews(count: bigint = 2n) {
  const { actor, isFetching } = useActor();
  return useQuery<NewsPost[]>({
    queryKey: ["latestNews", count.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLatestNews(count);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllNews() {
  const { actor, isFetching } = useActor();
  return useQuery<NewsPost[]>({
    queryKey: ["allNews"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNewsPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function usePlayerStats() {
  const { actor, isFetching } = useActor();
  return useQuery<PlayerStats[]>({
    queryKey: ["playerStats"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPlayerStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPlayer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      number, name, position, photo, height, weight, age, hometown, maxPrepsUrl, eliteProspectsUrl, password,
    }: {
      number: bigint; name: string; position: string; photo: string;
      height: string; weight: string; age: bigint; hometown: string;
      maxPrepsUrl: string; eliteProspectsUrl: string; password: string;
    }) => actor!.addPlayer(
      number, name, position, photo, height, weight, age, hometown,
      maxPrepsUrl.trim() || null,
      eliteProspectsUrl.trim() || null,
      password
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["players"] }),
  });
}

export function useUpdatePlayer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      number, name, position, photo, height, weight, age, hometown, maxPrepsUrl, eliteProspectsUrl, password,
    }: {
      number: bigint; name: string; position: string; photo: string;
      height: string; weight: string; age: bigint; hometown: string;
      maxPrepsUrl: string; eliteProspectsUrl: string; password: string;
    }) => actor!.updatePlayer(
      number, name, position, photo, height, weight, age, hometown,
      maxPrepsUrl.trim() || null,
      eliteProspectsUrl.trim() || null,
      password
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["players"] }),
  });
}

export function useSetPlayerStats() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      playerNumber, goals, assists, gamesPlayed, password,
    }: {
      playerNumber: bigint; goals: bigint; assists: bigint; gamesPlayed: bigint; password: string;
    }) => actor!.setPlayerStats(playerNumber, goals, assists, gamesPlayed, password),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playerStats"] }),
  });
}

export function useRemovePlayer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ number, password }: { number: bigint; password: string }) =>
      actor!.removePlayer(number, password),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["players"] }),
  });
}

export function useAddGame() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ date, opponent, location, isHome, password }: {
      date: string; opponent: string; location: string; isHome: boolean; password: string;
    }) => actor!.addGame(date, opponent, location, isHome, password),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allGames"] });
      qc.invalidateQueries({ queryKey: ["upcomingGames"] });
      qc.invalidateQueries({ queryKey: ["completedGames"] });
    },
  });
}

export function useUpdateGameScores() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, homeScore, awayScore, isCompleted, password }: {
      id: bigint; homeScore: bigint; awayScore: bigint; isCompleted: boolean; password: string;
    }) => actor!.updateGameScores(id, homeScore, awayScore, isCompleted, password),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allGames"] });
      qc.invalidateQueries({ queryKey: ["upcomingGames"] });
      qc.invalidateQueries({ queryKey: ["completedGames"] });
    },
  });
}

export function useRemoveGame() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, password }: { id: bigint; password: string }) =>
      actor!.removeGame(id, password),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allGames"] });
      qc.invalidateQueries({ queryKey: ["upcomingGames"] });
      qc.invalidateQueries({ queryKey: ["completedGames"] });
    },
  });
}

export function useAddNewsPost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ title, body, date, password }: { title: string; body: string; date: string; password: string }) =>
      actor!.addNewsPost(title, body, date, password),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allNews"] });
      qc.invalidateQueries({ queryKey: ["latestNews"] });
    },
  });
}

export function useUpdateNewsPost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title, body, date, password }: { id: bigint; title: string; body: string; date: string; password: string }) =>
      actor!.updateNewsPost(id, title, body, date, password),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allNews"] });
      qc.invalidateQueries({ queryKey: ["latestNews"] });
    },
  });
}

export function useRemoveNewsPost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, password }: { id: bigint; password: string }) =>
      actor!.removeNewsPost(id, password),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allNews"] });
      qc.invalidateQueries({ queryKey: ["latestNews"] });
    },
  });
}

export function useUpdateTeamInfo() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ wins, losses, overtimeLosses, points, leaguePosition, password }: {
      wins: bigint; losses: bigint; overtimeLosses: bigint; points: bigint; leaguePosition: bigint; password: string;
    }) => actor!.updateTeamInfo(wins, losses, overtimeLosses, points, leaguePosition, password),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teamInfo"] }),
  });
}
