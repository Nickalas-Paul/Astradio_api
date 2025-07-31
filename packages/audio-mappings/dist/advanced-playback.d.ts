import { AudioConfiguration, MelodicAudioSession } from '@astradio/types';
export interface PlaybackEffects {
    reverb: number;
    delay: number;
    distortion: number;
    chorus: number;
    filter: number;
}
export interface PlaybackControls {
    tempo: number;
    key: string;
    transpose: number;
    volume: number;
    loopStart: number;
    loopEnd: number;
    isLooping: boolean;
}
export interface AdvancedAudioConfiguration extends AudioConfiguration {
    effects?: PlaybackEffects;
    controls?: PlaybackControls;
    segments?: AudioSegment[];
}
export interface AudioSegment {
    id: string;
    name: string;
    startTime: number;
    endTime: number;
    color: string;
    description?: string;
}
export declare class AdvancedPlaybackEngine {
    private currentSession;
    private effects;
    private controls;
    private segments;
    private isPlaying;
    private currentTime;
    private loopInterval;
    constructor();
    /**
     * Apply real-time effects to audio playback
     */
    applyEffects(audioData: number[], sampleRate: number): number[];
    /**
     * Transpose audio to different key
     */
    transposeAudio(audioData: number[], originalKey: string, newKey: string): number[];
    /**
     * Change tempo without affecting pitch
     */
    changeTempo(audioData: number[], originalTempo: number, newTempo: number): number[];
    /**
     * Set loop points for playback
     */
    setLoopPoints(startTime: number, endTime: number): void;
    /**
     * Clear loop points
     */
    clearLoop(): void;
    /**
     * Add audio segment for organization
     */
    addSegment(name: string, startTime: number, endTime: number, color?: string, description?: string): void;
    /**
     * Remove audio segment
     */
    removeSegment(segmentId: string): void;
    /**
     * Get segments for current time
     */
    getCurrentSegments(currentTime: number): AudioSegment[];
    /**
     * Apply volume control
     */
    applyVolume(audioData: number[], volume: number): number[];
    /**
     * Process audio with all effects and controls
     */
    processAudio(audioData: number[], sampleRate: number, config: AdvancedAudioConfiguration): number[];
    /**
     * Start playback with loop support
     */
    startPlayback(session: MelodicAudioSession, config?: AdvancedAudioConfiguration): void;
    /**
     * Stop playback
     */
    stopPlayback(): void;
    /**
     * Pause playback
     */
    pausePlayback(): void;
    /**
     * Resume playback
     */
    resumePlayback(): void;
    /**
     * Get current playback state
     */
    getPlaybackState(): {
        isPlaying: boolean;
        currentTime: number;
        duration: number;
        effects: PlaybackEffects;
        controls: PlaybackControls;
        segments: AudioSegment[];
    };
    /**
     * Update effects in real-time
     */
    updateEffects(effects: Partial<PlaybackEffects>): void;
    /**
     * Update controls in real-time
     */
    updateControls(controls: Partial<PlaybackControls>): void;
    /**
     * Get available effects presets
     */
    getEffectsPresets(): Record<string, PlaybackEffects>;
    /**
     * Get available tempo presets
     */
    getTempoPresets(): Record<string, number>;
}
export declare const advancedPlaybackEngine: AdvancedPlaybackEngine;
