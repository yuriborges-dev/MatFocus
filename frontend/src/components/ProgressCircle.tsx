type ProgressCircleProps = {
  value: number
  size?: number
  strokeWidth?: number
  progressColor?: string
  trackColor?: string
  textColor?: string
}

function ProgressCircle({
  value,
  size = 128,
  strokeWidth = 12,
  progressColor = "#79c6a1",
  trackColor = "#e5e7eb",
  textColor = "#1e293b",
}: ProgressCircleProps) {
  const normalizedValue = Math.max(0, Math.min(100, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (circumference * normalizedValue) / 100

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      <span
        className="absolute text-[2rem] font-bold"
        style={{ color: textColor }}
      >
        {normalizedValue}%
      </span>
    </div>
  )
}

export default ProgressCircle