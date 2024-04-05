type Event = {
  half: number;
  time: string; // Format "MM:SS:XXX"
  team: string;
  player: string;
  event: string;
};

function convertTimeToMinutes(time: string): number {
  const [minutes, seconds] = time.split(':').map(part => parseInt(part, 10));
  return minutes + seconds / 60;
}

function isolatePlayerEvents(events: Event[]): Record<string, Event[]> {
  const playerEvents: Record<string, Event[]> = {};
  events.forEach(event => {
      if (event.player) {
          if (!playerEvents[event.player]) {
              playerEvents[event.player] = [];
          }
          playerEvents[event.player].push(event);
      } else {
          // For global events like timeouts, add them to all players' event lists
          Object.keys(playerEvents).forEach(player => {
              playerEvents[player].push({...event, player}); // Mark global events with player's name for uniform processing
          });
      }
  });

  // Sort events for each player by time and half
  Object.values(playerEvents).forEach(playerEventList => {
      playerEventList.sort((a, b) => a.half !== b.half ? a.half - b.half : convertTimeToMinutes(a.time) - convertTimeToMinutes(b.time));
  });

  return playerEvents;
}

function calculatePlayerPlayTime(playerEvents: Event[]): { total: number; byHalf: Record<number, number> } {
  let totalTime = 0;
  const timeByHalf: Record<number, number> = {};
  let lastCheckInTime = 0;
  let inPlay = false;
  let currentHalf = 0;

  playerEvents.forEach(event => {
      const currentTime = convertTimeToMinutes(event.time);
      if (event.event === 'checked_in') {
          lastCheckInTime = currentTime;
          inPlay = true;
          currentHalf = event.half;
      } else if (event.event === 'checked_out' && inPlay) {
          const playTime = currentTime - lastCheckInTime;
          totalTime += playTime;
          timeByHalf[currentHalf] = (timeByHalf[currentHalf] || 0) + playTime;
          inPlay = false;
      }
  });

  // Handle edge case for player not checking out
  if (inPlay) {
      console.log(`Player ${playerEvents[0].player} did not check out from half ${currentHalf}.`);
      // Assume end of the half for checkout, typically 20 minutes per half in format MM:SS:XXX
      const assumedCheckoutTime = 20;
      const playTime = assumedCheckoutTime - lastCheckInTime;
      totalTime += playTime;
      timeByHalf[currentHalf] = (timeByHalf[currentHalf] || 0) + playTime;
  }

  return { total: totalTime, byHalf: timeByHalf };
}

export function calculateAllPlayTimes(events: Event[]): Record<string, { total: number; byHalf: Record<number, number> }> {
  const isolatedEvents = isolatePlayerEvents(events);
  console.log(isolatedEvents)
  const playTimes: Record<string, { total: number; byHalf: Record<number, number> }> = {};

  Object.keys(isolatedEvents).forEach(player => {
      playTimes[player] = calculatePlayerPlayTime(isolatedEvents[player]);
  });

  return playTimes;
}


// Example usage
const events: Event[] = [
  { half: 3, time: '0:00:000', team: 'off in public', player: 'ev', event: 'checked_in' },
  { half: 3, time: '0:00:000', team: 'off in public', player: 'john', event: 'checked_in' },
  { half: 3, time: '3:07:000', team: 'off in public', player: '', event: 'timeout' },
  { half: 3, time: '4:00:000', team: 'off in public', player: '', event: 'timestart' },
  { half: 3, time: '4:30:000', team: 'let it fly', player: 'ev', event: 'checked_out' },
  { half: 3, time: '5:00:000', team: 'off in public', player: 'john', event: 'checked_out' },
];

console.log(calculateAllPlayTimes(events));
