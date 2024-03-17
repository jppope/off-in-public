import { parse, stringify } from "https://deno.land/std@0.219.0/csv/mod.ts";
import { init } from "https://dev.jspm.io/npm:@jspm/core@2.0.1/nodelibs/events";

// Check if you need to specify headers explicitly for your CSV library
interface PlayerStats {
  points: number;
  rebounds: number;
  "2pt_attempts": number;
  "2pt_made": number;
  "3pt_attempts": number;
  "3pt_made": number;
  eFG: number;
  trueFG: number;
  offensive_rebounds: number;
  defensive_rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  PER: number; // Add PER to the interface
  [key: string]: number; // Add index signature
}

function PlayerStats() {
  return {
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
    trueShooting: "N/A",
    offensive_rebounds: 0,
    defensive_rebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    fouls: 0,
  };
}

function TrueShooting(points: number, fga: number, fta: number): string {
  if (fga + fta === 0) {
    return "N/A"; // Avoid division by zero; applicable if no attempts are made.
  }

  const tsp = (points / (2 * (fga + 0.44 * fta))) * 100;
  return tsp.toFixed(2) + '%'; // Returns the TSP as a percentage string rounded to two decimal places.
}

function playerEfficiencyRating(stats: PlayerStats): number {
  // Calculate missed shots: Total attempts minus total made shots
  const missedShots = stats["2pt_attempts"] + stats["3pt_attempts"];

  // Calculate the divisor to avoid division by zero. This represents the total impact actions.
  const divisor = stats.points + missedShots + stats.turnovers;

  if (divisor <= 0) {
    return 0;
  }

  const rawPer = (stats.points + stats.rebounds + stats.assists + stats.steals + stats.blocks - missedShots - stats.turnovers) / divisor;

  // Introduce a scaling factor to adjust the PER range
  const scale = 15; // This is a placeholder; adjust based on your data set and desired range
  const scaledPer = rawPer * scale;

  return scaledPer;
}


async function processCsv(
  inputFilePath: string,
  outputFilePath: string,
): Promise<void> {
  const content = await Deno.readTextFile(inputFilePath);
  const rows: any[] = await parse(content);

  // Create a dictionary to store player stats
  const playerStats: Record<string, PlayerStats> = {};

  const column_names = rows.shift();
  const events: object[] = [];

  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    let event: { [key: string]: any } = {}; // Add type annotation for event object
    for (let j = 0; j < column_names.length; j++) {
      event[column_names[j]] = row[j];
    }
    events.push(event);
  }

  console.log(events);

  events.forEach((row) => {
    if(`${row.team}`.toLowerCase() !== "off in public") return;
    const player: string = row.player.toLowerCase().trim();
    if (!playerStats[player]) {
      playerStats[player] = PlayerStats()
    }
    const stats = playerStats[player];
    switch (row.event) {
      case "2pt_attempt":
        stats["2pt_attempts"]++;
        break;
      case "2pt_made":
        stats.points += 2;
        // stats["2pt_attempts"]++;
        stats["2pt_made"]++;
        break;
      case "3pt_attempt":
        stats["3pt_attempts"]++;
        break;
      case "3pt_made":
        stats.points += 3;
        // stats["3pt_attempts"]++;
        stats["3pt_made"]++;
        break;
      case "ft_attempt":
        stats["ft_attempts"]++;
        break;
      case "ft_made":
        stats.points += 1;
        // stats["ft_attempts"]++;
        stats["ft_made"]++;
        break;
      case "offensive_rebound":
        stats.offensive_rebounds++;
        stats.rebounds++;
        break;
      case "defensive_rebound":
        stats.defensive_rebounds++;
        stats.rebounds++;
        break;
      case "assist":
        stats.assists++;
        break;
      case "steal":
        stats.steals++;
        break;
      case "block":
        stats.blocks++;
        break;
      case "turnover":
        stats.turnovers++;
        break;
      case "foul":
        stats.fouls++;
        break;
      default:
        console.log(`Unknown event: ${row.event}`);
    }
  });

  Object.values(playerStats).forEach((stats) => {
    stats.eFG = ((stats["2pt_made"] + stats["3pt_made"]) > 0) ? ((stats["2pt_made"] + 1.5 * stats["3pt_made"]) / (stats["2pt_made"] + stats["2pt_attempts"] + stats["3pt_made"] + stats["3pt_attempts"])) : 0;
    // stats.trueFG = ((stats["2pt_made"] + stats["2pt_attempts"] + stats["3pt_made"] + stats["3pt_attempts"]+ (0.44 * stats["3pt_made"] + stats["3pt_attempts"])) > 0) ? (stats.points / (2 * (stats["2pt_attempts"] + stats["3pt_attempts"] + 0.44 * stats["3pt_attempts"]))) : 0;
    const fga = stats["2pt_attempts"] + stats["2pt_made"] + stats["3pt_attempts"] + stats["3pt_made"];
    stats.trueShooting = TrueShooting(stats.points, fga, stats["ft_attempts"] + stats["ft_made"]) 
    stats.PER = playerEfficiencyRating(stats);
  });
  

  
  // Prepare CSV content
  const headers = [
    "player",
    "points",
    "rebounds",
    "2pt_attempts",
    "2pt_made",
    "3pt_attempts",
    "3pt_made",
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
  let csvString = headers.join(",") + "\n";

  for (const [player, stats] of Object.entries(playerStats)) {
    const row = [
      player,
      ...headers.slice(1).map((header) => stats[header]?.toString() || "0"),
    ].join(",");
    console.log(row);
    csvString += row + "\n";
  }


  // Writing the CSV string to a file
  await Deno.writeTextFile(outputFilePath, csvString);
  console.log("CSV file has been created.");
}

const inputFilePath = "./files/2024-03-14.csv";
const outputFilePath = "./boxScores/2024-03-14.csv";

processCsv(inputFilePath, outputFilePath).then(() =>
  console.log("CSV processing complete.")
);
