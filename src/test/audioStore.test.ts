import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAudioStore } from '@/store/audioStore'

// Mock Tone.js completely
vi.mock('tone', () => ({
  context: {
    state: 'suspended',
    resume: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    sampleRate: 44100,
    createGain: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
    createMediaStreamDestination: vi.fn(() => ({})),
    now: vi.fn(() => 0),
  },
  start: vi.fn().mockResolvedValue(undefined),
  now: vi.fn(() => 0),
  Oscillator: vi.fn().mockImplementation(() => ({
    frequency: { value: 440, setValueAtTime: vi.fn() },
    type: 'sine',
    volume: { value: -10 },
    state: 'stopped',
    start: vi.fn(),
    stop: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    dispose: vi.fn(),
    toDestination: vi.fn().mockReturnThis(),
  })),
  Gain: vi.fn().mockImplementation(() => ({
    gain: { value: 0.5, setValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
    dispose: vi.fn(),
    toDestination: vi.fn().mockReturnThis(),
  })),
}))

describe('AudioStore - Critical InvalidAccessError Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store to initial state
    useAudioStore.setState({
      isPlaying: false,
      audioContext: null,
      oscillatorNode: null,
      gainNode: null,
      analyserNode: null,
    })
  })

  describe('Audio Initialization', () => {
    it('should initialize audio context successfully', async () => {
      // Arrange
      const mockResume = vi.fn().mockResolvedValue(undefined)
      ;(Tone.context as any).resume = mockResume
      ;(Tone.context as any).state = 'suspended'

      // Act
      await store.initializeAudio()

      // Assert
      expect(mockResume).toHaveBeenCalledTimes(1)
      expect(store.isInitialized).toBe(true)
    })

    it('should handle audio context resume failure', async () => {
      // Arrange
      const resumeError = new Error('Audio context resume failed')
      ;(Tone.context as any).resume = vi.fn().mockRejectedValue(resumeError)

      // Act & Assert
      await expect(store.initializeAudio()).rejects.toThrow('Audio context resume failed')
      expect(store.isInitialized).toBe(false)
    })
  })

  describe('Critical Bug: StartTone InvalidAccessError', () => {
    beforeEach(() => {
      // Set initialized state
      store.isInitialized = true
    })

    it('should create oscillator and gain node without errors', async () => {
      // Arrange
      const mockOscillator = {
        frequency: { value: 440 },
        type: 'sine',
        volume: { value: -10 },
        state: 'stopped',
        start: vi.fn(),
        stop: vi.fn(),
        connect: vi.fn(),
        dispose: vi.fn(),
        toDestination: vi.fn().mockReturnThis(),
      }
      
      const mockGain = {
        gain: { value: 0.5 },
        connect: vi.fn(),
        dispose: vi.fn(),
        toDestination: vi.fn().mockReturnThis(),
      }

      ;(Tone.Oscillator as any).mockReturnValue(mockOscillator)
      ;(Tone.Gain as any).mockReturnValue(mockGain)

      // Act
      await store.startTone()

      // Assert
      expect(Tone.Oscillator).toHaveBeenCalledWith({
        frequency: store.frequency,
        type: store.waveform,
      })
      expect(Tone.Gain).toHaveBeenCalledWith(store.volume)
      expect(store.isPlaying).toBe(true)
    })

    it('should handle oscillator creation failure', async () => {
      // Arrange - Simulate the exact error from line 165
      const invalidAccessError = new DOMException(
        'The AudioContext was not allowed to start. User gesture is required.',
        'InvalidAccessError'
      )
      ;(Tone.Oscillator as any).mockImplementation(() => {
        throw invalidAccessError
      })

      // Act & Assert
      await expect(store.startTone()).rejects.toThrow('InvalidAccessError')
      expect(store.isPlaying).toBe(false)
      expect(store.oscillator).toBe(null)
    })

    it('should handle gain node creation failure', async () => {
      // Arrange
      const mockOscillator = {
        frequency: { value: 440 },
        type: 'sine',
        volume: { value: -10 },
        state: 'stopped',
        start: vi.fn(),
        stop: vi.fn(),
        connect: vi.fn(),
        dispose: vi.fn(),
        toDestination: vi.fn().mockReturnThis(),
      }
      
      ;(Tone.Oscillator as any).mockReturnValue(mockOscillator)
      ;(Tone.Gain as any).mockImplementation(() => {
        throw new Error('Gain node creation failed')
      })

      // Act & Assert
      await expect(store.startTone()).rejects.toThrow('Gain node creation failed')
      expect(store.isPlaying).toBe(false)
    })

    it('should properly connect audio nodes', async () => {
      // Arrange
      const mockOscillator = {
        frequency: { value: 440 },
        type: 'sine',
        volume: { value: -10 },
        state: 'stopped',
        start: vi.fn(),
        stop: vi.fn(),
        connect: vi.fn(),
        dispose: vi.fn(),
        toDestination: vi.fn().mockReturnThis(),
      }
      
      const mockGain = {
        gain: { value: 0.5 },
        connect: vi.fn(),
        dispose: vi.fn(),
        toDestination: vi.fn().mockReturnThis(),
      }

      ;(Tone.Oscillator as any).mockReturnValue(mockOscillator)
      ;(Tone.Gain as any).mockReturnValue(mockGain)

      // Act
      await store.startTone()

      // Assert - Check proper connection chain
      expect(mockOscillator.connect).toHaveBeenCalledWith(mockGain)
      expect(mockGain.toDestination).toHaveBeenCalled()
      expect(mockOscillator.start).toHaveBeenCalled()
    })
  })

  describe('Audio Context State Management', () => {
    it('should check audio context state before operations', async () => {
      // Arrange
      ;(Tone.context as any).state = 'suspended'
      const mockResume = vi.fn().mockResolvedValue(undefined)
      ;(Tone.context as any).resume = mockResume

      store.isInitialized = true

      // Act
      await store.startTone()

      // Assert - Should attempt to resume if suspended
      expect(mockResume).toHaveBeenCalled()
    })

    it('should handle audio context state changes', async () => {
      // Arrange
      ;(Tone.context as any).state = 'running'
      store.isInitialized = true

      const mockOscillator = {
        frequency: { value: 440 },
        type: 'sine',
        volume: { value: -10 },
        state: 'stopped',
        start: vi.fn(),
        stop: vi.fn(),
        connect: vi.fn(),
        dispose: vi.fn(),
        toDestination: vi.fn().mockReturnThis(),
      }
      
      ;(Tone.Oscillator as any).mockReturnValue(mockOscillator)

      // Act
      await store.startTone()

      // Assert - Should proceed with running context
      expect(store.isPlaying).toBe(true)
    })
  })

  describe('Stop Tone Functionality', () => {
    it('should stop and dispose of audio nodes properly', async () => {
      // Arrange
      const mockOscillator = {
        frequency: { value: 440 },
        type: 'sine',
        volume: { value: -10 },
        state: 'started',
        start: vi.fn(),
        stop: vi.fn(),
        connect: vi.fn(),
        dispose: vi.fn(),
        toDestination: vi.fn().mockReturnThis(),
      }
      
      const mockGain = {
        gain: { value: 0.5 },
        connect: vi.fn(),
        dispose: vi.fn(),
        toDestination: vi.fn().mockReturnThis(),
      }

      store.isPlaying = true
      store.oscillator = mockOscillator as any
      store.gainNode = mockGain as any

      // Act
      await store.stopTone()

      // Assert
      expect(mockOscillator.stop).toHaveBeenCalled()
      expect(mockOscillator.dispose).toHaveBeenCalled()
      expect(mockGain.dispose).toHaveBeenCalled()
      expect(store.isPlaying).toBe(false)
      expect(store.oscillator).toBe(null)
      expect(store.gainNode).toBe(null)
    })
  })

  describe('Emergency Stop', () => {
    it('should immediately stop all audio and reset state', async () => {
      // Arrange
      const mockOscillator = {
        frequency: { value: 440 },
        type: 'sine',
        volume: { value: -10 },
        state: 'started',
        start: vi.fn(),
        stop: vi.fn(),
        connect: vi.fn(),
        dispose: vi.fn(),
        toDestination: vi.fn().mockReturnThis(),
      }

      store.isPlaying = true
      store.oscillator = mockOscillator as any

      // Act
      await store.emergencyStop()

      // Assert
      expect(mockOscillator.stop).toHaveBeenCalled()
      expect(mockOscillator.dispose).toHaveBeenCalled()
      expect(store.isPlaying).toBe(false)
      expect(store.oscillator).toBe(null)
    })
  })

  describe('Parameter Updates', () => {
    it('should update frequency safely', async () => {
      // Arrange
      const newFrequency = 1000

      // Act
      await store.updateFrequency(newFrequency)

      // Assert
      expect(store.frequency).toBe(newFrequency)
    })

    it('should clamp frequency to valid range', async () => {
      // Act - Test minimum
      await store.updateFrequency(-100)
      expect(store.frequency).toBeGreaterThanOrEqual(0.1) // Minimum frequency

      // Act - Test maximum
      await store.updateFrequency(100000)
      expect(store.frequency).toBeLessThanOrEqual(25000) // Maximum frequency
    })

    it('should update volume with safety limits', async () => {
      // Act - Test normal volume
      await store.updateVolume(0.5)
      expect(store.volume).toBe(0.5)

      // Act - Test volume limit
      await store.updateVolume(1.0)
      expect(store.volume).toBeLessThanOrEqual(0.8) // Safety limit
    })
  })
})
