import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Player {
    age: bigint;
    weight: string;
    height: string;
    maxPrepsUrl?: string;
    name: string;
    hometown: string;
    number: bigint;
    eliteProspectsUrl?: string;
    photo: string;
    position: string;
}
export interface Game {
    id: bigint;
    isCompleted: boolean;
    date: string;
    isHome: boolean;
    homeScore?: bigint;
    awayScore?: bigint;
    location: string;
    opponent: string;
}
export interface TeamInfo {
    leaguePosition: bigint;
    wins: bigint;
    losses: bigint;
    overtimeLosses: bigint;
    points: bigint;
}
export interface PlayerStats {
    gamesPlayed: bigint;
    assists: bigint;
    goals: bigint;
    playerNumber: bigint;
}
export interface NewsPost {
    id: bigint;
    title: string;
    body: string;
    date: string;
}
export interface backendInterface {
    addGame(date: string, opponent: string, location: string, isHome: boolean, password: string): Promise<void>;
    addNewsPost(title: string, body: string, date: string, password: string): Promise<void>;
    addPlayer(number: bigint, name: string, position: string, photo: string, height: string, weight: string, age: bigint, hometown: string, maxPrepsUrl: string | null, eliteProspectsUrl: string | null, password: string): Promise<void>;
    changePassword(oldPassword: string, newPassword: string): Promise<void>;
    getCompletedGames(): Promise<Array<Game>>;
    getGames(): Promise<Array<Game>>;
    getLatestNews(count: bigint): Promise<Array<NewsPost>>;
    getNewsPosts(): Promise<Array<NewsPost>>;
    getPlayerStats(): Promise<Array<PlayerStats>>;
    getPlayerStatsByNumber(playerNumber: bigint): Promise<PlayerStats | null>;
    getPlayers(): Promise<Array<Player>>;
    getTeamInfo(): Promise<TeamInfo>;
    getUpcomingGames(): Promise<Array<Game>>;
    removeGame(id: bigint, password: string): Promise<void>;
    removeNewsPost(id: bigint, password: string): Promise<void>;
    removePlayer(number: bigint, password: string): Promise<void>;
    setPlayerStats(playerNumber: bigint, goals: bigint, assists: bigint, gamesPlayed: bigint, password: string): Promise<void>;
    updateGameScores(id: bigint, homeScore: bigint, awayScore: bigint, isCompleted: boolean, password: string): Promise<void>;
    updateNewsPost(id: bigint, title: string, body: string, date: string, password: string): Promise<void>;
    updatePlayer(number: bigint, name: string, position: string, photo: string, height: string, weight: string, age: bigint, hometown: string, maxPrepsUrl: string | null, eliteProspectsUrl: string | null, password: string): Promise<void>;
    updateTeamInfo(wins: bigint, losses: bigint, overtimeLosses: bigint, points: bigint, leaguePosition: bigint, password: string): Promise<void>;
}
