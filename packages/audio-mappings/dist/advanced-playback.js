"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancedPlaybackEngine = exports.AdvancedPlaybackEngine = void 0;
class AdvancedPlaybackEngine {
    constructor() {
        this.currentSession = null;
        this.segments = [];
        this.isPlaying = false;
        this.currentTime = 0;
        this.loopInterval = null;
        this.effects = {
            reverb: 0.3,
            delay: 0.2,
            distortion: 0.0,
            chorus: 0.1,
            filter: 0.0
        };
        this.controls = {
            tempo: 120,
            key: 'C',
            transpose: 0,
            volume: 0.8,
            loopStart: 0,
            loopEnd: 0,
            isLooping: false
        };
    }
    /**
     * Apply real-time effects to audio playback
     */
    applyEffects(audioData, sampleRate) {
        const processed = [...audioData];
        // Apply reverb (simplified convolution)
        if (this.effects.reverb > 0) {
            const reverbLength = Math.floor(sampleRate * this.effects.reverb * 0.5);
            for (let i = reverbLength; i < processed.length; i++) {
                processed[i] += processed[i - reverbLength] * 0.3 * this.effects.reverb;
            }
        }
        // Apply delay
        if (this.effects.delay > 0) {
            const delaySamples = Math.floor(sampleRate * 0.3 * this.effects.delay);
            for (let i = delaySamples; i < processed.length; i++) {
                processed[i] += processed[i - delaySamples] * 0.5 * this.effects.delay;
            }
        }
        // Apply distortion
        if (this.effects.distortion > 0) {
            for (let i = 0; i < processed.length; i++) {
                const input = processed[i];
                const distortion = this.effects.distortion;
                processed[i] = Math.tanh(input * (1 + distortion * 5)) * (1 - distortion * 0.3);
            }
        }
        // Apply chorus (frequency modulation)
        if (this.effects.chorus > 0) {
            for (let i = 0; i < processed.length; i++) {
                const time = i / sampleRate;
                const modulation = Math.sin(2 * Math.PI * 1.5 * time) * this.effects.chorus;
                const delayedIndex = Math.floor(i + modulation * sampleRate * 0.01);
                if (delayedIndex < processed.length && delayedIndex >= 0) {
                    processed[i] += processed[delayedIndex] * 0.3 * this.effects.chorus;
                }
            }
        }
        // Apply low-pass filter
        if (this.effects.filter > 0) {
            let filtered = 0;
            const filterStrength = this.effects.filter;
            for (let i = 0; i < processed.length; i++) {
                filtered = filtered * (1 - filterStrength) + processed[i] * filterStrength;
                processed[i] = filtered;
            }
        }
        return processed;
    }
    /**
     * Transpose audio to different key
     */
    transposeAudio(audioData, originalKey, newKey) {
        const keyOffsets = {
            'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6,
            'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
        };
        const semitones = (keyOffsets[newKey] || 0) - (keyOffsets[originalKey] || 0);
        const ratio = Math.pow(2, semitones / 12);
        // Simple pitch shifting by resampling
        const newLength = Math.floor(audioData.length / ratio);
        const transposed = new Array(newLength);
        for (let i = 0; i < newLength; i++) {
            const sourceIndex = Math.floor(i * ratio);
            if (sourceIndex < audioData.length) {
                transposed[i] = audioData[sourceIndex];
            }
            else {
                transposed[i] = 0;
            }
        }
        return transposed;
    }
    /**
     * Change tempo without affecting pitch
     */
    changeTempo(audioData, originalTempo, newTempo) {
        const ratio = originalTempo / newTempo;
        const newLength = Math.floor(audioData.length * ratio);
        const tempoChanged = new Array(newLength);
        for (let i = 0; i < newLength; i++) {
            const sourceIndex = Math.floor(i / ratio);
            if (sourceIndex < audioData.length) {
                tempoChanged[i] = audioData[sourceIndex];
            }
            else {
                tempoChanged[i] = 0;
            }
        }
        return tempoChanged;
    }
    /**
     * Set loop points for playback
     */
    setLoopPoints(startTime, endTime) {
        this.controls.loopStart = Math.max(0, startTime);
        this.controls.loopEnd = Math.max(startTime, endTime);
        this.controls.isLooping = true;
    }
    /**
     * Clear loop points
     */
    clearLoop() {
        this.controls.isLooping = false;
        this.controls.loopStart = 0;
        this.controls.loopEnd = 0;
    }
    /**
     * Add audio segment for organization
     */
    addSegment(name, startTime, endTime, color = '#667eea', description) {
        const segment = {
            id: `segment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name,
            startTime,
            endTime,
            color,
            description
        };
        this.segments.push(segment);
    }
    /**
     * Remove audio segment
     */
    removeSegment(segmentId) {
        this.segments = this.segments.filter(s => s.id !== segmentId);
    }
    /**
     * Get segments for current time
     */
    getCurrentSegments(currentTime) {
        return this.segments.filter(segment => currentTime >= segment.startTime && currentTime <= segment.endTime);
    }
    /**
     * Apply volume control
     */
    applyVolume(audioData, volume) {
        return audioData.map(sample => sample * Math.max(0, Math.min(1, volume)));
    }
    /**
     * Process audio with all effects and controls
     */
    processAudio(audioData, sampleRate, config) {
        let processed = [...audioData];
        // Apply tempo change
        if (config.controls?.tempo && config.controls.tempo !== this.controls.tempo) {
            processed = this.changeTempo(processed, this.controls.tempo, config.controls.tempo);
            this.controls.tempo = config.controls.tempo;
        }
        // Apply key transposition
        if (config.controls?.key && config.controls.key !== this.controls.key) {
            processed = this.transposeAudio(processed, this.controls.key, config.controls.key);
            this.controls.key = config.controls.key;
        }
        // Apply effects
        if (config.effects) {
            this.effects = { ...this.effects, ...config.effects };
            processed = this.applyEffects(processed, sampleRate);
        }
        // Apply volume
        if (config.controls?.volume !== undefined) {
            this.controls.volume = config.controls.volume;
            processed = this.applyVolume(processed, this.controls.volume);
        }
        return processed;
    }
    /**
     * Start playback with loop support
     */
    startPlayback(session, config) {
        this.currentSession = session;
        this.isPlaying = true;
        this.currentTime = 0;
        if (config?.controls?.isLooping) {
            this.setLoopPoints(config.controls.loopStart, config.controls.loopEnd);
        }
        console.log(`🎵 Starting advanced playback for session ${session.id}`);
        console.log(`   Tempo: ${this.controls.tempo} BPM`);
        console.log(`   Key: ${this.controls.key}`);
        console.log(`   Effects: Reverb ${this.effects.reverb}, Delay ${this.effects.delay}, Distortion ${this.effects.distortion}`);
    }
    /**
     * Stop playback
     */
    stopPlayback() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.clearLoop();
        if (this.loopInterval) {
            clearInterval(this.loopInterval);
            this.loopInterval = null;
        }
        console.log('⏹️ Advanced playback stopped');
    }
    /**
     * Pause playback
     */
    pausePlayback() {
        this.isPlaying = false;
        console.log('⏸️ Advanced playback paused');
    }
    /**
     * Resume playback
     */
    resumePlayback() {
        this.isPlaying = true;
        console.log('▶️ Advanced playback resumed');
    }
    /**
     * Get current playback state
     */
    getPlaybackState() {
        const duration = this.currentSession ?
            Math.max(...this.currentSession.phrases.flatMap(p => p.notes.map(n => n.timestamp + n.duration))) : 0;
        return {
            isPlaying: this.isPlaying,
            currentTime: this.currentTime,
            duration,
            effects: { ...this.effects },
            controls: { ...this.controls },
            segments: [...this.segments]
        };
    }
    /**
     * Update effects in real-time
     */
    updateEffects(effects) {
        this.effects = { ...this.effects, ...effects };
        console.log(`🎛️ Effects updated:`, this.effects);
    }
    /**
     * Update controls in real-time
     */
    updateControls(controls) {
        this.controls = { ...this.controls, ...controls };
        console.log(`🎛️ Controls updated:`, this.controls);
    }
    /**
     * Get available effects presets
     */
    getEffectsPresets() {
        return {
            'Clean': {
                reverb: 0.1,
                delay: 0.0,
                distortion: 0.0,
                chorus: 0.0,
                filter: 0.0
            },
            'Ambient': {
                reverb: 0.8,
                delay: 0.6,
                distortion: 0.0,
                chorus: 0.3,
                filter: 0.2
            },
            'Rock': {
                reverb: 0.3,
                delay: 0.2,
                distortion: 0.7,
                chorus: 0.1,
                filter: 0.1
            },
            'Electronic': {
                reverb: 0.4,
                delay: 0.4,
                distortion: 0.3,
                chorus: 0.5,
                filter: 0.4
            },
            'Jazz': {
                reverb: 0.5,
                delay: 0.3,
                distortion: 0.1,
                chorus: 0.2,
                filter: 0.0
            }
        };
    }
    /**
     * Get available tempo presets
     */
    getTempoPresets() {
        return {
            'Largo': 60,
            'Adagio': 72,
            'Andante': 96,
            'Moderato': 108,
            'Allegro': 132,
            'Presto': 168,
            'Prestissimo': 200
        };
    }
}
exports.AdvancedPlaybackEngine = AdvancedPlaybackEngine;
exports.advancedPlaybackEngine = new AdvancedPlaybackEngine();
