"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enhancedCompositionEngine = exports.EnhancedCompositionEngine = void 0;
const index_1 = require("./index");
class EnhancedCompositionEngine {
    constructor() {
        this.currentSession = null;
        this.scheduledEvents = [];
        // Duration configurations
        this.FREE_DURATION_PER_HOUSE = 5; // 5 seconds per house
        this.PREMIUM_DURATION_PER_HOUSE = 30; // 30 seconds per house
        this.FREE_TOTAL_DURATION = 60; // 1 minute total
        this.PREMIUM_TOTAL_DURATION = 360; // 6 minutes total
        // Musical scales for different elements
        this.elementScales = {
            Fire: [0, 2, 4, 6, 7, 9, 11], // Lydian
            Earth: [0, 2, 3, 5, 7, 8, 10], // Dorian
            Air: [0, 2, 4, 5, 7, 9, 10], // Mixolydian
            Water: [0, 2, 3, 5, 7, 8, 10] // Aeolian
        };
        // House characteristics for musical influence
        this.houseCharacteristics = {
            1: { element: 'Fire', mood: 'assertive', tempo: 120 },
            2: { element: 'Earth', mood: 'stable', tempo: 100 },
            3: { element: 'Air', mood: 'curious', tempo: 140 },
            4: { element: 'Water', mood: 'emotional', tempo: 80 },
            5: { element: 'Fire', mood: 'creative', tempo: 130 },
            6: { element: 'Earth', mood: 'practical', tempo: 110 },
            7: { element: 'Air', mood: 'social', tempo: 115 },
            8: { element: 'Water', mood: 'intense', tempo: 90 },
            9: { element: 'Fire', mood: 'expansive', tempo: 125 },
            10: { element: 'Earth', mood: 'ambitious', tempo: 135 },
            11: { element: 'Air', mood: 'innovative', tempo: 150 },
            12: { element: 'Water', mood: 'mystical', tempo: 70 }
        };
    }
    async generateHouseBasedComposition(chartData, config) {
        console.log('Generating enhanced house-based composition...');
        console.log(`Configuration: ${JSON.stringify(config)}`);
        const durationPerHouse = config.duration === 'premium'
            ? this.PREMIUM_DURATION_PER_HOUSE
            : this.FREE_DURATION_PER_HOUSE;
        const totalDuration = config.duration === 'premium'
            ? this.PREMIUM_TOTAL_DURATION
            : this.FREE_TOTAL_DURATION;
        // Organize planets by house
        const housesWithPlanets = this.organizePlanetsByHouse(chartData);
        // Generate house compositions
        const houseCompositions = [];
        const motifs = [];
        let currentKey = 0; // C major
        for (let houseNum = 1; houseNum <= 12; houseNum++) {
            const planets = housesWithPlanets[houseNum] || [];
            const houseChar = this.houseCharacteristics[houseNum];
            // Generate melody for this house
            const melody = this.generateHouseMelody(planets, houseChar, currentKey);
            // Generate transition to next house
            const transition = this.generateHouseTransition(houseNum, houseChar, config.includeTransitions);
            // Create house composition
            const houseComp = {
                houseNumber: houseNum,
                planets,
                duration: durationPerHouse,
                melody,
                transition
            };
            houseCompositions.push(houseComp);
            // Store motif for recurrence
            if (melody.motif && config.motifRecurrence) {
                motifs.push(melody.motif);
            }
            // Update key for next house
            if (transition.keyChange) {
                currentKey = (currentKey + transition.keyChange) % 12;
            }
        }
        // Generate interpretation
        const interpretation = this.generateHouseBasedInterpretation(houseCompositions, config);
        return {
            houses: houseCompositions,
            totalDuration,
            key: this.getKeyName(currentKey),
            tempo: this.calculateAverageTempo(houseCompositions),
            motifs,
            interpretation
        };
    }
    organizePlanetsByHouse(chartData) {
        const houses = {};
        Object.entries(chartData.planets).forEach(([planetName, planetData]) => {
            const house = planetData.house;
            if (!houses[house]) {
                houses[house] = [];
            }
            houses[house].push(planetName);
        });
        return houses;
    }
    generateHouseMelody(planets, houseChar, key) {
        const scale = this.elementScales[houseChar.element];
        const notes = [];
        const rhythm = [];
        const harmony = [];
        if (planets.length === 0) {
            // Empty house - generate ambient tones
            notes.push(key + scale[0], key + scale[2], key + scale[4]);
            rhythm.push(0.5, 0.5, 1.0);
            harmony.push(key + scale[0] + 12, key + scale[4] + 12);
        }
        else {
            // Generate melody based on planets in this house
            planets.forEach((planet, index) => {
                const mapping = index_1.planetaryMappings[planet];
                if (!mapping)
                    return;
                // Calculate note based on planet's base frequency
                const baseNote = this.frequencyToNote(mapping.baseFrequency);
                const scaleNote = scale[index % scale.length];
                const note = key + scaleNote;
                notes.push(note);
                rhythm.push(0.25 + (mapping.energy * 0.5)); // Energy affects rhythm
                // Add harmony based on element
                const harmonyNote = key + scale[(index + 2) % scale.length] + 12;
                harmony.push(harmonyNote);
            });
        }
        // Create motif for recurrence
        const motif = notes.slice(0, Math.min(3, notes.length));
        return {
            notes,
            rhythm,
            harmony,
            motif
        };
    }
    generateHouseTransition(houseNum, houseChar, includeTransitions) {
        if (!includeTransitions) {
            return { type: 'smooth', duration: 0.5 };
        }
        // Determine transition type based on house characteristics
        let transitionType = 'smooth';
        let keyChange = 0;
        if (houseNum % 4 === 0) {
            // Cardinal houses - more dramatic transitions
            transitionType = 'modulation';
            keyChange = 2; // Move up a whole step
        }
        else if (houseNum % 3 === 0) {
            // Mutable houses - contrasting transitions
            transitionType = 'contrast';
        }
        return {
            type: transitionType,
            duration: 0.5,
            keyChange
        };
    }
    frequencyToNote(frequency) {
        // Convert frequency to MIDI note number
        return Math.round(12 * Math.log2(frequency / 440) + 69);
    }
    getKeyName(key) {
        const keyNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return keyNames[key];
    }
    calculateAverageTempo(houseCompositions) {
        const tempos = houseCompositions.map(comp => this.houseCharacteristics[comp.houseNumber].tempo);
        return Math.round(tempos.reduce((sum, tempo) => sum + tempo, 0) / tempos.length);
    }
    generateHouseBasedInterpretation(houseCompositions, config) {
        let interpretation = `This ${config.duration === 'premium' ? 'expanded' : 'cosmic'} composition flows through all 12 houses of your astrological chart, creating a musical journey that reflects your unique celestial blueprint.\n\n`;
        houseCompositions.forEach((house, index) => {
            if (house.planets.length === 0) {
                interpretation += `House ${house.houseNumber}: A serene passage representing ${this.getHouseTheme(house.houseNumber)}. The ambient tones create space for reflection.\n\n`;
            }
            else {
                const planetNames = house.planets.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');
                interpretation += `House ${house.houseNumber}: ${planetNames} ${house.planets.length === 1 ? 'influences' : 'influence'} the ${this.getHouseTheme(house.houseNumber)} area of your life. The ${this.houseCharacteristics[house.houseNumber].mood} melody reflects this energy.\n\n`;
            }
        });
        if (config.duration === 'premium') {
            interpretation += `\nThis expanded composition allows for deeper exploration of each house's musical character, with richer harmonies and more detailed planetary interactions. The ${this.PREMIUM_TOTAL_DURATION / 60} minute journey provides a complete astrological soundscape.`;
        }
        return interpretation;
    }
    getHouseTheme(houseNumber) {
        const themes = {
            1: 'self and identity',
            2: 'values and resources',
            3: 'communication and learning',
            4: 'home and family',
            5: 'creativity and romance',
            6: 'work and health',
            7: 'partnerships and relationships',
            8: 'transformation and shared resources',
            9: 'philosophy and expansion',
            10: 'career and public image',
            11: 'friendships and aspirations',
            12: 'spirituality and subconscious'
        };
        return themes[houseNumber];
    }
    // Audio playback methods
    async playComposition(composition) {
        const sessionId = `enhanced_${Date.now()}`;
        this.currentSession = {
            id: sessionId,
            chartId: 'enhanced_composition',
            configuration: {
                mode: 'melodic',
                duration: composition.totalDuration,
                tempo: composition.tempo,
                key: composition.key
            },
            isPlaying: true,
            startTime: Date.now()
        };
        console.log(`Playing enhanced composition: ${composition.totalDuration}s, ${composition.tempo}BPM, Key: ${composition.key}`);
        // Schedule house compositions
        let currentTime = 0;
        composition.houses.forEach((house, index) => {
            // Schedule melody notes
            house.melody.notes.forEach((note, noteIndex) => {
                const rhythm = house.melody.rhythm[noteIndex] || 0.5;
                const duration = rhythm;
                // Schedule note
                setTimeout(() => {
                    console.log(`House ${house.houseNumber}: Playing note ${note} for ${duration}s`);
                    // Here you would trigger actual audio playback
                }, currentTime * 1000);
                currentTime += duration;
            });
            // Schedule transition to next house
            if (index < composition.houses.length - 1) {
                const transition = house.transition;
                currentTime += transition.duration;
            }
        });
        // Stop after total duration
        setTimeout(() => {
            this.stopComposition();
        }, composition.totalDuration * 1000);
        return this.currentSession;
    }
    stopComposition() {
        if (this.currentSession) {
            this.currentSession.isPlaying = false;
            this.currentSession = null;
        }
        // Clear any scheduled events
        this.scheduledEvents.forEach(event => {
            if (typeof event === 'function') {
                event();
            }
        });
        this.scheduledEvents = [];
    }
    getCurrentSession() {
        return this.currentSession;
    }
}
exports.EnhancedCompositionEngine = EnhancedCompositionEngine;
exports.enhancedCompositionEngine = new EnhancedCompositionEngine();
