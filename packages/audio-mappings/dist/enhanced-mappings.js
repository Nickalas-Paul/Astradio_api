"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genreInstruments = exports.elementScales = exports.dignityMappings = exports.modalityMappings = exports.aspectMappings = exports.enhancedPlanetaryMappings = void 0;
exports.calculateAspects = calculateAspects;
exports.getMusicalConfig = getMusicalConfig;
exports.calculateHarmonicInterval = calculateHarmonicInterval;
exports.getRhythmPattern = getRhythmPattern;
exports.getTonalQuality = getTonalQuality;
// Helper function to get sign number
function getSignNumber(signName) {
    const signNumbers = {
        'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
        'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
        'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12
    };
    return signNumbers[signName] || 1;
}
// Enhanced planetary mappings with musical theory integration
exports.enhancedPlanetaryMappings = {
    Sun: {
        instrument: 'sawtooth',
        baseFrequency: 264, // C4
        energy: 0.8,
        color: '#FFD700',
        element: 'Fire',
        modality: 'Fixed',
        dignity: 'rulership',
        musicalRole: 'melody',
        genreVariations: {
            classical: { instrument: 'brass', octave: 4 },
            jazz: { instrument: 'piano', octave: 4 },
            electronic: { instrument: 'sawtooth', octave: 4 },
            ambient: { instrument: 'pad', octave: 3 }
        }
    },
    Moon: {
        instrument: 'sine',
        baseFrequency: 294, // D4
        energy: 0.4,
        color: '#C0C0C0',
        element: 'Water',
        modality: 'Cardinal',
        dignity: 'rulership',
        musicalRole: 'harmony',
        genreVariations: {
            classical: { instrument: 'strings', octave: 3 },
            jazz: { instrument: 'vibraphone', octave: 4 },
            electronic: { instrument: 'sine', octave: 4 },
            ambient: { instrument: 'pad', octave: 2 }
        }
    },
    Mercury: {
        instrument: 'square',
        baseFrequency: 392, // G4
        energy: 0.6,
        color: '#87CEEB',
        element: 'Air',
        modality: 'Mutable',
        dignity: 'rulership',
        musicalRole: 'rhythm',
        genreVariations: {
            classical: { instrument: 'woodwinds', octave: 5 },
            jazz: { instrument: 'saxophone', octave: 4 },
            electronic: { instrument: 'square', octave: 5 },
            ambient: { instrument: 'bell', octave: 4 }
        }
    },
    Venus: {
        instrument: 'triangle',
        baseFrequency: 349, // F4
        energy: 0.5,
        color: '#FFB6C1',
        element: 'Earth',
        modality: 'Fixed',
        dignity: 'rulership',
        musicalRole: 'harmony',
        genreVariations: {
            classical: { instrument: 'harp', octave: 4 },
            jazz: { instrument: 'guitar', octave: 4 },
            electronic: { instrument: 'triangle', octave: 4 },
            ambient: { instrument: 'chime', octave: 3 }
        }
    },
    Mars: {
        instrument: 'sawtooth',
        baseFrequency: 330, // E4
        energy: 0.9,
        color: '#FF4500',
        element: 'Fire',
        modality: 'Cardinal',
        dignity: 'rulership',
        musicalRole: 'rhythm',
        genreVariations: {
            classical: { instrument: 'percussion', octave: 3 },
            jazz: { instrument: 'drums', octave: 3 },
            electronic: { instrument: 'sawtooth', octave: 3 },
            ambient: { instrument: 'drone', octave: 2 }
        }
    },
    Jupiter: {
        instrument: 'sine',
        baseFrequency: 440, // A4
        energy: 0.7,
        color: '#FFA500',
        element: 'Fire',
        modality: 'Mutable',
        dignity: 'rulership',
        musicalRole: 'bass',
        genreVariations: {
            classical: { instrument: 'bass', octave: 2 },
            jazz: { instrument: 'bass', octave: 2 },
            electronic: { instrument: 'sine', octave: 2 },
            ambient: { instrument: 'drone', octave: 1 }
        }
    },
    Saturn: {
        instrument: 'square',
        baseFrequency: 220, // A3
        energy: 0.3,
        color: '#808080',
        element: 'Earth',
        modality: 'Cardinal',
        dignity: 'rulership',
        musicalRole: 'structure',
        genreVariations: {
            classical: { instrument: 'bassoon', octave: 2 },
            jazz: { instrument: 'bass', octave: 2 },
            electronic: { instrument: 'square', octave: 2 },
            ambient: { instrument: 'drone', octave: 1 }
        }
    },
    Uranus: {
        instrument: 'triangle',
        baseFrequency: 523, // C5
        energy: 0.6,
        color: '#00CED1',
        element: 'Air',
        modality: 'Fixed',
        dignity: 'rulership',
        musicalRole: 'effects',
        genreVariations: {
            classical: { instrument: 'piccolo', octave: 6 },
            jazz: { instrument: 'trumpet', octave: 5 },
            electronic: { instrument: 'triangle', octave: 5 },
            ambient: { instrument: 'bell', octave: 4 }
        }
    },
    Neptune: {
        instrument: 'sine',
        baseFrequency: 494, // B4
        energy: 0.4,
        color: '#4169E1',
        element: 'Water',
        modality: 'Mutable',
        dignity: 'rulership',
        musicalRole: 'atmosphere',
        genreVariations: {
            classical: { instrument: 'strings', octave: 4 },
            jazz: { instrument: 'piano', octave: 4 },
            electronic: { instrument: 'sine', octave: 4 },
            ambient: { instrument: 'pad', octave: 3 }
        }
    },
    Pluto: {
        instrument: 'sawtooth',
        baseFrequency: 147, // D3
        energy: 0.2,
        color: '#800080',
        element: 'Water',
        modality: 'Fixed',
        dignity: 'rulership',
        musicalRole: 'bass',
        genreVariations: {
            classical: { instrument: 'bass', octave: 1 },
            jazz: { instrument: 'bass', octave: 1 },
            electronic: { instrument: 'sawtooth', octave: 1 },
            ambient: { instrument: 'drone', octave: 0 }
        }
    }
};
// Aspect mappings to harmonic relationships
exports.aspectMappings = {
    conjunction: {
        harmonic: 'unison',
        interval: 0,
        description: 'Planets in conjunction create unison or octave relationships',
        musicalEffect: 'reinforcement'
    },
    sextile: {
        harmonic: 'major_third',
        interval: 4,
        description: 'Planets in sextile create major third harmonies',
        musicalEffect: 'harmonious'
    },
    square: {
        harmonic: 'tritone',
        interval: 6,
        description: 'Planets in square create tritone (augmented fourth) relationships',
        musicalEffect: 'tension'
    },
    trine: {
        harmonic: 'perfect_fifth',
        interval: 7,
        description: 'Planets in trine create perfect fifth harmonies',
        musicalEffect: 'stable'
    },
    opposition: {
        harmonic: 'octave',
        interval: 12,
        description: 'Planets in opposition create octave relationships',
        musicalEffect: 'completion'
    }
};
// Modality mappings to rhythmic patterns
exports.modalityMappings = {
    Cardinal: {
        rhythm: 'quarter_notes',
        tempo: 'moderate',
        pattern: 'driving',
        description: 'Cardinal signs create driving, forward-moving rhythms'
    },
    Fixed: {
        rhythm: 'whole_notes',
        tempo: 'slow',
        pattern: 'sustained',
        description: 'Fixed signs create sustained, stable rhythms'
    },
    Mutable: {
        rhythm: 'eighth_notes',
        tempo: 'fast',
        pattern: 'flowing',
        description: 'Mutable signs create flowing, adaptable rhythms'
    }
};
// Dignity mappings to tonal qualities
exports.dignityMappings = {
    rulership: {
        tonalQuality: 'strong',
        volume: 1.0,
        clarity: 'clear',
        description: 'Planets in rulership have strong, clear tonal qualities'
    },
    exaltation: {
        tonalQuality: 'bright',
        volume: 1.2,
        clarity: 'brilliant',
        description: 'Planets in exaltation have bright, brilliant tonal qualities'
    },
    fall: {
        tonalQuality: 'muted',
        volume: 0.7,
        clarity: 'dull',
        description: 'Planets in fall have muted, dull tonal qualities'
    },
    detriment: {
        tonalQuality: 'harsh',
        volume: 0.8,
        clarity: 'distorted',
        description: 'Planets in detriment have harsh, distorted tonal qualities'
    }
};
// Element-based scales with genre variations
exports.elementScales = {
    Fire: {
        classical: ['C', 'D', 'E', 'F#', 'G', 'A', 'B'], // Lydian
        jazz: ['C', 'D', 'E', 'F#', 'G', 'A', 'B'], // Lydian
        electronic: ['C', 'D', 'E', 'F#', 'G', 'A', 'B'], // Lydian
        ambient: ['C', 'D', 'E', 'F#', 'G', 'A', 'B'] // Lydian
    },
    Earth: {
        classical: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'], // Dorian
        jazz: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'], // Dorian
        electronic: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'], // Dorian
        ambient: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'] // Dorian
    },
    Air: {
        classical: ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'], // Mixolydian
        jazz: ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'], // Mixolydian
        electronic: ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'], // Mixolydian
        ambient: ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'] // Mixolydian
    },
    Water: {
        classical: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'], // Aeolian
        jazz: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'], // Aeolian
        electronic: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'], // Aeolian
        ambient: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'] // Aeolian
    }
};
// Genre-specific instrument mappings
exports.genreInstruments = {
    classical: {
        melody: ['violin', 'flute', 'oboe', 'clarinet'],
        harmony: ['viola', 'cello', 'harp', 'piano'],
        rhythm: ['timpani', 'bassoon', 'trombone'],
        bass: ['double_bass', 'bassoon', 'tuba'],
        effects: ['piccolo', 'trumpet', 'french_horn']
    },
    jazz: {
        melody: ['saxophone', 'trumpet', 'piano'],
        harmony: ['piano', 'guitar', 'vibraphone'],
        rhythm: ['drums', 'bass', 'piano'],
        bass: ['bass', 'piano'],
        effects: ['trumpet', 'saxophone', 'guitar']
    },
    electronic: {
        melody: ['sawtooth', 'square', 'triangle', 'sine'],
        harmony: ['pad', 'chord', 'bell'],
        rhythm: ['kick', 'snare', 'hihat'],
        bass: ['sine', 'sawtooth', 'square'],
        effects: ['noise', 'filter', 'delay']
    },
    ambient: {
        melody: ['pad', 'bell', 'chime'],
        harmony: ['pad', 'drone', 'bell'],
        rhythm: ['drone', 'pad'],
        bass: ['drone', 'pad'],
        effects: ['reverb', 'delay', 'filter']
    }
};
// Calculate aspects between planets
function calculateAspects(chartData) {
    const aspects = [];
    const planets = Object.entries(chartData.planets);
    for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
            const [planet1, data1] = planets[i];
            const [planet2, data2] = planets[j];
            const angle1 = data1.sign.degree + (getSignNumber(data1.sign.name) - 1) * 30;
            const angle2 = data2.sign.degree + (getSignNumber(data2.sign.name) - 1) * 30;
            const angleDiff = Math.abs(angle1 - angle2);
            // Define aspect orbs
            const conjunction = angleDiff <= 8 || angleDiff >= 352;
            const sextile = (angleDiff >= 58 && angleDiff <= 62) || (angleDiff >= 298 && angleDiff <= 302);
            const square = (angleDiff >= 85 && angleDiff <= 95) || (angleDiff >= 265 && angleDiff <= 275);
            const trine = (angleDiff >= 118 && angleDiff <= 122) || (angleDiff >= 238 && angleDiff <= 242);
            const opposition = angleDiff >= 172 && angleDiff <= 188;
            if (conjunction) {
                aspects.push({
                    planet1, planet2, type: 'conjunction', angle: angleDiff,
                    harmonic: exports.aspectMappings.conjunction.harmonic
                });
            }
            else if (sextile) {
                aspects.push({
                    planet1, planet2, type: 'sextile', angle: angleDiff,
                    harmonic: exports.aspectMappings.sextile.harmonic
                });
            }
            else if (square) {
                aspects.push({
                    planet1, planet2, type: 'square', angle: angleDiff,
                    harmonic: exports.aspectMappings.square.harmonic
                });
            }
            else if (trine) {
                aspects.push({
                    planet1, planet2, type: 'trine', angle: angleDiff,
                    harmonic: exports.aspectMappings.trine.harmonic
                });
            }
            else if (opposition) {
                aspects.push({
                    planet1, planet2, type: 'opposition', angle: angleDiff,
                    harmonic: exports.aspectMappings.opposition.harmonic
                });
            }
        }
    }
    return aspects;
}
// Get musical configuration for a chart with genre
function getMusicalConfig(chartData, genre = 'electronic') {
    const aspects = calculateAspects(chartData);
    const planets = Object.keys(chartData.planets);
    // Get dominant element
    const elementCounts = {};
    planets.forEach(planet => {
        const element = exports.enhancedPlanetaryMappings[planet]?.element;
        if (element) {
            elementCounts[element] = (elementCounts[element] || 0) + 1;
        }
    });
    const dominantElement = Object.entries(elementCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Fire';
    return {
        genre,
        dominantElement,
        scale: exports.elementScales[dominantElement]?.[genre] || exports.elementScales.Fire[genre],
        aspects,
        planets: planets.map(planet => ({
            name: planet,
            ...exports.enhancedPlanetaryMappings[planet],
            genreConfig: exports.enhancedPlanetaryMappings[planet]?.genreVariations?.[genre]
        })),
        instruments: exports.genreInstruments[genre]
    };
}
// Calculate harmonic intervals for aspects
function calculateHarmonicInterval(baseFreq, aspectType) {
    const aspect = exports.aspectMappings[aspectType];
    if (!aspect)
        return baseFreq;
    // Calculate interval based on semitones
    const semitones = aspect.interval;
    return baseFreq * Math.pow(2, semitones / 12);
}
// Get rhythm pattern for modality
function getRhythmPattern(modality) {
    const pattern = exports.modalityMappings[modality];
    if (!pattern)
        return { rhythm: 'quarter_notes', tempo: 'moderate' };
    return {
        rhythm: pattern.rhythm,
        tempo: pattern.tempo,
        pattern: pattern.pattern,
        description: pattern.description
    };
}
// Get tonal quality for dignity
function getTonalQuality(dignity) {
    const quality = exports.dignityMappings[dignity];
    if (!quality)
        return { tonalQuality: 'neutral', volume: 1.0, clarity: 'clear' };
    return {
        tonalQuality: quality.tonalQuality,
        volume: quality.volume,
        clarity: quality.clarity,
        description: quality.description
    };
}
