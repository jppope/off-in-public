import { parse } from "https://deno.land/std@0.219.0/csv/mod.ts";
import { getEvents } from "./_utils.ts";
import { AdvancedStats, buildTeamStats, PlayerStats, assignMinutes } from "./_utils.ts";

const team = [];

async function processCsv(
  target: string,
): Promise<any> {
  const content = await Deno.readTextFile(`./files/${target}.csv`);

  const rows: any[] = await parse(content);
  const column_names = rows.shift();
  const events = getEvents(column_names, rows);
  const stats = buildTeamStats(events, target);
  const statsWithMinutes = assignMinutes(stats.offInPublic);
  const advancedStats = AdvancedStats(statsWithMinutes);

  // turn stats into jsonl, add player: name, game: date
  return Object.entries(advancedStats).map(([player, stats]) => {
    return {
      player,
      game: target,
      ...stats,
    };
  });
}

const writeBoxScore = async (directory: string, game: string, data: any) => {
  // Prepare season directory
  try {
    Deno.statSync(directory);
  } catch (_e) {
    await Deno.mkdir(directory);
  }

  const headers = Object.keys(data[0]);
  let csvString = headers.join(",") + "\n";

  for (const stats of data) {
    const row = headers.map((header) => {
      // if minutes are 0 make the default 15
      if (header === "minutes" && stats[header] === 0) {
        stats[header] = 15;
      }
      return stats[header].toString();
    });
    csvString += row.join(",") + "\n";
  }

  const seasonOutputFilePath = `boxScores/${game}.csv`;
  await Deno.writeTextFile(seasonOutputFilePath, csvString);
};

const processGames = async (directory: string, start: string, end: string) => {
  let allBoxScores: any = [];

  for await (const dirEntry of Deno.readDir(directory)) {
    if (dirEntry.isFile) {
      const [game, mimeType] = dirEntry.name.split(".");

      const gameDate = new Date(game);
      const startSeason = new Date(start);
      const endSeason = new Date(end);

      if (gameDate < startSeason || gameDate > endSeason) continue;

      if (mimeType === "csv") {
        let records = [] 
        try {
         records = await processCsv(game)
         writeBoxScore("./boxScores", game, records);
        } catch (e) {
            console.error(e);
        }
        allBoxScores = allBoxScores.concat(records);
      }
    }  
  }
  console.log("=====");
  console.log("boxscore lines", allBoxScores.length);
  const team = {};
  for(const record of allBoxScores){
    if(!team[record.player]){
      team[record.player] = PlayerStats();
      team[record.player]['gamesPlayed'] = 1;
    }
    for(const key of Object.keys(record)){
      if(!["player", "game", "PER","PlayerEfficiencyRating","eFG"].includes(key)){
        team[record.player][key] += record[key];
      }
    }
    team[record.player]['gamesPlayed'] += 1;
  }
  // calculate advanced stats for the team
    const advancedStats = AdvancedStats(team);
    // console.log("=====");
    // console.log("Team Advanced Stats");
    console.log(advancedStats);
  
};

const directory = "./files";
// season start/end dates
const start = "2024-06-20";
const end = "2024-09-30";
processGames(directory, start, end);
