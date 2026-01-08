export enum InstrumentType {
  DRUMS = 'Drums',
  BASS = 'Bass',
  SYNTH = 'Synth',
  VOCAL = 'Vocal'
}

export interface Note {
  id: string;
  start: number; // 0-16 steps (1 bar)
  duration: number;
  pitch: number; // MIDI note number roughly mapped 0-127
  velocity?: number; // 0-127
}

export interface EQSettings {
  lowCut: number;
  lowGain: number; // dB
  midFreq: number;
  midGain: number; // dB
  highGain: number; // dB
}

export interface Track {
  id: string;
  name: string;
  type: InstrumentType;
  volume: number; // 0-100
  pan: number; // -50 to 50
  reverb: number; // 0-100
  eq: EQSettings;
  muted: boolean;
  solo: boolean;
  notes: Note[];
  color: string;
  audioBuffer?: AudioBuffer | null; // For recorded vocals
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ProjectVersion {
  id: 'A' | 'B';
  name: string;
  tracks: Track[];
}

export interface GenerationParams {
  genre: string;
  key: string;
  chordProgression: string; // e.g., "ii-V-I"
  tempo: number;
}