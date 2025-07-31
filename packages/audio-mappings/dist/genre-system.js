"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOOD_TO_GENRE_MAPPINGS = exports.GENRE_CONFIGS = void 0;
exports.getGenreConfig = getGenreConfig;
exports.getMoodMapping = getMoodMapping;
exports.getRandomGenre = getRandomGenre;
exports.getGenreFromMood = getGenreFromMood;
exports.getInstrumentsForGenre = getInstrumentsForGenre;
exports.getVisualStyleForGenre = getVisualStyleForGenre;
exports.getTextStyleForGenre = getTextStyleForGenre;
exports.getTempoForGenre = getTempoForGenre;
exports.getScalesForGenre = getScalesForGenre;
exports.getAllGenres = getAllGenres;
exports.getAllMoods = getAllMoods;
exports.generateGenreSpecificMelody = generateGenreSpecificMelody;
// ===== GENRE DEFINITIONS =====
exports.GENRE_CONFIGS = {
    classical: {
        name: 'Classical',
        instruments: {
            primary: ['strings', 'piano', 'orchestral_percussion', 'harp'],
            secondary: ['woodwinds', 'brass', 'timpani'],
            effects: ['reverb', 'hall_reverb', 'delay']
        },
        visuals: {
            palette: ['#D4AF37', '#8B4513', '#F5DEB3', '#2F4F4F'],
            textures: ['parchment', 'golden_ratios', 'baroque_motifs'],
            animations: ['elegant_fades', 'smooth_transitions', 'graceful_movements'],
            overlays: ['ornate_frames', 'classical_patterns']
        },
        text: {
            style: 'poetic',
            tone: 'elegant',
            vocabulary: ['mythic', 'timeless', 'sophisticated', 'refined'],
            metaphors: ['symphonic', 'orchestral', 'harmonious', 'resonant']
        },
        textile: 'embroidered_silk',
        tempo: { min: 60, max: 140, default: 90 },
        scales: ['major', 'minor', 'dorian', 'mixolydian'],
        keySignatures: ['C', 'G', 'D', 'A', 'F', 'Bb', 'Eb']
    },
    house: {
        name: 'House',
        instruments: {
            primary: ['kick_4_on_floor', 'clap', 'hi_hats', 'synth_bass', 'stabs'],
            secondary: ['open_hats', 'shakers', 'cowbells', 'acid_synth'],
            effects: ['sidechain', 'filter_sweeps', 'delay', 'reverb']
        },
        visuals: {
            palette: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
            textures: ['neon_grids', 'dancefloor_pulses', 'geometric_minimalism'],
            animations: ['pulsing_rhythms', 'grid_animations', 'beat_synchronized'],
            overlays: ['club_lighting', 'laser_effects', 'smoke_machines']
        },
        text: {
            style: 'punchy',
            tone: 'rhythmic',
            vocabulary: ['nightlife', 'groove', 'beat', 'vibe', 'energy'],
            metaphors: ['dancefloor', 'club', 'rhythm', 'pulse', 'movement']
        },
        textile: 'vinyl',
        tempo: { min: 120, max: 135, default: 128 },
        scales: ['minor', 'dorian', 'mixolydian', 'pentatonic'],
        keySignatures: ['Am', 'Em', 'Dm', 'Gm', 'Cm']
    },
    techno: {
        name: 'Techno',
        instruments: {
            primary: ['analog_synths', 'distorted_kicks', 'metallic_percussion'],
            secondary: ['industrial_noises', 'white_noise', 'acid_lines'],
            effects: ['distortion', 'bit_crusher', 'filter_modulation', 'delay']
        },
        visuals: {
            palette: ['#000000', '#FFFFFF', '#FF0000', '#00FF00'],
            textures: ['industrial', 'monochrome', 'glitch_fx'],
            animations: ['strobing', 'glitch_effects', 'mechanical_movements'],
            overlays: ['scan_lines', 'digital_artifacts', 'pixel_effects']
        },
        text: {
            style: 'stark',
            tone: 'cybernetic',
            vocabulary: ['deconstructed', 'mechanical', 'digital', 'industrial'],
            metaphors: ['machine', 'circuit', 'algorithm', 'binary']
        },
        textile: 'mesh_carbon_fiber',
        tempo: { min: 125, max: 140, default: 130 },
        scales: ['chromatic', 'minor', 'dorian', 'pentatonic'],
        keySignatures: ['Am', 'Em', 'Dm', 'Gm']
    },
    jazz: {
        name: 'Jazz',
        instruments: {
            primary: ['upright_bass', 'brushed_drums', 'saxophone', 'piano'],
            secondary: ['trumpet', 'trombone', 'vibraphone', 'guitar'],
            effects: ['reverb', 'delay', 'compression', 'warm_distortion']
        },
        visuals: {
            palette: ['#8B4513', '#D2691E', '#CD853F', '#F4A460'],
            textures: ['warm_lighting', 'smoky_silhouettes', 'animated_scribbles'],
            animations: ['smooth_swings', 'improvisational_movements', 'flowing_lines'],
            overlays: ['jazz_club', 'spotlight_effects', 'smoke_curls']
        },
        text: {
            style: 'improvisational',
            tone: 'metaphor_rich',
            vocabulary: ['syncopated', 'swinging', 'blue', 'smooth', 'cool'],
            metaphors: ['conversation', 'storytelling', 'dialogue', 'call_response']
        },
        textile: 'velvet',
        tempo: { min: 80, max: 180, default: 120 },
        scales: ['blues', 'dorian', 'mixolydian', 'pentatonic', 'diminished'],
        keySignatures: ['Bb', 'F', 'C', 'G', 'D', 'A']
    },
    pop: {
        name: 'Pop',
        instruments: {
            primary: ['synth_pads', 'claps', 'layered_vocals', 'arpeggios'],
            secondary: ['piano', 'guitar', 'bass', 'drums'],
            effects: ['chorus', 'reverb', 'delay', 'compression']
        },
        visuals: {
            palette: ['#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD'],
            textures: ['bright_gradients', 'sparkles', 'collage_style'],
            animations: ['bouncy_movements', 'sparkle_effects', 'smooth_transitions'],
            overlays: ['glitter', 'bubble_effects', 'colorful_patterns']
        },
        text: {
            style: 'upbeat',
            tone: 'affirming',
            vocabulary: ['catchy', 'memorable', 'uplifting', 'relatable'],
            metaphors: ['hook', 'chorus', 'verse', 'bridge', 'refrain']
        },
        textile: 'sequins',
        tempo: { min: 90, max: 140, default: 120 },
        scales: ['major', 'minor', 'pentatonic'],
        keySignatures: ['C', 'G', 'F', 'D', 'A', 'E']
    },
    blues: {
        name: 'Blues',
        instruments: {
            primary: ['electric_guitar', 'harmonica', 'kick_snare', 'bass'],
            secondary: ['piano', 'slide_guitar', 'organ', 'drums'],
            effects: ['overdrive', 'reverb', 'delay', 'compression']
        },
        visuals: {
            palette: ['#8B0000', '#CD853F', '#696969', '#2F4F4F'],
            textures: ['film_grain', 'roadside_americana', 'rust_tones'],
            animations: ['slow_drags', 'soulful_movements', 'gritty_transitions'],
            overlays: ['dust_particles', 'vintage_filters', 'sepia_tones']
        },
        text: {
            style: 'soul_deep',
            tone: 'raw',
            vocabulary: ['honest', 'painful', 'soulful', 'gritty', 'real'],
            metaphors: ['road', 'train', 'river', 'heart', 'soul']
        },
        textile: 'denim',
        tempo: { min: 60, max: 120, default: 90 },
        scales: ['blues', 'minor', 'pentatonic'],
        keySignatures: ['A', 'E', 'D', 'G', 'C']
    },
    folk: {
        name: 'Folk',
        instruments: {
            primary: ['acoustic_guitar', 'banjo', 'fiddle', 'soft_percussion'],
            secondary: ['mandolin', 'harmonica', 'accordion', 'bodhran'],
            effects: ['natural_reverb', 'room_ambience', 'minimal_processing']
        },
        visuals: {
            palette: ['#8FBC8F', '#DEB887', '#F5DEB3', '#556B2F'],
            textures: ['paper_textures', 'hand_drawn_maps', 'field_tones'],
            animations: ['gentle_sways', 'organic_movements', 'natural_transitions'],
            overlays: ['handmade_patterns', 'nature_elements', 'rustic_frames']
        },
        text: {
            style: 'narrative',
            tone: 'pastoral',
            vocabulary: ['ancestral', 'traditional', 'natural', 'simple', 'pure'],
            metaphors: ['land', 'home', 'family', 'tradition', 'roots']
        },
        textile: 'flannel_cotton',
        tempo: { min: 70, max: 110, default: 90 },
        scales: ['major', 'minor', 'pentatonic', 'dorian'],
        keySignatures: ['G', 'C', 'D', 'A', 'E']
    },
    ambient: {
        name: 'Ambient',
        instruments: {
            primary: ['pads', 'drones', 'reverb_heavy_tones', 'sub_bass'],
            secondary: ['field_recordings', 'atmospheric_sounds', 'textures'],
            effects: ['reverb', 'delay', 'filter_sweeps', 'granular']
        },
        visuals: {
            palette: ['#2F4F4F', '#708090', '#B0C4DE', '#F0F8FF'],
            textures: ['starfields', 'foggy_nebulae', 'glacial_fades'],
            animations: ['slow_drifts', 'ethereal_movements', 'gradual_transitions'],
            overlays: ['mist_effects', 'particle_systems', 'atmospheric_layers']
        },
        text: {
            style: 'meditative',
            tone: 'cosmic',
            vocabulary: ['abstract', 'ethereal', 'spacious', 'floating', 'dreamy'],
            metaphors: ['space', 'clouds', 'ocean', 'wind', 'light']
        },
        textile: 'gauze_mist',
        tempo: { min: 40, max: 80, default: 60 },
        scales: ['pentatonic', 'whole_tone', 'chromatic'],
        keySignatures: ['C', 'G', 'D', 'A']
    },
    synthwave: {
        name: 'Synthwave',
        instruments: {
            primary: ['retro_arpeggiators', 'gated_snares', 'fm_synths'],
            secondary: ['analog_bass', 'drum_machines', 'pad_synths'],
            effects: ['gated_reverb', 'chorus', 'delay', 'filter_sweeps']
        },
        visuals: {
            palette: ['#FF4500', '#00CED1', '#FF1493', '#32CD32'],
            textures: ['80s_grids', 'vhs_filters', 'sun_on_horizon'],
            animations: ['retro_animations', 'grid_movements', 'sunset_effects'],
            overlays: ['neon_effects', 'retro_filters', 'cyberpunk_elements']
        },
        text: {
            style: 'nostalgic',
            tone: 'cinematic',
            vocabulary: ['retro', 'nostalgic', 'dreamy', 'cyberpunk', 'futuristic'],
            metaphors: ['sunset', 'highway', 'city_lights', 'neon', 'future']
        },
        textile: 'leather_chrome',
        tempo: { min: 100, max: 130, default: 115 },
        scales: ['minor', 'dorian', 'pentatonic'],
        keySignatures: ['Am', 'Em', 'Dm', 'Gm']
    },
    world_fusion: {
        name: 'World Fusion',
        instruments: {
            primary: ['sitar', 'djembes', 'pan_flutes', 'ocarinas'],
            secondary: ['tabla', 'duduk', 'kora', 'shakuhachi'],
            effects: ['reverb', 'delay', 'spatial_effects', 'ethnic_filters']
        },
        visuals: {
            palette: ['#FFD700', '#8B4513', '#4B0082', '#FF6347'],
            textures: ['cultural_textiles', 'global_motifs', 'ethnic_patterns'],
            animations: ['cultural_dances', 'flowing_movements', 'ritual_gestures'],
            overlays: ['cultural_symbols', 'global_elements', 'ethnic_frames']
        },
        text: {
            style: 'cross_cultural',
            tone: 'poetic',
            vocabulary: ['elemental', 'spiritual', 'universal', 'ancient', 'sacred'],
            metaphors: ['earth', 'water', 'fire', 'air', 'spirit']
        },
        textile: 'tapestry',
        tempo: { min: 60, max: 140, default: 100 },
        scales: ['pentatonic', 'dorian', 'mixolydian', 'ethnic_scales'],
        keySignatures: ['D', 'G', 'A', 'E', 'C']
    }
};
// ===== MOOD-TO-GENRE BRIDGE SYSTEM =====
exports.MOOD_TO_GENRE_MAPPINGS = {
    chill: {
        genres: ['ambient', 'jazz', 'folk'],
        tempo: { min: 60, max: 100, default: 80 },
        scales: ['pentatonic', 'dorian', 'major'],
        narration: {
            tone: 'calm',
            vocabulary: ['peaceful', 'serene', 'gentle', 'soothing'],
            metaphors: ['breeze', 'flow', 'drift', 'float']
        },
        visuals: {
            colorGrading: 'warm_soft',
            animationSpeed: 'slow',
            overlayStyle: 'gentle'
        }
    },
    intense: {
        genres: ['techno', 'classical'],
        tempo: { min: 120, max: 160, default: 140 },
        scales: ['minor', 'chromatic', 'diminished'],
        narration: {
            tone: 'dramatic',
            vocabulary: ['powerful', 'forceful', 'driving', 'urgent'],
            metaphors: ['storm', 'thunder', 'fire', 'energy']
        },
        visuals: {
            colorGrading: 'high_contrast',
            animationSpeed: 'fast',
            overlayStyle: 'dynamic'
        }
    },
    dreamy: {
        genres: ['ambient', 'synthwave'],
        tempo: { min: 70, max: 100, default: 85 },
        scales: ['whole_tone', 'pentatonic', 'major'],
        narration: {
            tone: 'ethereal',
            vocabulary: ['dreamy', 'floating', 'mystical', 'otherworldly'],
            metaphors: ['dreams', 'clouds', 'stars', 'moonlight']
        },
        visuals: {
            colorGrading: 'soft_pastel',
            animationSpeed: 'medium',
            overlayStyle: 'ethereal'
        }
    },
    passionate: {
        genres: ['pop', 'blues', 'jazz'],
        tempo: { min: 90, max: 140, default: 120 },
        scales: ['blues', 'minor', 'major'],
        narration: {
            tone: 'emotional',
            vocabulary: ['passionate', 'soulful', 'heartfelt', 'expressive'],
            metaphors: ['heart', 'soul', 'fire', 'love']
        },
        visuals: {
            colorGrading: 'warm_vibrant',
            animationSpeed: 'medium',
            overlayStyle: 'emotional'
        }
    },
    earthy: {
        genres: ['folk', 'world_fusion', 'blues'],
        tempo: { min: 70, max: 110, default: 90 },
        scales: ['pentatonic', 'dorian', 'minor'],
        narration: {
            tone: 'grounded',
            vocabulary: ['natural', 'organic', 'rooted', 'authentic'],
            metaphors: ['earth', 'soil', 'roots', 'land']
        },
        visuals: {
            colorGrading: 'natural_earthy',
            animationSpeed: 'medium',
            overlayStyle: 'organic'
        }
    },
    uplifting: {
        genres: ['pop', 'house', 'world_fusion'],
        tempo: { min: 110, max: 140, default: 130 },
        scales: ['major', 'pentatonic', 'mixolydian'],
        narration: {
            tone: 'positive',
            vocabulary: ['uplifting', 'energizing', 'inspiring', 'motivating'],
            metaphors: ['light', 'sunrise', 'victory', 'freedom']
        },
        visuals: {
            colorGrading: 'bright_vibrant',
            animationSpeed: 'fast',
            overlayStyle: 'energetic'
        }
    },
    cosmic: {
        genres: ['ambient', 'classical', 'jazz'],
        tempo: { min: 60, max: 100, default: 80 },
        scales: ['whole_tone', 'pentatonic', 'chromatic'],
        narration: {
            tone: 'mystical',
            vocabulary: ['cosmic', 'infinite', 'spiritual', 'transcendent'],
            metaphors: ['universe', 'stars', 'galaxies', 'infinity']
        },
        visuals: {
            colorGrading: 'cosmic_deep',
            animationSpeed: 'slow',
            overlayStyle: 'cosmic'
        }
    }
};
// ===== UTILITY FUNCTIONS =====
function getGenreConfig(genre) {
    return exports.GENRE_CONFIGS[genre] || exports.GENRE_CONFIGS.ambient;
}
function getMoodMapping(mood) {
    return exports.MOOD_TO_GENRE_MAPPINGS[mood] || exports.MOOD_TO_GENRE_MAPPINGS.chill;
}
function getRandomGenre() {
    const genres = Object.keys(exports.GENRE_CONFIGS);
    return genres[Math.floor(Math.random() * genres.length)];
}
function getGenreFromMood(mood) {
    const mapping = getMoodMapping(mood);
    const genres = mapping.genres;
    return genres[Math.floor(Math.random() * genres.length)];
}
function getInstrumentsForGenre(genre) {
    const config = getGenreConfig(genre);
    return config.instruments;
}
function getVisualStyleForGenre(genre) {
    const config = getGenreConfig(genre);
    return config.visuals;
}
function getTextStyleForGenre(genre) {
    const config = getGenreConfig(genre);
    return config.text;
}
function getTempoForGenre(genre) {
    const config = getGenreConfig(genre);
    return config.tempo;
}
function getScalesForGenre(genre) {
    const config = getGenreConfig(genre);
    return config.scales;
}
function getAllGenres() {
    return Object.keys(exports.GENRE_CONFIGS);
}
function getAllMoods() {
    return Object.keys(exports.MOOD_TO_GENRE_MAPPINGS);
}
// ===== GENRE-SPECIFIC AUDIO GENERATION =====
function generateGenreSpecificMelody(genre, chartData) {
    const config = getGenreConfig(genre);
    const tempo = config.tempo.default;
    const scales = config.scales;
    const instruments = config.instruments;
    // Genre-specific melody generation logic
    switch (genre) {
        case 'classical':
            return generateClassicalMelody(chartData, tempo, scales);
        case 'house':
            return generateHouseMelody(chartData, tempo, scales);
        case 'techno':
            return generateTechnoMelody(chartData, tempo, scales);
        case 'jazz':
            return generateJazzMelody(chartData, tempo, scales);
        case 'pop':
            return generatePopMelody(chartData, tempo, scales);
        case 'blues':
            return generateBluesMelody(chartData, tempo, scales);
        case 'folk':
            return generateFolkMelody(chartData, tempo, scales);
        case 'ambient':
            return generateAmbientMelody(chartData, tempo, scales);
        case 'synthwave':
            return generateSynthwaveMelody(chartData, tempo, scales);
        case 'world_fusion':
            return generateWorldFusionMelody(chartData, tempo, scales);
        default:
            return generateAmbientMelody(chartData, tempo, scales);
    }
}
// Individual genre melody generators (placeholder implementations)
function generateClassicalMelody(chartData, tempo, scales) {
    return {
        genre: 'classical',
        tempo,
        scale: scales[0],
        instruments: ['strings', 'piano', 'orchestral_percussion', 'harp'],
        notes: generateClassicalNotes(chartData, tempo, scales[0])
    };
}
function generateHouseMelody(chartData, tempo, scales) {
    return {
        genre: 'house',
        tempo,
        scale: scales[0],
        instruments: ['kick_4_on_floor', 'clap', 'hi_hats', 'synth_bass'],
        notes: generateHouseNotes(chartData, tempo, scales[0])
    };
}
function generateTechnoMelody(chartData, tempo, scales) {
    return {
        genre: 'techno',
        tempo,
        scale: scales[0],
        instruments: ['analog_synths', 'distorted_kicks', 'metallic_percussion'],
        notes: generateTechnoNotes(chartData, tempo, scales[0])
    };
}
function generateJazzMelody(chartData, tempo, scales) {
    return {
        genre: 'jazz',
        tempo,
        scale: scales[0],
        instruments: ['upright_bass', 'brushed_drums', 'saxophone', 'piano'],
        notes: generateJazzNotes(chartData, tempo, scales[0])
    };
}
function generatePopMelody(chartData, tempo, scales) {
    return {
        genre: 'pop',
        tempo,
        scale: scales[0],
        instruments: ['synth_pads', 'claps', 'layered_vocals', 'arpeggios'],
        notes: generatePopNotes(chartData, tempo, scales[0])
    };
}
function generateBluesMelody(chartData, tempo, scales) {
    return {
        genre: 'blues',
        tempo,
        scale: scales[0],
        instruments: ['electric_guitar', 'harmonica', 'kick_snare', 'bass'],
        notes: generateBluesNotes(chartData, tempo, scales[0])
    };
}
function generateFolkMelody(chartData, tempo, scales) {
    return {
        genre: 'folk',
        tempo,
        scale: scales[0],
        instruments: ['acoustic_guitar', 'banjo', 'fiddle', 'soft_percussion'],
        notes: generateFolkNotes(chartData, tempo, scales[0])
    };
}
function generateAmbientMelody(chartData, tempo, scales) {
    return {
        genre: 'ambient',
        tempo,
        scale: scales[0],
        instruments: ['pads', 'drones', 'reverb_heavy_tones', 'sub_bass'],
        notes: generateAmbientNotes(chartData, tempo, scales[0])
    };
}
function generateSynthwaveMelody(chartData, tempo, scales) {
    return {
        genre: 'synthwave',
        tempo,
        scale: scales[0],
        instruments: ['retro_arpeggiators', 'gated_snares', 'fm_synths'],
        notes: generateSynthwaveNotes(chartData, tempo, scales[0])
    };
}
function generateWorldFusionMelody(chartData, tempo, scales) {
    return {
        genre: 'world_fusion',
        tempo,
        scale: scales[0],
        instruments: ['sitar', 'djembes', 'pan_flutes', 'ocarinas'],
        notes: generateWorldFusionNotes(chartData, tempo, scales[0])
    };
}
// Placeholder note generation functions
function generateClassicalNotes(chartData, tempo, scale) {
    // Implementation for classical note generation
    return [];
}
function generateHouseNotes(chartData, tempo, scale) {
    // Implementation for house note generation
    return [];
}
function generateTechnoNotes(chartData, tempo, scale) {
    // Implementation for techno note generation
    return [];
}
function generateJazzNotes(chartData, tempo, scale) {
    // Implementation for jazz note generation
    return [];
}
function generatePopNotes(chartData, tempo, scale) {
    // Implementation for pop note generation
    return [];
}
function generateBluesNotes(chartData, tempo, scale) {
    // Implementation for blues note generation
    return [];
}
function generateFolkNotes(chartData, tempo, scale) {
    // Implementation for folk note generation
    return [];
}
function generateAmbientNotes(chartData, tempo, scale) {
    // Implementation for ambient note generation
    return [];
}
function generateSynthwaveNotes(chartData, tempo, scale) {
    // Implementation for synthwave note generation
    return [];
}
function generateWorldFusionNotes(chartData, tempo, scale) {
    // Implementation for world fusion note generation
    return [];
}
