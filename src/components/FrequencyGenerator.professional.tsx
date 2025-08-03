"use client";

import ClientOutputDevice from "@/components/ClientOutputDevice";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatFrequency } from "@/lib/utils";
import { useAudioStore } from "@/store/audioStore";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Headphones,
  Monitor,
  Pause,
  Play,
  Radio,
  Settings,
  Volume2,
  Waves,
  Zap,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

// Professional Glass Card Component
const ProfessionalCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
  glow?: boolean;
  title?: string;
  icon?: React.ReactNode;
}> = ({
  children,
  className = "",
  gradient = false,
  glow = false,
  title,
  icon,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className={`
      backdrop-blur-xl bg-white/5 dark:bg-slate-900/20 
      border border-white/10 dark:border-slate-700/20 
      rounded-3xl shadow-2xl
      ${
        gradient
          ? "bg-gradient-to-br from-white/10 to-white/5 dark:from-slate-800/20 dark:to-slate-900/10"
          : ""
      }
      ${
        glow
          ? "ring-1 ring-blue-500/20 shadow-blue-500/10 dark:shadow-blue-400/10"
          : ""
      }
      ${className}
    `}
  >
    {title && (
      <div className="flex items-center gap-3 p-6 pb-4 border-b border-white/10 dark:border-slate-700/20">
        {icon && (
          <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
          {title}
        </h3>
      </div>
    )}
    <div className={title ? "p-6 pt-4" : "p-6"}>{children}</div>
  </motion.div>
);

// Enhanced Professional Spectrum Analyzer
const ProfessionalSpectrumAnalyzer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { analyserNode, isPlaying, getFrequencyInHz } = useAudioStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !isClient) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high DPI canvas resolution
    const dpr =
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      const width = rect.width;
      const height = rect.height;

      // Professional dark background with subtle gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "rgba(15, 23, 42, 0.95)"); // slate-900
      gradient.addColorStop(0.5, "rgba(30, 41, 59, 0.95)"); // slate-800
      gradient.addColorStop(1, "rgba(51, 65, 85, 0.95)"); // slate-700
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Professional frequency grid
      const frequencies = [
        20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000,
      ];
      const maxFreq = 20000;
      const minFreq = 20;

      // Grid lines
      ctx.strokeStyle = "rgba(148, 163, 184, 0.15)"; // subtle grid
      ctx.lineWidth = 1;

      frequencies.forEach((freq) => {
        const logPos =
          Math.log10(freq / minFreq) / Math.log10(maxFreq / minFreq);
        const x = logPos * width;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height - 50);
        ctx.stroke();

        // Professional frequency labels
        ctx.fillStyle = "#94a3b8"; // slate-400
        ctx.font = '11px "SF Pro Display", system-ui, sans-serif';
        ctx.textAlign = "center";

        const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
        ctx.fillText(label, x, height - 15);
      });

      // dB scale with professional styling
      const dbLevels = [-60, -40, -20, 0];
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
      ctx.font = '10px "SF Mono", monospace';

      dbLevels.forEach((db) => {
        const y = height - 50 - ((db + 60) / 60) * (height - 50);
        ctx.fillText(`${db}dB`, width - 10, y + 3);

        // Horizontal grid lines
        ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width - 60, y);
        ctx.stroke();
      });

      // Enhanced spectrum visualization
      if (analyserNode && isPlaying) {
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteFrequencyData(dataArray);

        // Professional spectrum bars with glow effect
        const barWidth = (width / bufferLength) * 4;
        let x = 0;

        for (let i = 0; i < bufferLength / 4; i++) {
          const barHeight = (dataArray[i] / 255) * (height - 50);

          // Create gradient for each bar
          const barGradient = ctx.createLinearGradient(
            0,
            height - 50,
            0,
            height - 50 - barHeight
          );
          barGradient.addColorStop(0, "rgba(59, 130, 246, 0.8)"); // blue-500
          barGradient.addColorStop(0.5, "rgba(147, 51, 234, 0.8)"); // purple-600
          barGradient.addColorStop(1, "rgba(236, 72, 153, 0.8)"); // pink-500

          ctx.fillStyle = barGradient;
          ctx.fillRect(x, height - 50 - barHeight, barWidth - 1, barHeight);

          x += barWidth;
        }

        // Current frequency indicator
        const currentFreqHz = getFrequencyInHz();
        if (currentFreqHz >= minFreq && currentFreqHz <= maxFreq) {
          const logPos =
            Math.log10(currentFreqHz / minFreq) / Math.log10(maxFreq / minFreq);
          const indicatorX = logPos * width;

          // Glow effect for frequency indicator
          ctx.shadowColor = "#3b82f6";
          ctx.shadowBlur = 20;
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(indicatorX, 0);
          ctx.lineTo(indicatorX, height - 50);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Frequency label with professional styling
          ctx.fillStyle = "#3b82f6";
          ctx.font = 'bold 12px "SF Pro Display", system-ui, sans-serif';
          ctx.textAlign = "center";
          ctx.fillText(formatFrequency(currentFreqHz), indicatorX, 20);
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyserNode, isPlaying, getFrequencyInHz, isClient]);

  if (!isClient) {
    return (
      <div className="w-full h-80 rounded-2xl border border-white/10 dark:border-slate-700/20 bg-slate-900/50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">
            Loading spectrum analyzer...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-80 rounded-2xl border border-white/10 dark:border-slate-700/20"
        style={{ background: "transparent" }}
      />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-2xl backdrop-blur-sm">
          <div className="text-center">
            <Activity className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">
              Start audio to view spectrum
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Professional Component
export default function ProfessionalFrequencyGenerator() {
  const {
    audioSettings,
    isPlaying,
    isInitialized,
    // analyserNode,
    // availableOutputDevices,
    // selectedOutputDevice,
    safetySettings,
    initializeAudio,
    updateFrequency,
    updateVolume,
    updateWaveform,
    toggleChannel,
    startTone,
    stopTone,
    emergencyStop,
    loadOutputDevices,
    // selectOutputDevice,
    getFrequencyInHz,
  } = useAudioStore();

  const [frequencyInput, setFrequencyInput] = useState(
    audioSettings.frequency.value.toString()
  );
  const [frequencyUnitState, setFrequencyUnit] = useState(
    audioSettings.frequency.unit
  );
  // const [finetuneValue, setFinetuneValue] = useState(0);

  // Initialize audio system on component mount
  useEffect(() => {
    initializeAudio().catch(console.error);
    loadOutputDevices().catch(console.error);
  }, [initializeAudio, loadOutputDevices]);

  // Synchronize local state with store
  useEffect(() => {
    setFrequencyInput(audioSettings.frequency.value.toString());
    setFrequencyUnit(audioSettings.frequency.unit);
  }, [audioSettings.frequency.value, audioSettings.frequency.unit]);

  const handlePlay = async () => {
    try {
      if (isPlaying) {
        stopTone();
      } else {
        if (!isInitialized) {
          await initializeAudio();
        }
        startTone();
      }
    } catch (error) {
      console.error("Error handling play/stop:", error);
    }
  };

  const handleFrequencyChange = (value: string) => {
    setFrequencyInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      updateFrequency(numValue, frequencyUnitState);
    }
  };

  const handleUnitChange = (unit: "Hz" | "kHz") => {
    setFrequencyUnit(unit);
    const numValue = parseFloat(frequencyInput);
    if (!isNaN(numValue) && numValue > 0) {
      updateFrequency(numValue, unit);
    }
  };

  const currentFrequencyHz = getFrequencyInHz();
  const displayFrequency = formatFrequency(currentFrequencyHz);
  const isAudibleRange =
    currentFrequencyHz >= 20 && currentFrequencyHz <= 20000;
  const isWarningRange = currentFrequencyHz < 10 || currentFrequencyHz > 30000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 relative overflow-hidden">
      {/* Professional Background Pattern */}
      <div className="absolute inset-0 opacity-3 dark:opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Professional Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6 mb-12"
          >
            <div className="flex items-center justify-center gap-8">
              <motion.div
                animate={{
                  rotate: isPlaying ? 360 : 0,
                  scale: isPlaying ? 1.02 : 1,
                }}
                transition={{
                  rotate: {
                    duration: 12,
                    repeat: isPlaying ? Infinity : 0,
                    ease: "linear",
                  },
                  scale: { duration: 0.3 },
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
                <div className="relative p-8 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl">
                  <Waves className="w-20 h-20 text-blue-500 dark:text-blue-400" />
                </div>
              </motion.div>

              <div className="text-left">
                <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent leading-tight mb-2">
                  AudioLab Pro
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-2xl font-medium mb-4">
                  Professional Frequency Generator & Audio Analysis Suite
                </p>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
                    📊 1Hz - 50kHz Range
                  </div>
                  <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold">
                    🎛️ Real-time Analysis
                  </div>
                  <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">
                    🔊 Professional Grade
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
              className="flex justify-center"
            >
              <div className="h-1 w-40 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full shadow-lg" />
            </motion.div>
          </motion.header>

          {/* Professional Main Dashboard */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left Sidebar - Controls */}
            <div className="xl:col-span-4 space-y-6">
              {/* Transport Controls */}
              <ProfessionalCard
                title="Transport Controls"
                icon={<Play className="w-5 h-5 text-green-400" />}
                gradient
                glow
              >
                <div className="space-y-4">
                  <Button
                    onClick={handlePlay}
                    size="lg"
                    className={`
                      w-full h-16 text-lg font-semibold transition-all duration-500 
                      ${
                        isPlaying
                          ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg shadow-red-500/25"
                          : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25"
                      }
                      border-0 rounded-2xl backdrop-blur-sm
                    `}
                    disabled={!isInitialized && isPlaying}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-3"
                    >
                      {isPlaying ? (
                        <>
                          <Pause size={24} />
                          Stop Audio
                        </>
                      ) : (
                        <>
                          <Play size={24} />
                          Start Audio
                        </>
                      )}
                    </motion.div>
                  </Button>

                  <Button
                    onClick={emergencyStop}
                    variant="destructive"
                    size="lg"
                    className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-0 rounded-2xl shadow-lg shadow-red-600/25 font-semibold"
                  >
                    <Zap size={20} />
                    Emergency Stop
                  </Button>
                </div>

                {isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 font-semibold text-sm">
                        LIVE AUDIO
                      </span>
                    </div>
                    <p className="text-green-300 text-xs mt-1">
                      {displayFrequency} • {audioSettings.waveform}
                    </p>
                  </motion.div>
                )}
              </ProfessionalCard>

              {/* System Status */}
              <ProfessionalCard
                title="System Status"
                icon={<Monitor className="w-5 h-5 text-blue-400" />}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Audio Engine
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isInitialized
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {isInitialized ? "Ready" : "Initializing..."}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Frequency
                    </span>
                    <span className="text-sm font-mono text-slate-700 dark:text-slate-300 font-semibold">
                      {displayFrequency}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Volume
                    </span>
                    <span className="text-sm font-mono text-slate-700 dark:text-slate-300 font-semibold">
                      {Math.round(audioSettings.volume * 100)}% (
                      {(20 * Math.log10(audioSettings.volume)).toFixed(1)}dB)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Range Status
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        isAudibleRange
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : isWarningRange
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {isAudibleRange
                        ? "Audible"
                        : isWarningRange
                        ? "Warning"
                        : "Ultrasonic"}
                    </span>
                  </div>
                </div>
              </ProfessionalCard>

              {/* Output Device */}
              <ProfessionalCard
                title="Output Device"
                icon={<Headphones className="w-5 h-5 text-purple-400" />}
              >
                <ClientOutputDevice />
              </ProfessionalCard>
            </div>

            {/* Center Column - Spectrum & Frequency */}
            <div className="xl:col-span-5 space-y-6">
              {/* Spectrum Analyzer */}
              <ProfessionalCard
                title="Real-time Spectrum Analyzer"
                icon={<Activity className="w-5 h-5 text-pink-400" />}
                gradient
              >
                <ProfessionalSpectrumAnalyzer />
              </ProfessionalCard>

              {/* Frequency Control */}
              <ProfessionalCard
                title="Frequency Control"
                icon={<Radio className="w-5 h-5 text-blue-400" />}
                glow
              >
                <div className="space-y-6">
                  {/* Main Frequency Display */}
                  <div className="text-center p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200/30 dark:border-blue-700/30">
                    <div className="text-4xl font-bold font-mono text-blue-600 dark:text-blue-400 mb-2">
                      {displayFrequency}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Current Frequency
                    </div>
                  </div>

                  {/* Frequency Input */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={frequencyInput}
                          onChange={(e) =>
                            handleFrequencyChange(e.target.value)
                          }
                          className="w-full p-3 bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-600/30 rounded-xl text-lg font-mono backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                          placeholder="Enter frequency"
                        />
                      </div>
                      <div>
                        <select
                          value={frequencyUnitState}
                          onChange={(e) =>
                            handleUnitChange(e.target.value as "Hz" | "kHz")
                          }
                          className="w-full p-3 bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-600/30 rounded-xl backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                        >
                          <option value="Hz">Hz</option>
                          <option value="kHz">kHz</option>
                        </select>
                      </div>
                    </div>

                    {/* Frequency Slider */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Frequency Adjustment
                      </label>
                      <Slider
                        value={currentFrequencyHz}
                        onChange={(value: number) => {
                          if (value >= 1000) {
                            updateFrequency(value / 1000, "kHz");
                            setFrequencyInput((value / 1000).toFixed(2));
                            setFrequencyUnit("kHz");
                          } else {
                            updateFrequency(value, "Hz");
                            setFrequencyInput(value.toString());
                            setFrequencyUnit("Hz");
                          }
                        }}
                        min={1}
                        max={50000}
                        step={1}
                        showValue={false}
                        className="w-full"
                      />
                    </div>

                    {/* Frequency Warning */}
                    {isWarningRange && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-900/30 dark:to-orange-900/30 rounded-xl border border-red-200/50 dark:border-red-700/50"
                      >
                        <AlertTriangle
                          size={20}
                          className="text-red-600 dark:text-red-400"
                        />
                        <span className="text-sm font-medium text-red-800 dark:text-red-200">
                          {currentFrequencyHz < 10
                            ? "Infrasonic frequency - may not be audible"
                            : "Ultrasonic frequency - use caution"}
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </ProfessionalCard>
            </div>

            {/* Right Sidebar - Audio Controls */}
            <div className="xl:col-span-3 space-y-6">
              {/* Volume Control */}
              <ProfessionalCard
                title="Audio Output"
                icon={<Volume2 className="w-5 h-5 text-green-400" />}
              >
                <div className="space-y-6">
                  <Slider
                    label="Master Volume"
                    value={audioSettings.volume}
                    onChange={(value: number) => updateVolume(value)}
                    min={0.1}
                    max={safetySettings.maxVolume}
                    step={0.01}
                    showValue={true}
                    unit="%"
                    className="space-y-3"
                  />

                  {audioSettings.volume > safetySettings.warningThreshold && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl border border-amber-200/50 dark:border-amber-700/50"
                    >
                      <AlertTriangle
                        size={20}
                        className="text-amber-600 dark:text-amber-400"
                      />
                      <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Hearing protection active
                      </span>
                    </motion.div>
                  )}

                  {/* Channel Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Audio Channels
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={
                          audioSettings.leftChannel ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => toggleChannel("left")}
                        disabled={
                          !audioSettings.leftChannel &&
                          !audioSettings.rightChannel
                        }
                        className={`transition-all duration-200 ${
                          audioSettings.leftChannel
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25"
                            : "hover:bg-blue-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        Left
                      </Button>

                      <Button
                        variant={
                          audioSettings.rightChannel ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => toggleChannel("right")}
                        disabled={
                          !audioSettings.leftChannel &&
                          !audioSettings.rightChannel
                        }
                        className={`transition-all duration-200 ${
                          audioSettings.rightChannel
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25"
                            : "hover:bg-blue-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        Right
                      </Button>
                    </div>
                  </div>

                  {/* Waveform Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Waveform
                    </label>
                    <select
                      value={audioSettings.waveform}
                      onChange={(e) =>
                        updateWaveform(
                          e.target.value as
                            | "sine"
                            | "square"
                            | "sawtooth"
                            | "triangle"
                        )
                      }
                      className="w-full p-3 bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-600/30 rounded-xl backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                    >
                      <option value="sine">Sine Wave</option>
                      <option value="square">Square Wave</option>
                      <option value="sawtooth">Sawtooth Wave</option>
                      <option value="triangle">Triangle Wave</option>
                    </select>
                  </div>
                </div>
              </ProfessionalCard>

              {/* Quick Presets */}
              <ProfessionalCard
                title="Quick Presets"
                icon={<Settings className="w-5 h-5 text-violet-400" />}
              >
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { freq: 40, label: "Sub Bass", desc: "40Hz" },
                    { freq: 440, label: "A4 Note", desc: "440Hz" },
                    { freq: 1000, label: "Reference", desc: "1kHz" },
                    { freq: 2000, label: "Vocal", desc: "2kHz" },
                    { freq: 8000, label: "Presence", desc: "8kHz" },
                    { freq: 15000, label: "Air", desc: "15kHz" },
                  ].map(({ freq, label, desc }) => (
                    <motion.button
                      key={freq}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        updateFrequency(freq, "Hz");
                        if (freq >= 1000) {
                          setFrequencyInput((freq / 1000).toFixed(2));
                          setFrequencyUnit("kHz");
                        } else {
                          setFrequencyInput(freq.toString());
                          setFrequencyUnit("Hz");
                        }
                        // setFinetuneValue(0);
                      }}
                      className="p-3 bg-gradient-to-br from-white/10 to-white/5 dark:from-slate-800/50 dark:to-slate-900/30 rounded-xl border border-white/20 dark:border-slate-700/30 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 backdrop-blur-sm"
                    >
                      <div className="text-center">
                        <h4 className="font-bold text-slate-800 dark:text-white text-xs">
                          {label}
                        </h4>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-mono">
                          {desc}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </ProfessionalCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
