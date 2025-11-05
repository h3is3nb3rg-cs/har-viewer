import type { EntryWithMetadata, Timings } from '@types';

export interface WaterfallBar {
  offset: number; // Percentage offset from start
  segments: WaterfallSegment[];
  totalWidth: number; // Percentage width
}

export interface WaterfallSegment {
  type: 'blocked' | 'dns' | 'connect' | 'ssl' | 'send' | 'wait' | 'receive';
  width: number; // Percentage width
  duration: number; // Actual duration in ms
}

export interface WaterfallData {
  entries: EntryWithMetadata[];
  bars: WaterfallBar[];
  startTime: number;
  endTime: number;
  totalDuration: number;
}

export function calculateWaterfallData(entries: EntryWithMetadata[]): WaterfallData {
  if (entries.length === 0) {
    return {
      entries: [],
      bars: [],
      startTime: 0,
      endTime: 0,
      totalDuration: 0,
    };
  }

  // Find the earliest start time across all entries
  const startTimes = entries.map((entry) => new Date(entry.startedDateTime).getTime());
  const startTime = Math.min(...startTimes);

  // Calculate end times for each entry
  const endTimes = entries.map(
    (entry, index) => startTimes[index] + entry.time
  );
  const endTime = Math.max(...endTimes);

  const totalDuration = endTime - startTime;

  // Calculate waterfall bars for each entry
  const bars: WaterfallBar[] = entries.map((entry, index) => {
    const entryStartTime = startTimes[index];
    const offset = ((entryStartTime - startTime) / totalDuration) * 100;

    const segments = calculateSegments(entry.timings, entry.time, totalDuration);
    const totalWidth = (entry.time / totalDuration) * 100;

    return {
      offset,
      segments,
      totalWidth,
    };
  });

  return {
    entries,
    bars,
    startTime,
    endTime,
    totalDuration,
  };
}

function calculateSegments(
  timings: Timings,
  _totalTime: number,
  waterfallTotalDuration: number
): WaterfallSegment[] {
  const segments: WaterfallSegment[] = [];

  // Add segments in order, only if they exist (>= 0)
  const segmentOrder: Array<{
    type: WaterfallSegment['type'];
    duration: number;
  }> = [
    { type: 'blocked', duration: timings.blocked ?? -1 },
    { type: 'dns', duration: timings.dns ?? -1 },
    { type: 'connect', duration: timings.connect ?? -1 },
    { type: 'ssl', duration: timings.ssl ?? -1 },
    { type: 'send', duration: timings.send },
    { type: 'wait', duration: timings.wait },
    { type: 'receive', duration: timings.receive },
  ];

  for (const segment of segmentOrder) {
    if (segment.duration >= 0) {
      const width = (segment.duration / waterfallTotalDuration) * 100;
      segments.push({
        type: segment.type,
        width,
        duration: segment.duration,
      });
    }
  }

  return segments;
}

export function getTimeMarkers(totalDuration: number): Array<{
  position: number;
  label: string;
}> {
  const markers: Array<{ position: number; label: string }> = [];

  // Determine appropriate interval
  let interval: number;
  if (totalDuration < 1000) {
    interval = 100; // 100ms
  } else if (totalDuration < 5000) {
    interval = 500; // 500ms
  } else if (totalDuration < 10000) {
    interval = 1000; // 1s
  } else if (totalDuration < 30000) {
    interval = 5000; // 5s
  } else {
    interval = 10000; // 10s
  }

  for (let time = 0; time <= totalDuration; time += interval) {
    const position = (time / totalDuration) * 100;
    const label = formatTime(time);
    markers.push({ position, label });
  }

  return markers;
}

function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}
