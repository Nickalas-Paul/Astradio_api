"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMusicNarration = generateMusicNarration;
exports.generateModeSpecificNarration = generateModeSpecificNarration;
exports.generateDualChartNarration = generateDualChartNarration;
const enhanced_mappings_1 = require("./enhanced-mappings");
// Element-based mood descriptions
const elementMoods = {
    Fire: {
        feeling: "passionate and dynamic",
        adjective: "with fiery intensity",
        theme: "creative energy and bold expression",
        insight: "a soul driven by passion and creative force"
    },
    Earth: {
        feeling: "grounded and stable",
        adjective: "with steady determination",
        theme: "practical wisdom and material focus",
        insight: "a spirit anchored in reality and tangible achievement"
    },
    Air: {
        feeling: "intellectual and communicative",
        adjective: "with flowing curiosity",
        theme: "mental agility and social connection",
        insight: "a mind that dances between ideas and relationships"
    },
    Water: {
        feeling: "emotional and intuitive",
        adjective: "with deep sensitivity",
        theme: "emotional depth and spiritual awareness",
        insight: "a heart that flows with feeling and inner knowing"
    }
};
// Modality-based rhythm descriptions
const modalityRhythms = {
    Cardinal: {
        rhythm: "driving and initiating",
        tempo: "forward-moving",
        energy: "dynamic and action-oriented"
    },
    Fixed: {
        rhythm: "sustained and stable",
        tempo: "steady and unwavering",
        energy: "determined and focused"
    },
    Mutable: {
        rhythm: "flowing and adaptable",
        tempo: "flexible and responsive",
        energy: "versatile and changeable"
    }
};
// Planet role descriptions
const planetRoles = {
    Sun: {
        description: "carries the lead melody",
        significance: "represents your core identity and creative expression",
        instrument: "brilliant and commanding"
    },
    Moon: {
        description: "provides the counter melody",
        significance: "reflects your emotional nature and intuitive responses",
        instrument: "sensitive and flowing"
    },
    Mercury: {
        description: "weaves the harmony",
        significance: "shows your communication style and mental agility",
        instrument: "quick and articulate"
    },
    Venus: {
        description: "creates harmonic beauty",
        significance: "expresses your values and aesthetic preferences",
        instrument: "sweet and harmonious"
    },
    Mars: {
        description: "drives the rhythm",
        significance: "reveals your action style and competitive nature",
        instrument: "bold and energetic"
    },
    Jupiter: {
        description: "provides the bassline",
        significance: "shows your growth areas and philosophical outlook",
        instrument: "expansive and supportive"
    },
    Saturn: {
        description: "structures the foundation",
        significance: "represents your challenges and areas of mastery",
        instrument: "disciplined and grounding"
    },
    Uranus: {
        description: "adds unexpected effects",
        significance: "brings innovation and sudden insights",
        instrument: "unconventional and surprising"
    },
    Neptune: {
        description: "creates ambient atmosphere",
        significance: "connects to your spiritual and artistic nature",
        instrument: "dreamy and transcendent"
    },
    Pluto: {
        description: "modulates the transformation",
        significance: "shows your power to transform and regenerate",
        instrument: "intense and transformative"
    }
};
// Aspect relationship descriptions
const aspectRelationships = {
    conjunction: {
        description: "united in purpose",
        effect: "reinforces and amplifies",
        harmony: "unison or octave relationships"
    },
    sextile: {
        description: "harmoniously supportive",
        effect: "flows naturally together",
        harmony: "major third harmonies"
    },
    square: {
        description: "creates dynamic tension",
        effect: "challenges and motivates",
        harmony: "tritone relationships"
    },
    trine: {
        description: "flows with ease",
        effect: "supports and stabilizes",
        harmony: "perfect fifth harmonies"
    },
    opposition: {
        description: "seeks balance",
        effect: "completes and integrates",
        harmony: "octave relationships"
    }
};
// Dignity-based tonal descriptions
const dignityTones = {
    rulership: {
        quality: "strong and clear",
        effect: "expresses with confidence and authority"
    },
    exaltation: {
        quality: "bright and brilliant",
        effect: "shines with natural talent and grace"
    },
    fall: {
        quality: "muted and reflective",
        effect: "speaks with humility and depth"
    },
    detriment: {
        quality: "harsh and challenging",
        effect: "expresses through struggle and growth"
    }
};
function generateMusicNarration(chartData, config) {
    // Calculate aspects and get musical configuration
    const aspects = (0, enhanced_mappings_1.calculateAspects)(chartData);
    const musicalConfig = (0, enhanced_mappings_1.getMusicalConfig)(chartData, config?.genre || 'electronic');
    // Determine dominant element and modality
    const elementCounts = {};
    const modalityCounts = {};
    Object.values(chartData.planets).forEach(planet => {
        const element = planet.sign.element;
        const modality = planet.sign.modality;
        elementCounts[element] = (elementCounts[element] || 0) + 1;
        modalityCounts[modality] = (modalityCounts[modality] || 0) + 1;
    });
    const dominantElement = Object.entries(elementCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Fire';
    const dominantModality = Object.entries(modalityCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Cardinal';
    // Get mood and rhythm descriptions
    const elementMood = elementMoods[dominantElement];
    const modalityRhythm = modalityRhythms[dominantModality];
    // Generate musical mood section
    const musicalMood = generateMusicalMood(chartData, musicalConfig, elementMood, modalityRhythm, config);
    // Generate planetary expression section
    const planetaryExpression = generatePlanetaryExpression(chartData, aspects, musicalConfig, config);
    // Generate interpretive summary
    const interpretiveSummary = generateInterpretiveSummary(chartData, elementMood, aspects, config);
    // Combine into full narration
    const fullNarration = `${musicalMood}\n\n${planetaryExpression}\n\n${interpretiveSummary}`;
    return {
        musicalMood,
        planetaryExpression,
        interpretiveSummary,
        fullNarration
    };
}
function generateMusicalMood(chartData, musicalConfig, elementMood, modalityRhythm, config) {
    const scale = musicalConfig.scale.join(', ');
    const key = musicalConfig.scale[0];
    const tempo = config?.tempo || 120;
    const genre = config?.genre || 'electronic';
    let genreDescription = '';
    switch (genre) {
        case 'classical':
            genreDescription = 'orchestral grandeur';
            break;
        case 'jazz':
            genreDescription = 'improvisational sophistication';
            break;
        case 'electronic':
            genreDescription = 'digital innovation';
            break;
        case 'ambient':
            genreDescription = 'atmospheric meditation';
            break;
        default:
            genreDescription = 'musical expression';
    }
    return `🎼 **Musical Mood**
This piece opens in the ${key} ${scale} scale, evoking a ${elementMood.feeling} atmosphere. With a ${modalityRhythm.rhythm} rhythm at ${tempo} BPM, the music flows ${elementMood.adjective}. The ${genreDescription} style creates a sonic landscape that captures the essence of your astrological signature.`;
}
function generatePlanetaryExpression(chartData, aspects, musicalConfig, config) {
    const planets = Object.entries(chartData.planets);
    const genre = config?.genre || 'electronic';
    // Get the most prominent planets (Sun, Moon, Ascendant ruler)
    const prominentPlanets = planets
        .filter(([name]) => ['Sun', 'Moon'].includes(name))
        .slice(0, 2);
    let expression = '🎹 **Planetary Expression**\n';
    prominentPlanets.forEach(([planetName, planetData]) => {
        const role = planetRoles[planetName];
        const mapping = enhanced_mappings_1.enhancedPlanetaryMappings[planetName];
        // Handle genre variations with fallback to default instrument
        const genreVariation = mapping?.genreVariations?.[genre];
        const instrument = genreVariation?.instrument || mapping?.instrument;
        // Find aspects for this planet
        const planetAspects = aspects.filter(a => a.planet1 === planetName || a.planet2 === planetName);
        let aspectDescription = '';
        if (planetAspects.length > 0) {
            const aspect = planetAspects[0];
            const otherPlanet = aspect.planet1 === planetName ? aspect.planet2 : aspect.planet1;
            const relationship = aspectRelationships[aspect.type];
            aspectDescription = `, ${relationship.description} with ${otherPlanet} creating ${relationship.harmony}`;
        }
        expression += `${planetName} ${role.description} on ${instrument}${aspectDescription}, ${role.significance}. `;
    });
    // Add aspect relationships
    if (aspects.length > 0) {
        const mainAspect = aspects[0];
        const relationship = aspectRelationships[mainAspect.type];
        expression += `\n\nThe ${mainAspect.planet1}-${mainAspect.planet2} ${mainAspect.type} ${relationship.description}, ${relationship.effect} the overall harmonic theme.`;
    }
    return expression;
}
function generateInterpretiveSummary(chartData, elementMood, aspects, config) {
    const mode = config?.mode || 'moments';
    const genre = config?.genre || 'electronic';
    // Count aspects by type
    const aspectCounts = {};
    aspects.forEach(aspect => {
        aspectCounts[aspect.type] = (aspectCounts[aspect.type] || 0) + 1;
    });
    // Determine chart complexity
    const totalAspects = aspects.length;
    let complexity = '';
    if (totalAspects > 8) {
        complexity = 'complex and multifaceted';
    }
    else if (totalAspects > 4) {
        complexity = 'balanced and harmonious';
    }
    else {
        complexity = 'focused and direct';
    }
    // Determine emotional theme based on dominant elements and aspects
    let emotionalTheme = elementMood.theme;
    if (aspectCounts.square && aspectCounts.square > 3) {
        emotionalTheme = 'dynamic tension and growth through challenge';
    }
    else if (aspectCounts.trine && aspectCounts.trine > 3) {
        emotionalTheme = 'natural flow and ease of expression';
    }
    else if (aspectCounts.opposition && aspectCounts.opposition > 2) {
        emotionalTheme = 'seeking balance and integration';
    }
    let modeContext = '';
    switch (mode) {
        case 'moments':
            modeContext = 'This musical moment captures your essential nature';
            break;
        case 'overlay':
            modeContext = 'This dual composition reveals the interplay between two souls';
            break;
        case 'sandbox':
            modeContext = 'This experimental piece explores your creative potential';
            break;
        case 'melodic':
            modeContext = 'This melodic journey tells the story of your astrological signature';
            break;
    }
    return `🌌 **Interpretive Summary**
${modeContext}, offering a sonic mirror of ${elementMood.insight}. The ${complexity} arrangement reflects ${emotionalTheme}, creating a ${genre} soundtrack that resonates with your unique cosmic fingerprint. This piece serves as both a musical portrait and a meditation on your astrological essence.`;
}
// Generate mode-specific narration
function generateModeSpecificNarration(chartData, mode, config) {
    const baseNarration = generateMusicNarration(chartData, config);
    switch (mode) {
        case 'overlay':
            return `${baseNarration.fullNarration}\n\n**Overlay Mode**: This composition weaves together two distinct astrological signatures, creating a dialogue between different cosmic perspectives.`;
        case 'sandbox':
            return `${baseNarration.fullNarration}\n\n**Sandbox Mode**: This experimental piece allows for creative exploration of your astrological themes, offering a space for musical discovery and personal insight.`;
        case 'melodic':
            return `${baseNarration.fullNarration}\n\n**Melodic Mode**: This sophisticated composition transforms your birth chart into a structured musical narrative, with each planet contributing its unique voice to the overall symphony.`;
        default:
            return baseNarration.fullNarration;
    }
}
// Generate narration for dual charts (overlay mode)
function generateDualChartNarration(chart1, chart2, config) {
    const narration1 = generateMusicNarration(chart1, config);
    const narration2 = generateMusicNarration(chart2, config);
    return `🎼 **Dual Chart Composition**

**Chart 1 - ${chart1.metadata.birth_datetime}**
${narration1.musicalMood}

**Chart 2 - ${chart2.metadata.birth_datetime}**
${narration2.musicalMood}

**Harmonic Dialogue**
This overlay composition creates a musical conversation between two distinct astrological signatures. The interplay reveals both individual expressions and the potential for harmonious integration or dynamic tension between these cosmic perspectives.

**Interpretive Summary**
The dual composition reflects the complexity of relationships and the beautiful dance between different souls, offering insight into both individual nature and the art of cosmic collaboration.`;
}
