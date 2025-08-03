import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAudioStore } from '@/store/audioStore'
import * as Tone from 'tone'

// Mock Tone.js for controlled testing
vi.mock('tone', () => ({
  start: vi.fn(() => Promise.resolve()),
  getContext: vi.fn(() => ({
    state: 'running',
    rawContext: {
      sampleRate: 44100,
      currentTime: 0,
    },
  })),
  getDestination: vi.fn(() => ({})),
  getTransport: vi.fn(() => ({
    stop: vi.fn(),
  })),
  Oscillator: vi.fn().mockImplementation(() => ({
    frequency: { value: 440 },
    type: 'sine',
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    dispose: vi.fn(),
    toDestination: vi.fn().mockReturnThis(),
  })),
  Gain: vi.fn().mockImplementation((value = 1) => ({
    gain: { value },
    connect: vi.fn(),
    disconnect: vi.fn(),
    dispose: vi.fn(),
    toDestination: vi.fn().mockReturnThis(),
  })),
  Analyser: vi.fn().mockImplementation(() => ({
    getValue: vi.fn(() => new Float32Array(256)),
    connect: vi.fn(),
    disconnect: vi.fn(),
    dispose: vi.fn(),
  })),
  Merge: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    dispose: vi.fn(),
    toDestination: vi.fn().mockReturnThis(),
  })),
}))

describe('AudioStore - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Reset store state
    const { result } = renderHook(() => useAudioStore())
    act(() => {
      result.current.emergencyStop()
    })
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAudioStore())
      const store = result.current

      expect(store.isInitialized).toBe(false)
      expect(store.isPlaying).toBe(false)
      expect(store.audioContext).toBeNull()
      expect(store.analyserNode).toBeNull()
      expect(store.audioSettings.frequency).toEqual({ value: 1000, unit: 'Hz' })
      expect(store.audioSettings.waveform).toBe('sine')
      expect(store.audioSettings.volume).toBe(0.3)
      expect(store.audioSettings.leftChannel).toBe(true)
      expect(store.audioSettings.rightChannel).toBe(true)
      expect(store.safetySettings.maxVolume).toBe(0.8)
      expect(store.safetySettings.warningThreshold).toBe(0.6)
    })
  })

  describe('Audio Initialization', () => {
    it('should initialize audio system successfully', async () => {
      const { result } = renderHook(() => useAudioStore())

      await act(async () => {
        await result.current.initializeAudio()
      })

      expect(result.current.isInitialized).toBe(true)
      expect(result.current.audioContext).toBeDefined()
      expect(result.current.analyserNode).toBeDefined()
      expect(Tone.start).toHaveBeenCalled()
    })

    it('should handle initialization errors', async () => {
      const { result } = renderHook(() => useAudioStore())
      const mockError = new Error('Audio initialization failed')
      
      vi.mocked(Tone.start).mockRejectedValueOnce(mockError)

      await expect(async () => {
        await act(async () => {
          await result.current.initializeAudio()
        })
      }).rejects.toThrow('Audio initialization failed')

      expect(result.current.isInitialized).toBe(false)
    })
  })

  describe('Tone Generation', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useAudioStore())
      await act(async () => {
        await result.current.initializeAudio()
      })
    })

    it('should start tone successfully', async () => {
      const { result } = renderHook(() => useAudioStore())

      await act(async () => {
        await result.current.startTone()
      })

      expect(result.current.isPlaying).toBe(true)
      expect(result.current.toneOscillator).toBeDefined()
      expect(Tone.Oscillator).toHaveBeenCalled()
      expect(Tone.Gain).toHaveBeenCalled()
    })

    it('should not start tone if not initialized', async () => {
      const { result } = renderHook(() => useAudioStore())
      // Don't initialize

      await expect(async () => {
        await act(async () => {
          await result.current.startTone()
        })
      }).rejects.toThrow('Audio system not initialized')

      expect(result.current.isPlaying).toBe(false)
    })

    it('should stop tone successfully', async () => {
      const { result } = renderHook(() => useAudioStore())

      // Start tone first
      await act(async () => {
        await result.current.startTone()
      })

      expect(result.current.isPlaying).toBe(true)

      // Stop tone
      act(() => {
        result.current.stopTone()
      })

      expect(result.current.isPlaying).toBe(false)
      expect(result.current.toneOscillator).toBeNull()
    })

    it('should handle start tone errors gracefully', async () => {
      const { result } = renderHook(() => useAudioStore())
      const mockError = new Error('Failed to create oscillator')
      
      vi.mocked(Tone.Oscillator).mockImplementationOnce(() => {
        throw mockError
      })

      await expect(async () => {
        await act(async () => {
          await result.current.startTone()
        })
      }).rejects.toThrow('Failed to create oscillator')

      expect(result.current.isPlaying).toBe(false)
    })
  })

  describe('Frequency Control', () => {
    it('should update frequency in Hz', () => {
      const { result } = renderHook(() => useAudioStore())

      act(() => {
        result.current.updateFrequency(440, 'Hz')
      })

      expect(result.current.audioSettings.frequency).toEqual({
        value: 440,
        unit: 'Hz'
      })
    })

    it('should update frequency in kHz and convert to Hz', () => {
      const { result } = renderHook(() => useAudioStore())

      act(() => {
        result.current.updateFrequency(1.5, 'kHz')
      })

      expect(result.current.audioSettings.frequency).toEqual({
        value: 1500,
        unit: 'Hz'
      })
    })

    it('should clamp frequency to valid range', () => {
      const { result } = renderHook(() => useAudioStore())

      // Test frequency too low
      act(() => {
        result.current.updateFrequency(0.05, 'Hz')
      })
      expect(result.current.audioSettings.frequency.value).toBeGreaterThanOrEqual(0.1)

      // Test frequency too high
      act(() => {
        result.current.updateFrequency(30000, 'Hz')
      })
      expect(result.current.audioSettings.frequency.value).toBeLessThanOrEqual(25000)
    })

    it('should get frequency in Hz correctly', () => {
      const { result } = renderHook(() => useAudioStore())

      act(() => {
        result.current.updateFrequency(2.5, 'kHz')
      })

      expect(result.current.getFrequencyInHz()).toBe(2500)
    })
  })

  describe('Waveform Control', () => {
    it('should update waveform', () => {
      const { result } = renderHook(() => useAudioStore())

      act(() => {
        result.current.updateWaveform('square')
      })

      expect(result.current.audioSettings.waveform).toBe('square')
    })

    it('should update live oscillator waveform when playing', async () => {
      const { result } = renderHook(() => useAudioStore())
      const mockOscillator = {
        frequency: { value: 440 },
        type: 'sine',
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        dispose: vi.fn(),
        toDestination: vi.fn().mockReturnThis(),
      }

      vi.mocked(Tone.Oscillator).mockReturnValueOnce(mockOscillator as any)

      await act(async () => {
        await result.current.initializeAudio()
        await result.current.startTone()
      })

      act(() => {
        result.current.updateWaveform('triangle')
      })

      expect(result.current.audioSettings.waveform).toBe('triangle')
      expect(mockOscillator.type).toBe('triangle')
    })
  })

  describe('Volume Control', () => {
    it('should update volume within safety limits', () => {
      const { result } = renderHook(() => useAudioStore())

      act(() => {
        result.current.updateVolume(0.5)
      })

      expect(result.current.audioSettings.volume).toBe(0.5)
    })

    it('should enforce maximum volume safety limit', () => {
      const { result } = renderHook(() => useAudioStore())

      act(() => {
        result.current.updateVolume(0.9) // Above maxVolume (0.8)
      })

      expect(result.current.audioSettings.volume).toBeLessThanOrEqual(0.8)
    })

    it('should validate volume correctly', () => {
      const { result } = renderHook(() => useAudioStore())

      expect(result.current.validateVolume(0.5)).toBe(0.5)
      expect(result.current.validateVolume(0.9)).toBeLessThanOrEqual(0.8)
      expect(result.current.validateVolume(-0.1)).toBeGreaterThanOrEqual(0.1)
    })
  })

  describe('Channel Control', () => {
    it('should toggle left channel', () => {
      const { result } = renderHook(() => useAudioStore())

      act(() => {
        result.current.toggleChannel('left')
      })

      expect(result.current.audioSettings.leftChannel).toBe(false)
      expect(result.current.audioSettings.rightChannel).toBe(true)
    })

    it('should toggle right channel', () => {
      const { result } = renderHook(() => useAudioStore())

      act(() => {
        result.current.toggleChannel('right')
      })

      expect(result.current.audioSettings.leftChannel).toBe(true)
      expect(result.current.audioSettings.rightChannel).toBe(false)
    })

    it('should not allow both channels to be disabled', () => {
      const { result } = renderHook(() => useAudioStore())

      // Disable right channel first
      act(() => {
        result.current.toggleChannel('right')
      })

      expect(result.current.audioSettings.rightChannel).toBe(false)

      // Try to disable left channel - should not work
      act(() => {
        result.current.toggleChannel('left')
      })

      expect(result.current.audioSettings.leftChannel).toBe(true)
    })
  })

  describe('Emergency Stop', () => {
    it('should perform emergency stop', async () => {
      const { result } = renderHook(() => useAudioStore())

      await act(async () => {
        await result.current.initializeAudio()
        await result.current.startTone()
      })

      expect(result.current.isPlaying).toBe(true)

      act(() => {
        result.current.emergencyStop()
      })

      expect(result.current.isPlaying).toBe(false)
      expect(result.current.audioSettings.volume).toBe(0.1) // Reset to low volume
      expect(Tone.getTransport().stop).toHaveBeenCalled()
    })

    it('should handle emergency stop errors gracefully', () => {
      const { result } = renderHook(() => useAudioStore())
      
      vi.mocked(Tone.getTransport).mockReturnValueOnce({
        stop: vi.fn(() => { throw new Error('Transport error') })
      } as any)

      expect(() => {
        act(() => {
          result.current.emergencyStop()
        })
      }).not.toThrow()

      expect(result.current.isPlaying).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle dispose errors in stopTone', async () => {
      const { result } = renderHook(() => useAudioStore())
      const mockOscillator = {
        frequency: { value: 440 },
        type: 'sine',
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        dispose: vi.fn(() => { throw new Error('Dispose error') }),
        toDestination: vi.fn().mockReturnThis(),
      }

      vi.mocked(Tone.Oscillator).mockReturnValueOnce(mockOscillator as any)

      await act(async () => {
        await result.current.initializeAudio()
        await result.current.startTone()
      })

      expect(() => {
        act(() => {
          result.current.stopTone()
        })
      }).not.toThrow()

      expect(result.current.isPlaying).toBe(false)
    })
  })
})
