import { AstroChart } from '@astradio/types';
interface CelestialBodyInterpretation {
    name: string;
    musicalInfluence: string;
    houseMeanings: Record<number, string>;
    signMeanings: Record<string, string>;
    generalMeaning: string;
}
declare const CELESTIAL_INTERPRETATIONS: Record<string, CelestialBodyInterpretation>;
export declare function generateEnhancedInterpretation(chartData: AstroChart, selectedOrbs: any[], genre: string): string;
export { CELESTIAL_INTERPRETATIONS };
