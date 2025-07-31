"use strict";
// Audio Generator for Astradio Backend
// Generates actual audio files or streams for astrological compositions
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioGenerator = void 0;
// Simple sine wave generator for Node.js
class SineWaveGenerator {
    constructor(sampleRate = 44100) {
        this.sampleRate = sampleRate;
    }
    generateSineWave(frequency, duration, volume = 0.5) {
        const numSamples = Math.floor(duration * this.sampleRate);
        const samples = new Float32Array(numSamples);
        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;
            samples[i] = Math.sin(2 * Math.PI * frequency * t) * volume;
        }
        return samples;
    }
    generateTone(frequency, duration, volume = 0.5, instrument = 'sine') {
        switch (instrument) {
            case 'sawtooth':
                return this.generateSawtooth(frequency, duration, volume);
            case 'square':
                return this.generateSquare(frequency, duration, volume);
            case 'triangle':
                return this.generateTriangle(frequency, duration, volume);
            default:
                return this.generateSineWave(frequency, duration, volume);
        }
    }
    generateSawtooth(frequency, duration, volume) {
        const numSamples = Math.floor(duration * this.sampleRate);
        const samples = new Float32Array(numSamples);
        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;
            const phase = (frequency * t) % 1;
            samples[i] = (2 * phase - 1) * volume;
        }
        return samples;
    }
    generateSquare(frequency, duration, volume) {
        const numSamples = Math.floor(duration * this.sampleRate);
        const samples = new Float32Array(numSamples);
        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;
            const phase = (frequency * t) % 1;
            samples[i] = (phase < 0.5 ? 1 : -1) * volume;
        }
        return samples;
    }
    generateTriangle(frequency, duration, volume) {
        const numSamples = Math.floor(duration * this.sampleRate);
        const samples = new Float32Array(numSamples);
        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;
            const phase = (frequency * t) % 1;
            samples[i] = (Math.abs(2 * phase - 1) * 2 - 1) * volume;
        }
        return samples;
    }
}
class AudioGenerator {
    constructor(sampleRate = 44100) {
        this.generator = new SineWaveGenerator(sampleRate);
        this.sampleRate = sampleRate;
    }
    // Get genre-specific instrument for a planet
    getGenreInstrument(planet, genre) {
        const genreInstruments = {
            ambient: {
                Sun: 'sine', Moon: 'sine', Mercury: 'triangle', Venus: 'triangle',
                Mars: 'sine', Jupiter: 'sine', Saturn: 'sine', Uranus: 'triangle',
                Neptune: 'sine', Pluto: 'sine'
            },
            folk: {
                Sun: 'triangle', Moon: 'sine', Mercury: 'square', Venus: 'triangle',
                Mars: 'triangle', Jupiter: 'sine', Saturn: 'square', Uranus: 'triangle',
                Neptune: 'sine', Pluto: 'triangle'
            },
            jazz: {
                Sun: 'sawtooth', Moon: 'sine', Mercury: 'square', Venus: 'triangle',
                Mars: 'sawtooth', Jupiter: 'sine', Saturn: 'square', Uranus: 'triangle',
                Neptune: 'sine', Pluto: 'sawtooth'
            },
            classical: {
                Sun: 'sine', Moon: 'sine', Mercury: 'triangle', Venus: 'triangle',
                Mars: 'sine', Jupiter: 'sine', Saturn: 'sine', Uranus: 'triangle',
                Neptune: 'sine', Pluto: 'sine'
            },
            electronic: {
                Sun: 'sawtooth', Moon: 'sine', Mercury: 'square', Venus: 'triangle',
                Mars: 'sawtooth', Jupiter: 'sine', Saturn: 'square', Uranus: 'triangle',
                Neptune: 'sine', Pluto: 'sawtooth'
            },
            rock: {
                Sun: 'sawtooth', Moon: 'sine', Mercury: 'square', Venus: 'triangle',
                Mars: 'sawtooth', Jupiter: 'sine', Saturn: 'square', Uranus: 'triangle',
                Neptune: 'sine', Pluto: 'sawtooth'
            },
            blues: {
                Sun: 'sawtooth', Moon: 'sine', Mercury: 'triangle', Venus: 'triangle',
                Mars: 'sawtooth', Jupiter: 'sine', Saturn: 'square', Uranus: 'triangle',
                Neptune: 'sine', Pluto: 'sawtooth'
            },
            world: {
                Sun: 'triangle', Moon: 'sine', Mercury: 'triangle', Venus: 'triangle',
                Mars: 'triangle', Jupiter: 'sine', Saturn: 'square', Uranus: 'triangle',
                Neptune: 'sine', Pluto: 'triangle'
            },
            techno: {
                Sun: 'sawtooth', Moon: 'sine', Mercury: 'square', Venus: 'triangle',
                Mars: 'sawtooth', Jupiter: 'sine', Saturn: 'square', Uranus: 'triangle',
                Neptune: 'sine', Pluto: 'sawtooth'
            },
            chill: {
                Sun: 'sine', Moon: 'sine', Mercury: 'triangle', Venus: 'triangle',
                Mars: 'sine', Jupiter: 'sine', Saturn: 'sine', Uranus: 'triangle',
                Neptune: 'sine', Pluto: 'sine'
            }
        };
        // Return genre-specific instrument or fallback to default
        const genreMap = genreInstruments[genre] || genreInstruments['ambient'];
        return genreMap[planet] || 'sine';
    }
    // Generate audio composition from astrological chart
    generateChartAudio(chart, duration = 60, genre = 'ambient') {
        const notes = [];
        const secondsPerHouse = duration / 12;
        // Base planetary mappings
        const basePlanetaryMappings = {
            Sun: { baseFrequency: 264, energy: 0.8, instrument: 'sine' },
            Moon: { baseFrequency: 294, energy: 0.4, instrument: 'triangle' },
            Mercury: { baseFrequency: 392, energy: 0.6, instrument: 'sine' },
            Venus: { baseFrequency: 349, energy: 0.5, instrument: 'triangle' },
            Mars: { baseFrequency: 330, energy: 0.9, instrument: 'sawtooth' },
            Jupiter: { baseFrequency: 440, energy: 0.7, instrument: 'sine' },
            Saturn: { baseFrequency: 220, energy: 0.3, instrument: 'square' },
            Uranus: { baseFrequency: 523, energy: 0.6, instrument: 'sawtooth' },
            Neptune: { baseFrequency: 494, energy: 0.4, instrument: 'triangle' },
            Pluto: { baseFrequency: 147, energy: 0.2, instrument: 'square' }
        };
        // Sort planets by house position
        const planetEntries = Object.entries(chart.planets);
        planetEntries.sort((a, b) => a[1].house - b[1].house);
        let currentTime = 0;
        planetEntries.forEach(([planetName, planetData]) => {
            const mapping = basePlanetaryMappings[planetName];
            if (!mapping)
                return;
            const frequency = this.calculateFrequency(mapping.baseFrequency, planetData.sign.degree, planetData.house);
            const noteDuration = secondsPerHouse * 0.8; // Use 80% of house time
            const volume = this.calculateVolume(mapping.energy, planetData.house);
            notes.push({
                frequency,
                duration: noteDuration,
                volume,
                instrument: mapping.instrument,
                startTime: currentTime
            });
            currentTime += secondsPerHouse;
        });
        return {
            notes,
            duration,
            totalDuration: duration,
            sampleRate: this.sampleRate,
            format: 'wav'
        };
    }
    // Generate sandbox-specific audio based on custom chart and aspects
    generateSandboxAudio(chart, aspects = [], configuration = {}, duration = 60, genre = 'ambient') {
        const notes = [];
        const secondsPerHouse = duration / 12;
        // Base planetary mappings with genre-specific instruments
        const basePlanetaryMappings = {
            Sun: { baseFrequency: 264, energy: 0.8 },
            Moon: { baseFrequency: 294, energy: 0.4 },
            Mercury: { baseFrequency: 392, energy: 0.6 },
            Venus: { baseFrequency: 349, energy: 0.5 },
            Mars: { baseFrequency: 330, energy: 0.9 },
            Jupiter: { baseFrequency: 440, energy: 0.7 },
            Saturn: { baseFrequency: 220, energy: 0.3 },
            Uranus: { baseFrequency: 523, energy: 0.6 },
            Neptune: { baseFrequency: 494, energy: 0.4 },
            Pluto: { baseFrequency: 147, energy: 0.2 },
            Chiron: { baseFrequency: 370, energy: 0.5 },
            Lilith: { baseFrequency: 415, energy: 0.3 },
            'North Node': { baseFrequency: 466, energy: 0.6 },
            'South Node': { baseFrequency: 311, energy: 0.4 },
            Ceres: { baseFrequency: 277, energy: 0.4 },
            Juno: { baseFrequency: 415, energy: 0.5 },
            Vesta: { baseFrequency: 349, energy: 0.6 },
            Pallas: { baseFrequency: 392, energy: 0.5 },
            Eris: { baseFrequency: 185, energy: 0.3 }
        };
        // Sort planets by house position
        const planetEntries = Object.entries(chart.planets);
        planetEntries.sort((a, b) => a[1].house - b[1].house);
        let currentTime = 0;
        // Generate notes for each planet
        planetEntries.forEach(([planetName, planetData]) => {
            const mapping = basePlanetaryMappings[planetName];
            if (!mapping)
                return;
            const frequency = this.calculateFrequency(mapping.baseFrequency, planetData.sign.degree, planetData.house);
            const noteDuration = secondsPerHouse * 0.8;
            const volume = this.calculateVolume(mapping.energy, planetData.house);
            const instrument = this.getGenreInstrument(planetName, genre);
            notes.push({
                frequency,
                duration: noteDuration,
                volume,
                instrument,
                startTime: currentTime
            });
            currentTime += secondsPerHouse;
        });
        // Add aspect-based harmonic notes
        aspects.forEach((aspect, index) => {
            const aspectNote = this.generateAspectNote(aspect, genre, currentTime + (index * 2));
            if (aspectNote) {
                notes.push(aspectNote);
            }
        });
        // Apply configuration overrides
        if (configuration.tempo) {
            const tempoMultiplier = configuration.tempo / 120; // 120 BPM as baseline
            notes.forEach(note => {
                note.duration *= tempoMultiplier;
            });
        }
        if (configuration.volume) {
            notes.forEach(note => {
                note.volume *= configuration.volume;
            });
        }
        return {
            notes,
            duration,
            totalDuration: duration,
            sampleRate: this.sampleRate,
            format: 'wav'
        };
    }
    // Generate harmonic notes based on aspects
    generateAspectNote(aspect, genre, startTime) {
        // Enhanced astrological aspect harmonics with proper meanings
        const aspectAstrologicalHarmonics = {
            conjunction: {
                frequency: 1.0,
                energy: 0.8,
                meaning: 'Unity & Focus',
                musicalQuality: 'unison',
                orb: 8
            },
            opposition: {
                frequency: 2.0,
                energy: 0.9,
                meaning: 'Balance & Tension',
                musicalQuality: 'octave',
                orb: 8
            },
            trine: {
                frequency: 1.5,
                energy: 0.7,
                meaning: 'Harmony & Flow',
                musicalQuality: 'perfect_fifth',
                orb: 8
            },
            square: {
                frequency: 1.33,
                energy: 0.6,
                meaning: 'Challenge & Growth',
                musicalQuality: 'perfect_fourth',
                orb: 8
            },
            sextile: {
                frequency: 1.17,
                energy: 0.5,
                meaning: 'Opportunity & Cooperation',
                musicalQuality: 'major_third',
                orb: 6
            }
        };
        const harmonic = aspectAstrologicalHarmonics[aspect.type];
        if (!harmonic) {
            console.warn('⚠️ Unknown aspect type:', aspect.type);
            return null;
        }
        // Calculate aspect strength based on angle (using angle as proxy for orb)
        const angleStrength = Math.max(0, 1 - (Math.abs(aspect.angle - 0) / 10));
        // Base frequency from the aspect type
        const baseFreq = 264; // Middle C
        let frequency = baseFreq * harmonic.frequency;
        // Adjust frequency based on the planets involved
        if (aspect.planet1 && aspect.planet2) {
            const planetFrequencies = {
                Sun: 264, Moon: 294, Mercury: 392, Venus: 349, Mars: 330,
                Jupiter: 440, Saturn: 220, Uranus: 523, Neptune: 494, Pluto: 147
            };
            const fromFreq = planetFrequencies[aspect.planet1] || baseFreq;
            const toFreq = planetFrequencies[aspect.planet2] || baseFreq;
            // Blend the frequencies based on aspect type
            switch (aspect.type) {
                case 'conjunction':
                    frequency = (fromFreq + toFreq) / 2; // Average
                    break;
                case 'opposition':
                    frequency = Math.max(fromFreq, toFreq) * 1.5; // Higher frequency
                    break;
                case 'trine':
                    frequency = (fromFreq + toFreq) * 0.75; // Harmonious blend
                    break;
                case 'square':
                    frequency = Math.abs(fromFreq - toFreq) * 1.2; // Tension
                    break;
                default:
                    frequency = (fromFreq + toFreq) / 2; // Default blend
            }
        }
        // Calculate volume based on aspect strength and type
        let volume = harmonic.energy * angleStrength;
        // Aspect-specific volume adjustments
        switch (aspect.type) {
            case 'conjunction':
                volume *= 1.2; // Strongest aspect
                break;
            case 'opposition':
                volume *= 1.1; // Very strong
                break;
            case 'trine':
                volume *= 1.0; // Harmonious
                break;
            case 'square':
                volume *= 0.9; // Challenging
                break;
            case 'sextile':
                volume *= 0.8; // Gentle
                break;
            default:
                volume *= 0.7; // Minor aspects
        }
        // Clamp volume
        volume = Math.max(0.1, Math.min(1.0, volume));
        // Choose instrument based on aspect type
        let instrument = 'sine';
        switch (aspect.type) {
            case 'conjunction':
                instrument = 'sine'; // Pure, unified
                break;
            case 'opposition':
                instrument = 'square'; // Contrasting
                break;
            case 'trine':
                instrument = 'triangle'; // Harmonious
                break;
            case 'square':
                instrument = 'sawtooth'; // Tension
                break;
            case 'sextile':
                instrument = 'triangle'; // Gentle
                break;
            default:
                instrument = 'sine';
        }
        // Apply genre-specific instrument override
        const genreInstrument = this.getGenreInstrument('Sun', genre);
        if (genreInstrument !== 'sine') {
            instrument = genreInstrument;
        }
        console.log(`🎵 Generated aspect note for ${aspect.planet1}-${aspect.planet2} ${aspect.type}:`, {
            frequency: Math.round(frequency),
            volume: volume.toFixed(2),
            instrument,
            meaning: harmonic.meaning,
            angle: aspect.angle,
            strength: angleStrength.toFixed(2)
        });
        return {
            frequency: Math.round(frequency),
            duration: 3, // 3-second aspect note
            volume,
            instrument,
            startTime
        };
    }
    // Generate daily audio based on transit data
    generateDailyAudio(transitData, duration = 60, genre = 'ambient') {
        console.log('🎵 generateDailyAudio called with:', { transitData, duration, genre });
        const notes = [];
        const secondsPerPlanet = duration / Math.max(transitData.planets.length, 1);
        // Enhanced astrological planetary mappings with proper energy levels
        const astrologicalPlanetaryMappings = {
            Sun: {
                baseFrequency: 264, // C4 - Solar energy
                energy: 0.9,
                element: 'fire',
                qualities: ['leadership', 'vitality', 'creativity']
            },
            Moon: {
                baseFrequency: 294, // D4 - Lunar intuition
                energy: 0.7,
                element: 'water',
                qualities: ['emotion', 'intuition', 'nurturing']
            },
            Mercury: {
                baseFrequency: 392, // G4 - Mercurial communication
                energy: 0.6,
                element: 'air',
                qualities: ['communication', 'intellect', 'adaptability']
            },
            Venus: {
                baseFrequency: 349, // F4 - Venusian harmony
                energy: 0.8,
                element: 'earth',
                qualities: ['beauty', 'harmony', 'relationships']
            },
            Mars: {
                baseFrequency: 330, // E4 - Martial energy
                energy: 0.9,
                element: 'fire',
                qualities: ['action', 'passion', 'courage']
            },
            Jupiter: {
                baseFrequency: 440, // A4 - Jovian expansion
                energy: 0.8,
                element: 'fire',
                qualities: ['wisdom', 'expansion', 'optimism']
            },
            Saturn: {
                baseFrequency: 220, // A3 - Saturnine structure
                energy: 0.5,
                element: 'earth',
                qualities: ['discipline', 'structure', 'limitation']
            },
            Uranus: {
                baseFrequency: 523, // C5 - Uranian innovation
                energy: 0.7,
                element: 'air',
                qualities: ['innovation', 'rebellion', 'freedom']
            },
            Neptune: {
                baseFrequency: 494, // B4 - Neptunian transcendence
                energy: 0.6,
                element: 'water',
                qualities: ['spirituality', 'illusion', 'compassion']
            },
            Pluto: {
                baseFrequency: 147, // D3 - Plutonian transformation
                energy: 0.4,
                element: 'water',
                qualities: ['transformation', 'power', 'regeneration']
            }
        };
        // Astrological house meanings and musical characteristics
        const houseMusicalCharacteristics = {
            1: { tempo: 1.2, volume: 1.0, harmony: 'major', description: 'Identity & Self' },
            2: { tempo: 0.8, volume: 0.7, harmony: 'minor', description: 'Values & Resources' },
            3: { tempo: 1.1, volume: 0.8, harmony: 'major', description: 'Communication & Learning' },
            4: { tempo: 0.9, volume: 0.9, harmony: 'minor', description: 'Home & Family' },
            5: { tempo: 1.3, volume: 1.0, harmony: 'major', description: 'Creativity & Romance' },
            6: { tempo: 0.7, volume: 0.6, harmony: 'minor', description: 'Work & Health' },
            7: { tempo: 1.0, volume: 0.8, harmony: 'major', description: 'Partnerships & Balance' },
            8: { tempo: 0.6, volume: 0.5, harmony: 'minor', description: 'Transformation & Shared Resources' },
            9: { tempo: 1.2, volume: 0.9, harmony: 'major', description: 'Philosophy & Travel' },
            10: { tempo: 1.1, volume: 1.0, harmony: 'major', description: 'Career & Public Image' },
            11: { tempo: 1.0, volume: 0.8, harmony: 'major', description: 'Friendships & Groups' },
            12: { tempo: 0.5, volume: 0.4, harmony: 'minor', description: 'Spirituality & Hidden Things' }
        };
        // Zodiac sign musical characteristics
        const zodiacMusicalCharacteristics = {
            Aries: { frequency: 1.0, rhythm: 'energetic', element: 'fire' },
            Taurus: { frequency: 0.9, rhythm: 'steady', element: 'earth' },
            Gemini: { frequency: 1.1, rhythm: 'varied', element: 'air' },
            Cancer: { frequency: 0.8, rhythm: 'flowing', element: 'water' },
            Leo: { frequency: 1.2, rhythm: 'bold', element: 'fire' },
            Virgo: { frequency: 0.7, rhythm: 'precise', element: 'earth' },
            Libra: { frequency: 1.0, rhythm: 'balanced', element: 'air' },
            Scorpio: { frequency: 0.6, rhythm: 'intense', element: 'water' },
            Sagittarius: { frequency: 1.3, rhythm: 'expansive', element: 'fire' },
            Capricorn: { frequency: 0.8, rhythm: 'structured', element: 'earth' },
            Aquarius: { frequency: 1.1, rhythm: 'innovative', element: 'air' },
            Pisces: { frequency: 0.5, rhythm: 'dreamy', element: 'water' }
        };
        let currentTime = 0;
        console.log('🎵 Generating notes for planets:', transitData.planets.map((p) => p.name));
        // Generate notes for each planet in transit with astrological rules
        transitData.planets.forEach((planet) => {
            const mapping = astrologicalPlanetaryMappings[planet.name];
            if (!mapping) {
                console.warn('⚠️ No mapping found for planet:', planet.name);
                return;
            }
            // Get house characteristics
            const houseChar = houseMusicalCharacteristics[planet.house] ||
                houseMusicalCharacteristics[1];
            // Get zodiac sign characteristics
            const signName = planet.sign?.name || 'Aries';
            const zodiacChar = zodiacMusicalCharacteristics[signName] ||
                zodiacMusicalCharacteristics['Aries'];
            // Calculate frequency with astrological modifications
            let frequency = mapping.baseFrequency;
            // Modify by sign degree (0-29 degrees within sign)
            const signDegree = planet.longitude % 30;
            frequency *= (1 + (signDegree / 30) * 0.5); // Up to 50% frequency variation
            // Modify by zodiac sign characteristics
            frequency *= zodiacChar.frequency;
            // Modify by house characteristics
            frequency *= houseChar.tempo;
            // Calculate volume with astrological rules
            let volume = mapping.energy;
            // House influence on volume
            volume *= houseChar.volume;
            // Element compatibility bonus
            if (mapping.element === zodiacChar.element) {
                volume *= 1.2; // 20% boost for element compatibility
            }
            // Angular houses (1, 4, 7, 10) are stronger
            if ([1, 4, 7, 10].includes(planet.house)) {
                volume *= 1.3; // 30% boost for angular houses
            }
            // Succedent houses (2, 5, 8, 11) are moderate
            if ([2, 5, 8, 11].includes(planet.house)) {
                volume *= 1.1; // 10% boost for succedent houses
            }
            // Cadent houses (3, 6, 9, 12) are weaker
            if ([3, 6, 9, 12].includes(planet.house)) {
                volume *= 0.9; // 10% reduction for cadent houses
            }
            // Clamp volume to reasonable range
            volume = Math.max(0.1, Math.min(1.0, volume));
            const noteDuration = secondsPerPlanet * 0.8;
            const instrument = this.getGenreInstrument(planet.name, genre);
            // Add astrological metadata to the note
            const astrologicalNote = {
                frequency: Math.round(frequency),
                duration: noteDuration,
                volume: volume,
                instrument: instrument,
                startTime: currentTime,
                // Astrological metadata
                planet: planet.name,
                sign: signName,
                house: planet.house,
                element: mapping.element,
                qualities: mapping.qualities,
                houseCharacteristics: houseChar,
                zodiacCharacteristics: zodiacChar
            };
            console.log(`🎵 Generated astrological note for ${planet.name}:`, {
                frequency: Math.round(frequency),
                duration: noteDuration.toFixed(2),
                volume: volume.toFixed(2),
                instrument,
                startTime: currentTime.toFixed(2),
                sign: signName,
                house: planet.house,
                element: mapping.element,
                houseDesc: houseChar.description
            });
            notes.push(astrologicalNote);
            currentTime += secondsPerPlanet;
        });
        console.log('🎵 Total notes generated:', notes.length);
        console.log('🎵 Total duration:', duration);
        return {
            notes,
            duration,
            totalDuration: duration,
            sampleRate: this.sampleRate,
            format: 'wav'
        };
    }
    // Generate WAV file buffer from composition
    generateWAVBuffer(composition) {
        const { notes, duration, sampleRate } = composition;
        const totalSamples = Math.floor(duration * sampleRate);
        const audioData = new Float32Array(totalSamples);
        // Mix all notes
        notes.forEach(note => {
            const noteSamples = this.generator.generateTone(note.frequency, note.duration, note.volume, note.instrument);
            const startSample = Math.floor(note.startTime * sampleRate);
            for (let i = 0; i < noteSamples.length && startSample + i < totalSamples; i++) {
                audioData[startSample + i] += noteSamples[i];
            }
        });
        // Normalize audio
        let maxAmplitude = 0;
        for (let i = 0; i < audioData.length; i++) {
            const absValue = Math.abs(audioData[i]);
            if (absValue > maxAmplitude) {
                maxAmplitude = absValue;
            }
        }
        if (maxAmplitude > 0) {
            for (let i = 0; i < audioData.length; i++) {
                audioData[i] /= maxAmplitude * 0.8; // Leave some headroom
            }
        }
        // Convert to 16-bit PCM
        const pcmData = new Int16Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
            pcmData[i] = Math.round(audioData[i] * 32767);
        }
        // Create WAV header
        const header = this.createWAVHeader(pcmData.length * 2, sampleRate);
        // Combine header and audio data
        const buffer = Buffer.alloc(header.length + pcmData.length * 2);
        buffer.set(header, 0);
        buffer.set(new Uint8Array(pcmData.buffer), header.length);
        return buffer;
    }
    createWAVHeader(dataLength, sampleRate) {
        const header = Buffer.alloc(44);
        // RIFF header
        header.write('RIFF', 0);
        header.writeUInt32LE(36 + dataLength, 4);
        header.write('WAVE', 8);
        // fmt chunk
        header.write('fmt ', 12);
        header.writeUInt32LE(16, 16); // fmt chunk size
        header.writeUInt16LE(1, 20); // PCM format
        header.writeUInt16LE(1, 22); // mono
        header.writeUInt32LE(sampleRate, 24);
        header.writeUInt32LE(sampleRate * 2, 28); // byte rate
        header.writeUInt16LE(2, 32); // block align
        header.writeUInt16LE(16, 34); // bits per sample
        // data chunk
        header.write('data', 36);
        header.writeUInt32LE(dataLength, 40);
        return header;
    }
    calculateFrequency(baseFreq, signDegree, house) {
        const degreeMultiplier = 1 + (signDegree / 30) * 0.5;
        const houseMultiplier = 1 + (house - 1) * 0.1;
        return baseFreq * degreeMultiplier * houseMultiplier;
    }
    calculateVolume(planetEnergy, house) {
        const baseVolume = 0.3;
        const energyGain = planetEnergy * 0.4;
        const houseGain = (house - 1) * 0.05;
        return Math.min(0.8, baseVolume + energyGain + houseGain);
    }
}
exports.AudioGenerator = AudioGenerator;
