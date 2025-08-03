// Audio types for the FQ-Generator application
export type WaveformType =
  | "sine"
  | "square"
  | "sawtooth"
  | "triangle"
  | "noise";

export interface FrequencyConfig {
  value: number;
  unit: "Hz" | "kHz";
}

export interface AudioSettings {
  frequency: FrequencyConfig;
  waveform: WaveformType;
  volume: number; // 0-1 range
  duration?: number; // in seconds, undefined for infinite
  leftChannel: boolean;
  rightChannel: boolean;
}

export interface SafetySettings {
  maxVolume: number; // Maximum allowed volume (0.8 default)
  warningThreshold: number; // Volume warning threshold (0.6 default)
  emergencyStop: boolean; // Emergency stop state
  hearingProtection: boolean; // Enable hearing protection mode
  progressiveIncrease: boolean; // Enable progressive volume increases
}

export interface AnalysisData {
  fft: Float32Array;
  waveform: Float32Array;
  rms: number;
  peak: number;
  thd: number; // Total Harmonic Distortion
  frequency: number;
}

export interface GeneratorState {
  isPlaying: boolean;
  audioSettings: AudioSettings;
  safetySettings: SafetySettings;
  analysisData: AnalysisData | null;
  audioContext: AudioContext | null;
  oscillatorNode: OscillatorNode | null;
  gainNode: GainNode | null;
  analyserNode: AnalyserNode | null;
}

// Predefined frequency presets for speaker testing
export interface FrequencyPreset {
  name: string;
  frequency: number;
  description: string;
  category:
    | "sub-bass"
    | "bass"
    | "low-mid"
    | "mid"
    | "high-mid"
    | "presence"
    | "brilliance";
}

export const FREQUENCY_PRESETS: FrequencyPreset[] = [
  // Sub-bass (20-60 Hz)
  {
    name: "20 Hz",
    frequency: 20,
    description: "Ultra-low frequency",
    category: "sub-bass",
  },
  {
    name: "30 Hz",
    frequency: 30,
    description: "Deep sub-bass",
    category: "sub-bass",
  },
  {
    name: "40 Hz",
    frequency: 40,
    description: "Sub-bass fundamental",
    category: "sub-bass",
  },
  {
    name: "50 Hz",
    frequency: 50,
    description: "Kick drum fundamental",
    category: "sub-bass",
  },

  // Bass (60-250 Hz)
  { name: "80 Hz", frequency: 80, description: "Deep bass", category: "bass" },
  {
    name: "100 Hz",
    frequency: 100,
    description: "Bass fundamental",
    category: "bass",
  },
  {
    name: "120 Hz",
    frequency: 120,
    description: "Warm bass",
    category: "bass",
  },
  {
    name: "200 Hz",
    frequency: 200,
    description: "Upper bass",
    category: "bass",
  },

  // Low-mid (250-500 Hz)
  {
    name: "250 Hz",
    frequency: 250,
    description: "Low midrange",
    category: "low-mid",
  },
  {
    name: "400 Hz",
    frequency: 400,
    description: "Body and warmth",
    category: "low-mid",
  },

  // Mid (500-2000 Hz)
  {
    name: "800 Hz",
    frequency: 800,
    description: "Midrange clarity",
    category: "mid",
  },
  {
    name: "1000 Hz",
    frequency: 1000,
    description: "Reference frequency",
    category: "mid",
  },
  {
    name: "1500 Hz",
    frequency: 1500,
    description: "Vocal presence",
    category: "mid",
  },

  // High-mid (2-4 kHz)
  {
    name: "2000 Hz",
    frequency: 2000,
    description: "Speech intelligibility",
    category: "high-mid",
  },
  {
    name: "3000 Hz",
    frequency: 3000,
    description: "Vocal presence",
    category: "high-mid",
  },

  // Presence (4-6 kHz)
  {
    name: "4000 Hz",
    frequency: 4000,
    description: "Clarity and definition",
    category: "presence",
  },
  {
    name: "5000 Hz",
    frequency: 5000,
    description: "Presence peak",
    category: "presence",
  },

  // Brilliance (6-20+ kHz)
  {
    name: "8000 Hz",
    frequency: 8000,
    description: "High frequency detail",
    category: "brilliance",
  },
  {
    name: "10000 Hz",
    frequency: 10000,
    description: "Shimmer and air",
    category: "brilliance",
  },
  {
    name: "15000 Hz",
    frequency: 15000,
    description: "High frequency extension",
    category: "brilliance",
  },
  {
    name: "20000 Hz",
    frequency: 20000,
    description: "Upper hearing limit",
    category: "brilliance",
  },
];

// Test patterns for comprehensive speaker testing
export interface TestPattern {
  name: string;
  description: string;
  frequencies: number[];
  duration: number; // seconds per frequency
  fadeTime: number; // crossfade time in seconds
}

export const TEST_PATTERNS: TestPattern[] = [
  {
    name: "Frequency Sweep",
    description: "Logarithmic sweep from 20 Hz to 20 kHz",
    frequencies: [], // Will be generated dynamically
    duration: 30,
    fadeTime: 0.1,
  },
  {
    name: "Speaker Range Test",
    description: "Test key frequencies across the audible spectrum",
    frequencies: [50, 100, 200, 500, 1000, 2000, 4000, 8000, 16000],
    duration: 5,
    fadeTime: 0.5,
  },
  {
    name: "Bass Response",
    description: "Focus on low-frequency response",
    frequencies: [20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200],
    duration: 3,
    fadeTime: 0.3,
  },
  {
    name: "Midrange Clarity",
    description: "Test midrange frequency response",
    frequencies: [250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000],
    duration: 3,
    fadeTime: 0.3,
  },
  {
    name: "High Frequency Detail",
    description: "Test high-frequency response and extension",
    frequencies: [
      2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000,
    ],
    duration: 3,
    fadeTime: 0.3,
  },
];
