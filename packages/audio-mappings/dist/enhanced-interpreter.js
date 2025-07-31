"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CELESTIAL_INTERPRETATIONS = void 0;
exports.generateEnhancedInterpretation = generateEnhancedInterpretation;
const CELESTIAL_INTERPRETATIONS = {
    // Traditional Planets
    Sun: {
        name: 'Sun',
        musicalInfluence: 'Core identity and lead melodies',
        houseMeanings: {
            1: 'Self-expression through bold, confident musical themes',
            2: 'Material values reflected in grounding bass lines',
            3: 'Communication through melodic conversations',
            4: 'Emotional foundation in harmonic progressions',
            5: 'Creative expression through dynamic lead parts',
            6: 'Service-oriented rhythms and practical melodies',
            7: 'Partnership dynamics in call-and-response patterns',
            8: 'Transformation through intense, deep bass',
            9: 'Expansion through soaring, adventurous themes',
            10: 'Career achievement through powerful, authoritative sounds',
            11: 'Community connection through collaborative harmonies',
            12: 'Spiritual transcendence through ethereal, ambient textures'
        },
        signMeanings: {
            Aries: 'Bold, assertive lead melodies with fire energy',
            Taurus: 'Steady, grounding rhythms with earthy bass',
            Gemini: 'Quick, versatile melodic patterns',
            Cancer: 'Emotional, nurturing harmonic progressions',
            Leo: 'Dramatic, expressive lead performances',
            Virgo: 'Precise, detailed melodic craftsmanship',
            Libra: 'Balanced, harmonious musical relationships',
            Scorpio: 'Intense, transformative deep bass',
            Sagittarius: 'Adventurous, expansive soaring themes',
            Capricorn: 'Structured, authoritative musical leadership',
            Aquarius: 'Innovative, community-oriented harmonies',
            Pisces: 'Dreamy, spiritual ambient textures'
        },
        generalMeaning: 'The Sun represents your core musical identity and the primary melody that defines your sound.'
    },
    Moon: {
        name: 'Moon',
        musicalInfluence: 'Emotional undercurrents and ambient textures',
        houseMeanings: {
            1: 'Emotional self-expression through intuitive melodies',
            2: 'Material security reflected in comforting harmonies',
            3: 'Emotional communication through sensitive phrasing',
            4: 'Deep emotional foundation in nurturing bass',
            5: 'Creative emotional expression through heartfelt themes',
            6: 'Emotional service through gentle, supportive sounds',
            7: 'Emotional partnerships in harmonious duets',
            8: 'Emotional transformation through cathartic releases',
            9: 'Emotional expansion through spiritual sounds',
            10: 'Emotional career fulfillment through meaningful expression',
            11: 'Emotional community bonds through shared feelings',
            12: 'Spiritual emotional transcendence through ethereal sounds'
        },
        signMeanings: {
            Aries: 'Passionate emotional expression with fiery intensity',
            Taurus: 'Steady emotional grounding with earthy comfort',
            Gemini: 'Versatile emotional communication with quick changes',
            Cancer: 'Deeply nurturing emotional foundation',
            Leo: 'Dramatic emotional expression with creative flair',
            Virgo: 'Precise emotional attention to detail',
            Libra: 'Balanced emotional harmony in relationships',
            Scorpio: 'Intense emotional transformation and depth',
            Sagittarius: 'Adventurous emotional expansion and freedom',
            Capricorn: 'Structured emotional discipline and control',
            Aquarius: 'Innovative emotional detachment and community',
            Pisces: 'Dreamy emotional transcendence and spirituality'
        },
        generalMeaning: 'The Moon governs the emotional undercurrents and ambient textures that provide depth to your musical expression.'
    },
    // Outer Planets
    Uranus: {
        name: 'Uranus',
        musicalInfluence: 'Innovation, disruption, and glitch effects',
        houseMeanings: {
            1: 'Revolutionary self-expression through avant-garde sounds',
            2: 'Innovative approach to material values and resources',
            3: 'Disruptive communication through experimental techniques',
            4: 'Revolutionary changes in emotional foundation',
            5: 'Innovative creative expression through technology',
            6: 'Disruptive service through unconventional methods',
            7: 'Revolutionary partnerships and relationship dynamics',
            8: 'Innovative transformation through radical change',
            9: 'Disruptive expansion through revolutionary ideas',
            10: 'Innovative career through cutting-edge approaches',
            11: 'Revolutionary community involvement and activism',
            12: 'Innovative spiritual transcendence through technology'
        },
        signMeanings: {
            Aries: 'Pioneering innovation with bold, disruptive energy',
            Taurus: 'Revolutionary changes to traditional values',
            Gemini: 'Innovative communication through technology',
            Cancer: 'Disruptive changes to emotional foundations',
            Leo: 'Revolutionary creative expression and leadership',
            Virgo: 'Innovative precision and analytical disruption',
            Libra: 'Revolutionary balance and relationship innovation',
            Scorpio: 'Disruptive transformation and radical change',
            Sagittarius: 'Innovative expansion and revolutionary freedom',
            Capricorn: 'Revolutionary structure and authority',
            Aquarius: 'Innovative community and technological advancement',
            Pisces: 'Disruptive spirituality and transcendent innovation'
        },
        generalMeaning: 'Uranus brings innovation, disruption, and glitch effects that break conventional musical boundaries.'
    },
    Neptune: {
        name: 'Neptune',
        musicalInfluence: 'Dreamy atmospheres, reverb, and spiritual transcendence',
        houseMeanings: {
            1: 'Spiritual self-expression through ethereal sounds',
            2: 'Transcendent approach to material values',
            3: 'Dreamy communication through intuitive expression',
            4: 'Spiritual emotional foundation and divine connection',
            5: 'Transcendent creative expression through inspiration',
            6: 'Spiritual service through compassionate healing',
            7: 'Dreamy partnerships based on spiritual connection',
            8: 'Transcendent transformation through divine grace',
            9: 'Spiritual expansion through mystical experiences',
            10: 'Dreamy career fulfillment through divine calling',
            11: 'Transcendent community through spiritual unity',
            12: 'Divine spiritual transcendence and cosmic connection'
        },
        signMeanings: {
            Aries: 'Spiritual fire and divine inspiration',
            Taurus: 'Transcendent material values and divine beauty',
            Gemini: 'Dreamy communication and spiritual messages',
            Cancer: 'Divine emotional foundation and spiritual nurturing',
            Leo: 'Transcendent creative expression and divine leadership',
            Virgo: 'Spiritual precision and divine service',
            Libra: 'Dreamy balance and spiritual harmony',
            Scorpio: 'Transcendent transformation and divine mystery',
            Sagittarius: 'Spiritual expansion and divine wisdom',
            Capricorn: 'Dreamy structure and spiritual authority',
            Aquarius: 'Transcendent innovation and divine community',
            Pisces: 'Divine spirituality and cosmic transcendence'
        },
        generalMeaning: 'Neptune creates dreamy atmospheres, reverb effects, and spiritual transcendence in your musical expression.'
    },
    Pluto: {
        name: 'Pluto',
        musicalInfluence: 'Deep transformation, distortion, and powerful bass',
        houseMeanings: {
            1: 'Transformative self-expression through powerful themes',
            2: 'Deep transformation of material values and resources',
            3: 'Powerful communication through intense expression',
            4: 'Transformative emotional foundation and deep healing',
            5: 'Powerful creative expression through cathartic release',
            6: 'Deep transformation through intense service',
            7: 'Transformative partnerships through powerful bonds',
            8: 'Deep transformation through intense change',
            9: 'Powerful expansion through transformative experiences',
            10: 'Transformative career through powerful authority',
            11: 'Deep transformation of community through power',
            12: 'Powerful spiritual transcendence through transformation'
        },
        signMeanings: {
            Aries: 'Powerful transformation through bold, intense action',
            Taurus: 'Deep transformation of traditional values',
            Gemini: 'Powerful communication through intense expression',
            Cancer: 'Transformative emotional foundation and healing',
            Leo: 'Powerful creative expression and leadership',
            Virgo: 'Deep transformation through precise analysis',
            Libra: 'Transformative balance and powerful harmony',
            Scorpio: 'Intense transformation and deep mystery',
            Sagittarius: 'Powerful expansion and transformative wisdom',
            Capricorn: 'Deep transformation of structure and authority',
            Aquarius: 'Powerful innovation and transformative community',
            Pisces: 'Transformative spirituality and deep transcendence'
        },
        generalMeaning: 'Pluto brings deep transformation, distortion effects, and powerful bass that represents profound change.'
    },
    // Asteroids and Points
    Chiron: {
        name: 'Chiron',
        musicalInfluence: 'Healing through tension and resolution',
        houseMeanings: {
            1: 'Healing self-expression through vulnerability',
            2: 'Healing material values through acceptance',
            3: 'Healing communication through honest expression',
            4: 'Healing emotional foundation through understanding',
            5: 'Healing creative expression through authenticity',
            6: 'Healing service through compassionate care',
            7: 'Healing partnerships through mutual understanding',
            8: 'Healing transformation through deep processing',
            9: 'Healing expansion through wisdom and growth',
            10: 'Healing career through authentic leadership',
            11: 'Healing community through shared vulnerability',
            12: 'Healing spirituality through transcendent understanding'
        },
        signMeanings: {
            Aries: 'Healing through bold, courageous vulnerability',
            Taurus: 'Healing material values through acceptance',
            Gemini: 'Healing communication through honest expression',
            Cancer: 'Healing emotional foundation through nurturing',
            Leo: 'Healing creative expression through authentic leadership',
            Virgo: 'Healing through precise, compassionate service',
            Libra: 'Healing balance through mutual understanding',
            Scorpio: 'Healing transformation through deep processing',
            Sagittarius: 'Healing expansion through wisdom and growth',
            Capricorn: 'Healing structure through authentic authority',
            Aquarius: 'Healing community through innovative understanding',
            Pisces: 'Healing spirituality through transcendent compassion'
        },
        generalMeaning: 'Chiron represents the wounded healer, creating musical tension that resolves into healing and growth.'
    },
    Lilith: {
        name: 'Lilith',
        musicalInfluence: 'Unconventional expression, minor keys, and contrast',
        houseMeanings: {
            1: 'Unconventional self-expression through rebellion',
            2: 'Unconventional material values and independence',
            3: 'Unconventional communication through raw honesty',
            4: 'Unconventional emotional foundation and independence',
            5: 'Unconventional creative expression through rebellion',
            6: 'Unconventional service through independence',
            7: 'Unconventional partnerships and independence',
            8: 'Unconventional transformation through rebellion',
            9: 'Unconventional expansion through independence',
            10: 'Unconventional career through rebellion',
            11: 'Unconventional community through independence',
            12: 'Unconventional spirituality through rebellion'
        },
        signMeanings: {
            Aries: 'Bold rebellion and unconventional independence',
            Taurus: 'Unconventional material values and independence',
            Gemini: 'Unconventional communication and independence',
            Cancer: 'Unconventional emotional foundation and independence',
            Leo: 'Unconventional creative expression and rebellion',
            Virgo: 'Unconventional service and independence',
            Libra: 'Unconventional balance and independence',
            Scorpio: 'Unconventional transformation and rebellion',
            Sagittarius: 'Unconventional expansion and independence',
            Capricorn: 'Unconventional structure and rebellion',
            Aquarius: 'Unconventional innovation and independence',
            Pisces: 'Unconventional spirituality and rebellion'
        },
        generalMeaning: 'Lilith represents the dark feminine, bringing unconventional expression, minor keys, and musical contrast.'
    },
    NorthNode: {
        name: 'North Node',
        musicalInfluence: 'Directional pull toward growth and evolution',
        houseMeanings: {
            1: 'Evolutionary self-expression and personal growth',
            2: 'Evolutionary material values and self-worth',
            3: 'Evolutionary communication and learning',
            4: 'Evolutionary emotional foundation and security',
            5: 'Evolutionary creative expression and joy',
            6: 'Evolutionary service and health',
            7: 'Evolutionary partnerships and relationships',
            8: 'Evolutionary transformation and shared resources',
            9: 'Evolutionary expansion and higher learning',
            10: 'Evolutionary career and public recognition',
            11: 'Evolutionary community and social causes',
            12: 'Evolutionary spirituality and transcendence'
        },
        signMeanings: {
            Aries: 'Evolutionary boldness and courageous growth',
            Taurus: 'Evolutionary stability and material growth',
            Gemini: 'Evolutionary communication and learning',
            Cancer: 'Evolutionary emotional security and nurturing',
            Leo: 'Evolutionary creative leadership and expression',
            Virgo: 'Evolutionary service and precision',
            Libra: 'Evolutionary balance and partnership',
            Scorpio: 'Evolutionary transformation and depth',
            Sagittarius: 'Evolutionary expansion and wisdom',
            Capricorn: 'Evolutionary structure and authority',
            Aquarius: 'Evolutionary innovation and community',
            Pisces: 'Evolutionary spirituality and transcendence'
        },
        generalMeaning: 'The North Node represents your evolutionary direction, pulling your music toward growth and development.'
    },
    SouthNode: {
        name: 'South Node',
        musicalInfluence: 'Release of past patterns and familiar comfort',
        houseMeanings: {
            1: 'Release of old self-expression patterns',
            2: 'Release of old material value patterns',
            3: 'Release of old communication patterns',
            4: 'Release of old emotional foundation patterns',
            5: 'Release of old creative expression patterns',
            6: 'Release of old service patterns',
            7: 'Release of old partnership patterns',
            8: 'Release of old transformation patterns',
            9: 'Release of old expansion patterns',
            10: 'Release of old career patterns',
            11: 'Release of old community patterns',
            12: 'Release of old spiritual patterns'
        },
        signMeanings: {
            Aries: 'Release of old boldness and independence',
            Taurus: 'Release of old stability and materialism',
            Gemini: 'Release of old communication patterns',
            Cancer: 'Release of old emotional patterns',
            Leo: 'Release of old creative leadership patterns',
            Virgo: 'Release of old service and precision patterns',
            Libra: 'Release of old balance and partnership patterns',
            Scorpio: 'Release of old transformation patterns',
            Sagittarius: 'Release of old expansion and wisdom patterns',
            Capricorn: 'Release of old structure and authority patterns',
            Aquarius: 'Release of old innovation and community patterns',
            Pisces: 'Release of old spirituality and transcendence patterns'
        },
        generalMeaning: 'The South Node represents past patterns to release, creating familiar musical comfort zones to transcend.'
    },
    Ceres: {
        name: 'Ceres',
        musicalInfluence: 'Nurturing, caring, and motherly themes',
        houseMeanings: {
            1: 'Nurturing self-expression and self-care',
            2: 'Nurturing material values and self-worth',
            3: 'Nurturing communication and learning',
            4: 'Nurturing emotional foundation and security',
            5: 'Nurturing creative expression and joy',
            6: 'Nurturing service and health',
            7: 'Nurturing partnerships and relationships',
            8: 'Nurturing transformation and shared resources',
            9: 'Nurturing expansion and higher learning',
            10: 'Nurturing career and public recognition',
            11: 'Nurturing community and social causes',
            12: 'Nurturing spirituality and transcendence'
        },
        signMeanings: {
            Aries: 'Bold nurturing and courageous care',
            Taurus: 'Stable nurturing and material care',
            Gemini: 'Versatile nurturing and communicative care',
            Cancer: 'Deep nurturing and emotional care',
            Leo: 'Creative nurturing and expressive care',
            Virgo: 'Precise nurturing and service-oriented care',
            Libra: 'Balanced nurturing and harmonious care',
            Scorpio: 'Intense nurturing and transformative care',
            Sagittarius: 'Expansive nurturing and wise care',
            Capricorn: 'Structured nurturing and authoritative care',
            Aquarius: 'Innovative nurturing and community care',
            Pisces: 'Spiritual nurturing and transcendent care'
        },
        generalMeaning: 'Ceres represents nurturing and caring themes, bringing motherly warmth and protective energy to your music.'
    },
    Juno: {
        name: 'Juno',
        musicalInfluence: 'Partnership dynamics and committed relationships',
        houseMeanings: {
            1: 'Partnership in self-expression and identity',
            2: 'Partnership in material values and resources',
            3: 'Partnership in communication and learning',
            4: 'Partnership in emotional foundation and security',
            5: 'Partnership in creative expression and joy',
            6: 'Partnership in service and health',
            7: 'Partnership in relationships and commitment',
            8: 'Partnership in transformation and shared resources',
            9: 'Partnership in expansion and higher learning',
            10: 'Partnership in career and public recognition',
            11: 'Partnership in community and social causes',
            12: 'Partnership in spirituality and transcendence'
        },
        signMeanings: {
            Aries: 'Bold partnership and courageous commitment',
            Taurus: 'Stable partnership and material commitment',
            Gemini: 'Versatile partnership and communicative commitment',
            Cancer: 'Emotional partnership and nurturing commitment',
            Leo: 'Creative partnership and expressive commitment',
            Virgo: 'Precise partnership and service-oriented commitment',
            Libra: 'Balanced partnership and harmonious commitment',
            Scorpio: 'Intense partnership and transformative commitment',
            Sagittarius: 'Expansive partnership and wise commitment',
            Capricorn: 'Structured partnership and authoritative commitment',
            Aquarius: 'Innovative partnership and community commitment',
            Pisces: 'Spiritual partnership and transcendent commitment'
        },
        generalMeaning: 'Juno represents committed partnerships and relationship dynamics, bringing harmony and balance to your musical expression.'
    },
    Vesta: {
        name: 'Vesta',
        musicalInfluence: 'Focused dedication and spiritual service',
        houseMeanings: {
            1: 'Focused self-expression and dedicated identity',
            2: 'Focused material values and dedicated resources',
            3: 'Focused communication and dedicated learning',
            4: 'Focused emotional foundation and dedicated security',
            5: 'Focused creative expression and dedicated joy',
            6: 'Focused service and dedicated health',
            7: 'Focused partnerships and dedicated relationships',
            8: 'Focused transformation and dedicated shared resources',
            9: 'Focused expansion and dedicated higher learning',
            10: 'Focused career and dedicated public recognition',
            11: 'Focused community and dedicated social causes',
            12: 'Focused spirituality and dedicated transcendence'
        },
        signMeanings: {
            Aries: 'Bold focus and courageous dedication',
            Taurus: 'Stable focus and material dedication',
            Gemini: 'Versatile focus and communicative dedication',
            Cancer: 'Emotional focus and nurturing dedication',
            Leo: 'Creative focus and expressive dedication',
            Virgo: 'Precise focus and service-oriented dedication',
            Libra: 'Balanced focus and harmonious dedication',
            Scorpio: 'Intense focus and transformative dedication',
            Sagittarius: 'Expansive focus and wise dedication',
            Capricorn: 'Structured focus and authoritative dedication',
            Aquarius: 'Innovative focus and community dedication',
            Pisces: 'Spiritual focus and transcendent dedication'
        },
        generalMeaning: 'Vesta represents focused dedication and spiritual service, bringing concentration and devotion to your musical expression.'
    },
    Pallas: {
        name: 'Pallas',
        musicalInfluence: 'Wisdom, strategy, and intellectual themes',
        houseMeanings: {
            1: 'Wise self-expression and strategic identity',
            2: 'Wise material values and strategic resources',
            3: 'Wise communication and strategic learning',
            4: 'Wise emotional foundation and strategic security',
            5: 'Wise creative expression and strategic joy',
            6: 'Wise service and strategic health',
            7: 'Wise partnerships and strategic relationships',
            8: 'Wise transformation and strategic shared resources',
            9: 'Wise expansion and strategic higher learning',
            10: 'Wise career and strategic public recognition',
            11: 'Wise community and strategic social causes',
            12: 'Wise spirituality and strategic transcendence'
        },
        signMeanings: {
            Aries: 'Bold wisdom and courageous strategy',
            Taurus: 'Stable wisdom and material strategy',
            Gemini: 'Versatile wisdom and communicative strategy',
            Cancer: 'Emotional wisdom and nurturing strategy',
            Leo: 'Creative wisdom and expressive strategy',
            Virgo: 'Precise wisdom and service-oriented strategy',
            Libra: 'Balanced wisdom and harmonious strategy',
            Scorpio: 'Intense wisdom and transformative strategy',
            Sagittarius: 'Expansive wisdom and strategic growth',
            Capricorn: 'Structured wisdom and authoritative strategy',
            Aquarius: 'Innovative wisdom and community strategy',
            Pisces: 'Spiritual wisdom and transcendent strategy'
        },
        generalMeaning: 'Pallas represents wisdom and strategic thinking, bringing intellectual depth and thoughtful themes to your music.'
    },
    Eris: {
        name: 'Eris',
        musicalInfluence: 'Disruption, chaos, and revolutionary change',
        houseMeanings: {
            1: 'Disruptive self-expression and chaotic identity',
            2: 'Disruptive material values and chaotic resources',
            3: 'Disruptive communication and chaotic learning',
            4: 'Disruptive emotional foundation and chaotic security',
            5: 'Disruptive creative expression and chaotic joy',
            6: 'Disruptive service and chaotic health',
            7: 'Disruptive partnerships and chaotic relationships',
            8: 'Disruptive transformation and chaotic shared resources',
            9: 'Disruptive expansion and chaotic higher learning',
            10: 'Disruptive career and chaotic public recognition',
            11: 'Disruptive community and chaotic social causes',
            12: 'Disruptive spirituality and chaotic transcendence'
        },
        signMeanings: {
            Aries: 'Bold disruption and courageous chaos',
            Taurus: 'Stable disruption and material chaos',
            Gemini: 'Versatile disruption and communicative chaos',
            Cancer: 'Emotional disruption and nurturing chaos',
            Leo: 'Creative disruption and expressive chaos',
            Virgo: 'Precise disruption and service-oriented chaos',
            Libra: 'Balanced disruption and harmonious chaos',
            Scorpio: 'Intense disruption and transformative chaos',
            Sagittarius: 'Expansive disruption and wise chaos',
            Capricorn: 'Structured disruption and authoritative chaos',
            Aquarius: 'Innovative disruption and community chaos',
            Pisces: 'Spiritual disruption and transcendent chaos'
        },
        generalMeaning: 'Eris represents disruption and chaos, bringing revolutionary change and challenging energy to your musical expression.'
    }
};
exports.CELESTIAL_INTERPRETATIONS = CELESTIAL_INTERPRETATIONS;
function generateEnhancedInterpretation(chartData, selectedOrbs, genre) {
    let interpretation = `Your sandbox configuration creates a unique cosmic symphony that reflects the interplay of ${selectedOrbs.length} celestial bodies. `;
    // Group orbs by house
    const orbsByHouse = {};
    selectedOrbs.forEach(orb => {
        if (orb.position?.house) {
            if (!orbsByHouse[orb.position.house]) {
                orbsByHouse[orb.position.house] = [];
            }
            orbsByHouse[orb.position.house].push(orb);
        }
    });
    // Generate house-specific interpretations
    Object.entries(orbsByHouse).forEach(([houseNum, orbs]) => {
        const house = parseInt(houseNum);
        const sign = orbs[0]?.position?.sign || 'Unknown';
        interpretation += `\n\nIn the ${ordinal(house)} house (${sign}), `;
        if (orbs.length === 1) {
            const orb = orbs[0];
            const orbInterpretation = CELESTIAL_INTERPRETATIONS[orb.name];
            if (orbInterpretation) {
                interpretation += orbInterpretation.houseMeanings[house] ||
                    `${orb.name} brings its unique energy to this area of life.`;
            }
        }
        else {
            interpretation += `${orbs.length} celestial bodies converge, creating a complex harmonic interplay. `;
            orbs.forEach((orb, index) => {
                const orbInterpretation = CELESTIAL_INTERPRETATIONS[orb.name];
                if (orbInterpretation) {
                    interpretation += `${index === 0 ? '' : index === orbs.length - 1 ? ', and ' : ', '}${orb.name} (${orbInterpretation.musicalInfluence})`;
                }
            });
            interpretation += ` work together to create a rich, layered soundscape.`;
        }
    });
    // Add genre-specific conclusion
    interpretation += `\n\nThis ${genre} composition reflects the unique cosmic fingerprint of your sandbox configuration, where each celestial body contributes its distinct voice to create a harmonious yet complex musical expression.`;
    return interpretation;
}
function ordinal(n) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}
