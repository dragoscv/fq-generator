import { vi } from "vitest";

// Mock for Tone.js
const ToneMock = {
  start: vi.fn().mockResolvedValue(undefined),
  getContext: vi.fn(() => ({
    state: "running",
    rawContext: {
      createOscillator: vi.fn(),
      createGain: vi.fn(),
      createAnalyser: vi.fn(),
      destination: {},
      sampleRate: 44100,
    },
  })),
  getTransport: vi.fn(() => ({
    stop: vi.fn(),
  })),
  Oscillator: vi.fn().mockImplementation(() => ({
    frequency: { value: 440 },
    type: "sine",
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    dispose: vi.fn(),
  })),
  Gain: vi.fn().mockImplementation((value = 1) => ({
    gain: { value },
    connect: vi.fn(),
    dispose: vi.fn(),
  })),
  Merge: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    toDestination: vi.fn(),
  })),
  Analyser: vi.fn().mockImplementation(() => ({
    getValue: vi.fn(() => new Float32Array(256)),
  })),
};

export default ToneMock;
