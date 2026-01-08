import { InstrumentType, Track } from './types';

const DEFAULT_EQ = {
  lowCut: 0,
  lowGain: 0,
  midFreq: 1000,
  midGain: 0,
  highGain: 0
};

export const COLORS = {
  [InstrumentType.DRUMS]: '#f87171', // Red
  [InstrumentType.BASS]: '#60a5fa',  // Blue
  [InstrumentType.SYNTH]: '#c084fc', // Purple
  [InstrumentType.VOCAL]: '#4ade80', // Green
};

export const INITIAL_TRACKS_A: Track[] = [
  {
    id: 't1',
    name: 'Kick & Snare',
    type: InstrumentType.DRUMS,
    volume: 80,
    pan: 0,
    reverb: 10,
    eq: { ...DEFAULT_EQ, lowGain: 3 },
    muted: false,
    solo: false,
    color: COLORS[InstrumentType.DRUMS],
    notes: [
      { id: 'n1', start: 0, duration: 1, pitch: 36, velocity: 100 },
      { id: 'n2', start: 4, duration: 1, pitch: 38, velocity: 90 },
      { id: 'n3', start: 8, duration: 1, pitch: 36, velocity: 100 },
      { id: 'n4', start: 12, duration: 1, pitch: 38, velocity: 90 },
    ]
  },
  {
    id: 't2',
    name: 'Deep Bass',
    type: InstrumentType.BASS,
    volume: 75,
    pan: 0,
    reverb: 5,
    eq: { ...DEFAULT_EQ, lowGain: 5, highGain: -2 },
    muted: false,
    solo: false,
    color: COLORS[InstrumentType.BASS],
    notes: [
      { id: 'n5', start: 0, duration: 3, pitch: 24, velocity: 80 },
      { id: 'n6', start: 8, duration: 3, pitch: 24, velocity: 80 },
    ]
  },
  {
    id: 't3',
    name: 'Topline Melody',
    type: InstrumentType.SYNTH,
    volume: 70,
    pan: 10,
    reverb: 40,
    eq: { ...DEFAULT_EQ, midGain: 2, midFreq: 2500 },
    muted: false,
    solo: false,
    color: COLORS[InstrumentType.SYNTH],
    notes: [
      { id: 'n7', start: 0, duration: 2, pitch: 60, velocity: 70 },
      { id: 'n8', start: 2, duration: 2, pitch: 64, velocity: 75 },
      { id: 'n9', start: 4, duration: 4, pitch: 67, velocity: 80 },
    ]
  }
];

export const INITIAL_TRACKS_B: Track[] = [
  {
    id: 't1',
    name: 'Indie Drums',
    type: InstrumentType.DRUMS,
    volume: 60,
    pan: 0,
    reverb: 30,
    eq: DEFAULT_EQ,
    muted: false,
    solo: false,
    color: COLORS[InstrumentType.DRUMS],
    notes: [
      { id: 'n1b', start: 0, duration: 1, pitch: 36 },
      { id: 'n2b', start: 2, duration: 1, pitch: 42 },
      { id: 'n3b', start: 4, duration: 1, pitch: 38 },
      { id: 'n4b', start: 6, duration: 1, pitch: 42 },
    ]
  },
  {
    id: 't2',
    name: 'Fuzzy Bass',
    type: InstrumentType.BASS,
    volume: 85,
    pan: 0,
    reverb: 20,
    eq: DEFAULT_EQ,
    muted: false,
    solo: false,
    color: COLORS[InstrumentType.BASS],
    notes: [
      { id: 'n5b', start: 0, duration: 2, pitch: 36 },
      { id: 'n6b', start: 2, duration: 2, pitch: 36 },
      { id: 'n7b', start: 4, duration: 4, pitch: 41 },
    ]
  },
  {
    id: 't3',
    name: 'Dreamy Synth',
    type: InstrumentType.SYNTH,
    volume: 65,
    pan: 10,
    reverb: 60,
    eq: DEFAULT_EQ,
    muted: false,
    solo: false,
    color: COLORS[InstrumentType.SYNTH],
    notes: [
      { id: 'n8b', start: 0, duration: 8, pitch: 72 },
      { id: 'n9b', start: 8, duration: 4, pitch: 71 },
    ]
  }
];