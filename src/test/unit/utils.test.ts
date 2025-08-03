import {
  calculateRMS,
  calculateTHD,
  clampFrequency,
  cn,
  dbToLinear,
  findPeak,
  formatFrequency,
  frequencyToNote,
  generateFrequencySweep,
  linearToDb,
  validateVolumeLevel,
} from "@/lib/utils";
import { describe, expect, it } from "vitest";

describe("Utility Functions - Unit Tests", () => {
  describe("cn (className utility)", () => {
    it("should combine class names correctly", () => {
      expect(cn("base", "additional")).toBe("base additional");
      expect(cn("base", undefined, "conditional")).toBe("base conditional");
      expect(cn("base", false && "hidden", "visible")).toBe("base visible");
    });

    it("should handle empty inputs", () => {
      expect(cn()).toBe("");
      expect(cn("")).toBe("");
      expect(cn(undefined, null, false)).toBe("");
    });
  });

  describe("formatFrequency", () => {
    it("should format frequencies correctly", () => {
      expect(formatFrequency(440)).toBe("440 Hz");
      expect(formatFrequency(1000)).toBe("1.00 kHz");
      expect(formatFrequency(1500)).toBe("1.50 kHz");
      expect(formatFrequency(20000)).toBe("20.0 kHz");
      expect(formatFrequency(50)).toBe("50 Hz");
    });

    it("should handle edge cases", () => {
      expect(formatFrequency(0.1)).toBe("0.1 Hz");
      expect(formatFrequency(999)).toBe("999 Hz");
      expect(formatFrequency(1001)).toBe("1.00 kHz");
      expect(formatFrequency(25000)).toBe("25.0 kHz");
    });
  });

  describe("frequencyToNote", () => {
    it("should convert frequencies to musical notes", () => {
      expect(frequencyToNote(440)).toBe("A4");
      expect(frequencyToNote(261.63)).toBe("C4");
      expect(frequencyToNote(523.25)).toBe("C5");
      expect(frequencyToNote(220)).toBe("A3");
    });

    it("should handle frequencies outside musical range", () => {
      expect(frequencyToNote(20)).toMatch(/[A-G][#b]?[0-9]/);
      expect(frequencyToNote(20000)).toMatch(/[A-G][#b]?[0-9]/);
    });
  });

  describe("dbToLinear", () => {
    it("should convert dB to linear scale correctly", () => {
      expect(dbToLinear(0)).toBeCloseTo(1, 5);
      expect(dbToLinear(-6)).toBeCloseTo(0.5, 2);
      expect(dbToLinear(-20)).toBeCloseTo(0.1, 2);
      expect(dbToLinear(-40)).toBeCloseTo(0.01, 3);
      expect(dbToLinear(6)).toBeCloseTo(2, 1);
    });

    it("should handle extreme values", () => {
      expect(dbToLinear(-100)).toBeCloseTo(0, 5);
      expect(dbToLinear(20)).toBeCloseTo(10, 1);
    });
  });

  describe("linearToDb", () => {
    it("should convert linear to dB scale correctly", () => {
      expect(linearToDb(1)).toBeCloseTo(0, 5);
      expect(linearToDb(0.5)).toBeCloseTo(-6, 1);
      expect(linearToDb(0.1)).toBeCloseTo(-20, 1);
      expect(linearToDb(2)).toBeCloseTo(6, 1);
    });

    it("should handle edge cases", () => {
      expect(linearToDb(0.001)).toBeCloseTo(-60, 1);
      expect(linearToDb(10)).toBeCloseTo(20, 1);
    });

    it("should handle invalid inputs", () => {
      expect(linearToDb(0)).toBe(-Infinity);
      expect(linearToDb(-1)).toBe(NaN);
    });
  });

  describe("clampFrequency", () => {
    it("should clamp frequency within valid range", () => {
      expect(clampFrequency(440)).toBe(440);
      expect(clampFrequency(0.05)).toBe(0.1); // Below minimum
      expect(clampFrequency(30000)).toBe(25000); // Above maximum
      expect(clampFrequency(1000)).toBe(1000);
    });

    it("should handle boundary values", () => {
      expect(clampFrequency(0.1)).toBe(0.1); // Minimum
      expect(clampFrequency(25000)).toBe(25000); // Maximum
    });
  });

  describe("validateVolumeLevel", () => {
    it("should validate volume within safety limits", () => {
      expect(validateVolumeLevel(0.5, 0.8)).toBe(0.5);
      expect(validateVolumeLevel(0.9, 0.8)).toBe(0.8); // Clamped to max
      expect(validateVolumeLevel(0.05, 0.8)).toBe(0.1); // Clamped to min
    });

    it("should handle edge cases", () => {
      expect(validateVolumeLevel(0.8, 0.8)).toBe(0.8); // At maximum
      expect(validateVolumeLevel(0.1, 0.8)).toBe(0.1); // At minimum
    });
  });

  describe("generateFrequencySweep", () => {
    it("should generate frequency sweep correctly", () => {
      const sweep = generateFrequencySweep(100, 1000, 10);

      expect(sweep).toHaveLength(10);
      expect(sweep[0]).toBeCloseTo(100, 1);
      expect(sweep[sweep.length - 1]).toBeCloseTo(1000, 1);

      // Check logarithmic progression
      for (let i = 1; i < sweep.length; i++) {
        expect(sweep[i]).toBeGreaterThan(sweep[i - 1]);
      }
    });

    it("should handle single point sweep", () => {
      const sweep = generateFrequencySweep(440, 440, 1);
      expect(sweep).toEqual([440]);
    });

    it("should handle edge cases", () => {
      const sweep = generateFrequencySweep(20, 20000, 5);
      expect(sweep).toHaveLength(5);
      expect(sweep[0]).toBe(20);
      expect(sweep[4]).toBe(20000);
    });
  });

  describe("calculateRMS", () => {
    it("should calculate RMS correctly", () => {
      const samples = new Float32Array([1, -1, 1, -1]);
      const rms = calculateRMS(samples);
      expect(rms).toBeCloseTo(1, 5);
    });

    it("should handle sine wave approximation", () => {
      const samples = new Float32Array(1000);
      for (let i = 0; i < samples.length; i++) {
        samples[i] = Math.sin((i / samples.length) * 2 * Math.PI);
      }
      const rms = calculateRMS(samples);
      expect(rms).toBeCloseTo(0.707, 2); // 1/√2 for sine wave
    });

    it("should handle zero signal", () => {
      const samples = new Float32Array([0, 0, 0, 0]);
      const rms = calculateRMS(samples);
      expect(rms).toBe(0);
    });
  });

  describe("findPeak", () => {
    it("should find peak value correctly", () => {
      const samples = new Float32Array([0.1, -0.8, 0.6, -0.3]);
      const peak = findPeak(samples);
      expect(peak).toBe(0.8); // Absolute maximum
    });

    it("should handle all positive values", () => {
      const samples = new Float32Array([0.1, 0.5, 0.3, 0.7]);
      const peak = findPeak(samples);
      expect(peak).toBe(0.7);
    });

    it("should handle single value", () => {
      const samples = new Float32Array([0.5]);
      const peak = findPeak(samples);
      expect(peak).toBe(0.5);
    });
  });

  describe("calculateTHD", () => {
    it("should calculate THD for fundamental frequency", () => {
      // Mock FFT data with fundamental at bin 10 and harmonics
      const fftData = new Float32Array(512);
      fftData.fill(-80); // Background noise level
      fftData[10] = -10; // Fundamental (100x stronger)
      fftData[20] = -30; // 2nd harmonic
      fftData[30] = -40; // 3rd harmonic

      const thd = calculateTHD(fftData, 10); // Use bin index directly
      expect(thd).toBeGreaterThan(0);
      expect(thd).toBeLessThan(100); // Should be reasonable percentage
    });

    it("should handle pure tone (low THD)", () => {
      const fftData = new Float32Array(512);
      fftData.fill(-80); // Background noise
      fftData[10] = -10; // Only fundamental, no harmonics

      const thd = calculateTHD(fftData, 10);
      expect(thd).toBeLessThan(1); // Very low THD for pure tone
    });

    it("should handle edge cases", () => {
      const fftData = new Float32Array(512);
      fftData.fill(-80);

      const thd = calculateTHD(fftData, 0); // DC frequency
      expect(thd).toBeGreaterThanOrEqual(0);

      const thdNyquist = calculateTHD(fftData, 255); // Near Nyquist
      expect(thdNyquist).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Integration Tests", () => {
    it("should work together for frequency conversion", () => {
      const frequency = 1500;
      const formatted = formatFrequency(frequency);
      const note = frequencyToNote(frequency);
      const clamped = clampFrequency(frequency);

      expect(formatted).toBe("1.50 kHz");
      expect(note).toMatch(/[A-G][#b]?[0-9]/);
      expect(clamped).toBe(frequency);
    });

    it("should work together for audio analysis", () => {
      const samples = new Float32Array(1024);
      // Generate test signal
      for (let i = 0; i < samples.length; i++) {
        samples[i] = 0.5 * Math.sin((i / samples.length) * 2 * Math.PI * 4); // 4 cycles
      }

      const rms = calculateRMS(samples);
      const peak = findPeak(samples);

      expect(rms).toBeCloseTo(0.5 / Math.sqrt(2), 2);
      expect(peak).toBeCloseTo(0.5, 2);
    });
  });
});
