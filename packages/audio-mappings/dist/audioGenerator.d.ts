import { AstroChart, AspectData } from '@astradio/types';
export interface AudioNote {
    frequency: number;
    duration: number;
    volume: number;
    instrument: string;
    startTime: number;
}
export interface AudioComposition {
    notes: AudioNote[];
    duration: number;
    totalDuration: number;
    sampleRate: number;
    format: 'wav' | 'mp3' | 'ogg';
}
export declare class AudioGenerator {
    private generator;
    private sampleRate;
    constructor(sampleRate?: number);
    private getGenreInstrument;
    generateChartAudio(chart: AstroChart, duration?: number, genre?: string): AudioComposition;
    generateSandboxAudio(chart: AstroChart, aspects?: AspectData[], configuration?: any, duration?: number, genre?: string): AudioComposition;
    private generateAspectNote;
    generateDailyAudio(transitData: any, duration?: number, genre?: string): AudioComposition;
    generateWAVBuffer(composition: AudioComposition): Buffer;
    private createWAVHeader;
    private calculateFrequency;
    private calculateVolume;
}
