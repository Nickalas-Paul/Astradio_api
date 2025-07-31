import { AstroChart, AudioSession, GenreType } from '@astradio/types';
export interface HouseComposition {
    houseNumber: number;
    planets: string[];
    duration: number;
    melody: HouseMelody;
    transition: HouseTransition;
}
export interface HouseMelody {
    notes: number[];
    rhythm: number[];
    harmony: number[];
    motif?: number[];
}
export interface HouseTransition {
    type: 'smooth' | 'contrast' | 'modulation';
    duration: number;
    keyChange?: number;
}
export interface CompositionConfig {
    duration: 'free' | 'premium';
    genre: GenreType;
    includeTransitions: boolean;
    motifRecurrence: boolean;
}
export interface EnhancedComposition {
    houses: HouseComposition[];
    totalDuration: number;
    key: string;
    tempo: number;
    motifs: number[][];
    interpretation: string;
}
export declare class EnhancedCompositionEngine {
    private currentSession;
    private scheduledEvents;
    private readonly FREE_DURATION_PER_HOUSE;
    private readonly PREMIUM_DURATION_PER_HOUSE;
    private readonly FREE_TOTAL_DURATION;
    private readonly PREMIUM_TOTAL_DURATION;
    private readonly elementScales;
    private readonly houseCharacteristics;
    generateHouseBasedComposition(chartData: AstroChart, config: CompositionConfig): Promise<EnhancedComposition>;
    private organizePlanetsByHouse;
    private generateHouseMelody;
    private generateHouseTransition;
    private frequencyToNote;
    private getKeyName;
    private calculateAverageTempo;
    private generateHouseBasedInterpretation;
    private getHouseTheme;
    playComposition(composition: EnhancedComposition): Promise<AudioSession>;
    stopComposition(): void;
    getCurrentSession(): AudioSession | null;
}
export declare const enhancedCompositionEngine: EnhancedCompositionEngine;
