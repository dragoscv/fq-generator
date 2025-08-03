'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, AlertTriangle, Zap, Volume2, Settings, Waves, Activity, Radio } from 'lucide-react'
import { useAudioStore } from '@/store/audioStore'
import { formatFrequency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

// Modern Glassy Card Component
const GlassCard: React.FC<{ 
  children: React.ReactNode, 
  className?: string,
  gradient?: boolean,
  glow?: boolean 
}> = ({ children, className = "", gradient = false, glow = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className={`
      backdrop-blur-xl bg-white/10 dark:bg-slate-900/20 
      border border-white/20 dark:border-slate-700/30 
      rounded-2xl shadow-2xl
      ${gradient ? 'bg-gradient-to-br from-white/15 to-white/5 dark:from-slate-800/20 dark:to-slate-900/10' : ''}
      ${glow ? 'shadow-blue-500/10 dark:shadow-blue-400/10' : ''}
      ${className}
    `}
  >
    {children}
  </motion.div>
)

// Enhanced Spectrum Analyzer with Modern Design
const SpectrumAnalyzer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const { analyserNode, isPlaying, getFrequencyInHz } = useAudioStore()

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas resolution
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const draw = () => {
      const width = rect.width
      const height = rect.height

      // Clear with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0.9)') // slate-900
      gradient.addColorStop(1, 'rgba(30, 41, 59, 0.9)') // slate-800
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Draw frequency grid with glassy effect
      const frequencies = [20, 100, 500, 1000, 5000, 10000, 20000]
      const maxFreq = 20000
      const minFreq = 20
      
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)' // slate-400 with alpha
      ctx.lineWidth = 1
      
      frequencies.forEach(freq => {
        const logPos = Math.log10(freq / minFreq) / Math.log10(maxFreq / minFreq)
        const x = logPos * width
        
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height - 40)
        ctx.stroke()
        
        // Frequency labels with glow effect
        ctx.shadowColor = 'rgba(59, 130, 246, 0.5)'
        ctx.shadowBlur = 4
        ctx.fillStyle = '#94a3b8' // slate-400
        ctx.font = '12px SF Pro Display, system-ui, sans-serif'
        ctx.textAlign = 'center'
        const label = freq >= 1000 ? `${freq/1000}k` : `${freq}`
        ctx.fillText(label, x, height - 10)
        ctx.shadowBlur = 0
      })

      // Draw dB scale
      const dbLevels = [-60, -40, -20, 0]
      ctx.textAlign = 'right'
      dbLevels.forEach(db => {
        const y = height - 40 - ((db + 60) / 60) * (height - 40)
        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)'
        ctx.fillText(`${db}dB`, width - 10, y)
        
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)'
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width - 50, y)
        ctx.stroke()
      })

      if (!isPlaying || !analyserNode) {
        // Animated "Not playing" message
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)'
        ctx.font = '18px SF Pro Display, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('🎵 Start audio to see live spectrum', width / 2, height / 2 - 10)
        ctx.font = '14px SF Pro Display, system-ui, sans-serif'
        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)'
        ctx.fillText('Real-time frequency analysis', width / 2, height / 2 + 15)
        return
      }

      try {
        const dataArray = (analyserNode as unknown as { getValue(): Float32Array }).getValue()
        const currentFreq = getFrequencyInHz()
        
        // Highlight current frequency with animated glow
        if (currentFreq >= minFreq && currentFreq <= maxFreq) {
          const logPos = Math.log10(currentFreq / minFreq) / Math.log10(maxFreq / minFreq)
          const x = logPos * width
          
          // Animated glow effect
          const time = Date.now() * 0.003
          const glowIntensity = 0.5 + 0.3 * Math.sin(time)
          
          ctx.shadowColor = `rgba(239, 68, 68, ${glowIntensity})`
          ctx.shadowBlur = 15
          ctx.strokeStyle = '#ef4444'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height - 40)
          ctx.stroke()
          ctx.shadowBlur = 0
          
          // Frequency label with background
          ctx.fillStyle = 'rgba(239, 68, 68, 0.9)'
          ctx.font = 'bold 14px SF Pro Display, system-ui, sans-serif'
          ctx.textAlign = 'center'
          const freqLabel = currentFreq >= 1000 ? `${(currentFreq/1000).toFixed(1)}kHz` : `${Math.round(currentFreq)}Hz`
          
          // Background for label
          const textWidth = ctx.measureText(freqLabel).width
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
          ctx.fillRect(x - textWidth/2 - 6, 5, textWidth + 12, 20)
          
          ctx.fillStyle = '#ef4444'
          ctx.fillText(freqLabel, x, 18)
        }

        // Draw spectrum with enhanced visuals
        const bufferLength = dataArray.length
        const sampleRate = 44100
        
        for (let i = 1; i < bufferLength; i++) {
          const freq = (i * sampleRate) / (2 * bufferLength)
          if (freq < minFreq || freq > maxFreq) continue
          
          const logPos = Math.log10(freq / minFreq) / Math.log10(maxFreq / minFreq)
          const x = logPos * width
          
          const dbValue = dataArray[i]
          const normalizedValue = Math.max(0, (dbValue + 60) / 60)
          const barHeight = normalizedValue * (height - 40)

          // Enhanced color spectrum with gradients
          const hue = (freq / maxFreq) * 280 + 200 // Blue to purple spectrum
          const saturation = 70 + normalizedValue * 30
          const lightness = 50 + normalizedValue * 20
          
          // Create gradient for each bar
          const barGradient = ctx.createLinearGradient(0, height - 40 - barHeight, 0, height - 40)
          barGradient.addColorStop(0, `hsl(${hue}, ${saturation}%, ${lightness}%)`)
          barGradient.addColorStop(1, `hsl(${hue}, ${saturation}%, ${lightness - 20}%)`)
          
          ctx.fillStyle = barGradient
          ctx.shadowColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`
          ctx.shadowBlur = 2
          
          const barWidth = Math.max(1, width / bufferLength * 2)
          ctx.fillRect(x - barWidth/2, height - 40 - barHeight, barWidth, barHeight)
        }
        ctx.shadowBlur = 0
        
      } catch (error) {
        console.warn('Spectrum analyzer error:', error)
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [analyserNode, isPlaying, getFrequencyInHz])

  return (
    <GlassCard gradient glow className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
          <Activity className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Live Spectrum Analyzer
        </h3>
        {isPlaying && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"
          />
        )}
      </div>
      
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-white/10">
        <canvas
          ref={canvasRef}
          className="w-full h-80 block"
          style={{ filter: 'contrast(1.1) brightness(1.1)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      </div>
      
      <div className="flex justify-between items-center mt-4 text-sm text-slate-400">
        <span className="flex items-center gap-2">
          <Radio className="w-4 h-4" />
          20Hz
        </span>
        <span className="font-mono">Real-time FFT Analysis</span>
        <span className="flex items-center gap-2">
          20kHz
          <Waves className="w-4 h-4" />
        </span>
      </div>
    </GlassCard>
  )
}

export default function FrequencyGenerator() {
  const {
    isPlaying,
    audioSettings,
    safetySettings,
    isInitialized,
    initializeAudio,
    startTone,
    stopTone,
    updateFrequency,
    updateWaveform,
    updateVolume,
    toggleChannel,
    emergencyStop,
    getFrequencyInHz,
    availableOutputDevices,
    selectedOutputDevice,
    loadOutputDevices,
    selectOutputDevice,
  } = useAudioStore()

  // Local state for input controls  
  const [frequencyInput, setFrequencyInput] = useState('1.00')
  const [frequencyUnit, setFrequencyUnit] = useState<'Hz' | 'kHz'>('kHz')
  const [finetuneValue, setFinetuneValue] = useState(0)

  // Initialize frequency input from store
  useEffect(() => {
    const currentHz = getFrequencyInHz()
    if (currentHz < 20) {
      updateFrequency(1000, 'Hz')
      setFrequencyInput('1.00')
      setFrequencyUnit('kHz')
    } else if (currentHz >= 1000) {
      setFrequencyInput((currentHz / 1000).toFixed(2))
      setFrequencyUnit('kHz')
    } else {
      setFrequencyInput(currentHz.toString())
      setFrequencyUnit('Hz')
    }
  }, [getFrequencyInHz, updateFrequency])

  const handleInitialize = async () => {
    try {
      await initializeAudio()
      console.log('Audio initialized - ready to play')
    } catch (error) {
      console.error('Failed to initialize audio:', error)
      alert('Failed to initialize audio. Please check browser permissions.')
    }
  }

  const handleFrequencyInputChange = (value: string) => {
    setFrequencyInput(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      updateFrequency(numValue, frequencyUnit)
    }
  }

  const handleFrequencyUnitChange = (unit: 'Hz' | 'kHz') => {
    const currentValue = parseFloat(frequencyInput)
    if (isNaN(currentValue) || currentValue <= 0) return
    
    if (frequencyUnit === 'Hz' && unit === 'kHz') {
      const newDisplayValue = (currentValue / 1000).toFixed(3)
      setFrequencyInput(newDisplayValue)
      setFrequencyUnit('kHz')
      updateFrequency(currentValue, 'Hz')
    } else if (frequencyUnit === 'kHz' && unit === 'Hz') {
      const newDisplayValue = Math.round(currentValue * 1000).toString()
      setFrequencyInput(newDisplayValue)
      setFrequencyUnit('Hz')
      updateFrequency(currentValue * 1000, 'Hz')
    } else {
      setFrequencyUnit(unit)
      updateFrequency(currentValue, unit)
    }
    
    setFinetuneValue(0)
  }

  const handlePlay = async () => {
    try {
      if (!isInitialized) {
        console.log('Audio not initialized, initializing now...')
        await handleInitialize()
        // Wait a moment for state to update
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // Check again after initialization attempt
      const currentState = useAudioStore.getState()
      if (!currentState.isInitialized) {
        alert('Audio system not ready. Please try again.')
        return
      }
      
      if (isPlaying) {
        stopTone()
      } else {
        const currentHz = getFrequencyInHz()
        if (currentHz < 10) {
          alert('Warning: Frequency below 10Hz may be difficult to hear and could cause speaker damage.')
        } else if (currentHz > 30000) {
          alert('Warning: Frequency above 30kHz is beyond human hearing and may damage tweeters.')
        } else if (currentHz < 20) {
          alert('Warning: Frequency below 20Hz may not be audible with standard speakers.')
        } else if (currentHz > 20000) {
          alert('Warning: Frequency above 20kHz may not be audible to most people.')
        }
        
        await startTone()
      }
    } catch (error) {
      console.error('Error controlling playback:', error)
      alert(`Audio error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const currentFrequencyHz = getFrequencyInHz()
  const displayFrequency = formatFrequency(currentFrequencyHz)
  const isAudibleRange = currentFrequencyHz >= 20 && currentFrequencyHz <= 20000
  const isWarningRange = currentFrequencyHz < 10 || currentFrequencyHz > 30000

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900 p-4">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4 py-8"
        >
          <h1 className="text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
            FQ-Generator
          </h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl text-slate-600 dark:text-slate-300 font-medium"
          >
            Professional Audio Frequency Generator & Testing Suite
          </motion.p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"
          />
        </motion.div>

        {/* Main Control Center */}
        <GlassCard gradient className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Audio Control Center</h2>
            {isPlaying && (
              <motion.div
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(34, 197, 94, 0.5)",
                    "0 0 40px rgba(34, 197, 94, 0.8)",
                    "0 0 20px rgba(34, 197, 94, 0.5)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30"
              >
                <span className="text-green-400 font-semibold text-sm">● LIVE</span>
              </motion.div>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Play Controls */}
            <div className="lg:col-span-1 space-y-6">
              <div className="flex flex-col gap-4">
                <Button
                  onClick={handlePlay}
                  size="lg"
                  className={`
                    h-16 text-lg font-semibold transition-all duration-300 
                    ${isPlaying 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg shadow-red-500/25' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25'
                    }
                    border-0 rounded-xl backdrop-blur-sm
                  `}
                  disabled={!isInitialized && isPlaying}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center gap-3"
                  >
                    {isPlaying ? (
                      <>
                        <Pause size={24} />
                        Stop Audio
                      </>
                    ) : (
                      <>
                        <Play size={24} />
                        Start Audio
                      </>
                    )}
                  </motion.div>
                </Button>

                <Button
                  onClick={emergencyStop}
                  variant="destructive"
                  size="lg"
                  className="h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-0 rounded-xl shadow-lg shadow-red-600/25"
                >
                  <Zap size={20} />
                  Emergency Stop
                </Button>
              </div>

              {/* Status Display */}
              <motion.div 
                layout
                className="p-6 bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl border border-white/20"
              >
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">System Status</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Audio Engine</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      isInitialized 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {isInitialized ? 'Ready' : 'Initializing...'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Output</span>
                    <div className="flex items-center gap-2">
                      {isPlaying && <Volume2 size={16} className="text-green-500" />}
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        isPlaying 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400'
                      }`}>
                        {isPlaying ? `${displayFrequency} • ${audioSettings.waveform}` : 'Stopped'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Volume</span>
                    <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
                      {Math.round(audioSettings.volume * 100)}% ({(20 * Math.log10(audioSettings.volume)).toFixed(1)}dB)
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Output Device Selection */}
              <motion.div 
                layout
                className="p-6 bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl border border-white/20"
              >
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Output Device</h3>
                
                <div className="space-y-3">
                  {!navigator.mediaDevices ? (
                    <div className="text-center py-4">
                      <div className="text-sm text-amber-600 dark:text-amber-400 mb-2">
                        ⚠️ Audio device selection not available
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        {typeof window !== 'undefined' && !window.isSecureContext 
                          ? 'This feature requires HTTPS in production' 
                          : 'MediaDevices API not supported in this browser'
                        }
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 p-2 bg-amber-50/50 dark:bg-amber-900/20 rounded border border-amber-200/30 dark:border-amber-700/30">
                        💡 Audio will use your system&apos;s default output device
                      </div>
                    </div>
                  ) : availableOutputDevices.length > 0 ? (
                    <div className="space-y-2">
                      <label className="text-sm text-slate-600 dark:text-slate-400">Select Audio Output</label>
                      <select
                        value={selectedOutputDevice || ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            selectOutputDevice(e.target.value).catch(console.error)
                          }
                        }}
                        className="w-full p-2 bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-600/30 rounded-lg text-sm backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                      >
                        <option value="">Select device...</option>
                        {availableOutputDevices.map((device) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Audio Device ${device.deviceId.slice(0, 8)}...`}
                          </option>
                        ))}
                      </select>
                      
                      {selectedOutputDevice && (
                        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>
                            {availableOutputDevices.find(d => d.deviceId === selectedOutputDevice)?.label || 'Selected Device'}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                        No output devices detected
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadOutputDevices().catch(console.error)}
                        className="text-xs"
                      >
                        Refresh Devices
                      </Button>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Click refresh after granting microphone permission
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 p-2 bg-blue-50/50 dark:bg-blue-900/20 rounded border border-blue-200/30 dark:border-blue-700/30">
                    💡 Device selection requires HTTPS and microphone permission for device labels
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Frequency Control */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
                  <Waves className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Frequency Control</h3>
              </div>

              {/* Unit Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={frequencyUnit === 'Hz' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFrequencyUnitChange('Hz')}
                  className={`transition-all duration-200 ${
                    frequencyUnit === 'Hz' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25' 
                      : 'hover:bg-blue-50 dark:hover:bg-slate-700'
                  }`}
                >
                  Hz
                </Button>
                <Button
                  variant={frequencyUnit === 'kHz' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFrequencyUnitChange('kHz')}
                  className={`transition-all duration-200 ${
                    frequencyUnit === 'kHz' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25' 
                      : 'hover:bg-blue-50 dark:hover:bg-slate-700'
                  }`}
                >
                  kHz
                </Button>
              </div>

              {/* Frequency Input */}
              <div className="space-y-4">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="number"
                  value={frequencyInput}
                  onChange={(e) => handleFrequencyInputChange(e.target.value)}
                  className="w-full text-4xl font-mono text-center p-6 border-2 border-white/20 rounded-2xl bg-white/10 dark:bg-slate-800/20 backdrop-blur-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300"
                  step={frequencyUnit === 'Hz' ? '1' : '0.01'}
                  min="1"
                  max={frequencyUnit === 'Hz' ? '50000' : '50'}
                />
                <p className="text-lg text-center font-mono text-slate-600 dark:text-slate-400">
                  {displayFrequency}
                </p>
              </div>

              {/* Enhanced Frequency Slider */}
              <Slider
                label="Frequency Slider"
                value={parseFloat(frequencyInput) || 1}
                onChange={(value: number) => {
                  const newValue = value.toFixed(frequencyUnit === 'Hz' ? 0 : 2)
                  setFrequencyInput(newValue)
                  handleFrequencyInputChange(newValue)
                }}
                min={frequencyUnit === 'Hz' ? 1 : 0.001}
                max={frequencyUnit === 'Hz' ? 50000 : 50}
                step={frequencyUnit === 'Hz' ? 1 : 0.01}
                showValue={true}
                unit={frequencyUnit}
                className="my-6"
              />

              {/* Fine Tune Slider */}
              <Slider
                label="Fine Tune"
                value={finetuneValue}
                onChange={(value: number) => {
                  setFinetuneValue(value)
                  const baseFreq = parseFloat(frequencyInput) * (frequencyUnit === 'kHz' ? 1000 : 1)
                  updateFrequency(baseFreq + value, 'Hz')
                }}
                min={-100}
                max={100}
                step={1}
                showValue={true}
                unit="Hz"
              />

              {/* Frequency Status */}
              <motion.div 
                layout
                className={`p-6 rounded-2xl backdrop-blur-sm border-2 transition-all duration-300 ${
                  isWarningRange 
                    ? 'bg-gradient-to-br from-red-50/50 to-red-50/50 dark:from-red-900/20 dark:to-red-900/20 border-red-200/50 dark:border-red-700/50' 
                    : isAudibleRange 
                      ? 'bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-700/50' 
                      : 'bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200/50 dark:border-amber-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-bold text-lg ${
                      isWarningRange 
                        ? 'text-red-800 dark:text-red-200' 
                        : isAudibleRange 
                          ? 'text-green-800 dark:text-green-200' 
                          : 'text-amber-800 dark:text-amber-200'
                    }`}>
                      Current Frequency
                    </h4>
                    <p className={`text-3xl font-mono font-bold ${
                      isWarningRange 
                        ? 'text-red-700 dark:text-red-300' 
                        : isAudibleRange 
                          ? 'text-green-700 dark:text-green-300' 
                          : 'text-amber-700 dark:text-amber-300'
                    }`}>
                      {displayFrequency}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Raw: {currentFrequencyHz}Hz
                    </p>
                  </div>
                  <div className={`text-right ${
                    isWarningRange 
                      ? 'text-red-600 dark:text-red-400' 
                      : isAudibleRange 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold ${
                      isWarningRange 
                        ? 'bg-red-100 dark:bg-red-900/30' 
                        : isAudibleRange 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : 'bg-amber-100 dark:bg-amber-900/30'
                    }`}>
                      {isWarningRange ? (
                        <>
                          <AlertTriangle size={16} />
                          {currentFrequencyHz < 10 ? 'Danger Zone' : 'Ultrasonic'}
                        </>
                      ) : isAudibleRange ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          Audible Range
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-amber-500 rounded-full" />
                          Extended Range
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </GlassCard>

        {/* Spectrum Analyzer */}
        <SpectrumAnalyzer />

        {/* Audio Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Waveform Selection */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-lg">
                <Radio className="w-5 h-5 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Waveform Generator</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { type: 'sine', label: 'Sine Wave', desc: 'Pure tone, no harmonics', icon: '∿' },
                { type: 'square', label: 'Square Wave', desc: 'Rich in odd harmonics', icon: '⊏' },
                { type: 'sawtooth', label: 'Sawtooth', desc: 'Rich in all harmonics', icon: '⟋' },
                { type: 'triangle', label: 'Triangle', desc: 'Softer harmonics', icon: '△' },
              ].map(({ type, label, desc, icon }) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateWaveform(type)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm ${
                    audioSettings.waveform === type
                      ? 'border-blue-400 bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-900/40 dark:to-purple-900/40 shadow-lg shadow-blue-500/20'
                      : 'border-white/20 bg-white/10 hover:border-blue-300 hover:bg-blue-50/20 dark:border-slate-700/50 dark:bg-slate-800/20 dark:hover:border-blue-600'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{icon}</div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{label}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </GlassCard>

          {/* Volume and Channel Controls */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg">
                <Volume2 className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Audio Output</h3>
            </div>
            
            <div className="space-y-6">
              {/* Volume Control */}
              <Slider
                label="Master Volume"
                value={audioSettings.volume}
                onChange={(value: number) => updateVolume(value)}
                min={0.1}
                max={safetySettings.maxVolume}
                step={0.01}
                showValue={true}
                unit="%"
                className="space-y-3"
              />
              
              {audioSettings.volume > safetySettings.warningThreshold && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl border border-amber-200/50 dark:border-amber-700/50"
                >
                  <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Hearing protection enabled</span>
                </motion.div>
              )}

              {/* Channel Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Audio Channels</label>
                
                <div className="flex gap-3">
                  <Button
                    variant={audioSettings.leftChannel ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleChannel('left')}
                    disabled={!audioSettings.leftChannel && !audioSettings.rightChannel}
                    className={`flex-1 transition-all duration-200 ${
                      audioSettings.leftChannel 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25' 
                        : 'hover:bg-blue-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    Left Channel
                  </Button>
                  <Button
                    variant={audioSettings.rightChannel ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleChannel('right')}
                    disabled={!audioSettings.rightChannel && !audioSettings.leftChannel}
                    className={`flex-1 transition-all duration-200 ${
                      audioSettings.rightChannel 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25' 
                        : 'hover:bg-blue-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    Right Channel
                  </Button>
                  <Button
                    variant={audioSettings.leftChannel && audioSettings.rightChannel ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (audioSettings.leftChannel && audioSettings.rightChannel) {
                        toggleChannel('right')
                      } else {
                        if (!audioSettings.leftChannel) toggleChannel('left')
                        if (!audioSettings.rightChannel) toggleChannel('right')
                      }
                    }}
                    className={`flex-1 transition-all duration-200 ${
                      audioSettings.leftChannel && audioSettings.rightChannel 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/25' 
                        : 'hover:bg-green-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    Stereo
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Quick Presets */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-lg">
              <Settings className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Quick Frequency Presets</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { freq: 40, label: 'Sub Bass', desc: '40Hz' },
              { freq: 440, label: 'A4 Note', desc: '440Hz' },
              { freq: 1000, label: 'Reference', desc: '1kHz' },
              { freq: 2000, label: 'Vocal', desc: '2kHz' },
              { freq: 8000, label: 'Presence', desc: '8kHz' },
              { freq: 15000, label: 'Air', desc: '15kHz' },
            ].map(({ freq, label, desc }) => (
              <motion.button
                key={freq}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  updateFrequency(freq, 'Hz')
                  if (freq >= 1000) {
                    setFrequencyInput((freq / 1000).toFixed(2))
                    setFrequencyUnit('kHz')
                  } else {
                    setFrequencyInput(freq.toString())
                    setFrequencyUnit('Hz')
                  }
                  setFinetuneValue(0)
                }}
                className="p-4 bg-gradient-to-br from-white/10 to-white/5 dark:from-slate-800/50 dark:to-slate-900/30 rounded-xl border border-white/20 dark:border-slate-700/30 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="text-center">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{label}</h4>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-mono">{desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
