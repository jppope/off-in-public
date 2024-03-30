export function TrueShooting(points: number, fga: number, fta: number): string {
    if (fga + fta === 0) {
      return "N/A"; // Avoid division by zero; applicable if no attempts are made.
    }
  
    const tsp = (points / (2 * (fga + 0.44 * fta))) * 100;
    return tsp.toFixed(2) + '%'; // Returns the TSP as a percentage string rounded to two decimal places.
  }
  
  export function playerEfficiencyRating(stats: PlayerStats): number {
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