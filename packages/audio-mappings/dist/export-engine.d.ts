import { MelodicAudioSession } from '@astradio/types';
export interface ExportOptions {
    format: 'midi' | 'wav' | 'mp3' | 'narration' | 'markdown' | 'html' | 'pdf';
    quality?: 'low' | 'medium' | 'high';
    includeNarration?: boolean;
    filename?: string;
}
export interface ExportResult {
    success: boolean;
    data?: any;
    filename?: string;
    size?: number;
    error?: string;
}
export interface MIDIExportData {
    header: {
        format: number;
        tracks: number;
        timeDivision: number;
    };
    tracks: Array<{
        name: string;
        notes: Array<{
            time: number;
            duration: number;
            note: number;
            velocity: number;
            channel: number;
        }>;
    }>;
}
export interface NarrationExportData {
    markdown: string;
    html: string;
    pdf?: Buffer;
    metadata: {
        title: string;
        author: string;
        date: string;
        duration: string;
        genre: string;
        mode: string;
    };
}
export declare class ExportEngine {
    /**
     * Export melodic session to MIDI format
     */
    exportToMIDI(session: MelodicAudioSession, options?: ExportOptions): Promise<ExportResult>;
    /**
     * Export melodic session to WAV format (simulated)
     */
    exportToWAV(session: MelodicAudioSession, options?: ExportOptions): Promise<ExportResult>;
    /**
     * Export melodic session to MP3 format (simulated)
     */
    exportToMP3(session: MelodicAudioSession, options?: ExportOptions): Promise<ExportResult>;
    /**
     * Export narration in various formats
     */
    exportNarration(session: MelodicAudioSession, chartData: any, options?: ExportOptions): Promise<ExportResult>;
    /**
     * Batch export multiple sessions
     */
    batchExport(sessions: MelodicAudioSession[], chartData: any, options?: ExportOptions): Promise<ExportResult[]>;
    private convertToMIDITime;
    private frequencyToMIDINote;
    private calculateTempo;
    private generateMarkdownNarration;
    private generateHTMLNarration;
    private generateMetadata;
}
export declare const exportEngine: ExportEngine;
