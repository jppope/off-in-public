import { parse } from "https://deno.land/std@0.219.0/csv/mod.ts";
import { getEvents } from "./_utils.ts";
import { buildTeamStats, AdvancedStats } from "./_utils.ts";
import { calculateAllPlayTimes } from "./_playingTime.ts";
import { Stats } from "./stats.t.ts";

async function processCsv(
  inputFilePath: string,
  outputFilePath: string,
): Promise<any> {
  const content = await Deno.readTextFile(inputFilePath);
  const rows: any[] = await parse(content);
  const column_names = rows.shift();

  const events = getEvents(column_names, rows);
  const stats = buildTeamStats(events);
  const minutes = calculateAllPlayTimes(events);
  console.log(minutes);

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

  return csvString;
}

const inputFilePath = "./files/2025-07-17.csv";
const outputFilePath = "./boxScores/2025/2025-07-17.csv";

processCsv(inputFilePath, outputFilePath)
  .then((csv) =>  Deno.writeTextFile(outputFilePath, csv))
  .then(() => console.log("CSV processing complete."))
  .catch((error) => console.error(error));
