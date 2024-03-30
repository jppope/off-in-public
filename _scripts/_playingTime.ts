export interface Event {
  half: number;
  time: string; // Format "MM:SS:XXX"
  team: string;
  player: string;
  event: string;
  against?: string;
  notes?: string;
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
              playerEvents[player].push(event);
          });
      }
  });

  // Sort events for each player by time
  Object.values(playerEvents).forEach(playerEventList => {
      playerEventList.sort((a, b) => convertTimeToMinutes(a.time) - convertTimeToMinutes(b.time));
  });

  return playerEvents;
}

function calculatePlayerPlayTime(playerEvents: Event[]): number {
  let totalMinutes = 0;
  let lastCheckInTime = 0;
  let inPlay = false;
  let timeouts = [];

  playerEvents.forEach(event => {
      const currentTime = convertTimeToMinutes(event.time);
      if (event.event === 'checked_in' && !inPlay) {
          lastCheckInTime = currentTime;
          inPlay = true;
      } else if (event.event === 'checked_out' && inPlay) {
          totalMinutes += currentTime - lastCheckInTime - timeouts.reduce((acc, cur) => acc + cur, 0);
          inPlay = false;
          timeouts = []; // Reset timeouts after calculating playtime
      } else if (event.event === 'timeout' && inPlay) {
          // Record timeout start
          timeouts.push(-currentTime);
      } else if (event.event === 'timestart' && timeouts.length > 0) {
          // End the last timeout period
          timeouts[timeouts.length - 1] += currentTime;
      }
  });

  // Handle edge case where player does not check out
  if (inPlay) {
      console.log(`Player did not check out. Assuming end of last event as checkout.`);
      const lastEventTime = convertTimeToMinutes(playerEvents[playerEvents.length - 1].time);
      totalMinutes += lastEventTime - lastCheckInTime - timeouts.reduce((acc, cur) => acc + cur, 0);
  }

  return totalMinutes;
}

export function calculateAllPlayTimes(events: Event[]): Record<string, number> {
  const isolatedEvents = isolatePlayerEvents(events);
  const playTimes: Record<string, number> = {};

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
