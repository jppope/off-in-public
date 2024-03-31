import { parse } from "https://deno.land/std@0.219.0/csv/mod.ts";
import { buildEvents, TrueShooting, playerEfficiencyRating } from "./_utils.ts";
import { PlayerStats, buildTeamStats } from "./_utils.ts";
import { Event, calculateAllPlayTimes } from "./_playingTime.ts";

async function processCsv(
  inputFilePath: string,
  outputFilePath: string,
): Promise<void> {
  const content = await Deno.readTextFile(inputFilePath);
  const rows: any[] = await parse(content);
  const column_names = rows.shift();

  const events = buildEvents(column_names, rows);
  
  console.log(events);


  const stats = buildTeamStats(events);
  // const minutes = calculateAllPlayTimes(events);
  // console.log(minutes);

  function AdvancedStats(playerStats: any){
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
  const offInPublicStats = AdvancedStats(stats.offInPublic);
  const awayStats = AdvancedStats(stats.away);

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

  for (const [player, stats] of Object.entries(offInPublicStats)) {
    const row = [
      player,
      ...headers.slice(1).map((header) => stats[header]?.toString() || "0"),
    ].join(",");
    console.log(row);
    csvString += row + "\n";
  }

  console.log("\n");

  for (const [player, stats] of Object.entries(awayStats)) {
    const row = [
      player,
      ...headers.slice(1).map((header) => stats[header]?.toString() || "0"),
    ].join(",");
    console.log(row);
    csvString += row + "\n";
  }

  // Writing the CSV string to a file
  // await Deno.writeTextFile(outputFilePath, csvString);
  console.log("CSV file has been created.");
}

const inputFilePath = "./files/2024-03-27.csv";
const outputFilePath = "./boxScores/2024-03-27.csv";

processCsv(inputFilePath, outputFilePath).then(() =>
  console.log("CSV processing complete.")
);
