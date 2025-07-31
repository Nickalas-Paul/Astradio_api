import { AstroChart, AudioConfiguration, AudioSession } from '@astradio/types';
export declare const planetRoles: {
    Sun: string;
    Moon: string;
    Mercury: string;
    Venus: string;
    Mars: string;
    Jupiter: string;
    Saturn: string;
    Uranus: string;
    Neptune: string;
    Pluto: string;
};
export interface MelodicPhrase {
    id: string;
    planet: string;
    role: string;
    notes: MelodicNote[];
    startTime: number;
    duration: number;
    intensity: number;
    variation: number;
}
export interface MelodicNote {
    frequency: number;
    duration: number;
    velocity: number;
    instrument: string;
    timestamp: number;
    effects?: string[];
}
export interface MelodicAudioSession extends AudioSession {
    mode: 'melodic';
    phrases: MelodicPhrase[];
    scale: string[];
    key: string;
    tempo: number;
    timeSignature: string;
}
export declare class MelodicGenerator {
    private currentSession;
    private aspects;
    private musicalConfig;
    generateMelodicChart(chartData: AstroChart, config?: AudioConfiguration): Promise<MelodicAudioSession>;
    private generatePlanetaryPhrases;
    private generatePhraseNotes;
    private weightedNoteSelection;
    private calculateOctave;
    private calculateNoteDuration;
    private calculateVelocity;
    private getInstrumentForRole;
    private calculateEffects;
    private calculateVariation;
    private calculatePhraseLength;
    private calculateNoteCount;
    private applyHarmonicRelationships;
    private applyRhythmicPatterns;
    getCurrentSession(): MelodicAudioSession | null;
    stopAll(): void;
}
export declare const melodicGenerator: MelodicGenerator;
