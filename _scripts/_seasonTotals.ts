import { parse } from "https://deno.land/std@0.219.0/csv/mod.ts";
import { a } from "https://dev.jspm.io/npm:@jspm/core@2.0.1/_/a421dfba.js";

const a_team = [    
    '2024-03-06',
    '2024-03-13',
    '2024-03-20',
    '2024-03-27',
    '2024-04-03',
    '2024-04-10',
    '2024-04-17',
    '2024-04-24',
    '2024-05-01',
    '2024-05-08',
    '2024-05-15',
]

const b_team = [
    '2024-03-07',
    '2024-03-14',
    '2024-03-21',
    '2024-03-28',
    '2024-04-04',
    '2024-04-11',
    '2024-04-18',
    '2024-04-25',
    '2024-05-02',
    '2024-05-09',
    '2024-05-16',    
]

// Function to read all files in a specified directory and parse them as CSV
async function readAndParseCSVFiles(directory: string): Promise<any[]> {
    const a_team_data: any[] = [];
    const b_team_data: any[] = [];

    const columns = []

    // Loop through all entries in the directory
    for await (const entry of Deno.readDir(directory)) {
        if (entry.isFile && entry.name.endsWith('.csv')) {
            const date = entry.name.split('.csv')[0];
            const filePath = `${directory}/${entry.name}`;
            const content = await Deno.readTextFile(filePath);
            // console.log(content);
            try {
                const rows: any[] = await parse(content);
                const column_names = rows.shift();
                // add new headers to the headers array, make into a set
                columns.push(...column_names);                
                // console.log(columns);
                const parsedData = rows.map(row => {
                    const obj = {};
                    for (let i = 0; i < column_names.length; i++) {
                        obj[column_names[i]] = row[i];
                    }
                    // add a property of minutes to the object. all records should have 27 minutes
                    obj['min'] = 27;
                    return obj;
                });

                if(a_team.includes(date)){
                    a_team_data.push(parsedData);
                }

                if(b_team.includes(date)){
                    b_team_data.push(parsedData);
                }

            } catch (error) {
                console.error(`Error parsing ${entry.name}: ${error.message}`);
            }
        }
    }

    // make sure headers are a set/unique
    const headers = new Set(columns);    
    console.log(headers);

    const playerStats: { [key: string]: any } = {}

    a_team_data
        .flat()
        .forEach(row => {
            const player = row['player'];
            if (!playerStats[player]) {
                playerStats[player] = {
                    minutes: 0,
                    points: 0,
                    rebounds: 0,
                    "2pt_attempts": 0,
                    "2pt_made": 0,
                    "3pt_attempts": 0,
                    "3pt_made": 0,
                    eFG: 0,
                    trueShooting: 0,
                    offensive_rebounds: 0,
                    defensive_rebounds: 0,
                    assists: 0,
                    steals: 0,
                    blocks: 0,
                    turnovers: 0,
                    PER: 0,
                };
            }
            playerStats[player].minutes += parseInt(row['min'], 10);
            playerStats[player].points += parseInt(row['points'], 10);
            playerStats[player].rebounds += parseInt(row['rebounds'], 10);
            playerStats[player]["2pt_attempts"] += parseInt(row['2pt_attempts'], 10);
            playerStats[player]["2pt_made"] += parseInt(row['2pt_made'], 10);
            playerStats[player]["3pt_attempts"] += parseInt(row['3pt_attempts'], 10);
            playerStats[player]["3pt_made"] += parseInt(row['3pt_made'], 10);
            // free throws
            playerStats[player]["ft_attempts"] += parseInt(row['ft_attempts'], 10);
            playerStats[player]["ft_made"] += parseInt(row['ft_made'], 10);
            playerStats[player].offensive_rebounds += parseInt(row['oreb'] || row['offensive_rebounds'], 10);
            playerStats[player].defensive_rebounds += parseInt(row['dreb'] || row['defensive_rebounds'], 10);
            playerStats[player].assists += parseInt(row['assists'], 10);
            playerStats[player].steals += parseInt(row['steals'], 10);
            playerStats[player].blocks += parseInt(row['blocks'], 10);
            playerStats[player].turnovers += parseInt(row['turnovers'], 10);
        });
    console.log(playerStats);

    return playerStats
}

// Main function to process the data
async function processCSVFiles(directory: string) {
    const parsedFiles = await readAndParseCSVFiles(directory);
    // console.log(parsedFiles); // This will log the parsed data from all CSV files
}


// Replace '/path/to/your/csv/directory' with the actual directory path
processCSVFiles('./boxScores');
