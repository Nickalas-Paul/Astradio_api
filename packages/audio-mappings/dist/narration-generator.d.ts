import { AstroChart, AudioConfiguration } from '@astradio/types';
export interface MusicNarration {
    musicalMood: string;
    planetaryExpression: string;
    interpretiveSummary: string;
    fullNarration: string;
}
export declare function generateMusicNarration(chartData: AstroChart, config?: AudioConfiguration): MusicNarration;
export declare function generateModeSpecificNarration(chartData: AstroChart, mode: string, config?: AudioConfiguration): string;
export declare function generateDualChartNarration(chart1: AstroChart, chart2: AstroChart, config?: AudioConfiguration): string;
