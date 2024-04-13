import { Event } from "./_playingTime.ts";
import { Stats } from "./stats.t.ts";

// Check if you need to specify headers explicitly for your CSV library
export interface PlayerStats {
  minutes: number;
  points: number;
  rebounds: number;
  "2pt_attempts": number;
  "2pt_made": number;
  "3pt_attempts": number;
  "3pt_made": number;
  "ft_attempts": number;
  "ft_made": number;
  eFG: number;
  trueShooting: number;
  offensive_rebounds: number;
  defensive_rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  PER: number; // Add PER to the interface
  [key: string]: number; // Add index signature
}

export function PlayerStats() {
  return {
    minutes: 0,
    PlayerEfficiencyRating: 0,
    points: 0,
    rebounds: 0,
    "2pt_attempts": 0,
    "2pt_made": 0,
    "3pt_attempts": 0,
    "3pt_made": 0,
    "ft_attempts": 0,
    "ft_made": 0,
    eFG: 0,
    offensive_rebounds: 0,
    defensive_rebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    fouls: 0,
    trueShooting: 0,
    PER: 0,
  };
}

export function getEvents(column_names: any, rows: any) : Event[] {
  const events: Event[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const event: Event = {
      half: row[0],
      time: row[1],
      team: row[2],
      player: row[3],
      event: row[4],
      against: row[5],
      notes: row[6],
    }; 
    events.push(event);
  }
  return events;
}

export function buildTeamStats(events: any[]) {
  // Create a dictionary to store player stats
  const teamStats: Record<string, Record<string, PlayerStats>> = {
    offInPublic: {},
    away: {},
  };

  for (let i = 0; i < events.length; i++) {
    const row = events[i];

    // which team?
    const team = `${row.team}`.toLowerCase() === "off in public" ? "offInPublic" : "away";
    const player: string = row.player.toLowerCase().trim();

    if (!teamStats[team][player]) {
      teamStats[team][player] = PlayerStats();
    }

    if (row.event === "2pt_attempt") {
      teamStats[team][player]["2pt_attempts"]++;
    }

    if (row.event === "2pt_made") {
      teamStats[team][player]["points"] += 2;
      teamStats[team][player]["2pt_made"]++;
    }

    if (row.event === "3pt_attempt") {
      teamStats[team][player]["3pt_attempts"]++;
    }

    if (row.event === "3pt_made") {
      teamStats[team][player]["points"] += 3;
      teamStats[team][player]["3pt_made"]++;
    }

    if (row.event === "ft_attempt") {
      teamStats[team][player]["ft_attempts"]++;
    }

    if (row.event === "ft_made") {
      teamStats[team][player]["points"] += 1;
      teamStats[team][player]["ft_made"]++;
    }

    if (row.event === "offensive_rebound" || row.event === "oreb") {
      teamStats[team][player]["offensive_rebounds"]++;
      teamStats[team][player]["rebounds"]++;
    }

    if (row.event === "defensive_rebound" || row.event === "dreb") {
      teamStats[team][player]["defensive_rebounds"]++;
      teamStats[team][player]["rebounds"]++;
    }

    if (row.event === "assist") {
      teamStats[team][player]["assists"]++;
    }

    if (row.event === "steal") {
      teamStats[team][player]["steals"]++;
    }

    if (row.event === "block") {
      teamStats[team][player]["blocks"]++;
    }

    if (row.event === "turnover") {
      teamStats[team][player]["turnovers"]++;
    }

    if (row.event === "foul") {
      teamStats[team][player]["fouls"]++;
    }

    if (
      row.event !== "2pt_attempt" &&
      row.event !== "2pt_made" &&
      row.event !== "3pt_attempt" &&
      row.event !== "3pt_made" &&
      row.event !== "ft_attempt" &&
      row.event !== "ft_made" &&
      row.event !== "offensive_rebound" &&
      row.event !== "oreb" &&
      row.event !== "defensive_rebound" &&
      row.event !== "dreb" &&
      row.event !== "assist" &&
      row.event !== "steal" &&
      row.event !== "block" &&
      row.event !== "turnover" &&
      row.event !== "foul"
    ) {
      console.log(`Unknown event: ${row.event}`);
    }
  }

  return teamStats;
}

export function TrueShooting(points: number, fga: number, fta: number): string {
  if (fga + fta === 0) {
    return "N/A"; // Avoid division by zero; applicable if no attempts are made.
  }

  const tsp = (points / (2 * (fga + 0.44 * fta))) * 100;
  return tsp.toFixed(2) + "%"; // Returns the TSP as a percentage string rounded to two decimal places.
}

export function playerEfficiencyRating(stats: PlayerStats): number {
  // Calculate missed shots: Total attempts minus total made shots
  const missedShots = stats["2pt_attempts"] + stats["3pt_attempts"];

  // Calculate the divisor to avoid division by zero. This represents the total impact actions.
  const divisor = stats.points + missedShots + stats.turnovers;

  if (divisor <= 0) {
    return 0;
  }

  const rawPer =
    (stats.points + stats.rebounds + stats.assists + stats.steals +
      stats.blocks - missedShots - stats.turnovers) / divisor;

  // Introduce a scaling factor to adjust the PER range
  const scale = 15; // This is a placeholder; adjust based on your data set and desired range
  const scaledPer = rawPer * scale;

  return scaledPer;
}

export function AdvancedStats(playerStats: Stats){
  const players = Object.entries(playerStats)
  for(let i = 0; i < players.length; i++){
    const [player, stats] = players[i];
    console.log(player, stats)
    stats.eFG = ((stats["2pt_made"] + stats["3pt_made"]) > 0) ? ((stats["2pt_made"] + 1.5 * stats["3pt_made"]) / (stats["2pt_made"] + stats["2pt_attempts"] + stats["3pt_made"] + stats["3pt_attempts"])) : 0;    
    const fga = stats["2pt_attempts"] + stats["2pt_made"] + stats["3pt_attempts"] + stats["3pt_made"];
    // stats.trueShooting = TrueShooting(stats.points, fga, stats["ft_attempts"] + stats["ft_made"]) 
    stats.PER = playerEfficiencyRating(stats);
    playerStats[player] = stats;
  };
  return playerStats;
}