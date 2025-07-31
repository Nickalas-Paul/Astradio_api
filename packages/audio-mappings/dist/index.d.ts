import { AstroChart, AudioSession, AudioConfiguration, MelodicAudioSession } from '@astradio/types';
import { melodicGenerator } from './melodic-generator';
import { generateMusicNarration, generateModeSpecificNarration, generateDualChartNarration } from './narration-generator';
import { exportEngine } from './export-engine';
import { advancedPlaybackEngine } from './advanced-playback';
import { GENRE_CONFIGS, MOOD_TO_GENRE_MAPPINGS, getRandomGenre, getGenreFromMood, getAllGenres, getAllMoods } from './genre-system';
export { generateMusicNarration, generateModeSpecificNarration, generateDualChartNarration };
export { exportEngine };
export { advancedPlaybackEngine };
export { melodicGenerator };
export { GENRE_CONFIGS, MOOD_TO_GENRE_MAPPINGS, getRandomGenre, getGenreFromMood, getAllGenres, getAllMoods };
export { AudioGenerator } from './audioGenerator';
export { generateEnhancedInterpretation, CELESTIAL_INTERPRETATIONS } from './enhanced-interpreter';
export { enhancedCompositionEngine, EnhancedCompositionEngine } from './enhanced-composition';
export type { HouseComposition, HouseMelody, HouseTransition, CompositionConfig, EnhancedComposition } from './enhanced-composition';
export * from './genre-system';
export * from './genre-narration';
export declare const planetaryMappings: {
    Sun: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Moon: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Mercury: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Venus: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Mars: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Jupiter: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Saturn: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Uranus: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Neptune: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Pluto: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Chiron: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Lilith: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    NorthNode: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    SouthNode: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Ceres: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Juno: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Vesta: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Pallas: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Eris: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
};
export declare class UniversalAudioEngine {
    private synths;
    private currentSession;
    private isInitialized;
    private scheduledEvents;
    private currentGenre;
    private currentMood;
    initialize(): Promise<void>;
    private initializeSynths;
    private calculateFrequency;
    private calculateDuration;
    private calculateVolume;
    generateSequential(chartData: AstroChart): Promise<AudioSession>;
    generateLayered(chartData: AstroChart): Promise<AudioSession>;
    generateOverlay(chart1: AstroChart, chart2: AstroChart, config?: AudioConfiguration): Promise<AudioSession>;
    generatePreview(chartData: AstroChart, duration?: number): Promise<AudioSession>;
    generateMelodic(chartData: AstroChart, config?: AudioConfiguration): Promise<MelodicAudioSession>;
    stopAll(): void;
    getCurrentSession(): AudioSession | null;
    getAudioConfig(chartData: AstroChart): any;
}
export declare const audioEngine: UniversalAudioEngine;
