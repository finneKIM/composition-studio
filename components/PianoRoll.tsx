import React, { useState, useRef, useEffect } from 'react';
import { Track, Note } from '../types';

interface PianoRollProps {
  tracks: Track[];
  isPlaying: boolean;
  currentStep: number;
  onUpdateNote?: (trackId: string, noteId: string, updates: Partial<Note>) => void;
}

const STEPS = 16;
const TRACK_HEIGHT = 80;
const MIN_PITCH = 24;
const MAX_PITCH = 96;

export const PianoRoll: React.FC<PianoRollProps> = ({ tracks, isPlaying, currentStep, onUpdateNote }) => {
  // Drag State
  const [dragging, setDragging] = useState<{
    trackId: string;
    noteId: string;
    originalStart: number;
    originalPitch: number;
    startX: number;
    startY: number;
  } | null>(null);

  // Optimistic UI state
  const [dragOffset, setDragOffset] = useState<{ steps: number; pitch: number }>({ steps: 0, pitch: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, trackId: string, note: Note) => {
    e.stopPropagation();
    e.preventDefault();
    setDragging({
      trackId,
      noteId: note.id,
      originalStart: note.start,
      originalPitch: note.pitch,
      startX: e.clientX,
      startY: e.clientY,
    });
    setDragOffset({ steps: 0, pitch: 0 });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging || !containerRef.current) return;

      const deltaX = e.clientX - dragging.startX;
      const deltaY = e.clientY - dragging.startY;

      // Calculate step change (approx width of container / 16)
      const containerWidth = containerRef.current.clientWidth;
      const stepWidth = containerWidth / STEPS;
      const stepsDelta = Math.round(deltaX / stepWidth);

      // Calculate pitch change (approx height of track?)
      // We are dragging relative to the screen. 
      // Let's assume some sensitivity: 5 pixels = 1 semitone
      const pitchDelta = Math.round(-deltaY / 5); // Negative because moving up increases pitch

      setDragOffset({ steps: stepsDelta, pitch: pitchDelta });
    };

    const handleMouseUp = () => {
      if (dragging && onUpdateNote) {
        // Commit changes
        const newStart = Math.max(0, Math.min(STEPS - 1, dragging.originalStart + dragOffset.steps));
        const newPitch = Math.max(0, Math.min(127, dragging.originalPitch + dragOffset.pitch));

        if (newStart !== dragging.originalStart || newPitch !== dragging.originalPitch) {
             onUpdateNote(dragging.trackId, dragging.noteId, {
                 start: newStart,
                 pitch: newPitch
             });
        }
      }
      setDragging(null);
      setDragOffset({ steps: 0, pitch: 0 });
    };

    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffset, onUpdateNote]);

  return (
    <div ref={containerRef} className="flex-1 bg-slate-900 overflow-y-auto overflow-x-hidden relative border-l border-slate-800 select-none">
        {/* Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20" 
             style={{ 
               backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px)',
               backgroundSize: `${100 / STEPS}% 100%`
             }}>
        </div>

        {/* Playhead */}
        {isPlaying && (
            <div 
                className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-20 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                style={{ left: `${(currentStep / STEPS) * 100}%` }}
            />
        )}

        <div className="flex flex-col min-h-full">
            {tracks.map((track) => (
                <div key={track.id} className="relative border-b border-slate-800 group" style={{ height: TRACK_HEIGHT }}>
                    {/* Track Label Overlay */}
                    <div className="absolute left-2 top-2 z-10 text-xs font-bold px-2 py-1 rounded bg-black/40 backdrop-blur-sm select-none pointer-events-none" style={{ color: track.color }}>
                        {track.name}
                    </div>

                    {/* Notes */}
                    <div className="absolute inset-0 w-full h-full">
                        {track.notes.map((note) => {
                            const isBeingDragged = dragging?.noteId === note.id;
                            
                            // Calculate display values
                            const displayStart = isBeingDragged ? Math.max(0, Math.min(STEPS-1, note.start + dragOffset.steps)) : note.start;
                            const displayPitch = isBeingDragged ? Math.max(0, Math.min(127, note.pitch + dragOffset.pitch)) : note.pitch;

                            // Normalize pitch for visual vertical position
                            // Use a localized range for rendering to ensure notes are visible within the track strip
                            // We center the view around C4 (60) or the track's average pitch range.
                            // For simplicity, we map 2 octaves range (24 semitones) inside the track height?
                            // No, simpler: Scale MIN_PITCH to MAX_PITCH to 0-100%
                            const pitchPercent = Math.max(0, Math.min(1, (displayPitch - MIN_PITCH) / (MAX_PITCH - MIN_PITCH)));
                            const topPos = 100 - (pitchPercent * 100); 

                            return (
                                <div
                                    key={note.id}
                                    onMouseDown={(e) => handleMouseDown(e, track.id, note)}
                                    className={`absolute rounded-sm border border-black/20 shadow-sm cursor-grab active:cursor-grabbing transition-colors ${isBeingDragged ? 'z-30 ring-2 ring-white' : ''}`}
                                    style={{
                                        left: `${(displayStart / STEPS) * 100}%`,
                                        width: `${(note.duration / STEPS) * 100}%`,
                                        top: `${topPos}%`,
                                        height: '20%', // Fixed height for note blocks
                                        backgroundColor: track.muted ? '#475569' : track.color,
                                        opacity: track.muted ? 0.5 : (isBeingDragged ? 1 : 0.9),
                                        transform: 'translateY(-50%)' // Center note on pitch line
                                    }}
                                    title={`Pitch: ${displayPitch}, Start: ${displayStart}`}
                                >
                                  {isBeingDragged && (
                                    <div className="absolute -top-6 left-0 bg-black/80 text-white text-[10px] px-1 rounded whitespace-nowrap">
                                        P:{displayPitch} T:{displayStart}
                                    </div>
                                  )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
            
            {tracks.length === 0 && (
                <div className="flex items-center justify-center h-64 text-slate-500 italic">
                    No tracks generated. Use the AI Assistant to compose.
                </div>
            )}
        </div>
    </div>
  );
};