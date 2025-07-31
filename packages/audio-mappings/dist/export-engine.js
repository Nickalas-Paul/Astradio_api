"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportEngine = exports.ExportEngine = void 0;
const narration_generator_1 = require("./narration-generator");
class ExportEngine {
    /**
     * Export melodic session to MIDI format
     */
    async exportToMIDI(session, options) {
        try {
            console.log(`🎵 Exporting session ${session.id} to MIDI format`);
            const midiData = {
                header: {
                    format: 1, // Multi-track format
                    tracks: session.phrases.length + 1, // +1 for tempo track
                    timeDivision: 480 // PPQ (Pulses Per Quarter note)
                },
                tracks: []
            };
            // Add tempo track
            const tempoTrack = {
                name: 'Tempo',
                notes: [],
                tempo: this.calculateTempo(session.tempo)
            };
            midiData.tracks.push(tempoTrack);
            // Convert each phrase to MIDI track
            session.phrases.forEach((phrase, phraseIndex) => {
                const track = {
                    name: `${phrase.planet} - ${phrase.role}`,
                    notes: phrase.notes.map(note => ({
                        time: this.convertToMIDITime(note.timestamp, session.tempo),
                        duration: this.convertToMIDITime(note.duration, session.tempo),
                        note: this.frequencyToMIDINote(note.frequency),
                        velocity: Math.floor(note.velocity * 127),
                        channel: phraseIndex % 16 // Use different channels for different planets
                    }))
                };
                midiData.tracks.push(track);
            });
            const filename = options?.filename || `astroaudio-${session.id}.mid`;
            console.log(`✅ MIDI export completed: ${midiData.tracks.length} tracks, ${midiData.tracks.reduce((sum, track) => sum + track.notes.length, 0)} notes`);
            return {
                success: true,
                data: midiData,
                filename,
                size: JSON.stringify(midiData).length
            };
        }
        catch (error) {
            console.error('MIDI export failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Export melodic session to WAV format (simulated)
     */
    async exportToWAV(session, options) {
        try {
            console.log(`🎵 Exporting session ${session.id} to WAV format`);
            // Simulate WAV generation (in real implementation, would use Tone.js or Web Audio API)
            const sampleRate = 44100;
            const bitDepth = 16;
            const channels = 2; // Stereo
            // Calculate total duration in samples
            const totalDuration = Math.max(...session.phrases.flatMap(p => p.notes.map(n => n.timestamp + n.duration)));
            const totalSamples = Math.ceil(totalDuration * sampleRate);
            // Generate simulated audio data
            const audioData = new Array(totalSamples).fill(0);
            // Apply each note to the audio buffer
            session.phrases.forEach(phrase => {
                phrase.notes.forEach(note => {
                    const startSample = Math.floor(note.timestamp * sampleRate);
                    const endSample = Math.floor((note.timestamp + note.duration) * sampleRate);
                    // Generate sine wave for the note
                    for (let i = startSample; i < endSample && i < totalSamples; i++) {
                        const time = (i - startSample) / sampleRate;
                        const amplitude = note.velocity * Math.exp(-time * 2); // Decay
                        const sample = amplitude * Math.sin(2 * Math.PI * note.frequency * time);
                        audioData[i] = Math.max(-1, Math.min(1, audioData[i] + sample));
                    }
                });
            });
            const filename = options?.filename || `astroaudio-${session.id}.wav`;
            const fileSize = totalSamples * channels * (bitDepth / 8);
            console.log(`✅ WAV export completed: ${(totalDuration / 60).toFixed(2)} minutes, ${fileSize} bytes`);
            return {
                success: true,
                data: {
                    audioData,
                    sampleRate,
                    bitDepth,
                    channels,
                    duration: totalDuration
                },
                filename,
                size: fileSize
            };
        }
        catch (error) {
            console.error('WAV export failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Export melodic session to MP3 format (simulated)
     */
    async exportToMP3(session, options) {
        try {
            console.log(`🎵 Exporting session ${session.id} to MP3 format`);
            // Simulate MP3 compression (in real implementation, would use a proper MP3 encoder)
            const quality = options?.quality || 'medium';
            const compressionRatios = {
                low: 0.1,
                medium: 0.15,
                high: 0.25
            };
            // First generate WAV data
            const wavResult = await this.exportToWAV(session, options);
            if (!wavResult.success) {
                throw new Error('WAV generation failed');
            }
            // Simulate MP3 compression
            const compressedSize = Math.floor(wavResult.size * compressionRatios[quality]);
            const filename = options?.filename || `astroaudio-${session.id}.mp3`;
            console.log(`✅ MP3 export completed: ${compressedSize} bytes (${quality} quality)`);
            return {
                success: true,
                data: {
                    originalSize: wavResult.size,
                    compressedSize,
                    compressionRatio: compressionRatios[quality],
                    quality
                },
                filename,
                size: compressedSize
            };
        }
        catch (error) {
            console.error('MP3 export failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Export narration in various formats
     */
    async exportNarration(session, chartData, options) {
        try {
            console.log(`📝 Exporting narration for session ${session.id}`);
            // Generate narration
            const narration = (0, narration_generator_1.generateMusicNarration)(chartData, {
                mode: session.mode,
                tempo: session.tempo,
                genre: 'electronic' // Default genre since session doesn't have genre property
            });
            const format = options?.format || 'narration';
            const filename = options?.filename || `astroaudio-narration-${session.id}`;
            let exportData;
            switch (format) {
                case 'markdown':
                    exportData = {
                        markdown: this.generateMarkdownNarration(narration, session, chartData),
                        html: this.generateHTMLNarration(narration, session, chartData),
                        metadata: this.generateMetadata(session, chartData)
                    };
                    break;
                case 'html':
                    exportData = {
                        markdown: this.generateMarkdownNarration(narration, session, chartData),
                        html: this.generateHTMLNarration(narration, session, chartData),
                        metadata: this.generateMetadata(session, chartData)
                    };
                    break;
                case 'pdf':
                    exportData = {
                        markdown: this.generateMarkdownNarration(narration, session, chartData),
                        html: this.generateHTMLNarration(narration, session, chartData),
                        pdf: Buffer.from('PDF simulation'), // In real implementation, would generate actual PDF
                        metadata: this.generateMetadata(session, chartData)
                    };
                    break;
                default:
                    exportData = {
                        markdown: this.generateMarkdownNarration(narration, session, chartData),
                        html: this.generateHTMLNarration(narration, session, chartData),
                        metadata: this.generateMetadata(session, chartData)
                    };
            }
            const fileExtension = format === 'markdown' ? '.md' : format === 'html' ? '.html' : '.pdf';
            const finalFilename = `${filename}${fileExtension}`;
            console.log(`✅ Narration export completed: ${format} format, ${exportData.markdown.length} characters`);
            return {
                success: true,
                data: exportData,
                filename: finalFilename,
                size: exportData.markdown.length
            };
        }
        catch (error) {
            console.error('Narration export failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Batch export multiple sessions
     */
    async batchExport(sessions, chartData, options) {
        console.log(`📦 Starting batch export of ${sessions.length} sessions`);
        const results = [];
        for (const session of sessions) {
            try {
                let result;
                switch (options?.format) {
                    case 'midi':
                        result = await this.exportToMIDI(session, options);
                        break;
                    case 'wav':
                        result = await this.exportToWAV(session, options);
                        break;
                    case 'mp3':
                        result = await this.exportToMP3(session, options);
                        break;
                    case 'narration':
                        result = await this.exportNarration(session, chartData, options);
                        break;
                    default:
                        result = {
                            success: false,
                            error: 'Unknown export format'
                        };
                }
                results.push(result);
            }
            catch (error) {
                results.push({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        const successCount = results.filter(r => r.success).length;
        console.log(`✅ Batch export completed: ${successCount}/${sessions.length} successful`);
        return results;
    }
    // Helper methods
    convertToMIDITime(seconds, tempo) {
        const beatsPerSecond = tempo / 60;
        const beats = seconds * beatsPerSecond;
        return Math.round(beats * 480); // 480 PPQ
    }
    frequencyToMIDINote(frequency) {
        return Math.round(12 * Math.log2(frequency / 440) + 69);
    }
    calculateTempo(tempo) {
        return Math.round(60000000 / tempo); // Microseconds per quarter note
    }
    generateMarkdownNarration(narration, session, chartData) {
        return `# AstroAudio Composition: ${chartData.metadata.birth_datetime}

## 🎵 Musical Information
- **Mode**: ${session.mode}
- **Tempo**: ${session.tempo} BPM
- **Key**: ${session.key}
- **Scale**: ${session.scale.join(', ')}
- **Genre**: electronic
- **Duration**: ${(session.phrases.reduce((sum, p) => sum + p.notes.reduce((s, n) => s + n.duration, 0), 0) / 60).toFixed(2)} minutes

## 📝 Musical Interpretation

${narration.fullNarration}

## 🎼 Composition Details
- **Total Phrases**: ${session.phrases.length}
- **Total Notes**: ${session.phrases.reduce((sum, p) => sum + p.notes.length, 0)}
- **Planets Featured**: ${session.phrases.map(p => p.planet).join(', ')}

---
*Generated by AstroAudio - Astrological Music Composition System*
`;
    }
    generateHTMLNarration(narration, session, chartData) {
        return `<!DOCTYPE html>
<html>
<head>
    <title>AstroAudio Composition</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #667eea; }
        .metadata { background: #f5f5f5; padding: 15px; border-radius: 5px; }
        .narration { line-height: 1.6; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎵 AstroAudio Composition</h1>
        <p>Birth Chart: ${chartData.metadata.birth_datetime}</p>
    </div>
    
    <div class="metadata">
        <h2>Musical Information</h2>
        <p><strong>Mode:</strong> ${session.mode}</p>
        <p><strong>Tempo:</strong> ${session.tempo} BPM</p>
        <p><strong>Key:</strong> ${session.key}</p>
        <p><strong>Scale:</strong> ${session.scale.join(', ')}</p>
        <p><strong>Genre:</strong> electronic</p>
    </div>
    
    <div class="narration">
        ${narration.fullNarration.replace(/\n/g, '<br>')}
    </div>
    
    <div class="section">
        <h3>Composition Details</h3>
        <p><strong>Total Phrases:</strong> ${session.phrases.length}</p>
        <p><strong>Total Notes:</strong> ${session.phrases.reduce((sum, p) => sum + p.notes.length, 0)}</p>
        <p><strong>Planets Featured:</strong> ${session.phrases.map(p => p.planet).join(', ')}</p>
    </div>
    
    <hr>
    <p><em>Generated by AstroAudio - Astrological Music Composition System</em></p>
</body>
</html>`;
    }
    generateMetadata(session, chartData) {
        return {
            title: `AstroAudio Composition - ${chartData.metadata.birth_datetime}`,
            author: 'AstroAudio System',
            date: new Date().toISOString(),
            duration: `${(session.phrases.reduce((sum, p) => sum + p.notes.reduce((s, n) => s + n.duration, 0), 0) / 60).toFixed(2)} minutes`,
            genre: 'electronic',
            mode: session.mode
        };
    }
}
exports.ExportEngine = ExportEngine;
exports.exportEngine = new ExportEngine();
