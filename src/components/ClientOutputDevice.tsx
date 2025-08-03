"use client";

import { Button } from "@/components/ui/button";
import { useAudioStore } from "@/store/audioStore";
import { useEffect, useState } from "react";

export default function ClientOutputDevice() {
  const [isClient, setIsClient] = useState(false);
  const {
    availableOutputDevices,
    selectedOutputDevice,
    loadOutputDevices,
    selectOutputDevice,
  } = useAudioStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="text-center py-4">
        <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          Audio Output Device
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Device selection loading...
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/30 dark:border-blue-700/30">
          💡 Using system default output device
        </div>
      </div>
    );
  }

  if (!navigator.mediaDevices) {
    return (
      <div className="text-center py-4">
        <div className="text-sm text-amber-600 dark:text-amber-400 mb-2">
          ⚠️ Device selection unavailable
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          {!window.isSecureContext
            ? "Requires HTTPS in production"
            : "MediaDevices API not supported"}
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/30 dark:border-blue-700/30">
          💡 Using system default output device
        </div>
      </div>
    );
  }

  if (availableOutputDevices.length > 0) {
    return (
      <div className="space-y-3">
        <select
          value={selectedOutputDevice || ""}
          onChange={(e) => {
            if (e.target.value) {
              selectOutputDevice(e.target.value).catch(console.error);
            }
          }}
          className="w-full p-3 bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-600/30 rounded-xl text-sm backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
        >
          <option value="">Select audio device...</option>
          {availableOutputDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Audio Device ${device.deviceId.slice(0, 8)}...`}
            </option>
          ))}
        </select>

        {selectedOutputDevice && (
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/20 p-2 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>
              {availableOutputDevices.find(
                (d) => d.deviceId === selectedOutputDevice
              )?.label || "Selected Device"}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      <Button
        size="sm"
        variant="outline"
        onClick={() => loadOutputDevices().catch(console.error)}
        className="mb-3"
      >
        Refresh Devices
      </Button>
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Grant microphone permission for device labels
      </div>
    </div>
  );
}
