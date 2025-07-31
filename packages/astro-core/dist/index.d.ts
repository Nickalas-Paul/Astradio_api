import { AstroChart, BirthData } from '@astradio/types';
export declare class AstroCore {
    generateChart(birthData: BirthData): Promise<AstroChart>;
    private getOffsetString;
    generateDailyChart(date?: string): Promise<AstroChart>;
    private getMockChart;
}
export declare const astroCore: AstroCore;
