import { Track } from '../types';

// Simple MIDI writer (Type 1)
export const exportToMidi = (tracks: Track[], bpm: number = 120): Blob => {
  const headerChunk = createMidiHeader(tracks.length);
  const trackChunks = tracks.map(t => createTrackChunk(t, bpm));
  
  const fileData = [headerChunk, ...trackChunks];
  const blob = new Blob(fileData, { type: 'audio/midi' });
  return blob;
};

const stringToBytes = (str: string) => str.split('').map(char => char.charCodeAt(0));

const numberToBytes = (num: number, bytes: number) => {
  const arr = [];
  for (let i = bytes - 1; i >= 0; i--) {
    arr.push((num >> (8 * i)) & 0xFF);
  }
  return arr;
};

const createMidiHeader = (trackCount: number) => {
  const id = stringToBytes('MThd');
  const length = numberToBytes(6, 4);
  const format = numberToBytes(1, 2); // Type 1 (multi-track)
  const tracks = numberToBytes(trackCount, 2);
  const timeDivision = numberToBytes(96, 2); // 96 ticks per quarter note
  
  return new Uint8Array([...id, ...length, ...format, ...tracks, ...timeDivision]);
};

const createTrackChunk = (track: Track, bpm: number) => {
  let events: number[] = [];
  
  // Meta: Track Name
  events.push(0x00, 0xFF, 0x03, track.name.length, ...stringToBytes(track.name));

  // Note events
  // Simplified: Assuming linear timeline, sorting by start time
  const ticksPerStep = 96 / 4; // 16th notes
  
  // Sort notes by start time
  const sortedNotes = [...track.notes].sort((a, b) => a.start - b.start);
  
  let lastTick = 0;
  
  // Need to handle note on and note off events interleaved
  // Creating a list of all events { tick, type, pitch, velocity }
  const midiEvents: any[] = [];
  
  sortedNotes.forEach(note => {
    const startTick = Math.floor(note.start * ticksPerStep);
    const endTick = Math.floor((note.start + note.duration) * ticksPerStep);
    
    midiEvents.push({ tick: startTick, type: 'on', pitch: note.pitch, velocity: note.velocity || 80 });
    midiEvents.push({ tick: endTick, type: 'off', pitch: note.pitch, velocity: 0 });
  });
  
  midiEvents.sort((a, b) => a.tick - b.tick);
  
  midiEvents.forEach(evt => {
    const delta = evt.tick - lastTick;
    const deltaBytes = variableLengthQuantity(delta);
    lastTick = evt.tick;
    
    const status = evt.type === 'on' ? 0x90 : 0x80; // Channel 0 (simplified)
    events.push(...deltaBytes, status, evt.pitch, evt.velocity);
  });
  
  // End of Track
  events.push(0x00, 0xFF, 0x2F, 0x00);

  const id = stringToBytes('MTrk');
  const length = numberToBytes(events.length, 4);
  
  return new Uint8Array([...id, ...length, ...events]);
};

const variableLengthQuantity = (n: number) => {
  let buffer = n & 0x7F;
  let arr = [];
  while ((n >>= 7)) {
    buffer <<= 8;
    buffer |= ((n & 0x7F) | 0x80);
  }
  while (true) {
    arr.push(buffer & 0xFF);
    if (buffer & 0x80) buffer >>= 8;
    else break;
  }
  return arr;
};