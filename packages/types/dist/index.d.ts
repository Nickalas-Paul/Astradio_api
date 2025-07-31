export interface AstroChart {
    metadata: ChartMetadata;
    planets: Record<string, PlanetData>;
    houses: Record<string, HouseData>;
}
export interface ChartMetadata {
    conversion_method: string;
    ayanamsa_correction: number;
    birth_datetime: string;
    coordinate_system: 'tropical' | 'sidereal';
}
export interface PlanetData {
    longitude: number;
    sign: SignData;
    house: number;
    retrograde: boolean;
}
export interface HouseData {
    cusp_longitude: number;
    sign: SignData;
}
export interface SignData {
    name: string;
    element: 'Fire' | 'Earth' | 'Air' | 'Water';
    modality: 'Cardinal' | 'Fixed' | 'Mutable';
    degree: number;
}
export interface AspectData {
    planet1: string;
    planet2: string;
    type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
    angle: number;
    harmonic: string;
}
export interface BirthData {
    date: string;
    time: string;
    latitude: number;
    longitude: number;
    timezone: number;
    location?: string;
}
export interface AudioConfiguration {
    mode: 'sequential' | 'layered' | 'overlay' | 'sandbox' | 'melodic' | 'preview';
    duration?: number;
    tempo?: number;
    key?: string;
    genre?: GenreType;
    mood?: MoodType;
}
export type GenreType = 'ambient' | 'folk' | 'jazz' | 'classical' | 'electronic' | 'rock' | 'blues' | 'world' | 'techno' | 'chill' | 'house' | 'pop' | 'synthwave' | 'world_fusion';
export type MoodType = 'contemplative' | 'energetic' | 'melancholic' | 'uplifting' | 'mysterious' | 'peaceful' | 'passionate' | 'grounded';
export interface GenreConfiguration {
    name: GenreType;
    instruments: {
        melodic: string[];
        rhythmic: string[];
        bass: string[];
        pad: string[];
    };
    tempo: {
        min: number;
        max: number;
        default: number;
    };
    scales: string[];
    visualStyle: {
        colors: string[];
        motionSpeed: number;
        opacity: number;
        filter: string;
    };
    narration: {
        tone: string;
        language: string;
        style: string;
    };
    textile: string;
}
export interface MoodConfiguration {
    name: MoodType;
    genreWeights: Partial<Record<GenreType, number>>;
    tempo: {
        min: number;
        max: number;
        default: number;
    };
    visualFilter: string;
    narrationTone: string;
}
export interface AudioSession {
    id: string;
    chartId: string;
    configuration: AudioConfiguration;
    isPlaying: boolean;
    currentHouse?: number;
    startTime?: number;
    duration?: number;
    genre?: GenreType;
    mood?: MoodType;
}
export interface MelodicNote {
    frequency: number;
    duration: number;
    velocity: number;
    instrument: string;
    timestamp: number;
    effects?: string[];
}
export interface MelodicPhrase {
    id: string;
    planet: string;
    role: string;
    notes: MelodicNote[];
    startTime: number;
    duration: number;
    intensity: number;
    variation: number;
}
export interface MelodicAudioSession extends AudioSession {
    mode: 'melodic';
    phrases: MelodicPhrase[];
    scale: string[];
    key: string;
    tempo: number;
    timeSignature: string;
}
export interface MusicalConfig {
    genre: string;
    dominantElement: string;
    scale: string[];
    aspects: AspectData[];
    planets: Array<{
        name: string;
        element: string;
        modality: string;
        dignity: string;
        musicalRole: string;
        genreConfig: any;
    }>;
    instruments: Record<string, string[]>;
}
export interface ChartInputProps {
    onChartGenerated: (chart: AstroChart) => void;
    label?: string;
    defaultValues?: Partial<BirthData>;
    disabled?: boolean;
}
export interface AudioControlsProps {
    onPlay: () => void;
    onPause: () => void;
    onStop: () => void;
    isPlaying: boolean;
    isLoading?: boolean;
    duration?: number;
    currentTime?: number;
}
export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    interval: 'weekly' | 'monthly' | 'annual';
    features: string[];
    limits: {
        chartGenerations: number;
        audioDuration: number;
        exports: number;
        sandboxUses: number;
    };
}
export interface UserSubscription {
    userId: string;
    planId: string;
    status: 'active' | 'cancelled' | 'expired';
    startDate: Date;
    endDate: Date;
    usage: {
        chartGenerations: number;
        audioDuration: number;
        exports: number;
        sandboxUses: number;
    };
}
export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export type Genre = 'classical' | 'house' | 'techno' | 'jazz' | 'pop' | 'blues' | 'folk' | 'ambient' | 'synthwave' | 'world_fusion';
export type Mood = 'chill' | 'intense' | 'dreamy' | 'passionate' | 'earthy' | 'uplifting' | 'cosmic';
export interface InstrumentMapping {
    primary: string[];
    secondary: string[];
    effects: string[];
}
export interface VisualStyle {
    palette: string[];
    textures: string[];
    animations: string[];
    overlays: string[];
}
export interface TextStyle {
    style: string;
    tone: string;
    vocabulary: string[];
    metaphors: string[];
}
export interface GenreConfig {
    name: string;
    instruments: InstrumentMapping;
    visuals: VisualStyle;
    text: TextStyle;
    textile: string;
    tempo: {
        min: number;
        max: number;
        default: number;
    };
    scales: string[];
    keySignatures: string[];
}
export interface MoodToGenreMapping {
    genres: Genre[];
    tempo: {
        min: number;
        max: number;
        default: number;
    };
    scales: string[];
    narration: {
        tone: string;
        vocabulary: string[];
        metaphors: string[];
    };
    visuals: {
        colorGrading: string;
        animationSpeed: string;
        overlayStyle: string;
    };
}
export interface AudioGenerationConfig {
    genre: Genre;
    mood?: Mood;
    tempo: number;
    scale: string;
    keySignature: string;
    instruments: InstrumentMapping;
    effects: string[];
    duration: number;
}
export interface MelodyNote {
    pitch: number;
    duration: number;
    velocity: number;
    instrument: string;
    effects?: string[];
}
export interface GenreSpecificMelody {
    genre: Genre;
    tempo: number;
    scale: string;
    instruments: string[];
    notes: MelodyNote[];
    visualStyle: VisualStyle;
    textStyle: TextStyle;
}
export interface VisualConfig {
    genre: Genre;
    mood?: Mood;
    palette: string[];
    textures: string[];
    animations: string[];
    overlays: string[];
    colorGrading: string;
    animationSpeed: string;
}
export interface TextGenerationConfig {
    genre: Genre;
    mood?: Mood;
    style: string;
    tone: string;
    vocabulary: string[];
    metaphors: string[];
    chartData: any;
}
export interface NarrationSection {
    title: string;
    content: string;
    style: string;
    tone: string;
}
export interface GenreSpecificNarration {
    genre: Genre;
    mood?: Mood;
    sections: NarrationSection[];
    musicalMood: string;
    planetaryExpression: string;
    interpretiveSummary: string;
    fullNarration: string;
}
