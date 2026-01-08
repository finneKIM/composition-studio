import { Track, InstrumentType } from '../types';

class AudioEngine {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private reverbNode: ConvolverNode;
  private nextNoteTime: number = 0;
  private isPlaying: boolean = false;
  private lookahead: number = 25.0; // ms
  private scheduleAheadTime: number = 0.1; // s
  private currentStep: number = 0;
  private onStepChange: ((step: number) => void) | null = null;
  private tracks: Track[] = [];
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    
    // Simple Impulse Response for Reverb
    this.reverbNode = this.ctx.createConvolver();
    this.createImpulseResponse();
    this.reverbNode.connect(this.masterGain);
  }

  private createImpulseResponse() {
    const rate = this.ctx.sampleRate;
    const length = rate * 2.0; // 2 seconds
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 5); // Decaying noise
        left[i] = (Math.random() * 2 - 1) * decay;
        right[i] = (Math.random() * 2 - 1) * decay;
    }
    this.reverbNode.buffer = impulse;
  }

  public setTracks(tracks: Track[]) {
    this.tracks = tracks;
  }

  public setCallback(cb: (step: number) => void) {
    this.onStepChange = cb;
  }

  public start() {
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.isPlaying = true;
    this.currentStep = 0;
    this.nextNoteTime = this.ctx.currentTime;
    this.scheduler();
  }

  public stop() {
    this.isPlaying = false;
  }

  private scheduler() {
    if (!this.isPlaying) return;

    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentStep, this.nextNoteTime);
      this.nextNote();
    }
    window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  private nextNote() {
    const secondsPerBeat = 60.0 / 120.0; // 120 BPM
    const secondsPer16th = secondsPerBeat / 4;
    this.nextNoteTime += secondsPer16th;
    this.currentStep = (this.currentStep + 1) % 16;
  }

  private scheduleNote(step: number, time: number) {
    // Notify UI
    if (this.onStepChange) {
        // Use timeout to sync UI with audio time
        const delay = (time - this.ctx.currentTime) * 1000;
        setTimeout(() => {
             if (this.onStepChange) this.onStepChange(step);
        }, Math.max(0, delay));
    }

    this.tracks.forEach(track => {
      if (track.muted) return;
      if (track.solo && !this.tracks.find(t => t.solo && t.id === track.id)) return; // Simple solo logic

      // Find notes starting at this step
      const notes = track.notes.filter(n => Math.floor(n.start) === step);
      notes.forEach(note => {
        this.playOscillator(track, note, time);
      });
    });
  }

  private playOscillator(track: Track, note: any, time: number) {
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const panNode = this.ctx.createStereoPanner();
    
    // Frequency
    const freq = 440 * Math.pow(2, (note.pitch - 69) / 12);
    osc.frequency.value = freq;

    // Type
    if (track.type === InstrumentType.DRUMS) {
        if (note.pitch < 40) osc.type = 'sine'; // Kick-ish
        else osc.type = 'square'; // Snare-ish (simplified)
        // Add noise for snare in a real engine, but simple osc for now
    } else if (track.type === InstrumentType.BASS) {
        osc.type = 'sawtooth';
    } else {
        osc.type = 'triangle';
    }

    // Envelope
    const volume = (track.volume / 100) * (note.velocity ? note.velocity / 127 : 0.8);
    gainNode.gain.setValueAtTime(volume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + (note.duration * 0.1)); // Short decay

    // Pan
    panNode.pan.value = track.pan / 50;

    // Reverb Send
    const reverbGain = this.ctx.createGain();
    reverbGain.gain.value = track.reverb / 100;
    
    // Routing
    osc.connect(gainNode);
    gainNode.connect(panNode);
    panNode.connect(this.masterGain);
    
    // Reverb connection
    panNode.connect(reverbGain);
    reverbGain.connect(this.reverbNode);

    osc.start(time);
    osc.stop(time + (note.duration * 0.15)); // Duration based on 16th notes approx
  }

  // --- Recording ---

  public async startRecording(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      this.audioChunks.push(event.data);
    };

    this.mediaRecorder.start();
  }

  public async stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
        if (!this.mediaRecorder) return resolve(new Blob());

        this.mediaRecorder.onstop = () => {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            resolve(audioBlob);
        };
        this.mediaRecorder.stop();
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  }
}

export const audioEngine = new AudioEngine();