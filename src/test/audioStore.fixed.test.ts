import { useAudioStore } from "@/store/audioStore";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Tone.js completely
vi.mock("tone", () => {
  const mockContext = {
    state: "suspended" as any,
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
  };

  return {
    context: mockContext,
    start: vi.fn().mockResolvedValue(undefined),
    getContext: vi.fn().mockReturnValue(mockContext), // Add missing getContext
    now: vi.fn(() => 0),
    Analyser: vi.fn().mockImplementation(() => ({
      // Add missing Analyser
      toDestination: vi.fn().mockReturnThis(),
      dispose: vi.fn(),
      connect: vi.fn().mockReturnThis(),
    })),
    Oscillator: vi.fn().mockImplementation(() => ({
      frequency: { value: 440, setValueAtTime: vi.fn() },
      type: "sine",
      volume: { value: -10 },
      state: "stopped",
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
  };
});

describe("AudioStore - Critical InvalidAccessError Fix", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Audio Initialization", () => {
    it("should initialize audio context successfully", async () => {
      const { result } = renderHook(() => useAudioStore());

      await act(async () => {
        await result.current.initializeAudio();
      });

      expect(result.current.isInitialized).toBe(true);
      expect(result.current.toneContext).toBeDefined();
      expect(result.current.analyserNode).toBeDefined();
    });

    it("should handle audio context resume failure", async () => {
      const { result } = renderHook(() => useAudioStore());
      const resumeError = new Error("Audio context resume failed");

      // Mock Tone context to fail on resume
      const mockTone = vi.mocked(await import("tone"));
      vi.mocked(mockTone.context.resume).mockRejectedValue(resumeError);

      await act(async () => {
        await expect(result.current.initializeAudio()).rejects.toThrow();
      });

      expect(result.current.isInitialized).toBe(false);
    });
  });

  describe("Critical Bug: StartTone InvalidAccessError", () => {
    it("should create oscillator and gain node without errors", async () => {
      const { result } = renderHook(() => useAudioStore());

      // Initialize first
      await act(async () => {
        await result.current.initializeAudio();
      });

      const mockOscillator = {
        frequency: { value: 440, setValueAtTime: vi.fn() },
        type: "sine",
        start: vi.fn(),
        stop: vi.fn(),
        connect: vi.fn(),
        disconnect: vi.fn(),
        dispose: vi.fn(),
      };

      const mockGain = {
        gain: { value: 0.5, setValueAtTime: vi.fn() },
        connect: vi.fn(),
        disconnect: vi.fn(),
        dispose: vi.fn(),
        toDestination: vi.fn(),
      };

      const mockTone = vi.mocked(await import("tone"));
      vi.mocked(mockTone.Oscillator).mockReturnValue(mockOscillator as any);
      vi.mocked(mockTone.Gain).mockReturnValue(mockGain as any);

      await act(async () => {
        await result.current.startTone({
          frequency: { value: 440, unit: "Hz" },
          waveform: "sine",
          volume: -20,
        });
      });

      expect(mockTone.Oscillator).toHaveBeenCalledWith({
        frequency: 440,
        type: "sine",
      });
      expect(result.current.isPlaying).toBe(true);
    });

    it("should handle oscillator creation failure", async () => {
      const { result } = renderHook(() => useAudioStore());

      await act(async () => {
        await result.current.initializeAudio();
      });

      const mockTone = vi.mocked(await import("tone"));
      vi.mocked(mockTone.Oscillator).mockImplementation(() => {
        throw new DOMException("Mock InvalidAccessError", "InvalidAccessError");
      });

      await act(async () => {
        await expect(result.current.startTone()).rejects.toThrow(
          "InvalidAccessError"
        );
      });
    });

    it("should handle gain node creation failure", async () => {
      const { result } = renderHook(() => useAudioStore());

      await act(async () => {
        await result.current.initializeAudio();
      });

      const mockTone = vi.mocked(await import("tone"));
      vi.mocked(mockTone.Gain).mockImplementation(() => {
        throw new Error("Gain creation failed");
      });

      await act(async () => {
        await expect(result.current.startTone()).rejects.toThrow();
      });
    });

    it("should properly connect audio nodes", async () => {
      const { result } = renderHook(() => useAudioStore());

      await act(async () => {
        await result.current.initializeAudio();
      });

      const mockOscillator = {
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        disconnect: vi.fn(),
        dispose: vi.fn(),
      };

      const mockGain = {
        connect: vi.fn(),
        toDestination: vi.fn(),
        disconnect: vi.fn(),
        dispose: vi.fn(),
      };

      const mockTone = vi.mocked(await import("tone"));
      vi.mocked(mockTone.Oscillator).mockReturnValue(mockOscillator as any);
      vi.mocked(mockTone.Gain).mockReturnValue(mockGain as any);

      await act(async () => {
        await result.current.startTone();
      });

      expect(mockOscillator.connect).toHaveBeenCalledWith(mockGain);
      expect(mockGain.toDestination).toHaveBeenCalled();
    });
  });

  describe("Audio Context State Management", () => {
    it("should check audio context state before operations", async () => {
      const { result } = renderHook(() => useAudioStore());

      // Try to start tone without initialization
      await act(async () => {
        await expect(result.current.startTone()).rejects.toThrow(
          "Audio context not initialized"
        );
      });
    });

    it("should handle audio context state changes", async () => {
      const { result } = renderHook(() => useAudioStore());

      await act(async () => {
        await result.current.initializeAudio();
      });

      const mockTone = vi.mocked(await import("tone"));
      // Mock suspended context
      mockTone.context.state = "suspended";

      const mockOscillator = {
        start: vi.fn(),
        connect: vi.fn(),
        disconnect: vi.fn(),
        dispose: vi.fn(),
      };

      const mockGain = {
        connect: vi.fn(),
        toDestination: vi.fn(),
        disconnect: vi.fn(),
        dispose: vi.fn(),
      };

      vi.mocked(mockTone.Oscillator).mockReturnValue(mockOscillator as any);
      vi.mocked(mockTone.Gain).mockReturnValue(mockGain as any);

      await act(async () => {
        await result.current.startTone();
      });

      // Should attempt to resume suspended context
      expect(mockTone.context.resume).toHaveBeenCalled();
    });
  });

  describe("Stop Tone Functionality", () => {
    it("should stop and dispose of audio nodes properly", async () => {
      const { result } = renderHook(() => useAudioStore());

      await act(async () => {
        await result.current.initializeAudio();
      });

      const mockOscillator = {
        start: vi.fn(),
        stop: vi.fn(),
        connect: vi.fn(),
        disconnect: vi.fn(),
        dispose: vi.fn(),
      };

      const mockGain = {
        connect: vi.fn(),
        toDestination: vi.fn(),
        disconnect: vi.fn(),
        dispose: vi.fn(),
      };

      const mockTone = vi.mocked(await import("tone"));
      vi.mocked(mockTone.Oscillator).mockReturnValue(mockOscillator as any);
      vi.mocked(mockTone.Gain).mockReturnValue(mockGain as any);

      await act(async () => {
        await result.current.startTone();
      });

      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.stopTone();
      });

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.oscillatorNode).toBeNull();
      expect(result.current.gainNode).toBeNull();
    });
  });

  describe("Emergency Stop", () => {
    it("should immediately stop all audio and reset state", async () => {
      const { result } = renderHook(() => useAudioStore());

      await act(async () => {
        await result.current.initializeAudio();
        await result.current.startTone();
      });

      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.emergencyStop();
      });

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.safetySettings.emergencyStop).toBe(true);
    });
  });

  describe("Parameter Updates", () => {
    it("should update frequency safely", async () => {
      const { result } = renderHook(() => useAudioStore());
      const newFrequency = 880;

      act(() => {
        result.current.updateFrequency(newFrequency);
      });

      expect(result.current.audioSettings.frequency.value).toBe(newFrequency);
    });

    it("should clamp frequency to valid range", async () => {
      const { result } = renderHook(() => useAudioStore());

      act(() => {
        result.current.updateFrequency(-100); // Invalid negative frequency
      });

      expect(
        result.current.audioSettings.frequency.value
      ).toBeGreaterThanOrEqual(0.1);

      act(() => {
        result.current.updateFrequency(50000); // Very high frequency
      });

      expect(result.current.audioSettings.frequency.value).toBeLessThanOrEqual(
        25000
      );
    });

    it("should update volume with safety limits", async () => {
      const { result } = renderHook(() => useAudioStore());

      act(() => {
        result.current.updateVolume(-10); // Normal volume
      });

      expect(result.current.audioSettings.volume).toBe(-10);

      act(() => {
        result.current.updateVolume(10); // Very loud volume - should be limited
      });

      expect(result.current.audioSettings.volume).toBeLessThanOrEqual(-6); // Should be capped at -6dB
    });
  });
});
