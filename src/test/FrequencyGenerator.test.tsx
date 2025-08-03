import FrequencyGenerator from "@/components/FrequencyGenerator";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock audio store
const mockAudioStore = {
  isInitialized: false,
  isPlaying: false,
  frequency: 440,
  waveform: "sine" as const,
  volume: 0.5,
  leftChannel: true,
  rightChannel: true,
  analyzer: null,
  safetySettings: {
    maxVolume: 0.8,
    progressiveIncrease: true,
    emergencyStopEnabled: true,
    volumeWarningThreshold: 0.7,
  },
  initializeAudio: vi.fn(),
  startTone: vi.fn(),
  stopTone: vi.fn(),
  updateFrequency: vi.fn(),
  updateWaveform: vi.fn(),
  updateVolume: vi.fn(),
  toggleChannel: vi.fn(),
  emergencyStop: vi.fn(),
};

// Mock the audio store
vi.mock("@/store/audioStore", () => ({
  useAudioStore: () => mockAudioStore,
}));

describe("FrequencyGenerator - Emergency Audio Fix", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    mockAudioStore.isInitialized = false;
    mockAudioStore.isPlaying = false;
    mockAudioStore.frequency = 440;
  });

  describe("Audio Initialization", () => {
    it("should initialize audio context on user interaction", async () => {
      // Arrange
      mockAudioStore.initializeAudio.mockResolvedValue(undefined);

      render(<FrequencyGenerator />);

      // Act
      const initButton = screen.getByRole("button", {
        name: /initialize audio/i,
      });
      fireEvent.click(initButton);

      // Assert
      await waitFor(() => {
        expect(mockAudioStore.initializeAudio).toHaveBeenCalledTimes(1);
      });
    });

    it("should handle initialization errors gracefully", async () => {
      // Arrange
      const initError = new Error(
        "InvalidAccessError: Audio context initialization failed"
      );
      mockAudioStore.initializeAudio.mockRejectedValue(initError);

      render(<FrequencyGenerator />);

      // Act
      const initButton = screen.getByRole("button", {
        name: /initialize audio/i,
      });
      fireEvent.click(initButton);

      // Assert - Should not crash the component
      await waitFor(() => {
        expect(mockAudioStore.initializeAudio).toHaveBeenCalledTimes(1);
      });

      // Component should still be rendered
      expect(
        screen.getByRole("button", { name: /initialize audio/i })
      ).toBeInTheDocument();
    });
  });

  describe("Audio Playback - Critical Bug Fix", () => {
    beforeEach(() => {
      // Set up initialized state
      mockAudioStore.isInitialized = true;
    });

    it("should start tone playback without InvalidAccessError", async () => {
      // Arrange
      mockAudioStore.startTone.mockResolvedValue(undefined);

      render(<FrequencyGenerator />);

      // Act
      const playButton = screen.getByRole("button", { name: /start/i });
      fireEvent.click(playButton);

      // Assert
      await waitFor(() => {
        expect(mockAudioStore.startTone).toHaveBeenCalledTimes(1);
      });
    });

    it("should handle InvalidAccessError in startTone method", async () => {
      // Arrange - Simulate the exact error from audioStore.ts:165
      const invalidAccessError = new DOMException(
        "The AudioContext was not allowed to start. User gesture is required.",
        "InvalidAccessError"
      );
      mockAudioStore.startTone.mockRejectedValue(invalidAccessError);

      render(<FrequencyGenerator />);

      // Act
      const playButton = screen.getByRole("button", { name: /start/i });
      fireEvent.click(playButton);

      // Assert - Should handle error without crashing
      await waitFor(() => {
        expect(mockAudioStore.startTone).toHaveBeenCalledTimes(1);
      });

      // Component should remain functional
      expect(playButton).toBeInTheDocument();
    });

    it("should stop tone playback correctly", async () => {
      // Arrange
      mockAudioStore.isPlaying = true;
      mockAudioStore.stopTone.mockResolvedValue(undefined);

      render(<FrequencyGenerator />);

      // Act
      const stopButton = screen.getByRole("button", { name: /stop/i });
      fireEvent.click(stopButton);

      // Assert
      await waitFor(() => {
        expect(mockAudioStore.stopTone).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Emergency Stop Functionality", () => {
    it("should execute emergency stop", async () => {
      // Arrange
      mockAudioStore.isPlaying = true;
      mockAudioStore.emergencyStop.mockResolvedValue(undefined);

      render(<FrequencyGenerator />);

      // Act - Find emergency stop button (should be red/danger variant)
      const emergencyButton = screen.getByRole("button", {
        name: /emergency stop/i,
      });
      fireEvent.click(emergencyButton);

      // Assert
      await waitFor(() => {
        expect(mockAudioStore.emergencyStop).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Frequency Control", () => {
    beforeEach(() => {
      mockAudioStore.isInitialized = true;
    });

    it("should update frequency via input field", async () => {
      // Arrange
      mockAudioStore.updateFrequency.mockResolvedValue(undefined);

      render(<FrequencyGenerator />);

      // Act
      const frequencyInput = screen.getByRole("spinbutton", {
        name: /frequency/i,
      });
      fireEvent.change(frequencyInput, { target: { value: "1000" } });

      // Assert
      await waitFor(() => {
        expect(mockAudioStore.updateFrequency).toHaveBeenCalledWith(1000);
      });
    });

    it("should constrain frequency to valid range", async () => {
      // Arrange
      mockAudioStore.updateFrequency.mockResolvedValue(undefined);

      render(<FrequencyGenerator />);

      // Act - Try to set frequency beyond max range
      const frequencyInput = screen.getByRole("spinbutton", {
        name: /frequency/i,
      });
      fireEvent.change(frequencyInput, { target: { value: "50000" } });

      // Assert - Should be clamped to maximum allowed value
      await waitFor(() => {
        expect(mockAudioStore.updateFrequency).toHaveBeenCalledWith(25000); // Assuming 25kHz max
      });
    });
  });

  describe("Volume Safety System", () => {
    beforeEach(() => {
      mockAudioStore.isInitialized = true;
    });

    it("should enforce maximum volume limit", async () => {
      // Arrange
      mockAudioStore.updateVolume.mockResolvedValue(undefined);

      render(<FrequencyGenerator />);

      // Act - Try to set volume above safety limit
      const volumeSlider = screen.getByRole("slider", { name: /volume/i });
      fireEvent.change(volumeSlider, { target: { value: "1.0" } });

      // Assert - Should be limited to safety threshold
      await waitFor(() => {
        expect(mockAudioStore.updateVolume).toHaveBeenCalledWith(0.8); // Safety max
      });
    });

    it("should show volume warning at high levels", () => {
      // Arrange
      mockAudioStore.volume = 0.75; // Above warning threshold

      render(<FrequencyGenerator />);

      // Assert - Should display volume warning
      expect(screen.getByText(/high volume warning/i)).toBeInTheDocument();
    });
  });

  describe("Component Rendering", () => {
    it("should render all essential controls", () => {
      render(<FrequencyGenerator />);

      // Assert all critical UI elements are present
      expect(
        screen.getByRole("button", { name: /initialize audio/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("spinbutton", { name: /frequency/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("slider", { name: /volume/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /emergency stop/i })
      ).toBeInTheDocument();
    });

    it("should show initialization required state", () => {
      mockAudioStore.isInitialized = false;

      render(<FrequencyGenerator />);

      // Assert initialization prompt is shown
      expect(screen.getByText(/initialize audio/i)).toBeInTheDocument();
    });

    it("should show ready state after initialization", () => {
      mockAudioStore.isInitialized = true;

      render(<FrequencyGenerator />);

      // Assert playback controls are available
      expect(
        screen.getByRole("button", { name: /start/i })
      ).toBeInTheDocument();
    });
  });
});
