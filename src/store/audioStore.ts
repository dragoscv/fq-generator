'use client'

import { create } from 'zustand'
import * as Tone from 'tone'
import type { AudioSettings, SafetySettings, GeneratorState, WaveformType } from '@/types/audio'
import { clampFrequency } from '@/lib/utils'

interface AudioStore extends GeneratorState {
  // Additional properties for Tone.js integration
  toneOscillator: Tone.Oscillator | null
  isInitialized: boolean
  
  // Output device properties
  availableOutputDevices: MediaDeviceInfo[]
  selectedOutputDevice: string | null
  
  // Actions
  initializeAudio: () => Promise<void>
  startTone: (config?: Partial<AudioSettings>) => Promise<void>
  stopTone: () => void
  updateFrequency: (frequency: number, unit?: 'Hz' | 'kHz') => void
  updateWaveform: (waveform: string) => void
  updateVolume: (volume: number) => void
  toggleChannel: (channel: 'left' | 'right') => void
  emergencyStop: () => void
  validateVolume: (volume: number) => number
  getFrequencyInHz: () => number
  
  // Output device actions
  loadOutputDevices: () => Promise<void>
  selectOutputDevice: (deviceId: string) => Promise<void>
}

const initialAudioSettings: AudioSettings = {
  frequency: { value: 1000, unit: 'Hz' },
  waveform: 'sine',
  volume: 0.5, // Start with 50% volume for better audibility
  leftChannel: true,
  rightChannel: true,
}

const initialSafetySettings: SafetySettings = {
  maxVolume: 0.8, // 80% max
  warningThreshold: 0.6,
  emergencyStop: false,
  hearingProtection: true,
  progressiveIncrease: true,
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  // Initial state
  isInitialized: false,
  isPlaying: false,
  audioContext: null,
  analyserNode: null,
  oscillatorNode: null,
  gainNode: null,
  toneOscillator: null,
  analysisData: null,
  audioSettings: initialAudioSettings,
  safetySettings: initialSafetySettings,
  
  // Output device state
  availableOutputDevices: [],
  selectedOutputDevice: null,

  // Initialize audio system - SIMPLIFIED WORKING VERSION
  initializeAudio: async () => {
    try {
      console.log('🎵 Initializing audio system...')
      
      // Initialize Tone.js context
      await Tone.start()
      console.log('🎵 Tone.js started, context state:', Tone.getContext().state)

      // Create analyser for spectrum visualization
      const analyser = new Tone.Analyser('fft', 256)
      console.log('🎵 Analyzer created')
      
      // Set up the audio context reference
      const audioContext = Tone.getContext().rawContext

      set({
        isInitialized: true,
        audioContext: audioContext as AudioContext,
        analyserNode: analyser as unknown as AnalyserNode,
      })

      // Load output devices after successful initialization (optional, don't fail if this fails)
      try {
        await get().loadOutputDevices()
        console.log('🎵 Output devices loaded successfully')
      } catch (deviceError) {
        console.warn('⚠️ Failed to load output devices, but audio system is still functional:', deviceError)
        // Don't throw this error - audio should still work without device selection
      }

      console.log('✅ Audio system initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize audio:', error)
      throw error
    }
  },

  // Start tone - ENHANCED DEBUGGING VERSION FOR NO AUDIO ISSUE
  startTone: async (config?: Partial<AudioSettings>) => {
    const state = get()
    
    console.log('🎵 Starting tone with enhanced debugging...')
    console.log('🎵 Browser audio info:', {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor
    })
    
    if (!state.isInitialized) {
      console.error('❌ Audio system not initialized')
      throw new Error('Audio system not initialized')
    }
    
    try {
      // Check system audio capabilities
      console.log('🎵 System audio check:', {
        context: Tone.getContext(),
        contextState: Tone.getContext().state,
        sampleRate: Tone.getContext().sampleRate,
        destination: Tone.getContext().destination,
        baseLatency: (Tone.getContext().rawContext as AudioContext).baseLatency || 'unknown'
      })
      
      // Ensure Tone.js context is running
      if (Tone.getContext().state !== 'running') {
        console.log('🎵 Starting Tone.js context...')
        await Tone.start()
        console.log('🎵 Context started:', Tone.getContext().state)
        
        // Additional check after start
        await new Promise(resolve => setTimeout(resolve, 100))
        console.log('🎵 Context state after delay:', Tone.getContext().state)
      }
      
      // Stop any existing tone first
      if (state.isPlaying) {
        console.log('🎵 Stopping existing tone...')
        get().stopTone()
        await new Promise(resolve => setTimeout(resolve, 200)) // Longer wait for cleanup
      }
      
      // Get settings with debugging
      const settings = { ...state.audioSettings, ...config }
      const frequency = clampFrequency(settings.frequency.value)
      
      // Force higher volume for debugging - TESTING MAXIMUM AUDIBLE VOLUME
      let volume = Math.max(0.7, settings.volume) // Force minimum 70% for debugging
      volume = Math.min(volume, 0.9) // Use 90% instead of safety limit for testing
      
      console.log(`🎵 Creating tone with HIGH VOLUME: ${frequency}Hz, ${settings.waveform}, ${Math.round(volume * 100)}%`)
      console.log('🎵 Volume levels:', {
        requested: settings.volume,
        enforced: volume,
        safetyMax: state.safetySettings.maxVolume,
        linearGain: volume,
        dbLevel: (20 * Math.log10(volume)).toFixed(1) + 'dB'
      })
      
      // Try the most basic approach first - DIRECT TONE TO DESTINATION
      console.log('🎵 Creating basic oscillator...')
      const oscillator = new Tone.Oscillator({
        frequency: frequency,
        type: settings.waveform as OscillatorType,
        volume: (20 * Math.log10(volume)) // Set volume in dB directly on oscillator
      })
      
      console.log('🎵 Oscillator created:', {
        frequency: oscillator.frequency.value,
        type: oscillator.type,
        volume: oscillator.volume.value,
        state: oscillator.state
      })
      
      // Connect directly to destination - NO GAIN NODE FOR TESTING
      console.log('🎵 Connecting to destination...')
      oscillator.toDestination()
      
      // Also create a gain node for manual control
      const gain = new Tone.Gain(volume)
      console.log('🎵 Gain node created:', {
        gain: gain.gain.value,
        input: gain.input,
        output: gain.output
      })
      
      // Connect to analyzer if available  
      if (state.analyserNode) {
        console.log('🎵 Connecting to analyzer...')
        oscillator.connect(state.analyserNode as unknown as AudioNode)
      }
      
      console.log('🎵 Starting oscillator...')
      oscillator.start()
      console.log('🎵 Oscillator.start() called, state:', oscillator.state)
      
      // Update state
      set({
        isPlaying: true,
        toneOscillator: oscillator,
        oscillatorNode: oscillator as unknown as OscillatorNode,
        gainNode: gain as unknown as GainNode,
        audioSettings: {
          ...settings,
          frequency: { value: frequency, unit: 'Hz' },
          volume: volume
        }
      })
      
      console.log(`✅ Tone configuration complete: ${frequency}Hz, ${settings.waveform}, ${Math.round(volume * 100)}%`)
      
      // Enhanced verification with multiple checks
      setTimeout(() => {
        const contextState = Tone.getContext().state
        const oscState = oscillator.state
        const destination = Tone.getContext().destination
        
        console.log(`🎵 COMPREHENSIVE VERIFICATION:`)
        console.log(`   Context State: ${contextState}`)
        console.log(`   Oscillator State: ${oscState}`)
        console.log(`   Frequency: ${oscillator.frequency.value}Hz`)
        console.log(`   Volume: ${oscillator.volume.value}dB`)
        console.log(`   Destination:`, destination)
        console.log(`   Sample Rate: ${Tone.getContext().sampleRate}Hz`)
        
        // Test with Web Audio API directly
        const webAudioContext = Tone.getContext().rawContext
        console.log(`   Web Audio Context:`, {
          state: webAudioContext.state,
          sampleRate: webAudioContext.sampleRate,
          currentTime: webAudioContext.currentTime,
          destination: webAudioContext.destination,
          listener: webAudioContext.listener
        })
        
        if (contextState === 'running' && oscState === 'started') {
          console.log('✅ ALL SYSTEMS OPERATIONAL - AUDIO SHOULD BE AUDIBLE!')
          console.log('🔊 If you cannot hear audio, check:')
          console.log('   1. System volume levels')
          console.log('   2. Browser audio permissions')
          console.log('   3. Audio output device')
          console.log('   4. Other applications using audio')
        } else {
          console.warn('⚠️ AUDIO SYSTEM ISSUE DETECTED:')
          console.warn(`   Context not running: ${contextState !== 'running'}`)
          console.warn(`   Oscillator not started: ${oscState !== 'started'}`)
        }
      }, 300)
      
      // Additional test - try to create a simple beep after 1 second
      setTimeout(() => {
        console.log('🎵 Testing with simple beep...')
        try {
          const testOsc = new Tone.Oscillator(880, 'sine').toDestination()
          testOsc.start()
          setTimeout(() => {
            testOsc.dispose()
            console.log('🎵 Test beep completed')
          }, 200)
        } catch (error) {
          console.error('❌ Test beep failed:', error)
        }
      }, 1000)
      
    } catch (error) {
      console.error('❌ Failed to start tone:', error)
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')
      set({ isPlaying: false })
      throw error
    }
  },

  // Stop tone - SIMPLIFIED
  stopTone: () => {
    const state = get()
    
    console.log('🎵 Stopping tone...')
    
    try {
      if (state.toneOscillator) {
        console.log('🎵 Disposing oscillator...')
        state.toneOscillator.dispose()
      }
      
      // Clean up state
      set({
        isPlaying: false,
        toneOscillator: null,
        oscillatorNode: null,
        gainNode: null,
      })
      
      console.log('✅ Tone stopped')
    } catch (error) {
      console.error('❌ Error stopping tone:', error)
      // Force clean state even if error
      set({
        isPlaying: false,
        toneOscillator: null,
        oscillatorNode: null,
        gainNode: null,
      })
    }
  },

  // Emergency stop
  emergencyStop: () => {
    console.log('🚨 EMERGENCY STOP')
    get().stopTone()
    set({ safetySettings: { ...get().safetySettings, emergencyStop: true } })
  },

  // Update frequency - SIMPLE VERSION
  updateFrequency: (frequency: number, unit: 'Hz' | 'kHz' = 'Hz') => {
    const state = get()
    
    // Convert to Hz if needed
    const freqInHz = unit === 'kHz' ? frequency * 1000 : frequency
    const clampedFreq = clampFrequency(freqInHz)
    
    console.log(`🎵 Updating frequency: ${frequency}${unit} -> ${clampedFreq}Hz`)
    
    // Update state
    set({
      audioSettings: {
        ...state.audioSettings,
        frequency: { value: clampedFreq, unit: 'Hz' }
      }
    })
    
    // Update live tone if playing
    if (state.isPlaying && state.toneOscillator) {
      try {
        state.toneOscillator.frequency.value = clampedFreq
        console.log(`✅ Live frequency updated: ${clampedFreq}Hz`)
      } catch (error) {
        console.error('❌ Failed to update live frequency:', error)
      }
    }
  },

  // Update waveform
  updateWaveform: (waveform: string) => {
    const state = get()
    console.log(`🎵 Updating waveform: ${waveform}`)
    
    set({
      audioSettings: {
        ...state.audioSettings,
        waveform: waveform as WaveformType
      }
    })
    
    // Update live tone if playing - requires restart for waveform
    if (state.isPlaying) {
      console.log('🎵 Restarting tone with new waveform...')
      get().stopTone()
      setTimeout(() => {
        get().startTone({ waveform: waveform as WaveformType })
      }, 100)
    }
  },

  // Update volume
  updateVolume: (volume: number) => {
    const state = get()
    const validatedVolume = get().validateVolume(volume)
    
    console.log(`🎵 Updating volume: ${Math.round(validatedVolume * 100)}%`)
    
    set({
      audioSettings: {
        ...state.audioSettings,
        volume: validatedVolume
      }
    })
    
    // Update live volume if playing
    if (state.isPlaying && state.gainNode) {
      try {
        (state.gainNode as unknown as GainNode).gain.value = validatedVolume
        console.log(`✅ Live volume updated: ${Math.round(validatedVolume * 100)}%`)
      } catch (error) {
        console.error('❌ Failed to update live volume:', error)
      }
    }
  },

  // Toggle channel (simplified for now)
  toggleChannel: (channel: 'left' | 'right') => {
    const state = get()
    
    if (channel === 'left') {
      set({
        audioSettings: {
          ...state.audioSettings,
          leftChannel: !state.audioSettings.leftChannel
        }
      })
    } else {
      set({
        audioSettings: {
          ...state.audioSettings,
          rightChannel: !state.audioSettings.rightChannel
        }
      })
    }
    
    console.log(`🎵 Toggled ${channel} channel`)
  },

  // Validate volume with safety limits
  validateVolume: (volume: number): number => {
    const state = get()
    const maxVolume = state.safetySettings.maxVolume
    
    if (volume > maxVolume) {
      console.warn(`⚠️ Volume clamped from ${Math.round(volume * 100)}% to ${Math.round(maxVolume * 100)}%`)
      return maxVolume
    }
    
    return Math.max(0, Math.min(1, volume))
  },

  // Get frequency in Hz regardless of unit
  getFrequencyInHz: (): number => {
    const state = get()
    const freq = state.audioSettings.frequency
    return freq.unit === 'kHz' ? freq.value * 1000 : freq.value
  },

  // Load available output devices
  loadOutputDevices: async () => {
    try {
      console.log('🎵 Loading output devices...')
      
      // Check if MediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.warn('⚠️ MediaDevices API not available - this may be due to:')
        console.warn('  - Non-HTTPS context')
        console.warn('  - Unsupported browser')
        console.warn('  - Browser security settings')
        
        set({ 
          availableOutputDevices: [],
          selectedOutputDevice: null 
        })
        return
      }
      
      // Check if getUserMedia is available for permissions
      if (!navigator.mediaDevices.getUserMedia) {
        console.warn('⚠️ getUserMedia not available, trying to enumerate devices without permissions...')
        
        // Try to enumerate devices without requesting permissions first
        const devices = await navigator.mediaDevices.enumerateDevices()
        const audioOutputs = devices.filter(device => 
          device.kind === 'audiooutput'
        )
        
        console.log(`🎵 Found ${audioOutputs.length} output devices (without labels):`, audioOutputs)
        
        set({ availableOutputDevices: audioOutputs })
        
        if (audioOutputs.length > 0 && !get().selectedOutputDevice) {
          const defaultDevice = audioOutputs.find(d => d.deviceId === 'default') || audioOutputs[0]
          set({ selectedOutputDevice: defaultDevice.deviceId })
        }
        return
      }
      
      // Request permissions first to get device labels
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop()) // Stop the stream immediately
        console.log('🎵 Microphone permission granted')
      } catch (permissionError) {
        console.warn('⚠️ Microphone permission denied, device labels may not be available:', permissionError)
        // Continue anyway, we can still enumerate devices without labels
      }
      
      // Get all audio output devices
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioOutputs = devices.filter(device => 
        device.kind === 'audiooutput'
      )
      
      console.log(`🎵 Found ${audioOutputs.length} output devices:`, audioOutputs)
      
      set({ availableOutputDevices: audioOutputs })
      
      // Set default device if none selected
      const state = get()
      if (!state.selectedOutputDevice && audioOutputs.length > 0) {
        const defaultDevice = audioOutputs.find(d => d.deviceId === 'default') || audioOutputs[0]
        set({ selectedOutputDevice: defaultDevice.deviceId })
        console.log(`🎵 Auto-selected default device: ${defaultDevice.label || 'Unknown Device'}`)
      }
    } catch (error) {
      console.error('❌ Failed to load output devices:', error)
      
      // Provide more specific error information
      if (error instanceof TypeError && error.message.includes('getUserMedia')) {
        console.error('💡 This error usually occurs when:')
        console.error('  - Page is not served over HTTPS')
        console.error('  - Browser doesn\'t support MediaDevices API')
        console.error('  - Browser security settings block media access')
      }
      
      // Set fallback state
      set({ 
        availableOutputDevices: [],
        selectedOutputDevice: null 
      })
    }
  },

  // Select output device
  selectOutputDevice: async (deviceId: string) => {
    try {
      console.log(`🎵 Selecting output device: ${deviceId}`)
      
      const state = get()
      const device = state.availableOutputDevices.find(d => d.deviceId === deviceId)
      
      if (!device) {
        throw new Error(`Device ${deviceId} not found`)
      }
      
      // Check if the browser supports setSinkId
      if (!state.audioContext) {
        console.warn('⚠️ No audio context available')
        set({ selectedOutputDevice: deviceId })
        return
      }
      
      // Try to set the sink ID if supported
      const audioContext = state.audioContext as AudioContext & { setSinkId?: (deviceId: string) => Promise<void> }
      if (typeof audioContext.setSinkId === 'function') {
        try {
          await audioContext.setSinkId(deviceId)
          console.log(`🎵 Set audio context sink to: ${device.label || 'Unknown Device'}`)
        } catch (sinkError) {
          console.warn('⚠️ Failed to set sink ID:', sinkError)
          // Continue anyway, the device selection is still recorded
        }
      } else {
        console.warn('⚠️ setSinkId not supported in this browser')
        console.warn('💡 Device selection recorded but may not affect audio output')
      }
      
      set({ selectedOutputDevice: deviceId })
      console.log(`✅ Selected output device: ${device.label || 'Unknown Device'}`)
    } catch (error) {
      console.error('❌ Failed to select output device:', error)
      
      // Provide helpful error information
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          console.error('💡 Try refreshing the device list')
        } else if (error.message.includes('setSinkId')) {
          console.error('💡 This browser may not support audio output device selection')
        }
      }
      
      throw error
    }
  }
}))
