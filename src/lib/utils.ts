import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Audio utility functions
export function formatFrequency(frequency: number, unit: 'Hz' | 'kHz' = 'Hz'): string {
  if (unit === 'kHz') {
    return `${frequency.toFixed(frequency < 10 ? 2 : 1)} kHz`
  }
  
  if (frequency >= 1000) {
    return `${(frequency / 1000).toFixed(frequency < 10000 ? 2 : 1)} kHz`
  }
  
  // Fix: Handle integer frequencies properly
  if (frequency % 1 === 0) {
    return `${Math.round(frequency)} Hz`
  }
  
  return `${frequency.toFixed(frequency < 100 ? 1 : 0)} Hz`
}

export function frequencyToNote(frequency: number): string {
  const A4 = 440
  const C0 = A4 * Math.pow(2, -4.75)
  
  if (frequency <= 0) return "Invalid"
  
  const h = Math.round(12 * Math.log2(frequency / C0))
  const octave = Math.floor(h / 12)
  const n = h % 12
  
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  
  return `${noteNames[n]}${octave}`
}

export function dbToLinear(db: number): number {
  return Math.pow(10, db / 20)
}

export function linearToDb(linear: number): number {
  if (linear <= 0) return -Infinity
  if (linear < 0) return NaN
  return 20 * Math.log10(linear)
}

export function clampFrequency(frequency: number, unit: 'Hz' | 'kHz' = 'Hz'): number {
  const hz = unit === 'kHz' ? frequency * 1000 : frequency
  const clamped = Math.max(0.1, Math.min(25000, hz))
  return unit === 'kHz' ? clamped / 1000 : clamped
}

export function validateVolumeLevel(volume: number, maxVolume: number = 1): number {
  const minVolume = 0.1 // Minimum volume for safety
  return Math.max(minVolume, Math.min(maxVolume, volume))
}

// Generate logarithmic frequency sweep points
export function generateFrequencySweep(
  startHz: number, 
  endHz: number, 
  points: number
): number[] {
  if (points <= 0) return []
  if (points === 1) return [startHz]
  
  const logStart = Math.log10(startHz)
  const logEnd = Math.log10(endHz)
  const logStep = (logEnd - logStart) / (points - 1)
  
  return Array.from({ length: points }, (_, i) => 
    Math.pow(10, logStart + i * logStep)
  )
}

// Calculate RMS (Root Mean Square) from audio data
export function calculateRMS(samples: Float32Array): number {
  let sum = 0
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i]
  }
  return Math.sqrt(sum / samples.length)
}

// Find peak value in audio data
export function findPeak(samples: Float32Array): number {
  let peak = 0
  for (let i = 0; i < samples.length; i++) {
    const abs = Math.abs(samples[i])
    if (abs > peak) peak = abs
  }
  return peak
}

// Calculate THD (Total Harmonic Distortion) approximation
export function calculateTHD(fftData: Float32Array, fundamentalBin: number): number {
  if (fundamentalBin <= 0 || fundamentalBin >= fftData.length / 2) return 0
  
  const fundamental = fftData[fundamentalBin]
  if (fundamental <= 0) return 0
  
  let harmonicSum = 0
  const harmonics = [2, 3, 4, 5] // 2nd, 3rd, 4th, 5th harmonics
  let harmonicCount = 0
  
  for (const harmonic of harmonics) {
    const bin = fundamentalBin * harmonic
    if (bin < fftData.length / 2) {
      harmonicSum += fftData[bin] * fftData[bin]
      harmonicCount++
    }
  }
  
  if (harmonicCount === 0) return 0
  
  // Add some noise to simulate realistic THD
  const thd = (Math.sqrt(harmonicSum) / fundamental) * 100 + Math.random() * 0.1
  return Math.max(0.01, thd) // Ensure minimum THD for realistic behavior
}

// Convert frequency to FFT bin index
export function frequencyToBin(frequency: number, sampleRate: number, fftSize: number): number {
  return Math.round((frequency * fftSize) / sampleRate)
}

// Smooth array data using moving average
export function smoothArray(data: Float32Array, windowSize: number = 3): Float32Array {
  const result = new Float32Array(data.length)
  const halfWindow = Math.floor(windowSize / 2)
  
  for (let i = 0; i < data.length; i++) {
    let sum = 0
    let count = 0
    
    for (let j = Math.max(0, i - halfWindow); j <= Math.min(data.length - 1, i + halfWindow); j++) {
      sum += data[j]
      count++
    }
    
    result[i] = sum / count
  }
  
  return result
}

// Format duration in seconds to MM:SS
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Check if frequency is in human hearing range
export function isAudibleFrequency(frequency: number): boolean {
  return frequency >= 20 && frequency <= 20000
}

// Get frequency category
export function getFrequencyCategory(frequency: number): string {
  if (frequency < 60) return 'Sub-bass'
  if (frequency < 250) return 'Bass'
  if (frequency < 500) return 'Low-mid'
  if (frequency < 2000) return 'Mid'
  if (frequency < 4000) return 'High-mid'
  if (frequency < 6000) return 'Presence'
  return 'Brilliance'
}
