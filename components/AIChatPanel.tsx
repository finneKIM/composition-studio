import React, { useState } from 'react';
import { Send, Music2, Wand2, MessageSquare, AlertTriangle, Activity, Download, Mic, TrendingUp } from 'lucide-react';
import { ChatMessage } from '../types';

interface AIChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onGenerate: (prompt: string, params?: any) => void;
  onAnalyze: () => void;
  onExportMidi: () => void;
  onTrendingLyrics: () => void;
  isGenerating: boolean;
  analysisResult: string | null;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ 
    messages, 
    onSendMessage, 
    onGenerate, 
    onAnalyze,
    onExportMidi,
    onTrendingLyrics,
    isGenerating,
    analysisResult
}) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'chat' | 'generate'>('generate');
  
  // Advanced Params
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [genre, setGenre] = useState('Pop');
  const [progression, setProgression] = useState('ii-V-I');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (mode === 'generate') {
        const params = showAdvanced ? { genre, chordProgression: progression, key: 'C Major', tempo: 120 } : undefined;
        onGenerate(input, params);
    } else {
        onSendMessage(input);
    }
    setInput('');
  };

  return (
    <div className="w-80 bg-slate-950 border-l border-slate-800 flex flex-col h-full shadow-2xl z-20">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-800">
        <button 
            onClick={() => setMode('generate')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'generate' ? 'bg-slate-900 text-purple-400 border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
            <Wand2 size={16} /> Compose
        </button>
        <button 
            onClick={() => setMode('chat')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'chat' ? 'bg-slate-900 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
            <MessageSquare size={16} /> Chat
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Analysis Result Banner */}
        {analysisResult && (
             <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 animate-in fade-in slide-in-from-top-2">
                <h4 className="text-orange-400 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                    <AlertTriangle size={12} /> Mixing Engineer
                </h4>
                <p className="text-xs text-orange-200/80 leading-relaxed whitespace-pre-wrap font-mono">{analysisResult}</p>
             </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-2xl px-4 py-2 text-sm shadow-sm whitespace-pre-wrap ${
                msg.role === 'user' 
                ? 'bg-purple-600 text-white rounded-br-none' 
                : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isGenerating && (
            <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-bl-none px-4 py-2 text-sm border border-slate-700 animate-pulse flex items-center gap-2">
                    <Activity size={12} className="animate-spin" /> Processing with Music21 Logic...
                </div>
            </div>
        )}
      </div>

      {/* Tools Section */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/50 grid grid-cols-2 gap-2">
         <button onClick={onAnalyze} disabled={isGenerating} className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded border border-slate-700 flex items-center justify-center gap-1">
            <Activity size={12} /> Analyze Mix
         </button>
         <button onClick={onExportMidi} disabled={isGenerating} className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded border border-slate-700 flex items-center justify-center gap-1">
            <Download size={12} /> Export MIDI
         </button>
         <button onClick={onTrendingLyrics} disabled={isGenerating} className="col-span-2 text-[10px] bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-300 py-2 rounded border border-indigo-800/50 flex items-center justify-center gap-1">
            <TrendingUp size={12} /> Generate Trending Lyrics
         </button>
      </div>

      {/* Input Area */}
      <div className="p-4 pt-2">
         {mode === 'generate' && (
             <div className="mb-2">
                 <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-[10px] text-slate-500 hover:text-slate-300 mb-2 underline">
                     {showAdvanced ? 'Hide Advanced' : 'Show Advanced Settings'}
                 </button>
                 
                 {showAdvanced && (
                     <div className="grid grid-cols-2 gap-2 mb-2 p-2 bg-slate-900 rounded border border-slate-800">
                         <div>
                             <label className="text-[10px] text-slate-500 block">Genre</label>
                             <select value={genre} onChange={e => setGenre(e.target.value)} className="w-full bg-slate-800 text-xs border border-slate-700 rounded px-1 py-1">
                                 <option>Pop</option><option>Hip Hop</option><option>R&B</option><option>Rock</option>
                             </select>
                         </div>
                         <div>
                             <label className="text-[10px] text-slate-500 block">Progression</label>
                             <select value={progression} onChange={e => setProgression(e.target.value)} className="w-full bg-slate-800 text-xs border border-slate-700 rounded px-1 py-1">
                                 <option>ii-V-I</option><option>I-V-vi-IV</option><option>I-vi-IV-V</option>
                             </select>
                         </div>
                     </div>
                 )}
             </div>
         )}

         <form onSubmit={handleSubmit} className="relative">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'generate' ? "e.g., Chill beat with driving bass..." : "Ask: 'Boost 60Hz on kick...'"}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 placeholder:text-slate-600 transition-all"
            />
            <button 
                type="submit"
                disabled={!input.trim() || isGenerating}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {mode === 'generate' ? <Music2 size={16} /> : <Send size={16} />}
            </button>
         </form>
      </div>
    </div>
  );
};