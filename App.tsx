import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Layers, GitBranch, Share2, Menu, Mic, MicOff, Download } from 'lucide-react';
import { Track, ChatMessage, ProjectVersion, Note } from './types';
import { INITIAL_TRACKS_A, INITIAL_TRACKS_B } from './constants';
import { PianoRoll } from './components/PianoRoll';
import { Mixer } from './components/Mixer';
import { AIChatPanel } from './components/AIChatPanel';
import { generateMusic, analyzeMix, autoMixTracks, generateLyricsAndMelody, generateTrendingLyrics } from './services/geminiService';
import { audioEngine } from './services/audioEngine';
import { exportToMidi } from './services/midiService';

const App: React.FC = () => {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); 
  const [version, setVersion] = useState<'A' | 'B'>('A');
  const [tracksA, setTracksA] = useState<Track[]>(INITIAL_TRACKS_A);
  const [tracksB, setTracksB] = useState<Track[]>(INITIAL_TRACKS_B);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Derived state
  const currentTracks = version === 'A' ? tracksA : tracksB;
  const setCurrentTracks = (newTracks: Track[]) => {
      if (version === 'A') setTracksA(newTracks);
      else setTracksB(newTracks);
  };

  // Sync Audio Engine with State
  useEffect(() => {
    audioEngine.setTracks(currentTracks);
  }, [currentTracks]);

  useEffect(() => {
    // Setup Audio Engine callbacks
    audioEngine.setCallback((step) => {
        setCurrentStep(step);
    });
  }, []);

  // Handlers
  const togglePlay = () => {
    if (isPlaying) {
        audioEngine.stop();
        setIsPlaying(false);
    } else {
        audioEngine.start();
        setIsPlaying(true);
    }
  };
  
  const stop = () => {
    audioEngine.stop();
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const updateTrack = (id: string, updates: Partial<Track>) => {
    const updated = currentTracks.map(t => t.id === id ? { ...t, ...updates } : t);
    setCurrentTracks(updated);
  };

  const handleUpdateNote = (trackId: string, noteId: string, updates: Partial<Note>) => {
    const track = currentTracks.find(t => t.id === trackId);
    if (!track) return;
    
    // If updates is null/empty implies delete? No, let's keep it simple.
    const updatedNotes = track.notes.map(n => 
        n.id === noteId ? { ...n, ...updates } : n
    );
    updateTrack(trackId, { notes: updatedNotes });
  };

  const handleGenerate = async (prompt: string, params?: any) => {
    setIsGenerating(true);
    setChatMessages(prev => [...prev, { role: 'user', text: `Compose: ${prompt}` }]);
    
    try {
        const newTracks = await generateMusic(prompt, params);
        setCurrentTracks(newTracks);
        setChatMessages(prev => [...prev, { role: 'model', text: `I've composed new tracks using Music21 logic. Key: ${params?.key || 'C Major'}.` }]);
    } catch (error) {
        setChatMessages(prev => [...prev, { role: 'model', text: "Composition error." }]);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    setIsGenerating(true);
    const feedback = await analyzeMix(currentTracks);
    setAnalysisResult(feedback);
    setChatMessages(prev => [...prev, { role: 'model', text: feedback }]);
    setIsGenerating(false);
  };

  const handleTrendingLyrics = async () => {
      setIsGenerating(true);
      const result = await generateTrendingLyrics();
      setChatMessages(prev => [...prev, { 
          role: 'model', 
          text: `Trending Topic: ${result.topic}\n\nLyrics Draft:\n${result.lyrics}` 
      }]);
      setIsGenerating(false);
  };

  const handleExportMidi = () => {
      const blob = exportToMidi(currentTracks);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project.mid';
      a.click();
      URL.revokeObjectURL(url);
      setChatMessages(prev => [...prev, { role: 'model', text: "Project exported as MIDI." }]);
  };

  const toggleRecording = async () => {
      if (isRecording) {
          const audioBlob = await audioEngine.stopRecording();
          setIsRecording(false);
          setChatMessages(prev => [...prev, { role: 'model', text: "Recording stopped. (Audio handling is conceptual in this demo)." }]);
          // Ideally, add a new 'Vocal' track with this audioBlob here
      } else {
          try {
              await audioEngine.startRecording();
              setIsRecording(true);
          } catch (e) {
              alert("Microphone access denied.");
          }
      }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-200 font-sans">
      
      {/* Top Bar */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-900/20">
            <Layers size={18} className="text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 hidden sm:block">
            Symphony<span className="font-light">AI</span>
          </h1>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button onClick={togglePlay} className={`p-2 rounded hover:bg-slate-800 transition-colors ${isPlaying ? 'text-green-400' : 'text-slate-300'}`}>
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <button onClick={stop} className="p-2 rounded hover:bg-slate-800 text-slate-300 hover:text-red-400 transition-colors">
                <Square size={20} fill="currentColor" />
            </button>
            <button onClick={toggleRecording} className={`p-2 rounded hover:bg-slate-800 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-300'}`}>
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <div className="h-4 w-[1px] bg-slate-700 mx-1"></div>
            <div className="px-3 font-mono text-sm text-slate-400">
                120 BPM
            </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-900 rounded-md border border-slate-800 p-0.5">
                <button 
                    onClick={() => setVersion('A')}
                    className={`px-3 py-1 text-xs font-bold rounded ${version === 'A' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    A
                </button>
                <button 
                    onClick={() => setVersion('B')}
                    className={`px-3 py-1 text-xs font-bold rounded ${version === 'B' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    B
                </button>
            </div>
            
            <button 
                className="md:hidden text-slate-400"
                onClick={() => setShowMobileChat(!showMobileChat)}
            >
                <Menu size={20} />
            </button>
            <button onClick={handleExportMidi} className="hidden md:flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                <Share2 size={14} /> Export MIDI
            </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Track List (Left Sidebar) */}
        <div className="w-48 bg-slate-950 border-r border-slate-800 flex-col hidden md:flex">
             <div className="h-8 border-b border-slate-800 bg-slate-900/50"></div>
             <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {currentTracks.map(track => (
                    <div key={track.id} className="h-20 border-b border-slate-800 p-3 flex flex-col justify-center gap-1 group hover:bg-slate-900/30 transition-colors">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: track.color }}></div>
                            <span className="text-xs font-bold truncate text-slate-300">{track.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                             <div className="text-[10px] text-slate-500 uppercase tracking-wider">{track.type}</div>
                             <div className="text-[9px] text-slate-600 font-mono">EQ: {track.eq?.midFreq}Hz</div>
                        </div>
                    </div>
                ))}
             </div>
        </div>

        {/* Timeline / Piano Roll */}
        <PianoRoll 
            tracks={currentTracks} 
            isPlaying={isPlaying} 
            currentStep={currentStep}
            onUpdateNote={handleUpdateNote}
        />

        {/* AI Chat Sidebar */}
        <div className={`
            fixed inset-y-0 right-0 w-80 transform transition-transform duration-300 ease-in-out z-40
            ${showMobileChat ? 'translate-x-0' : 'translate-x-full'}
            md:relative md:translate-x-0 md:block
        `}>
            <AIChatPanel 
                messages={chatMessages}
                onSendMessage={(msg) => setChatMessages(p => [...p, {role: 'user', text: msg}])}
                onGenerate={handleGenerate}
                onAnalyze={handleAnalyze}
                onExportMidi={handleExportMidi}
                onTrendingLyrics={handleTrendingLyrics}
                isGenerating={isGenerating}
                analysisResult={analysisResult}
            />
        </div>
      </div>

      {/* Bottom Mixer */}
      <div className="shrink-0 z-30">
        <Mixer 
            tracks={currentTracks} 
            onUpdateTrack={updateTrack} 
            onAutoMix={() => {}}
            isAutoMixing={isGenerating} 
        />
      </div>

    </div>
  );
};

export default App;