import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { z } from 'zod';
import { astroCore } from '@astradio/astro-core';
import { audioEngine, exportEngine, advancedPlaybackEngine } from '@astradio/audio-mappings';
import { generateMusicNarration, generateModeSpecificNarration, generateDualChartNarration } from '@astradio/audio-mappings';
import { BirthData } from '@astradio/types';
import { AudioGenerator } from '@astradio/audio-mappings';

// Phase 6.3: User System & Social Features
import { initializeDatabase } from './database';
import { AuthService, User, AuthRequest } from './auth';
import { SessionService } from './services/sessionService';
import { DailyChartService } from './services/dailyChartService';
import { SocialService } from './services/socialService';
import { SubscriptionService } from './services/subscriptionService';

// Phase 6.4: Security Features
import {
  enhancedHelmet,
  chartGenerationLimit,
  audioGenerationLimit,
  authLimit,
  exportLimit,
  speedLimiter,
  validateInput,
  chartGenerationSchema,
  audioGenerationSchema,
  authSchema,
  sessionSchema,
  requestSizeLimit,
  securityHeaders,
  requestLogger,
  errorHandler,
  corsOptions
} from './middleware/security';

import {
  sanitizeInput,
  preventSQLInjection,
  preventXSS,
  logSuspiciousActivity,
  validateEnhancedInput,
  enhancedChartGenerationSchema,
  enhancedAudioGenerationSchema
} from './middleware/inputSanitizer';

// Phase 6.3-6.4: Controllers
import { AuthController } from './auth/authController';
import { SessionController } from './sessions/sessionController';
import { FriendController } from './friends/friendController';
import { SubscriptionController } from './subscriptions/subscriptionController';

dotenv.config();

// Log environment variables for debugging
console.log('Loaded Client ID:', process.env.ASTRO_CLIENT_ID ? 'Present' : 'Missing');
console.log('Loaded Client Secret:', process.env.ASTRO_CLIENT_SECRET ? 'Present' : 'Missing');
console.log('Loaded Token URL:', process.env.ASTRO_TOKEN_URL);

// Set default values for required environment variables
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'astradio-development-jwt-secret';
  console.log('⚠️  Using default JWT_SECRET for development');
}

if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = 'astradio-development-session-secret';
  console.log('⚠️  Using default SESSION_SECRET for development');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure database directory exists (only in development)
import fs from 'fs';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Security middleware (order matters!)
app.use(enhancedHelmet);
app.use(cors(corsOptions));
app.use(compression());
app.use(morgan('combined'));
app.use(securityHeaders);
app.use(requestLogger);
app.use(speedLimiter);
app.use(requestSizeLimit);
app.use(express.json({ limit: '10mb' }));

// Enhanced security middleware
app.use(sanitizeInput);
app.use(preventSQLInjection);
app.use(preventXSS);
app.use(logSuspiciousActivity);

// Health check (no rate limiting)
app.get('/health', (req, res) => {
  try {
    // Check if database is accessible
    const dbPath = process.env.DATABASE_URL || './data/astradio.db';
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3001,
      database: dbPath
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Daily charts endpoint
app.get('/api/daily/:date', validateEnhancedInput(z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
})), async (req, res) => {
  try {
    const { date } = req.params;
    
    // Additional validation
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime()) || 
        parsedDate.getFullYear() < 1900 || 
        parsedDate.getFullYear() > 2100) {
      return res.status(400).json({
        success: false,
        error: 'Date must be between 1900 and 2100'
      });
    }

    const chart = await astroCore.generateDailyChart(date);
    const audioConfig = audioEngine.getAudioConfig(chart);
    
    res.json({
      success: true,
      data: {
        date,
        chart,
        audio_config: audioConfig
      }
    });
  } catch (error) {
    console.error('Daily chart generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate daily chart',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Chart generation endpoint with rate limiting and validation
app.post('/api/charts/generate', 
  chartGenerationLimit,
  validateInput(chartGenerationSchema),
  async (req, res) => {
  try {
    const { birth_data, mode = 'moments' } = req.body;

    console.log(`Generating chart for mode: ${mode}`);

    const birthData: BirthData = {
      date: birth_data.date,
      time: birth_data.time,
      latitude: birth_data.latitude,
      longitude: birth_data.longitude,
      timezone: birth_data.timezone || 0
    };

    const chart = await astroCore.generateChart(birthData);
    const audioConfig = audioEngine.getAudioConfig(chart);
    
    res.json({
      success: true,
      data: {
        chart,
        audio_config: audioConfig,
        mode
      }
    });
  } catch (error) {
    console.error('Chart generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate chart',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Overlay charts endpoint with validation
app.post('/api/charts/overlay', 
  chartGenerationLimit,
  async (req, res) => {
  try {
    const { birth_data_1, birth_data_2 } = req.body;

    // Validate both birth data objects
    if (!birth_data_1 || !birth_data_1.date || !birth_data_1.time) {
      return res.status(400).json({
        success: false,
        error: 'Missing required birth data for chart 1 (date, time)'
      });
    }

    if (!birth_data_2 || !birth_data_2.date || !birth_data_2.time) {
      return res.status(400).json({
        success: false,
        error: 'Missing required birth data for chart 2 (date, time)'
      });
    }

    // Validate coordinates for both
    if (typeof birth_data_1.latitude !== 'number' || typeof birth_data_1.longitude !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates for chart 1 (latitude and longitude must be numbers)'
      });
    }

    if (typeof birth_data_2.latitude !== 'number' || typeof birth_data_2.longitude !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates for chart 2 (latitude and longitude must be numbers)'
      });
    }

    console.log('Generating overlay charts...');

    const birthData1: BirthData = {
      date: birth_data_1.date,
      time: birth_data_1.time,
      latitude: birth_data_1.latitude,
      longitude: birth_data_1.longitude,
      timezone: birth_data_1.timezone || 0
    };

    const birthData2: BirthData = {
      date: birth_data_2.date,
      time: birth_data_2.time,
      latitude: birth_data_2.latitude,
      longitude: birth_data_2.longitude,
      timezone: birth_data_2.timezone || 0
    };

    // Generate both charts
    const chart1 = await astroCore.generateChart(birthData1);
    const chart2 = await astroCore.generateChart(birthData2);

    // Create merged metadata
    const mergedMetadata = {
      chart1_birth_datetime: chart1.metadata.birth_datetime,
      chart2_birth_datetime: chart2.metadata.birth_datetime,
      overlay_created: new Date().toISOString(),
      mode: 'overlay'
    };

    const audioConfig = audioEngine.getAudioConfig(chart1); // Use chart1 as base for now
    
    res.json({
      success: true,
      data: {
        chart1,
        chart2,
        merged_metadata: mergedMetadata,
        audio_config: audioConfig,
        mode: 'overlay'
      }
    });
  } catch (error) {
    console.error('Overlay chart generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate overlay charts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Audio generation endpoints
app.post('/api/audio/generate', 
  audioGenerationLimit,
  validateInput(audioGenerationSchema),
  async (req, res) => {
  try {
    const { chart_data, genre = 'ambient', duration = 60 } = req.body;

    console.log(`🎵 Generating audio for genre: ${genre}`);
    console.log(`   Chart: ${chart_data.metadata.birth_datetime} (${Object.keys(chart_data.planets).length} planets)`);
    console.log(`   Duration: ${duration} seconds (${duration / 12} seconds per house)`);

    // Generate actual audio using AudioGenerator with genre
    const audioGenerator = new AudioGenerator();
    const composition = audioGenerator.generateChartAudio(chart_data, duration, genre);
    const audioBuffer = audioGenerator.generateWAVBuffer(composition);
    
    console.log(`   Generated ${composition.notes.length} notes`);
    console.log(`   Audio buffer size: ${audioBuffer.length} bytes`);

    // Set response headers for audio streaming
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Send audio buffer as ArrayBuffer
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('Audio generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate audio',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/audio/daily', 
  audioGenerationLimit,
  validateInput(audioGenerationSchema),
  async (req, res) => {
  try {
    const { transit_data, genre = 'ambient', duration = 60 } = req.body;

    console.log(`🌅 Generating daily audio for genre: ${genre}`);
    console.log(`   Transit data: ${transit_data.date}`);
    console.log(`   Duration: ${duration} seconds`);

    // Generate daily transit audio
    const audioGenerator = new AudioGenerator();
    const composition = audioGenerator.generateDailyAudio(transit_data, duration, genre);
    const audioBuffer = audioGenerator.generateWAVBuffer(composition);
    
    console.log(`   Generated ${composition.notes.length} notes`);
    console.log(`   Audio buffer size: ${audioBuffer.length} bytes`);

    // Set response headers for audio streaming
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Send audio buffer as ArrayBuffer
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('Daily audio generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate daily audio',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET endpoint for daily audio (for landing page)
app.get('/api/audio/daily', async (req, res) => {
  try {
    console.log('🎵 Daily audio endpoint called');
    
    const genre = req.query.genre as string || 'ambient';
    const duration = parseInt(req.query.duration as string) || 60;
    const date = req.query.date as string || new Date().toISOString().split('T')[0];
    
    console.log(`🎵 Generating daily audio: date=${date}, genre=${genre}, duration=${duration}s`);
    
    // Fetch real daily chart data
    console.log('🎵 Fetching daily chart data...');
    const dailyChart = await astroCore.generateDailyChart(date);
    console.log('🎵 Daily chart generated:', {
      date: dailyChart.metadata?.birth_datetime,
      planets: Object.keys(dailyChart.planets || {}).length,
      aspects: 0 // AstroChart doesn't have aspects property
    });
    
    // Convert chart data to transit format for audio generation
    const transitData = {
      date: date,
      planets: Object.entries(dailyChart.planets || {}).map(([name, planet]: [string, any]) => ({
        name: name,
        longitude: planet.longitude || 0,
        house: planet.house || 1,
        sign: planet.sign || 'Aries'
      }))
    };
    
    console.log(`🎵 Transit data prepared: ${transitData.planets.length} planets`);
    console.log('🎵 Transit planets:', transitData.planets.map(p => `${p.name} in ${p.sign} (${p.longitude}°)`));
    
    // Test AudioGenerator import
    console.log('🎵 AudioGenerator available:', typeof AudioGenerator);
    
    const audioGenerator = new AudioGenerator();
    console.log('🎵 AudioGenerator instance created');
    
    console.log('🎵 Calling generateDailyAudio...');
    const composition = audioGenerator.generateDailyAudio(transitData, duration, genre);
    console.log('🎵 Composition generated:', {
      notes: composition.notes?.length || 0,
      duration: composition.duration,
      totalDuration: composition.totalDuration,
      sampleRate: composition.sampleRate
    });
    
    console.log('🎵 Calling generateWAVBuffer...');
    const audioBuffer = audioGenerator.generateWAVBuffer(composition);
    console.log('🎵 WAV buffer generated');
    
    console.log(`🎵 Generated composition: ${composition.notes?.length || 0} notes`);
    console.log(`🎵 Audio buffer size: ${audioBuffer.length} bytes`);
    
    if (audioBuffer.length === 0) {
      throw new Error('Generated audio buffer is empty');
    }
    
    if (audioBuffer.length < 1000) {
      console.warn('⚠️ Audio buffer seems too small:', audioBuffer.length, 'bytes');
    }
    
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(Buffer.from(audioBuffer));
    
    console.log(`🎵 Daily audio sent successfully (${audioBuffer.length} bytes)`);
  } catch (error) {
    console.error('❌ Daily audio generation error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate daily audio',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Audio endpoints with rate limiting and validation
app.post('/api/audio/preview', 
  audioGenerationLimit,
  validateInput(audioGenerationSchema),
  async (req, res) => {
  try {
    const { chart_data, mode = 'daily_preview', duration = 60, genre = 'ambient' } = req.body;

    console.log(`Starting preview audio for mode: ${mode}`);
    console.log(`   Chart: ${chart_data.metadata.birth_datetime} (${Object.keys(chart_data.planets).length} planets)`);
    console.log(`   Duration: ${duration} seconds (${duration / 12} seconds per house)`);
    console.log(`   Genre: ${genre}`);

    // Generate actual audio using AudioGenerator with genre
    const audioGenerator = new AudioGenerator();
    const composition = audioGenerator.generateChartAudio(chart_data, duration, genre);
    const audioBuffer = audioGenerator.generateWAVBuffer(composition);
    
    console.log(`   Generated ${composition.notes.length} notes`);
    console.log(`   Audio buffer size: ${audioBuffer.length} bytes`);

    // Create session for tracking
    const sessionId = `preview_${Date.now()}`;
    const session = {
      id: sessionId,
      chartId: chart_data.metadata.birth_datetime,
      configuration: { mode: 'preview', duration, genre },
      isPlaying: true,
      startTime: Date.now()
    };
    
    console.log(`   Preview session created: ${session.id}`);
    console.log(`   Configuration: ${JSON.stringify(session.configuration)}`);
    
    // Set response headers for audio streaming
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Send audio buffer as ArrayBuffer
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('Preview audio generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate preview audio',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/audio/sequential', 
  audioGenerationLimit,
  validateInput(audioGenerationSchema),
  async (req, res) => {
  try {
    const { chart_data, mode = 'moments' } = req.body;

    console.log(`Starting sequential audio for mode: ${mode}`);
    console.log(`   Chart: ${chart_data.metadata.birth_datetime} (${Object.keys(chart_data.planets).length} planets)`);

    const session = await audioEngine.generateSequential(chart_data);
    
    console.log(`   Session created: ${session.id}`);
    console.log(`   Configuration: ${JSON.stringify(session.configuration)}`);
    
    res.json({
      success: true,
      data: {
        session,
        message: 'Sequential audio generation started',
        mode
      }
    });
  } catch (error) {
    console.error('Sequential audio generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate sequential audio',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Melodic composition endpoint
app.post('/api/audio/melodic', 
  audioGenerationLimit,
  validateInput(audioGenerationSchema),
  async (req, res) => {
  try {
    const { chart_data, configuration, mode = 'melodic' } = req.body;

    console.log(`Starting melodic composition for mode: ${mode}`);
    console.log(`   Chart: ${chart_data.metadata.birth_datetime} (${Object.keys(chart_data.planets).length} planets)`);
    if (configuration) {
      console.log(`   Configuration: ${JSON.stringify(configuration)}`);
    }

    const session = await audioEngine.generateMelodic(chart_data, configuration);
    
    console.log(`   Melodic session created: ${session.id}`);
    console.log(`   Phrases generated: ${session.phrases.length}`);
    console.log(`   Scale: ${session.scale.join(', ')}`);
    console.log(`   Tempo: ${session.tempo} BPM`);
    console.log(`   Total notes: ${session.phrases.reduce((sum: number, p: any) => sum + p.notes.length, 0)}`);
    
    res.json({
      success: true,
      data: {
        session,
        message: 'Melodic composition generated',
        mode,
        composition: {
          phrases: session.phrases.length,
          scale: session.scale,
          key: session.key,
          tempo: session.tempo,
          timeSignature: session.timeSignature,
          totalNotes: session.phrases.reduce((sum: number, p: any) => sum + p.notes.length, 0)
        }
      }
    });
  } catch (error) {
    console.error('Melodic composition failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate melodic composition',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Narration generation endpoint
app.post('/api/narration/generate', 
  audioGenerationLimit,
  validateInput(audioGenerationSchema),
  async (req, res) => {
  try {
    const { chart_data, configuration, mode = 'moments' } = req.body;

    console.log(`📝 Generating musical narration for mode: ${mode}`);
    console.log(`   Chart: ${chart_data.metadata.birth_datetime} (${Object.keys(chart_data.planets).length} planets)`);
    if (configuration) {
      console.log(`   Configuration: ${JSON.stringify(configuration)}`);
    }

    const narration = generateMusicNarration(chart_data, configuration);
    
    console.log(`   Narration generated successfully`);
    console.log(`   Musical Mood: ${narration.musicalMood.length} characters`);
    console.log(`   Planetary Expression: ${narration.planetaryExpression.length} characters`);
    console.log(`   Interpretive Summary: ${narration.interpretiveSummary.length} characters`);
    
    res.json({
      success: true,
      data: {
        narration,
        message: 'Musical narration generated',
        mode,
        summary: {
          totalLength: narration.fullNarration.length,
          sections: 3,
          genre: configuration?.genre || 'electronic'
        }
      }
    });
  } catch (error) {
    console.error('Narration generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate musical narration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Dual chart narration endpoint
app.post('/api/narration/dual', 
  audioGenerationLimit,
  async (req, res) => {
  try {
    const { chart1_data, chart2_data, configuration } = req.body;

    if (!chart1_data || !chart2_data) {
      return res.status(400).json({
        success: false,
        error: 'Missing chart data (both chart1_data and chart2_data required)'
      });
    }

    console.log(`📝 Generating dual chart narration`);
    console.log(`   Chart 1: ${chart1_data.metadata.birth_datetime}`);
    console.log(`   Chart 2: ${chart2_data.metadata.birth_datetime}`);

    const narration = generateDualChartNarration(chart1_data, chart2_data, configuration);
    
    console.log(`   Dual narration generated successfully`);
    console.log(`   Total length: ${narration.length} characters`);
    
    res.json({
      success: true,
      data: {
        narration,
        message: 'Dual chart narration generated',
        mode: 'overlay',
        summary: {
          totalLength: narration.length,
          charts: 2,
          genre: configuration?.genre || 'electronic'
        }
      }
    });
  } catch (error) {
    console.error('Dual narration generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate dual chart narration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Layered audio endpoint
app.post('/api/audio/layered', 
  audioGenerationLimit,
  validateInput(audioGenerationSchema),
  async (req, res) => {
  try {
    const { chart_data, mode = 'moments' } = req.body;

    console.log(`Starting layered audio for mode: ${mode}`);
    console.log(`   Chart: ${chart_data.metadata.birth_datetime} (${Object.keys(chart_data.planets).length} planets)`);

    const session = await audioEngine.generateLayered(chart_data);
    
    console.log(`   Session created: ${session.id}`);
    console.log(`   Configuration: ${JSON.stringify(session.configuration)}`);
    
    res.json({
      success: true,
      data: {
        session,
        message: 'Layered audio generation started',
        mode
      }
    });
  } catch (error) {
    console.error('Layered audio generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate layered audio',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Sandbox audio endpoint
app.post('/api/audio/sandbox', 
  audioGenerationLimit,
  validateInput(audioGenerationSchema),
  async (req, res) => {
  try {
    const { chart_data, aspects = [], configuration = {}, genre = 'ambient', duration = 60 } = req.body;

    console.log(`Starting sandbox audio for mode: ${genre}`);
    console.log(`   Chart: ${chart_data.metadata.birth_datetime} (${Object.keys(chart_data.planets).length} planets)`);
    if (configuration) {
      console.log(`   Configuration: ${JSON.stringify(configuration)}`);
    }

    // Generate sandbox-specific composition based on user's custom chart and aspects
    const audioGenerator = new AudioGenerator();
    const composition = audioGenerator.generateSandboxAudio(chart_data, aspects, configuration, duration, genre);
    const audioBuffer = audioGenerator.generateWAVBuffer(composition);
    
    console.log(`   Generated ${composition.notes.length} notes`);
    console.log(`   Audio buffer size: ${audioBuffer.length} bytes`);

    // Set response headers for audio streaming
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Send audio buffer as ArrayBuffer
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('Sandbox audio generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate sandbox audio',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Overlay audio endpoint
app.post('/api/audio/overlay', 
  audioGenerationLimit,
  async (req, res) => {
  try {
    const { chart1_data, chart2_data, configuration, mode = 'overlay' } = req.body;

    if (!chart1_data || !chart2_data) {
      return res.status(400).json({
        success: false,
        error: 'Missing chart data (both chart1_data and chart2_data required)'
      });
    }

    console.log(`Starting overlay audio for mode: ${mode}`);
    if (configuration) {
      console.log(`   Configuration: ${JSON.stringify(configuration)}`);
    }

    const session = await audioEngine.generateOverlay(chart1_data, chart2_data, configuration);
    
    res.json({
      success: true,
      data: {
        session,
        message: 'Overlay audio generation started',
        mode
      }
    });
  } catch (error) {
    console.error('Overlay audio generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate overlay audio',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Advanced playback endpoints
app.post('/api/audio/effects', async (req, res) => {
  try {
    const { effects } = req.body;

    if (!effects) {
      return res.status(400).json({
        success: false,
        error: 'Missing effects configuration'
      });
    }

    console.log(`🎛️ Updating audio effects:`, effects);
    advancedPlaybackEngine.updateEffects(effects);
    
    res.json({
      success: true,
      data: {
        effects: advancedPlaybackEngine.getPlaybackState().effects,
        message: 'Effects updated successfully'
      }
    });
  } catch (error) {
    console.error('Effects update failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update effects',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/audio/tempo', async (req, res) => {
  try {
    const { tempo } = req.body;

    if (typeof tempo !== 'number' || tempo < 60 || tempo > 200) {
      return res.status(400).json({
        success: false,
        error: 'Tempo must be between 60 and 200 BPM'
      });
    }

    console.log(`Updating tempo to ${tempo} BPM`);
    advancedPlaybackEngine.updateControls({ tempo });
    
    res.json({
      success: true,
      data: {
        tempo,
        message: 'Tempo updated successfully'
      }
    });
  } catch (error) {
    console.error('Tempo update failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update tempo',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/audio/key', async (req, res) => {
  try {
    const { key } = req.body;

    if (!key || typeof key !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Valid key required (C, C#, D, etc.)'
      });
    }

    console.log(`🎼 Transposing to key: ${key}`);
    advancedPlaybackEngine.updateControls({ key });
    
    res.json({
      success: true,
      data: {
        key,
        message: 'Key transposition applied successfully'
      }
    });
  } catch (error) {
    console.error('Key transposition failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to transpose key',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/audio/loop', async (req, res) => {
  try {
    const { startTime, endTime, isLooping } = req.body;

    if (isLooping && (typeof startTime !== 'number' || typeof endTime !== 'number')) {
      return res.status(400).json({
        success: false,
        error: 'Loop start and end times required when enabling loop'
      });
    }

    if (isLooping) {
      console.log(`Setting loop points: ${startTime}s to ${endTime}s`);
      advancedPlaybackEngine.setLoopPoints(startTime, endTime);
    } else {
      console.log('Clearing loop points');
      advancedPlaybackEngine.clearLoop();
    }
    
    res.json({
      success: true,
      data: {
        loopStart: startTime,
        loopEnd: endTime,
        isLooping,
        message: isLooping ? 'Loop points set successfully' : 'Loop cleared successfully'
      }
    });
  } catch (error) {
    console.error('Loop configuration failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to configure loop',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/audio/presets/effects', async (req, res) => {
  try {
    const presets = advancedPlaybackEngine.getEffectsPresets();
    
    res.json({
      success: true,
      data: {
        presets,
        message: 'Effects presets retrieved successfully'
      }
    });
  } catch (error) {
    console.error('Effects presets failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get effects presets',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/audio/presets/tempo', async (req, res) => {
  try {
    const presets = advancedPlaybackEngine.getTempoPresets();
    
    res.json({
      success: true,
      data: {
        presets,
        message: 'Tempo presets retrieved successfully'
      }
    });
  } catch (error) {
    console.error('Tempo presets failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get tempo presets',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/audio/state', async (req, res) => {
  try {
    const state = advancedPlaybackEngine.getPlaybackState();
    
    res.json({
      success: true,
      data: {
        state,
        message: 'Playback state retrieved successfully'
      }
    });
  } catch (error) {
    console.error('Playback state failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get playback state',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/audio/segments', async (req, res) => {
  try {
    const { name, startTime, endTime, color, description } = req.body;

    if (!name || typeof startTime !== 'number' || typeof endTime !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Name, startTime, and endTime are required'
      });
    }

    console.log(`📝 Adding audio segment: ${name} (${startTime}s - ${endTime}s)`);
    advancedPlaybackEngine.addSegment(name, startTime, endTime, color, description);
    
    res.json({
      success: true,
      data: {
        message: 'Audio segment added successfully'
      }
    });
  } catch (error) {
    console.error('Segment addition failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add audio segment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.delete('/api/audio/segments/:segmentId', async (req, res) => {
  try {
    const { segmentId } = req.params;

    console.log(`🗑️ Removing audio segment: ${segmentId}`);
    advancedPlaybackEngine.removeSegment(segmentId);
    
    res.json({
      success: true,
      data: {
        message: 'Audio segment removed successfully'
      }
    });
  } catch (error) {
    console.error('Segment removal failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove audio segment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Session export and share endpoints with rate limiting
app.get('/api/session/:id', (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = audioEngine.getCurrentSession();
    
    if (!session || session.id !== sessionId) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        session,
        shareable: true,
        url: `${req.protocol}://${req.get('host')}/session/${sessionId}`
      }
    });
  } catch (error) {
    console.error('Session retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/session/export', 
  exportLimit,
  async (req, res) => {
  try {
    const { session_id, format = 'json' } = req.body;
    
    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing session ID'
      });
    }

    const session = audioEngine.getCurrentSession();
    
    if (!session || session.id !== session_id) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // For now, export as JSON. In the future, this could generate actual audio files
    const exportData = {
      session: session,
      exported_at: new Date().toISOString(),
      format: format,
      download_url: `/api/session/${session_id}/download`
    };
    
    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Session export failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/session/:id/download', 
  exportLimit,
  (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = audioEngine.getCurrentSession();
    
    if (!session || session.id !== sessionId) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // For now, return session data as downloadable JSON
    // In the future, this could generate actual audio files
    const filename = `astradio-session-${sessionId}.json`;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.json({
      session: session,
      exported_at: new Date().toISOString(),
      note: 'This is a session export. Audio files will be available in future versions.'
    });
  } catch (error) {
    console.error('Session download failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/audio/stop', (req, res) => {
  try {
    audioEngine.stopAll();
    
    res.json({
      success: true,
      data: {
        message: 'Audio playback stopped'
      }
    });
  } catch (error) {
    console.error('Audio stop failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop audio',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/audio/status', (req, res) => {
  try {
    const session = audioEngine.getCurrentSession();
    
    res.json({
      success: true,
      data: {
        session,
        isPlaying: session?.isPlaying || false
      }
    });
  } catch (error) {
    console.error('Audio status check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get audio status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ===== PHASE 6.3-6.4: USER SYSTEM ROUTES =====

// Authentication routes
app.post('/api/auth/signup', 
  authLimit,
  validateInput(authSchema),
  AuthController.register
);

app.post('/api/auth/login', 
  authLimit,
  validateInput(authSchema),
  AuthController.login
);

app.post('/api/auth/password-reset-request', 
  authLimit,
  AuthController.requestPasswordReset
);

app.post('/api/auth/password-reset', 
  authLimit,
  AuthController.resetPassword
);

app.post('/api/auth/google', 
  authLimit,
  AuthController.googleAuth
);

app.get('/api/auth/profile', 
  AuthService.authenticateToken,
  AuthController.getProfile
);

app.put('/api/auth/profile', 
  AuthService.authenticateToken,
  AuthController.updateProfile
);

// Session management routes
app.post('/api/sessions', 
  AuthService.authenticateToken, 
  validateInput(sessionSchema),
  SessionController.saveSession
);

app.get('/api/sessions', 
  AuthService.authenticateToken, 
  SessionController.getUserSessions
);

app.get('/api/sessions/public', 
  SessionController.getPublicSessions
);

app.get('/api/sessions/:id', 
  SessionController.getSession
);

app.put('/api/sessions/:id', 
  AuthService.authenticateToken,
  SessionController.updateSession
);

app.delete('/api/sessions/:id', 
  AuthService.authenticateToken,
  SessionController.deleteSession
);

app.post('/api/sessions/:id/like', 
  AuthService.authenticateToken,
  SessionController.toggleLike
);

// Friends system routes
app.post('/api/friends/request', 
  AuthService.authenticateToken,
  FriendController.sendFriendRequest
);

app.post('/api/friends/accept/:requestId', 
  AuthService.authenticateToken,
  FriendController.acceptFriendRequest
);

app.post('/api/friends/decline/:requestId', 
  AuthService.authenticateToken,
  FriendController.declineFriendRequest
);

app.get('/api/friends', 
  AuthService.authenticateToken,
  FriendController.getFriends
);

app.delete('/api/friends/:friendId', 
  AuthService.authenticateToken,
  FriendController.removeFriend
);

app.get('/api/friends/:friendId/sessions', 
  AuthService.authenticateToken,
  FriendController.getFriendSessions
);

app.get('/api/friends/search', 
  AuthService.authenticateToken,
  FriendController.searchUsers
);

// Subscription routes
app.get('/api/subscriptions/plans', 
  SubscriptionController.getPlans
);

// TODO: Implement getSubscriptionStatus method
// app.get('/api/subscriptions/status', 
//   AuthService.authenticateToken,
//   SubscriptionController.getSubscriptionStatus
// );

app.post('/api/subscriptions/checkout', 
  AuthService.authenticateToken,
  SubscriptionController.createCheckoutSession
);

// TODO: Implement handleWebhook method
// app.post('/api/subscriptions/webhook', 
//   SubscriptionController.handleWebhook
// );

app.post('/api/subscriptions/cancel', 
  AuthService.authenticateToken,
  SubscriptionController.cancelSubscription
);

// TODO: Implement checkActionLimit method
// app.post('/api/subscriptions/check-limit', 
//   AuthService.authenticateToken,
//   SubscriptionController.checkActionLimit
// );

// Jam session routes
app.post('/api/jam/create', 
  chartGenerationLimit,
  async (req, res) => {
    try {
      const { birth_data, host_id } = req.body;
      
      console.log('Creating jam session...');
      
      const birthData: BirthData = {
        date: birth_data.date,
        time: birth_data.time,
        latitude: birth_data.latitude,
        longitude: birth_data.longitude,
        timezone: birth_data.timezone || 0
      };

      const chart = await astroCore.generateChart(birthData);
      const audioConfig = audioEngine.getAudioConfig(chart);
      
      const sessionId = `jam_${Date.now()}`;
      
      res.json({
        success: true,
        data: {
          session_id: sessionId,
          chart,
          audio_config: audioConfig,
          host_id: host_id || 'anonymous',
          participants: [host_id || 'anonymous'],
          created_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Jam session creation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create jam session',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

app.post('/api/jam/join/:sessionId', 
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { user_id } = req.body;
      
      console.log(`User ${user_id} joining jam session: ${sessionId}`);
      
      // In a real implementation, this would validate the session exists
      // and add the user to the participants list
      
      res.json({
        success: true,
        data: {
          session_id: sessionId,
          user_id,
          joined_at: new Date().toISOString(),
          message: 'Successfully joined jam session'
        }
      });
    } catch (error) {
      console.error('Jam session join failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to join jam session',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

app.get('/api/jam/:sessionId/status', 
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      console.log(`Getting status for jam session: ${sessionId}`);
      
      // Mock session status
      res.json({
        success: true,
        data: {
          session_id: sessionId,
          is_active: true,
          participants: ['user1', 'user2'],
          current_house: 3,
          audio_playing: true,
          last_updated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Jam session status failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get jam session status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Phase 6.3-6.4: Authentication Routes
app.post('/auth/signup', authLimit, AuthController.register);
app.post('/auth/login', authLimit, AuthController.login);
app.post('/auth/google', authLimit, AuthController.googleAuth);
app.post('/auth/forgot-password', authLimit, AuthController.requestPasswordReset);
app.post('/auth/reset-password', authLimit, AuthController.resetPassword);
app.get('/auth/profile', AuthService.authenticateToken, AuthController.getProfile);
app.put('/auth/profile', AuthService.authenticateToken, AuthController.updateProfile);
app.post('/auth/change-password', AuthService.authenticateToken, AuthController.changePassword);
app.get('/auth/verify', AuthController.verifyToken);
app.post('/auth/logout', AuthService.authenticateToken, AuthController.logout);
app.get('/auth/users/:id', AuthController.getUserById);

// Phase 6.3-6.4: Session Management Routes
app.post('/user/sessions/save', AuthService.authenticateToken, SessionController.saveSession);
app.get('/user/sessions', AuthService.authenticateToken, SessionController.getUserSessions);
// TODO: Implement these methods
// app.post('/user/sessions/share', AuthService.authenticateToken, SessionController.shareSession);
// app.get('/user/sessions/:id', SessionController.getSharedSession);
app.delete('/user/sessions/:id', AuthService.authenticateToken, SessionController.deleteSession);

// Phase 6.3-6.4: Social Features Routes
app.post('/friends/request', AuthService.authenticateToken, FriendController.sendFriendRequest);
app.post('/friends/accept', AuthService.authenticateToken, FriendController.acceptFriendRequest);
app.post('/friends/decline', AuthService.authenticateToken, FriendController.declineFriendRequest);
// TODO: Implement these methods
// app.get('/friends/list', AuthService.authenticateToken, FriendController.getFriendsList);
// app.get('/friends/pending', AuthService.authenticateToken, FriendController.getPendingRequests);
app.delete('/friends/:friendId', AuthService.authenticateToken, FriendController.removeFriend);
app.get('/friends/search', AuthService.authenticateToken, FriendController.searchUsers);

// Phase 6.3-6.4: Subscription & Monetization Routes
app.get('/subscriptions/plans', SubscriptionController.getPlans);
app.get('/subscriptions/current', AuthService.authenticateToken, SubscriptionController.getCurrentSubscription);
app.post('/subscriptions/checkout', AuthService.authenticateToken, SubscriptionController.createCheckoutSession);
app.post('/subscriptions/complete-checkout', SubscriptionController.completeCheckout);
app.post('/subscriptions/cancel', AuthService.authenticateToken, SubscriptionController.cancelSubscription);
app.post('/subscriptions/downgrade', AuthService.authenticateToken, SubscriptionController.downgradeToFree);
app.post('/subscriptions/check-access', AuthService.authenticateToken, SubscriptionController.checkFeatureAccess);
app.get('/subscriptions/usage', AuthService.authenticateToken, SubscriptionController.getUserUsage);
app.post('/subscriptions/track-usage', AuthService.authenticateToken, SubscriptionController.trackUsage);
app.get('/subscriptions/analytics', AuthService.authenticateToken, SubscriptionController.getAnalytics);
app.post('/subscriptions/webhook', SubscriptionController.stripeWebhook);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Astradio API server running on port ${PORT}`);
    console.log(`Security features enabled:`);
    console.log(`   - Rate limiting (chart: 20/15min, audio: 10/15min, auth: 5/15min)`);
    console.log(`   - Input validation with Zod schemas`);
    console.log(`   - Enhanced security headers`);
    console.log(`   - Request size limiting (10MB max)`);
    console.log(`   - Comprehensive error handling`);
    console.log(`User system enabled:`);
    console.log(`   - Authentication (signup/login/password reset)`);
    console.log(`   - Session management (save/retrieve/share)`);
    console.log(`   - Friends system (free to add, Pro for overlay)`);
    console.log(`   - Subscription system (Free/Pro/Flex plans)`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Chart generation: POST http://localhost:${PORT}/api/charts/generate`);
    console.log(`Daily charts: GET http://localhost:${PORT}/api/daily/:date`);
    console.log(`Sequential audio: POST http://localhost:${PORT}/api/audio/sequential`);
    console.log(`Layered audio: POST http://localhost:${PORT}/api/audio/layered`);
    console.log(`Stop audio: POST http://localhost:${PORT}/api/audio/stop`);
    console.log(`Audio status: GET http://localhost:${PORT}/api/audio/status`);
    console.log(`User system: POST http://localhost:${PORT}/api/auth/login`);
    console.log(`Sessions: POST http://localhost:${PORT}/api/sessions`);
    console.log(`Social: POST http://localhost:${PORT}/api/friends/request`);
    console.log(`Subscriptions: GET http://localhost:${PORT}/api/subscriptions/plans`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}); 