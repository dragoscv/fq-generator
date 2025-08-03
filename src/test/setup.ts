import "@testing-library/jest-dom";
import { afterEach, beforeAll, beforeEach, vi } from "vitest";

// Mock Web Audio API for testing environment
const mockAudioContext = {
  createOscillator: vi.fn(() => ({
    frequency: { value: 440 },
    type: "sine",
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    gain: { value: 0.5 },
    connect: vi.fn(),
  })),
  createAnalyser: vi.fn(() => ({
    fftSize: 2048,
    frequencyBinCount: 1024,
    connect: vi.fn(),
    getByteFrequencyData: vi.fn(),
    getFloatFrequencyData: vi.fn(),
  })),
  destination: {},
  sampleRate: 44100,
  state: "running",
  suspend: vi.fn(),
  resume: vi.fn(),
  close: vi.fn(),
};

const mockToneContext = {
  ...mockAudioContext,
  now: vi.fn(() => 0),
  lookAhead: 0.1,
};

// Mock AudioContext globally
Object.defineProperty(window, "AudioContext", {
  writable: true,
  value: vi.fn(() => mockAudioContext),
});

Object.defineProperty(window, "webkitAudioContext", {
  writable: true,
  value: vi.fn(() => mockAudioContext),
});

// Mock Tone.js
vi.mock("tone", () => ({
  context: mockToneContext,
  Oscillator: vi.fn(() => ({
    frequency: { value: 440 },
    type: "sine",
    start: vi.fn(),
    stop: vi.fn(),
    connect: vi.fn(),
    dispose: vi.fn(),
    volume: { value: -10 },
    state: "stopped",
  })),
  Gain: vi.fn(() => ({
    gain: { value: 0.5 },
    connect: vi.fn(),
    dispose: vi.fn(),
  })),
  Destination: vi.fn(() => ({
    connect: vi.fn(),
  })),
  start: vi.fn(),
  getTransport: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
  })),
}));

// Mock Canvas API
const mockCanvas = {
  getContext: vi.fn(() => ({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    canvas: { width: 300, height: 150 },
  })),
  width: 300,
  height: 150,
};

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: mockCanvas.getContext,
});

// Mock IntersectionObserver
global.IntersectionObserver = class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  root = null;
  rootMargin = "";
  thresholds = [];
  takeRecords = vi.fn(() => []);

  constructor() {}
};

// Mock ResizeObserver
global.ResizeObserver = class MockResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();

  constructor() {}
};

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
  return setTimeout(cb, 16) as unknown as number;
});
global.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id as unknown as NodeJS.Timeout);
});

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

beforeAll(() => {
  // Global test setup
});

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  vi.clearAllTimers();
});
