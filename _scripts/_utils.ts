import { Event } from "./_playingTime.ts";
import { Stats } from "./stats.t.ts";

export const headers = [
  "player",
  "points",
  "rebounds",
  "2pt_attempts",
  "2pt_made",
  "3pt_attempts",
  "3pt_made",
  "ft_attempts",
  "ft_made",
  "eFG",
  "trueShooting",
  "offensive_rebounds",
  "defensive_rebounds",
  "assists",
  "steals",
  "blocks",
  "turnovers",
  "PER",
];

const roster = [
  "pope",
  "ev",
  "kelo",
  "chosen",
  "dom",
  "eman",
  "chris",
  "nick",
  "jared",
  "trev",
  "cordell",
  "dylan",
  "norm",
  "tariq",
  "tyriq",
  "riq",
  "riq2",
  "cheihk",
  "ryan",
  "jeff",
  "joey",
  "josh",
  "jason",
  "eman's guy",
  "cordell's buddy",
  "---"
]

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
    charge: 0,
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

export function buildTeamStats(events: any[], game: string) : Record<string, Record<string, PlayerStats>> {
  // Create a dictionary to store player stats
  const teamStats: Record<string, Record<string, PlayerStats>> = {
    offInPublic: {},
    away: {},
  };

  for (let i = 0; i < events.length; i++) {
    const row = events[i];
    switch (row.team) {
      case "Off in Public":
        row.team = 0;
        break;
      case "off in public":
        row.team = 0;
        break;
      case "0":
        row.team = 0;
        break;
      case 0:
        row.team = 0;
        break;       
      case "Away":
        row.team = 1;
        break;
      case "1":
        row.team = 1;
        break;
      case 1:
        row.team = 1;
        break;                   
      default:
        row.team = 1;
        // console.log(`Unknown team: ${row.team}`);
    }

    const team = row.team === 0 ? "offInPublic" : "away";
    
    const player: string = row.player.toLowerCase().trim();
    if (player === "3pt_made") {
      console.log(`Game: ${game} | '${player}' was not found in the roster. ${JSON.stringify(row)}`)
    }

    if(!roster.includes(player) && team === "offInPublic"){
      console.log(`Game: ${game} | '${player}' was not found in the roster. ${JSON.stringify(row)}`)
    }

    if (!teamStats[team][player]) {
      teamStats[team][player] = PlayerStats();
    }

    if (row.event.trim() === "2pt_attempt") {
      teamStats[team][player]["2pt_attempts"]++;
    }

    if (row.event.trim() === "2pt_made") {
      teamStats[team][player]["points"] += 2;
      teamStats[team][player]["2pt_made"]++;
    }

    if (row.event.trim() === "3pt_attempt") {
      teamStats[team][player]["3pt_attempts"]++;
    }

    if (row.event.trim() === "3pt_made") {
      teamStats[team][player]["points"] += 3;
      teamStats[team][player]["3pt_made"]++;
    }

    if (row.event.trim() === "ft_attempt") {
      teamStats[team][player]["ft_attempts"]++;
    }

    if (row.event.trim() === "ft_made") {
      teamStats[team][player]["points"] += 1;
      teamStats[team][player]["ft_made"]++;
    }

    if (row.event.trim() === "offensive_rebound" || row.event.trim() === "oreb") {
      teamStats[team][player]["offensive_rebounds"]++;
      teamStats[team][player]["rebounds"]++;
    }

    if (row.event.trim() === "defensive_rebound" || row.event.trim() === "dreb") {
      teamStats[team][player]["defensive_rebounds"]++;
      teamStats[team][player]["rebounds"]++;
    }

    if (row.event.trim() === "assist") {
      teamStats[team][player]["assists"]++;
    }

    if (row.event.trim() === "steal") {
      teamStats[team][player]["steals"]++;
    }

    if (row.event.trim() === "block") {
      teamStats[team][player]["blocks"]++;
    }

    if (row.event.trim() === "turnover") {
      teamStats[team][player]["turnovers"]++;
    }

    if (row.event.trim() === "foul") {
      teamStats[team][player]["fouls"]++;
    }

    if (row.event.trim() === "charge") {
      teamStats[team][player]["charge"]++;
    }

    if (
      row.event.trim() !== "2pt_attempt" &&
      row.event.trim() !== "2pt_made" &&
      row.event.trim() !== "3pt_attempt" &&
      row.event.trim() !== "3pt_made" &&
      row.event.trim() !== "ft_attempt" &&
      row.event.trim() !== "ft_made" &&
      row.event.trim() !== "offensive_rebound" &&
      row.event.trim() !== "oreb" &&
      row.event.trim() !== "defensive_rebound" &&
      row.event.trim() !== "dreb" &&
      row.event.trim() !== "assist" &&
      row.event.trim() !== "steal" &&
      row.event.trim() !== "block" &&
      row.event.trim() !== "turnover" &&
      row.event.trim() !== "foul" &&
      row.event.trim() !== "---" &&
      row.event.trim() !== "charge"
    ) {
      console.log(`Unknown event: ${Object.entries(row).join(", ")}`);
      // throw new Error(`Unknown event: ${row.event}`);
    }
  }
  delete teamStats.offInPublic["---"];
  return teamStats;
}

export const assignMinutes = (stats: any) => {
  const numberOfPlayers = Object.keys(stats).length;
  const totalMinutes = 200;
  const minutesPerPlayer = parseInt((totalMinutes / numberOfPlayers).toFixed(0)) + 1;
  const statsWithMinutes = {};
  for (const player in stats) {
    statsWithMinutes[player] = { ...stats[player], minutes: minutesPerPlayer };
  }
  return statsWithMinutes;
};

export function trueShooting(points: number, fga: number, fta: number): number {
  const denominator = 2 * (fga + 0.44 * fta);
  if (denominator === 0) return 0;
  return points / denominator;
}

export function playerEfficiencyRating(stats: PlayerStats): number {
  
  if(stats.minutes <= 0){
    console.log(`Player: ${stats.player} has 0 minutes`)
  }

  // Calculate missed shots: Total attempts minus total made shots
  const missedShots = (stats["2pt_attempts"] - stats["2pt_made"]) + (stats["3pt_attempts"] - stats["3pt_made"]);

  // Calculate the divisor to avoid division by zero. This represents the total impact actions.
  const divisor = stats.points + missedShots + stats.turnovers;

  if (divisor <= 0) {
    return 0;
  }

  const rawPer =
    (stats.points + stats.rebounds + stats.assists + stats.steals +
      stats.blocks + stats.charge - missedShots - stats.turnovers) / divisor;

  // Introduce a scaling factor to adjust the PER range
  const scale = 8; // Adjusted for competitive recreational league
  const scaledPer = rawPer * scale;

  return scaledPer;
}

export function AdvancedStats(playerStats: Stats){
  const players = Object.entries(playerStats)
  for(let i = 0; i < players.length; i++){
    const [player, stats] = players[i];
    // console.log(player, stats)
    stats.eFG = ((stats["2pt_made"] + stats["3pt_made"]) > 0) ? ((stats["2pt_made"] + 1.5 * stats["3pt_made"]) / (stats["2pt_made"] + stats["2pt_attempts"] + stats["3pt_made"] + stats["3pt_attempts"])) : 0;    
    const fga = stats["2pt_attempts"] + stats["2pt_made"] + stats["3pt_attempts"] + stats["3pt_made"];
    stats.trueShooting = trueShooting(stats.points, fga, stats.ft_attempts);
    stats.PER = playerEfficiencyRating(stats);
    playerStats[player] = stats;
  };
  return playerStats;
}