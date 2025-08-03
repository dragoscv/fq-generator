// Type definitions for Tone.js mocks in tests
import { vi } from "vitest";

export interface MockToneContext {
  state: "suspended" | "running" | "closed";
  resume: ReturnType<typeof vi.fn>;
  suspend: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  sampleRate: number;
  rawContext: {
    createOscillator: ReturnType<typeof vi.fn>;
    createGain: ReturnType<typeof vi.fn>;
    createAnalyser: ReturnType<typeof vi.fn>;
    destination: object;
    sampleRate: number;
    baseLatency?: number;
    setSinkId?: ReturnType<typeof vi.fn>;
  };
}

export interface MockToneOscillator {
  frequency: { value: number };
  type: string;
  connect: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  dispose: ReturnType<typeof vi.fn>;
}

export interface MockToneGain {
  gain: { value: number };
  connect: ReturnType<typeof vi.fn>;
  dispose: ReturnType<typeof vi.fn>;
}

export interface MockToneAnalyser {
  getValue: ReturnType<typeof vi.fn>;
}

export interface MockTone {
  context: MockToneContext;
  start: ReturnType<typeof vi.fn>;
  getContext: ReturnType<typeof vi.fn>;
  getTransport: ReturnType<typeof vi.fn>;
  Oscillator: ReturnType<typeof vi.fn>;
  Gain: ReturnType<typeof vi.fn>;
  Analyser: ReturnType<typeof vi.fn>;
}

// Type assertion helpers
export const asMockToneContext = (obj: unknown): MockToneContext =>
  obj as MockToneContext;
export const asMockToneOscillator = (obj: unknown): MockToneOscillator =>
  obj as MockToneOscillator;
export const asMockToneGain = (obj: unknown): MockToneGain =>
  obj as MockToneGain;
export const asMockToneAnalyser = (obj: unknown): MockToneAnalyser =>
  obj as MockToneAnalyser;
export const asMockTone = (obj: unknown): MockTone => obj as MockTone;
