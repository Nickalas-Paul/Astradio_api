import { Genre, GenreConfig, Mood, MoodToGenreMapping, InstrumentMapping, VisualStyle, TextStyle } from '@astradio/types';
export declare const GENRE_CONFIGS: Record<Genre, GenreConfig>;
export declare const MOOD_TO_GENRE_MAPPINGS: Record<Mood, MoodToGenreMapping>;
export declare function getGenreConfig(genre: Genre): GenreConfig;
export declare function getMoodMapping(mood: Mood): MoodToGenreMapping;
export declare function getRandomGenre(): Genre;
export declare function getGenreFromMood(mood: Mood): Genre;
export declare function getInstrumentsForGenre(genre: Genre): InstrumentMapping;
export declare function getVisualStyleForGenre(genre: Genre): VisualStyle;
export declare function getTextStyleForGenre(genre: Genre): TextStyle;
export declare function getTempoForGenre(genre: Genre): {
    min: number;
    max: number;
    default: number;
};
export declare function getScalesForGenre(genre: Genre): string[];
export declare function getAllGenres(): Genre[];
export declare function getAllMoods(): Mood[];
export declare function generateGenreSpecificMelody(genre: Genre, chartData: any): any;
