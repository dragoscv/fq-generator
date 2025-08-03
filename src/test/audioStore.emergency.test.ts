import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAudioStore } from '@/store/audioStore'

// Mock Tone.js properly
vi.mock('tone', async () => {
  const mockOscillator = {
    frequency: { value: 440 },
    type: 'sine',
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    dispose: vi.fn(),
  }
  
  const mockGain = {
    gain: { value: 1 },
    connect: vi.fn(),
    dispose: vi.fn(),
  }
  
  const mockMerge = {
    connect: vi.fn(),
    toDestination: vi.fn(),
  }
  
  const mockAnalyser = {
    getValue: vi.fn(() => new Float32Array(256)),
  }
  
  return {
    start: vi.fn().mockResolvedValue(undefined),
    getContext: vi.fn(() => ({
      state: 'running',
      rawContext: {
        createOscillator: vi.fn(() => mockOscillator),
        createGain: vi.fn(() => mockGain),
        createAnalyser: vi.fn(() => mockAnalyser),
        destination: {},
        sampleRate: 44100,
      }
    })),
    getTransport: vi.fn(() => ({
      stop: vi.fn(),
    })),
    Oscillator: vi.fn().mockImplementation((config) => ({
      ...mockOscillator,
      frequency: { value: config?.frequency || 440 },
      type: config?.type || 'sine',
    })),
    Gain: vi.fn().mockImplementation((value = 1) => ({
      ...mockGain,
      gain: { value },
    })),
    Merge: vi.fn().mockImplementation(() => mockMerge),
    Analyser: vi.fn().mockImplementation(() => mockAnalyser),
  }
})

describe('AudioStore - Critical InvalidAccessError Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Audio Initialization', () => {
    it('should initialize audio context successfully', async () => {
      const { result } = renderHook(() => useAudioStore())

      await act(async () => {
        await result.current.initializeAudio()
      })

      expect(result.current.isInitialized).toBe(true)
      expect(result.current.audioContext).toBeDefined()
      expect(result.current.analyserNode).toBeDefined()
    })

    it('should handle audio context resume failure', async () => {
      const { result } = renderHook(() => useAudioStore())
      
      // Mock Tone.start to reject
      const mockStart = vi.fn().mockRejectedValue(new Error('Audio context failed'))
      vi.doMock('tone', () => ({
        start: mockStart,
      }))

      await act(async () => {
        await expect(result.current.initializeAudio()).rejects.toThrow()
      })

      expect(result.current.isInitialized).toBe(false)
    })
  })

  describe('Critical Bug: StartTone InvalidAccessError', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useAudioStore())
      await act(async () => {
        await result.current.initializeAudio()
      })
    })

    it('should create oscillator and gain node without errors', async () => {
      const { result } = renderHook(() => useAudioStore())
      
      await act(async () => {
        await result.current.initializeAudio()
      })

      await act(async () => {
        await result.current.startTone()
      })

      expect(result.current.isPlaying).toBe(true)
    })

    it('should handle oscillator creation failure', async () => {
      const { result } = renderHook(() => useAudioStore())
      
      await act(async () => {
        await result.current.initializeAudio()
      })

      // Mock oscillator to throw error
      vi.doMock('tone', () => ({
        Oscillator: vi.fn().mockImplementation(() => {
          throw new DOMException('InvalidAccessError')
        })
      }))

      await act(async () => {
        await expect(result.current.startTone()).rejects.toThrow()
      })

      expect(result.current.isPlaying).toBe(false)
    })

    it('should handle gain node creation failure', async () => {
      const { result } = renderHook(() => useAudioStore())
      
      await act(async () => {
        await result.current.initializeAudio()
      })

      // Mock gain to throw error
      vi.doMock('tone', () => ({
        Gain: vi.fn().mockImplementation(() => {
          throw new DOMException('InvalidAccessError')
        })
      }))

      await act(async () => {
        await expect(result.current.startTone()).rejects.toThrow()
      })

      expect(result.current.isPlaying).toBe(false)
    })

    it('should properly connect audio nodes', async () => {
      const { result } = renderHook(() => useAudioStore())
      
      await act(async () => {
        await result.current.initializeAudio()
      })

      await act(async () => {
        await result.current.startTone()
      })

      expect(result.current.isPlaying).toBe(true)
      expect(result.current.toneOscillator).toBeDefined()
    })
  })

  describe('Audio Context State Management', () => {
    it('should check audio context state before operations', async () => {
      const { result } = renderHook(() => useAudioStore())

      // Try to start tone without initialization
      await act(async () => {
        await expect(result.current.startTone()).rejects.toThrow('Audio system not initialized')
      })
    })

    it('should handle audio context state changes', async () => {
      const { result } = renderHook(() => useAudioStore())
      
      await act(async () => {
        await result.current.initializeAudio()
      })

      await act(async () => {
        await result.current.startTone()
      })

      expect(result.current.isPlaying).toBe(true)
    })
  })

  describe('Stop Tone Functionality', () => {
    it('should stop and dispose of audio nodes properly', async () => {
      const { result } = renderHook(() => useAudioStore())
      
      await act(async () => {
        await result.current.initializeAudio()
      })

      await act(async () => {
        await result.current.startTone()
      })

      act(() => {
        result.current.stopTone()
      })

      expect(result.current.isPlaying).toBe(false)
      expect(result.current.toneOscillator).toBeNull()
    })
  })

  describe('Emergency Stop', () => {
    it('should immediately stop all audio and reset state', async () => {
      const { result } = renderHook(() => useAudioStore())
      
      await act(async () => {
        await result.current.initializeAudio()
      })

      await act(async () => {
        await result.current.startTone()
      })

      act(() => {
        result.current.emergencyStop()
      })

      expect(result.current.isPlaying).toBe(false)
      expect(result.current.audioSettings.volume).toBe(0.1) // Reset to safe volume
    })
  })

  describe('Parameter Updates', () => {
    it('should update frequency safely', async () => {
      const { result } = renderHook(() => useAudioStore())
      const newFrequency = 880

      act(() => {
        result.current.updateFrequency(newFrequency)
      })

      expect(result.current.audioSettings.frequency.value).toBe(newFrequency)
    })

    it('should clamp frequency to valid range', async () => {
      const { result } = renderHook(() => useAudioStore())

      act(() => {
        result.current.updateFrequency(-100)
      })
      expect(result.current.audioSettings.frequency.value).toBeGreaterThanOrEqual(0.1)

      act(() => {
        result.current.updateFrequency(30000)
      })
      expect(result.current.audioSettings.frequency.value).toBeLessThanOrEqual(25000)
    })

    it('should update volume with safety limits', async () => {
      const { result } = renderHook(() => useAudioStore())

      act(() => {
        result.current.updateVolume(0.5)
      })

      expect(result.current.audioSettings.volume).toBe(0.5)

      act(() => {
        result.current.updateVolume(1.5)
      })

      expect(result.current.audioSettings.volume).toBeLessThanOrEqual(0.8) // Safety limit
    })
  })
})
