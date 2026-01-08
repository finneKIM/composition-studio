import React from 'react';
import { Track } from '../types';
import { Volume2, Mic2, Activity, Zap } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, YAxis, Tooltip as RechartsTooltip } from 'recharts';

interface MixerProps {
  tracks: Track[];
  onUpdateTrack: (id: string, updates: Partial<Track>) => void;
  onAutoMix: () => void;
  isAutoMixing: boolean;
}

export const Mixer: React.FC<MixerProps> = ({ tracks, onUpdateTrack, onAutoMix, isAutoMixing }) => {
  
  // Mock frequency data based on track volume for visualization
  const getFrequencyData = (track: Track) => {
      const base = track.muted ? 0 : track.volume;
      return [
        { name: 'Low', val: track.type === 'Bass' || track.type === 'Drums' ? base * 0.9 : base * 0.2 },
        { name: 'Mid', val: track.type === 'Synth' || track.type === 'Vocal' ? base * 0.9 : base * 0.4 },
        { name: 'High', val: track.type === 'Drums' || track.type === 'Synth' ? base * 0.6 : base * 0.3 },
      ];
  };

  return (
    <div className="h-64 bg-slate-900 border-t border-slate-800 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
            <Activity size={16} /> MIXER CONSOLE
        </h3>
        <button 
            onClick={onAutoMix}
            disabled={isAutoMixing}
            className={`text-xs flex items-center gap-1 px-3 py-1 rounded-full font-medium transition-all ${isAutoMixing ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'}`}
        >
            <Zap size={12} fill={isAutoMixing ? "currentColor" : "none"} />
            {isAutoMixing ? 'AI Mixing...' : 'Auto-Mix'}
        </button>
      </div>

      <div className="flex-1 overflow-x-auto p-4 flex gap-4 items-stretch">
        {tracks.map(track => (
          <div key={track.id} className="w-24 bg-slate-800/50 rounded-lg p-2 flex flex-col items-center justify-between border border-slate-700/50 hover:border-slate-600 transition-colors">
            
            {/* Visualizer Tiny */}
            <div className="w-full h-12 opacity-50 mb-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getFrequencyData(track)}>
                        <Bar dataKey="val" fill={track.color} radius={[2, 2, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center w-full gap-3 flex-1 justify-end">
                 {/* Pan Knob (Simulated with range for now) */}
                 <div className="w-full">
                    <label className="text-[10px] text-slate-500 uppercase font-bold text-center block mb-1">Pan</label>
                    <input 
                        type="range" 
                        min="-50" 
                        max="50" 
                        value={track.pan}
                        onChange={(e) => onUpdateTrack(track.id, { pan: parseInt(e.target.value) })}
                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400"
                    />
                 </div>

                 {/* Volume Fader */}
                 <div className="h-24 w-8 bg-slate-950 rounded-full relative p-1 shadow-inner border border-slate-800">
                    <div 
                        className="absolute bottom-1 left-1 right-1 bg-slate-700 rounded-full transition-all"
                        style={{ height: `${track.volume}%`, backgroundColor: track.muted ? '#475569' : track.color }}
                    ></div>
                    {/* Fix: Cast orient to any to avoid TS error on non-standard attribute */}
                    <input 
                        type="range"
                        {...({ orient: "vertical" } as any)}
                        min="0"
                        max="100"
                        value={track.volume}
                        onChange={(e) => onUpdateTrack(track.id, { volume: parseInt(e.target.value) })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize"
                        style={{ WebkitAppearance: 'slider-vertical' } as any}
                    />
                 </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex gap-1 mt-3 w-full justify-center">
                <button 
                    onClick={() => onUpdateTrack(track.id, { muted: !track.muted })}
                    className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${track.muted ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                >
                    M
                </button>
                <button 
                    onClick={() => onUpdateTrack(track.id, { solo: !track.solo })}
                    className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${track.solo ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                >
                    S
                </button>
            </div>

            <span className="text-xs truncate max-w-full mt-2 font-medium text-slate-300">
                {track.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};