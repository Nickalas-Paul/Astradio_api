import { getDatabase } from '../database';
import { v4 as uuidv4 } from 'uuid';
import { astroCore } from '@astradio/astro-core';
import { audioEngine } from '@astradio/audio-mappings';
import { generateMusicNarration } from '@astradio/audio-mappings';

export interface DailyChart {
  id: string;
  date: string; // YYYY-MM-DD format
  chart_data: any;
  narration?: any;
  audio_config?: any;
  created_at: string;
}

export class DailyChartService {
  /**
   * Generate daily chart for a specific date
   */
  static async generateDailyChart(date: string): Promise<DailyChart> {
    const db = await getDatabase();
    
    // Check if daily chart already exists
    const existingChart = await this.getDailyChart(date);
    if (existingChart) {
      return existingChart;
    }

    console.log(`🌅 Generating daily chart for ${date}`);

    // Generate chart data
    const chartData = await astroCore.generateDailyChart(date);
    
    // Generate audio configuration
    const audioConfig = audioEngine.getAudioConfig(chartData);
    
    // Generate narration
    const narration = generateMusicNarration(chartData, {
      mode: 'melodic',
      genre: 'electronic'
    });

    const dailyChart: DailyChart = {
      id: uuidv4(),
      date,
      chart_data: chartData,
      narration,
      audio_config: audioConfig,
      created_at: new Date().toISOString()
    };

    // Save to database
    await db.run(
      `INSERT INTO daily_charts (id, date, chart_data, narration, audio_config, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        dailyChart.id,
        dailyChart.date,
        JSON.stringify(dailyChart.chart_data),
        JSON.stringify(dailyChart.narration),
        JSON.stringify(dailyChart.audio_config),
        dailyChart.created_at
      ]
    );

    console.log(`✅ Daily chart generated for ${date}`);
    return dailyChart;
  }

  /**
   * Get daily chart by date
   */
  static async getDailyChart(date: string): Promise<DailyChart | null> {
    const db = await getDatabase();
    const chart = await db.get('SELECT * FROM daily_charts WHERE date = ?', [date]);
    
    if (!chart) return null;

    return {
      ...chart,
      chart_data: JSON.parse(chart.chart_data),
      narration: chart.narration ? JSON.parse(chart.narration) : undefined,
      audio_config: chart.audio_config ? JSON.parse(chart.audio_config) : undefined
    };
  }

  /**
   * Get latest daily chart
   */
  static async getLatestDailyChart(): Promise<DailyChart | null> {
    const db = await getDatabase();
    const chart = await db.get(
      'SELECT * FROM daily_charts ORDER BY date DESC LIMIT 1'
    );
    
    if (!chart) return null;

    return {
      ...chart,
      chart_data: JSON.parse(chart.chart_data),
      narration: chart.narration ? JSON.parse(chart.narration) : undefined,
      audio_config: chart.audio_config ? JSON.parse(chart.audio_config) : undefined
    };
  }

  /**
   * Get daily charts for a date range
   */
  static async getDailyCharts(startDate: string, endDate: string): Promise<DailyChart[]> {
    const db = await getDatabase();
    const charts = await db.all(
      'SELECT * FROM daily_charts WHERE date BETWEEN ? AND ? ORDER BY date DESC',
      [startDate, endDate]
    );

    return charts.map(chart => ({
      ...chart,
      chart_data: JSON.parse(chart.chart_data),
      narration: chart.narration ? JSON.parse(chart.narration) : undefined,
      audio_config: chart.audio_config ? JSON.parse(chart.audio_config) : undefined
    }));
  }

  /**
   * Generate missing daily charts for a date range
   */
  static async generateMissingCharts(startDate: string, endDate: string): Promise<DailyChart[]> {
    const db = await getDatabase();
    
    // Get existing charts in range
    const existingCharts = await db.all(
      'SELECT date FROM daily_charts WHERE date BETWEEN ? AND ?',
      [startDate, endDate]
    );
    
    const existingDates = new Set(existingCharts.map(chart => chart.date));
    const generatedCharts: DailyChart[] = [];

    // Generate charts for missing dates
    const currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    while (currentDate <= endDateObj) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      if (!existingDates.has(dateStr)) {
        try {
          const chart = await this.generateDailyChart(dateStr);
          generatedCharts.push(chart);
        } catch (error) {
          console.error(`Failed to generate daily chart for ${dateStr}:`, error);
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return generatedCharts;
  }

  /**
   * Get daily chart statistics
   */
  static async getDailyChartStats(): Promise<{
    totalCharts: number;
    dateRange: { start: string; end: string };
    latestChart: string;
  }> {
    const db = await getDatabase();
    
    const totalCharts = await db.get('SELECT COUNT(*) as count FROM daily_charts');
    const dateRange = await db.get(
      'SELECT MIN(date) as start, MAX(date) as end FROM daily_charts'
    );
    const latestChart = await db.get(
      'SELECT date FROM daily_charts ORDER BY date DESC LIMIT 1'
    );

    return {
      totalCharts: totalCharts.count,
      dateRange: {
        start: dateRange.start || '',
        end: dateRange.end || ''
      },
      latestChart: latestChart?.date || ''
    };
  }
} 