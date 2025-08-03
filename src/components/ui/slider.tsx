import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: number
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
  trackClassName?: string
  thumbClassName?: string
  showValue?: boolean
  label?: string
  unit?: string
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ 
    className, 
    trackClassName, 
    thumbClassName, 
    value, 
    onChange, 
    min = 0, 
    max = 100, 
    step = 1, 
    showValue = false,
    label,
    unit = "",
    ...props 
  }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false)
    const [localValue, setLocalValue] = React.useState(value || min)
    const trackRef = React.useRef<HTMLDivElement>(null)
    
    React.useEffect(() => {
      setLocalValue(value || min)
    }, [value, min])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value)
      setLocalValue(newValue)
      onChange?.(newValue)
    }

    const updateValueFromPosition = React.useCallback((e: React.MouseEvent | MouseEvent) => {
      if (!trackRef.current) return
      
      const rect = trackRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const newValue = min + percentage * (max - min)
      const steppedValue = Math.round(newValue / step) * step
      
      setLocalValue(steppedValue)
      onChange?.(steppedValue)
    }, [min, max, step, setLocalValue, onChange])

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true)
      updateValueFromPosition(e)
    }

    const handleMouseMove = React.useCallback((e: MouseEvent) => {
      if (isDragging) {
        updateValueFromPosition(e)
      }
    }, [isDragging, updateValueFromPosition])

    const handleMouseUp = React.useCallback(() => {
      setIsDragging(false)
    }, [])

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        }
      }
    }, [isDragging, handleMouseMove, handleMouseUp])

    const percentage = ((localValue - min) / (max - min)) * 100

    return (
      <div className={cn("relative w-full space-y-2", className)}>
        {(label || showValue) && (
          <div className="flex justify-between items-center">
            {label && (
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-sm font-mono text-slate-600 dark:text-slate-400 px-2 py-1 bg-white/50 dark:bg-slate-800/50 rounded-md backdrop-blur-sm">
                {localValue.toFixed(step < 1 ? 2 : 0)}{unit}
              </span>
            )}
          </div>
        )}
        
        <div className="relative">
          {/* Hidden native input for accessibility */}
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue}
            onChange={handleChange}
            className="sr-only"
            {...props}
          />
          
          {/* Custom slider track */}
          <div
            ref={trackRef}
            className={cn(
              "relative h-3 w-full rounded-full cursor-pointer",
              "bg-gradient-to-r from-slate-200/80 to-slate-300/80",
              "dark:from-slate-700/80 dark:to-slate-600/80",
              "backdrop-blur-sm border border-white/20 dark:border-slate-600/30",
              "shadow-inner transition-all duration-200 hover:shadow-md",
              trackClassName
            )}
            onMouseDown={handleMouseDown}
          >
            {/* Progress fill */}
            <div
              className="absolute h-full rounded-full transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
              style={{ width: `${percentage}%` }}
            />
            
            {/* Glowing effect */}
            <div
              className="absolute h-full rounded-full transition-all duration-200 bg-gradient-to-r from-blue-400/30 to-purple-500/30 blur-sm"
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          {/* Custom thumb */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full cursor-grab active:cursor-grabbing",
              "bg-gradient-to-br from-white to-slate-100 dark:from-slate-200 dark:to-slate-300",
              "border-2 border-white/50 dark:border-slate-400/50",
              "shadow-lg backdrop-blur-sm transition-all duration-200",
              "hover:scale-110 hover:shadow-xl",
              isDragging && "scale-110 shadow-xl ring-4 ring-blue-500/30",
              thumbClassName
            )}
            style={{ 
              left: `calc(${percentage}% - 12px)`,
              boxShadow: isDragging 
                ? '0 8px 32px rgba(59, 130, 246, 0.4), 0 0 20px rgba(147, 51, 234, 0.3)' 
                : '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
            onMouseDown={handleMouseDown}
          >
            {/* Inner glow */}
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20" />
          </div>
        </div>
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
