import { parse } from "https://deno.land/std@0.219.0/csv/mod.ts";

interface PlayerGameStats {
  player: string;
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
  PER: number;
}

interface PlayerSeasonStats {
  player: string;
  games_played: number;
  total_points: number;
  total_rebounds: number;
  total_2pt_attempts: number;
  total_2pt_made: number;
  total_3pt_attempts: number;
  total_3pt_made: number;
  total_ft_attempts: number;
  total_ft_made: number;
  total_offensive_rebounds: number;
  total_defensive_rebounds: number;
  total_assists: number;
  total_steals: number;
  total_blocks: number;
  total_turnovers: number;
  avg_points: number;
  avg_rebounds: number;
  avg_2pt_attempts: number;
  avg_2pt_made: number;
  avg_3pt_attempts: number;
  avg_3pt_made: number;
  avg_ft_attempts: number;
  avg_ft_made: number;
  avg_offensive_rebounds: number;
  avg_defensive_rebounds: number;
  avg_assists: number;
  avg_steals: number;
  avg_blocks: number;
  avg_turnovers: number;
  avg_eFG: number;
  avg_trueShooting: number;
  avg_PER: number;
}

// Function to get all home team box score files for a season
async function getHomeTeamFiles(year: string): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const boxScoreDir = Deno.readDir(`./boxScores/${year}`);
    for await (const file of boxScoreDir) {
      if (file.isFile && file.name.endsWith('-home.csv')) {
        files.push(`./boxScores/${year}/${file.name}`);
      }
    }
  } catch (error) {
    console.log(`Error reading boxScores/${year} directory:`, error);
  }
  
  return files.sort();
}

// Function to parse a single box score CSV file
async function parseBoxScoreFile(filePath: string): Promise<PlayerGameStats[]> {
  const content = await Deno.readTextFile(filePath);
  const rows: any[] = await parse(content);
  const headers = rows.shift();
  
  const gameStats: PlayerGameStats[] = [];
  
  for (const row of rows) {
    if (row[0] && row[0].trim() !== '') { // Skip empty rows
      const stats: PlayerGameStats = {
        player: row[0],
        points: parseFloat(row[1]) || 0,
        rebounds: parseFloat(row[2]) || 0,
        "2pt_attempts": parseFloat(row[3]) || 0,
        "2pt_made": parseFloat(row[4]) || 0,
        "3pt_attempts": parseFloat(row[5]) || 0,
        "3pt_made": parseFloat(row[6]) || 0,
        "ft_attempts": parseFloat(row[7]) || 0,
        "ft_made": parseFloat(row[8]) || 0,
        eFG: parseFloat(row[9]) || 0,
        trueShooting: parseFloat(row[10]) || 0,
        offensive_rebounds: parseFloat(row[11]) || 0,
        defensive_rebounds: parseFloat(row[12]) || 0,
        assists: parseFloat(row[13]) || 0,
        steals: parseFloat(row[14]) || 0,
        blocks: parseFloat(row[15]) || 0,
        turnovers: parseFloat(row[16]) || 0,
        PER: parseFloat(row[17]) || 0,
      };
      gameStats.push(stats);
    }
  }
  
  return gameStats;
}

// Function to calculate season totals and averages
function calculateSeasonStats(allGames: PlayerGameStats[][]): PlayerSeasonStats[] {
  const playerMap = new Map<string, {
    games: PlayerGameStats[];
  }>();
  
  // Group all games by player
  for (const gameData of allGames) {
    for (const playerStats of gameData) {
      if (!playerMap.has(playerStats.player)) {
        playerMap.set(playerStats.player, { games: [] });
      }
      playerMap.get(playerStats.player)!.games.push(playerStats);
    }
  }
  
  // Calculate season stats for each player
  const seasonStats: PlayerSeasonStats[] = [];
  
  for (const [playerName, data] of playerMap) {
    const games = data.games;
    const gamesPlayed = games.length;
    
    if (gamesPlayed === 0) continue;
    
    // Calculate totals
    const totals = {
      points: 0,
      rebounds: 0,
      "2pt_attempts": 0,
      "2pt_made": 0,
      "3pt_attempts": 0,
      "3pt_made": 0,
      "ft_attempts": 0,
      "ft_made": 0,
      offensive_rebounds: 0,
      defensive_rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      eFG: 0,
      trueShooting: 0,
      PER: 0,
    };
    
    for (const game of games) {
      totals.points += game.points;
      totals.rebounds += game.rebounds;
      totals["2pt_attempts"] += game["2pt_attempts"];
      totals["2pt_made"] += game["2pt_made"];
      totals["3pt_attempts"] += game["3pt_attempts"];
      totals["3pt_made"] += game["3pt_made"];
      totals["ft_attempts"] += game["ft_attempts"];
      totals["ft_made"] += game["ft_made"];
      totals.offensive_rebounds += game.offensive_rebounds;
      totals.defensive_rebounds += game.defensive_rebounds;
      totals.assists += game.assists;
      totals.steals += game.steals;
      totals.blocks += game.blocks;
      totals.turnovers += game.turnovers;
      totals.eFG += game.eFG;
      totals.trueShooting += game.trueShooting;
      totals.PER += game.PER;
    }
    
    const playerSeasonStats: PlayerSeasonStats = {
      player: playerName,
      games_played: gamesPlayed,
      total_points: totals.points,
      total_rebounds: totals.rebounds,
      total_2pt_attempts: totals["2pt_attempts"],
      total_2pt_made: totals["2pt_made"],
      total_3pt_attempts: totals["3pt_attempts"],
      total_3pt_made: totals["3pt_made"],
      total_ft_attempts: totals["ft_attempts"],
      total_ft_made: totals["ft_made"],
      total_offensive_rebounds: totals.offensive_rebounds,
      total_defensive_rebounds: totals.defensive_rebounds,
      total_assists: totals.assists,
      total_steals: totals.steals,
      total_blocks: totals.blocks,
      total_turnovers: totals.turnovers,
      avg_points: totals.points / gamesPlayed,
      avg_rebounds: totals.rebounds / gamesPlayed,
      avg_2pt_attempts: totals["2pt_attempts"] / gamesPlayed,
      avg_2pt_made: totals["2pt_made"] / gamesPlayed,
      avg_3pt_attempts: totals["3pt_attempts"] / gamesPlayed,
      avg_3pt_made: totals["3pt_made"] / gamesPlayed,
      avg_ft_attempts: totals["ft_attempts"] / gamesPlayed,
      avg_ft_made: totals["ft_made"] / gamesPlayed,
      avg_offensive_rebounds: totals.offensive_rebounds / gamesPlayed,
      avg_defensive_rebounds: totals.defensive_rebounds / gamesPlayed,
      avg_assists: totals.assists / gamesPlayed,
      avg_steals: totals.steals / gamesPlayed,
      avg_blocks: totals.blocks / gamesPlayed,
      avg_turnovers: totals.turnovers / gamesPlayed,
      avg_eFG: totals.eFG / gamesPlayed,
      avg_trueShooting: totals.trueShooting / gamesPlayed,
      avg_PER: totals.PER / gamesPlayed,
    };
    
    seasonStats.push(playerSeasonStats);
  }
  
  // Sort by total points (descending)
  return seasonStats.sort((a, b) => b.total_points - a.total_points);
}

// Function to generate season stats for a given year
async function generateSeasonStats(year: string): Promise<void> {
  console.log(`Generating season stats for ${year}...`);
  
  const homeTeamFiles = await getHomeTeamFiles(year);
  console.log(`Found ${homeTeamFiles.length} home games for ${year}`);
  
  if (homeTeamFiles.length === 0) {
    console.log(`No home team files found for ${year}`);
    return;
  }
  
  // Parse all box score files
  const allGames: PlayerGameStats[][] = [];
  for (const file of homeTeamFiles) {
    try {
      const gameStats = await parseBoxScoreFile(file);
      allGames.push(gameStats);
      console.log(`Processed: ${file.split('/').pop()}`);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
  
  // Calculate season stats
  const seasonStats = calculateSeasonStats(allGames);
  
  // Prepare CSV content
  const headers = [
    "player",
    "games_played",
    "total_points",
    "total_rebounds", 
    "total_2pt_attempts",
    "total_2pt_made",
    "total_3pt_attempts",
    "total_3pt_made",
    "total_ft_attempts",
    "total_ft_made",
    "total_offensive_rebounds",
    "total_defensive_rebounds",
    "total_assists",
    "total_steals",
    "total_blocks",
    "total_turnovers",
    "avg_points",
    "avg_rebounds",
    "avg_2pt_attempts", 
    "avg_2pt_made",
    "avg_3pt_attempts",
    "avg_3pt_made",
    "avg_ft_attempts",
    "avg_ft_made",
    "avg_offensive_rebounds",
    "avg_defensive_rebounds",
    "avg_assists",
    "avg_steals",
    "avg_blocks",
    "avg_turnovers",
    "avg_eFG",
    "avg_trueShooting",
    "avg_PER",
  ];
  
  let csvContent = headers.join(",") + "\n";
  
  for (const player of seasonStats) {
    const row = [
      player.player,
      player.games_played,
      player.total_points,
      player.total_rebounds,
      player.total_2pt_attempts,
      player.total_2pt_made,
      player.total_3pt_attempts,
      player.total_3pt_made,
      player.total_ft_attempts,
      player.total_ft_made,
      player.total_offensive_rebounds,
      player.total_defensive_rebounds,
      player.total_assists,
      player.total_steals,
      player.total_blocks,
      player.total_turnovers,
      player.avg_points.toFixed(2),
      player.avg_rebounds.toFixed(2),
      player.avg_2pt_attempts.toFixed(2),
      player.avg_2pt_made.toFixed(2),
      player.avg_3pt_attempts.toFixed(2),
      player.avg_3pt_made.toFixed(2),
      player.avg_ft_attempts.toFixed(2),
      player.avg_ft_made.toFixed(2),
      player.avg_offensive_rebounds.toFixed(2),
      player.avg_defensive_rebounds.toFixed(2),
      player.avg_assists.toFixed(2),
      player.avg_steals.toFixed(2),
      player.avg_blocks.toFixed(2),
      player.avg_turnovers.toFixed(2),
      player.avg_eFG.toFixed(4),
      player.avg_trueShooting.toFixed(4),
      player.avg_PER.toFixed(2),
    ].join(",");
    
    csvContent += row + "\n";
  }
  
  // Write season stats file
  const outputPath = `./seasonStats/${year}-season-stats.csv`;
  await Deno.mkdir(`./seasonStats`, { recursive: true });
  await Deno.writeTextFile(outputPath, csvContent);
  
  console.log(`Generated: ${outputPath}`);
  console.log(`Season stats completed for ${year} with ${seasonStats.length} players`);
}

// Main execution
async function main() {
  const years = ["2025"]; // Can be expanded to include other years
  
  for (const year of years) {
    try {
      await generateSeasonStats(year);
    } catch (error) {
      console.error(`Error generating season stats for ${year}:`, error);
    }
  }
}

main().catch((error) => console.error(error));