"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGenreSpecificNarration = generateGenreSpecificNarration;
exports.generateMusicNarration = generateGenreSpecificNarration;
const genre_system_1 = require("./genre-system");
function generateGenreSpecificNarration(chartData, genre, mood) {
    const genreConfig = (0, genre_system_1.getGenreConfig)(genre);
    const textStyle = (0, genre_system_1.getTextStyleForGenre)(genre);
    const moodMapping = mood ? (0, genre_system_1.getMoodMapping)(mood) : null;
    // Generate genre-specific content
    const musicalMood = generateMusicalMood(chartData, genre, mood);
    const planetaryExpression = generatePlanetaryExpression(chartData, genre, mood);
    const interpretiveSummary = generateInterpretiveSummary(chartData, genre, mood);
    // Create sections based on genre style
    const sections = [
        {
            title: getGenreSectionTitle(genre, 'mood'),
            content: musicalMood,
            style: textStyle.style,
            tone: textStyle.tone
        },
        {
            title: getGenreSectionTitle(genre, 'planetary'),
            content: planetaryExpression,
            style: textStyle.style,
            tone: textStyle.tone
        },
        {
            title: getGenreSectionTitle(genre, 'summary'),
            content: interpretiveSummary,
            style: textStyle.style,
            tone: textStyle.tone
        }
    ];
    // Combine into full narration
    const fullNarration = combineNarrationSections(sections, genre);
    return {
        genre,
        mood,
        sections,
        musicalMood,
        planetaryExpression,
        interpretiveSummary,
        fullNarration
    };
}
function generateMusicalMood(chartData, genre, mood) {
    const textStyle = (0, genre_system_1.getTextStyleForGenre)(genre);
    const moodConfig = mood ? (0, genre_system_1.getMoodMapping)(mood) : null;
    const vocabulary = moodConfig?.narration.vocabulary || textStyle.vocabulary;
    const metaphors = moodConfig?.narration.metaphors || textStyle.metaphors;
    switch (genre) {
        case 'classical':
            return `In the ${vocabulary[0]} realm of classical composition, your chart resonates with ${metaphors[0]} harmonies. The ${vocabulary[1]} interplay of planetary forces creates a ${vocabulary[2]} musical landscape, where each celestial body contributes its ${vocabulary[3]} voice to the grand orchestration of your cosmic symphony.`;
        case 'house':
            return `Your chart pulses with the ${vocabulary[0]} energy of house music, where every planetary alignment becomes a ${metaphors[0]} rhythm. The ${vocabulary[1]} groove of your celestial configuration drives the ${vocabulary[2]} beat of your musical identity, creating an irresistible ${vocabulary[3]} that moves through the cosmic ${metaphors[1]}.`;
        case 'techno':
            return `Your astrological blueprint manifests as ${vocabulary[0]} techno architecture, where planetary forces operate as ${metaphors[0]} algorithms. The ${vocabulary[1]} precision of your chart's ${vocabulary[2]} elements creates a ${vocabulary[3]} soundscape, where each celestial body functions as a ${metaphors[1]} in the cosmic ${metaphors[2]}.`;
        case 'jazz':
            return `Your chart swings with the ${vocabulary[0]} spirit of jazz, where planetary ${metaphors[0]} creates spontaneous ${vocabulary[1]} conversations. The ${vocabulary[2]} flow of your celestial ${vocabulary[3]} allows for ${metaphors[1]} expression, where each planet contributes its unique ${metaphors[2]} to the cosmic ${metaphors[3]}.`;
        case 'pop':
            return `Your chart radiates with ${vocabulary[0]} pop energy, creating ${vocabulary[1]} melodies that are instantly ${vocabulary[2]}. The ${vocabulary[3]} nature of your planetary alignments produces ${metaphors[0]} hooks that are both ${metaphors[1]} and ${metaphors[2]}, making your cosmic ${metaphors[3]} universally appealing.`;
        case 'blues':
            return `Your chart sings with the ${vocabulary[0]} soul of the blues, where every planetary position tells a ${vocabulary[1]} story. The ${vocabulary[2]} honesty of your celestial configuration creates ${vocabulary[3]} expressions that speak to the ${metaphors[0]} of human experience, with each planet contributing its ${metaphors[1]} to the cosmic ${metaphors[2]}.`;
        case 'folk':
            return `Your chart resonates with the ${vocabulary[0]} spirit of folk music, where planetary stories are told through ${vocabulary[1]} traditions. The ${vocabulary[2]} simplicity of your celestial ${vocabulary[3]} creates ${metaphors[0]} narratives that connect to ${metaphors[1]} wisdom, with each planet contributing to the cosmic ${metaphors[2]}.`;
        case 'ambient':
            return `Your chart drifts through ${vocabulary[0]} ambient spaces, where planetary forces create ${vocabulary[1]} soundscapes. The ${vocabulary[2]} nature of your celestial configuration produces ${vocabulary[3]} atmospheres that are both ${metaphors[0]} and ${metaphors[1]}, allowing for ${metaphors[2]} exploration of cosmic ${metaphors[3]}.`;
        case 'synthwave':
            return `Your chart glows with ${vocabulary[0]} synthwave aesthetics, where planetary forces create ${vocabulary[1]} retro-futuristic soundscapes. The ${vocabulary[2]} nostalgia of your celestial ${vocabulary[3]} produces ${metaphors[0]} atmospheres that are both ${metaphors[1]} and ${metaphors[2]}, with each planet contributing to the cosmic ${metaphors[3]}.`;
        case 'world_fusion':
            return `Your chart blends ${vocabulary[0]} world fusion elements, where planetary forces create ${vocabulary[1]} cross-cultural soundscapes. The ${vocabulary[2]} diversity of your celestial ${vocabulary[3]} produces ${metaphors[0]} expressions that are both ${metaphors[1]} and ${metaphors[2]}, with each planet contributing to the cosmic ${metaphors[3]}.`;
        default:
            return `Your chart creates a unique musical identity that reflects the cosmic dance of planetary forces.`;
    }
}
function generatePlanetaryExpression(chartData, genre, mood) {
    const textStyle = (0, genre_system_1.getTextStyleForGenre)(genre);
    const vocabulary = textStyle.vocabulary;
    const metaphors = textStyle.metaphors;
    // Extract planetary information from chart data
    const planets = chartData.planets || {};
    const planetNames = Object.keys(planets);
    switch (genre) {
        case 'classical':
            return `Each planet in your chart contributes its ${vocabulary[0]} voice to the cosmic orchestra. The ${vocabulary[1]} positions create ${vocabulary[2]} harmonies that resonate with ${vocabulary[3]} precision, forming a ${metaphors[0]} composition that reflects the ${metaphors[1]} nature of your celestial ${metaphors[2]}.`;
        case 'house':
            return `Your planetary alignments create ${vocabulary[0]} rhythms that drive the cosmic ${metaphors[0]}. Each planet contributes its ${vocabulary[1]} energy to the ${vocabulary[2]} groove, forming ${vocabulary[3]} patterns that move through the celestial ${metaphors[1]} with irresistible ${metaphors[2]}.`;
        case 'techno':
            return `Your planetary configuration operates as ${vocabulary[0]} algorithms in the cosmic ${metaphors[0]}. Each planet functions as a ${vocabulary[1]} component in the ${vocabulary[2]} system, creating ${vocabulary[3]} patterns that reflect the ${metaphors[1]} nature of your celestial ${metaphors[2]}.`;
        case 'jazz':
            return `Your planets engage in ${vocabulary[0]} conversations that create ${vocabulary[1]} dialogues. Each celestial body contributes its ${vocabulary[2]} voice to the cosmic ${vocabulary[3]}, forming ${metaphors[0]} expressions that reflect the ${metaphors[1]} nature of your astrological ${metaphors[2]}.`;
        case 'pop':
            return `Your planetary alignments create ${vocabulary[0]} hooks that are instantly ${vocabulary[1]}. Each planet contributes its ${vocabulary[2]} energy to the ${vocabulary[3]} melody, forming ${metaphors[0]} patterns that are both ${metaphors[1]} and ${metaphors[2]}.`;
        case 'blues':
            return `Your planets tell ${vocabulary[0]} stories through their ${vocabulary[1]} positions. Each celestial body contributes its ${vocabulary[2]} voice to the cosmic ${vocabulary[3]}, creating ${metaphors[0]} expressions that speak to the ${metaphors[1]} of human experience.`;
        case 'folk':
            return `Your planetary configuration tells ${vocabulary[0]} stories through ${vocabulary[1]} traditions. Each planet contributes its ${vocabulary[2]} wisdom to the cosmic ${vocabulary[3]}, forming ${metaphors[0]} narratives that connect to ${metaphors[1]} knowledge.`;
        case 'ambient':
            return `Your planets create ${vocabulary[0]} atmospheres that drift through ${vocabulary[1]} spaces. Each celestial body contributes its ${vocabulary[2]} energy to the cosmic ${vocabulary[3]}, forming ${metaphors[0]} soundscapes that are both ${metaphors[1]} and ${metaphors[2]}.`;
        case 'synthwave':
            return `Your planetary alignments create ${vocabulary[0]} retro-futuristic atmospheres. Each planet contributes its ${vocabulary[1]} energy to the cosmic ${vocabulary[2]}, forming ${vocabulary[3]} patterns that reflect the ${metaphors[0]} nature of your celestial ${metaphors[1]}.`;
        case 'world_fusion':
            return `Your planets blend ${vocabulary[0]} cultural elements into cosmic ${vocabulary[1]}. Each celestial body contributes its ${vocabulary[2]} energy to the ${vocabulary[3]} fusion, creating ${metaphors[0]} expressions that are both ${metaphors[1]} and ${metaphors[2]}.`;
        default:
            return `Your planetary configuration creates a unique expression of cosmic forces.`;
    }
}
function generateInterpretiveSummary(chartData, genre, mood) {
    const textStyle = (0, genre_system_1.getTextStyleForGenre)(genre);
    const vocabulary = textStyle.vocabulary;
    const metaphors = textStyle.metaphors;
    switch (genre) {
        case 'classical':
            return `Your chart represents a ${vocabulary[0]} composition in the grand ${metaphors[0]} of cosmic music. The ${vocabulary[1]} interplay of planetary forces creates a ${vocabulary[2]} masterpiece that reflects the ${vocabulary[3]} nature of your celestial ${metaphors[1]}, offering ${metaphors[2]} insights into your ${metaphors[3]} potential.`;
        case 'house':
            return `Your chart embodies the ${vocabulary[0]} energy of cosmic ${metaphors[0]}. The ${vocabulary[1]} rhythm of your planetary alignments creates ${vocabulary[2]} patterns that drive your ${vocabulary[3]} expression, offering ${metaphors[1]} insights into your ${metaphors[2]} potential.`;
        case 'techno':
            return `Your chart functions as a ${vocabulary[0]} system in the cosmic ${metaphors[0]}. The ${vocabulary[1]} precision of your planetary configuration creates ${vocabulary[2]} patterns that reflect the ${vocabulary[3]} nature of your celestial ${metaphors[1]}, offering ${metaphors[2]} insights into your ${metaphors[3]} potential.`;
        case 'jazz':
            return `Your chart swings with ${vocabulary[0]} cosmic ${metaphors[0]}. The ${vocabulary[1]} flow of your planetary alignments creates ${vocabulary[2]} expressions that reflect the ${vocabulary[3]} nature of your celestial ${metaphors[1]}, offering ${metaphors[2]} insights into your ${metaphors[3]} potential.`;
        case 'pop':
            return `Your chart radiates with ${vocabulary[0]} cosmic ${metaphors[0]}. The ${vocabulary[1]} energy of your planetary configuration creates ${vocabulary[2]} patterns that are both ${vocabulary[3]} and ${metaphors[1]}, offering ${metaphors[2]} insights into your ${metaphors[3]} potential.`;
        case 'blues':
            return `Your chart sings with ${vocabulary[0]} cosmic ${metaphors[0]}. The ${vocabulary[1]} honesty of your planetary alignments creates ${vocabulary[2]} expressions that speak to the ${vocabulary[3]} of human experience, offering ${metaphors[1]} insights into your ${metaphors[2]} potential.`;
        case 'folk':
            return `Your chart tells ${vocabulary[0]} cosmic ${metaphors[0]}. The ${vocabulary[1]} wisdom of your planetary configuration creates ${vocabulary[2]} narratives that connect to ${vocabulary[3]} traditions, offering ${metaphors[1]} insights into your ${metaphors[2]} potential.`;
        case 'ambient':
            return `Your chart drifts through ${vocabulary[0]} cosmic ${metaphors[0]}. The ${vocabulary[1]} nature of your planetary alignments creates ${vocabulary[2]} atmospheres that are both ${vocabulary[3]} and ${metaphors[1]}, offering ${metaphors[2]} insights into your ${metaphors[3]} potential.`;
        case 'synthwave':
            return `Your chart glows with ${vocabulary[0]} cosmic ${metaphors[0]}. The ${vocabulary[1]} nostalgia of your planetary configuration creates ${vocabulary[2]} atmospheres that are both ${vocabulary[3]} and ${metaphors[1]}, offering ${metaphors[2]} insights into your ${metaphors[3]} potential.`;
        case 'world_fusion':
            return `Your chart blends ${vocabulary[0]} cosmic ${metaphors[0]}. The ${vocabulary[1]} diversity of your planetary alignments creates ${vocabulary[2]} expressions that are both ${vocabulary[3]} and ${metaphors[1]}, offering ${metaphors[2]} insights into your ${metaphors[3]} potential.`;
        default:
            return `Your chart creates a unique cosmic expression that reflects your individual astrological signature.`;
    }
}
function getGenreSectionTitle(genre, section) {
    const genreConfig = (0, genre_system_1.getGenreConfig)(genre);
    switch (section) {
        case 'mood':
            return `${genreConfig.name} Musical Mood`;
        case 'planetary':
            return `${genreConfig.name} Planetary Expression`;
        case 'summary':
            return `${genreConfig.name} Interpretive Summary`;
        default:
            return `${genreConfig.name} Section`;
    }
}
function combineNarrationSections(sections, genre) {
    const genreConfig = (0, genre_system_1.getGenreConfig)(genre);
    const textStyle = (0, genre_system_1.getTextStyleForGenre)(genre);
    let combined = '';
    sections.forEach((section, index) => {
        combined += `${section.title}\n\n`;
        combined += `${section.content}\n\n`;
        if (index < sections.length - 1) {
            // Add genre-specific transition
            combined += `${getGenreTransition(genre)}\n\n`;
        }
    });
    return combined.trim();
}
function getGenreTransition(genre) {
    switch (genre) {
        case 'classical':
            return 'As the harmonies continue to unfold...';
        case 'house':
            return 'The rhythm builds and flows...';
        case 'techno':
            return 'The mechanical precision continues...';
        case 'jazz':
            return 'The improvisation flows naturally...';
        case 'pop':
            return 'The melody catches and holds...';
        case 'blues':
            return 'The soul continues to speak...';
        case 'folk':
            return 'The story continues to unfold...';
        case 'ambient':
            return 'The atmosphere drifts and flows...';
        case 'synthwave':
            return 'The retro-futuristic glow continues...';
        case 'world_fusion':
            return 'The cultural blend continues to evolve...';
        default:
            return 'The cosmic expression continues...';
    }
}
