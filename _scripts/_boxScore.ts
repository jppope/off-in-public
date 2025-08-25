import { parse } from "https://deno.land/std@0.219.0/csv/mod.ts";
import { getEvents } from "./_utils.ts";
import { buildTeamStats, AdvancedStats } from "./_utils.ts";
import { calculateAllPlayTimes } from "./_playingTime.ts";
import { Stats } from "./stats.t.ts";

async function processCsv(
  inputFilePath: string,
  date: string,
): Promise<void> {
  const content = await Deno.readTextFile(inputFilePath);
  const rows: any[] = await parse(content);
  const column_names = rows.shift();

  const events = getEvents(column_names, rows);
  const stats = buildTeamStats(events, date);
  const minutes = calculateAllPlayTimes(events);
  console.log(`Processing ${date}:`, minutes);

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

  // Create separate CSV for home team (Off in Public)
  let homeCsvString = headers.join(",") + "\n";
  for (const [player, stats] of Object.entries(offInPublicStats)) {
    const row = [
      player,
      ...headers.slice(1).map((header) => stats[header]?.toString() || "0"),
    ].join(",");
    homeCsvString += row + "\n";
  }

  // Create separate CSV for away team
  let awayCsvString = headers.join(",") + "\n";
  for (const [player, stats] of Object.entries(awayStats)) {
    const row = [
      player,
      ...headers.slice(1).map((header) => stats[header]?.toString() || "0"),
    ].join(",");
    awayCsvString += row + "\n";
  }

  // Write separate files
  const year = date.split('-')[0];
  await Deno.mkdir(`./boxScores/${year}`, { recursive: true });
  
  const homeOutputPath = `./boxScores/${year}/${date}-home.csv`;
  const awayOutputPath = `./boxScores/${year}/${date}-away.csv`;
  
  await Deno.writeTextFile(homeOutputPath, homeCsvString);
  await Deno.writeTextFile(awayOutputPath, awayCsvString);
  
  console.log(`Generated: ${homeOutputPath} and ${awayOutputPath}`);
}

// Function to get all CSV files from files directory
async function getAllCsvFiles(): Promise<string[]> {
  const csvFiles: string[] = [];
  
  // Skip 2024 files for now due to format differences
  // TODO: Handle 2024 format in future update
  
  // Check root files directory for 2025 files only (skip 2024 for now due to format differences)
  try {
    const filesRoot = Deno.readDir("./files");
    for await (const file of filesRoot) {
      if (file.isFile && file.name.endsWith('.csv') && file.name.startsWith('2025')) {
        csvFiles.push(`./files/${file.name}`);
      }
    }
  } catch (error) {
    console.log("Error reading files directory");
  }
  
  return csvFiles.sort();
}

// Function to extract date from file path
function extractDate(filePath: string): string {
  const fileName = filePath.split('/').pop()!;
  return fileName.replace('.csv', '');
}

// Main execution
async function main() {
  const csvFiles = await getAllCsvFiles();
  console.log(`Found ${csvFiles.length} CSV files to process`);
  
  for (const filePath of csvFiles) {
    try {
      const date = extractDate(filePath);
      console.log(`\nProcessing: ${filePath}`);
      await processCsv(filePath, date);
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }
  
  console.log("\nAll CSV processing complete.");
}

main().catch((error) => console.error(error));
