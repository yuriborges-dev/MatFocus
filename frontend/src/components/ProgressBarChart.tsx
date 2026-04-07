import { useMemo, useState } from "react"

type ProgressBarChartItem = {
  name: string
  correct: number
  wrong: number
}

type ProgressBarChartProps = {
  data: ProgressBarChartItem[]
}

type HoveredBar =
  | {
      type: "correct" | "wrong"
      item: ProgressBarChartItem
      x: number
      y: number
    }
  | null

function ProgressBarChart({ data }: ProgressBarChartProps) {
  const [hoveredBar, setHoveredBar] = useState<HoveredBar>(null)

  const maxValue = Math.max(
    ...data.flatMap((item) => [item.correct, item.wrong]),
    1
  )

  const roundedMax = useMemo(() => {
    if (maxValue <= 5) return 5
    if (maxValue <= 10) return 10
    if (maxValue <= 15) return 15
    if (maxValue <= 20) return 20
    if (maxValue <= 25) return 25
    return Math.ceil(maxValue / 5) * 5
  }, [maxValue])

  const ySteps = 4
  const chartHeight = 240
  const yLabels = Array.from({ length: ySteps + 1 }, (_, index) => {
    return Math.round((roundedMax / ySteps) * (ySteps - index))
  })

  return (
    <div className="rounded-[1.5rem] bg-slate-50 px-5 py-6">
      <div className="relative overflow-x-auto">
        {hoveredBar && (
          <div
            className="pointer-events-none absolute z-20 rounded-2xl bg-white px-4 py-3 shadow-lg ring-1 ring-slate-100"
            style={{
              left: hoveredBar.x,
              top: hoveredBar.y,
              transform: "translate(-50%, -110%)",
            }}
          >
            <p className="text-[1.05rem] font-bold text-slate-800">
              {hoveredBar.item.name}
            </p>
            <p className="mt-2 text-[1rem] font-medium text-[#79c6a1]">
              Acertos: {hoveredBar.item.correct}
            </p>
            <p className="mt-1 text-[1rem] font-medium text-[#ef9a9a]">
              Erros: {hoveredBar.item.wrong}
            </p>
          </div>
        )}

        <div className="flex min-w-[720px] gap-5">
          <div
            className="relative flex shrink-0 flex-col justify-between text-sm font-medium text-slate-400"
            style={{ height: `${chartHeight}px`, width: "42px" }}
          >
            {yLabels.map((label, index) => (
              <span
                key={`${label}-${index}`}
                className="flex h-0 -translate-y-1/2 items-center justify-end"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="relative flex-1">
            <div
              className="relative"
              style={{ height: `${chartHeight}px` }}
            >
              {Array.from({ length: ySteps + 1 }).map((_, index) => {
                const top = (chartHeight / ySteps) * index

                return (
                  <div
                    key={index}
                    className="absolute left-0 right-0 border-t border-dashed border-slate-200"
                    style={{ top }}
                  />
                )
              })}

              <div className="absolute inset-0 flex items-end justify-around gap-10">
                {data.map((item) => {
                  const correctHeight = (item.correct / roundedMax) * chartHeight
                  const wrongHeight = (item.wrong / roundedMax) * chartHeight

                  return (
                    <div
                      key={item.name}
                      className="flex min-w-[180px] flex-col items-center justify-end"
                    >
                      <div
                        className="flex items-end gap-4"
                        style={{ height: `${chartHeight}px` }}
                      >
                        <div className="flex flex-col items-center justify-end">
                          <div
                            className="w-20 rounded-t-[1rem] rounded-b-[0.35rem] bg-[#79c6a1] transition-all duration-300 hover:brightness-105"
                            style={{ height: `${Math.max(correctHeight, 10)}px` }}
                            onMouseEnter={(e) => {
                              const rect =
                                e.currentTarget.parentElement?.parentElement?.parentElement?.getBoundingClientRect()
                              const barRect = e.currentTarget.getBoundingClientRect()

                              if (!rect) return

                              setHoveredBar({
                                type: "correct",
                                item,
                                x: barRect.left - rect.left + barRect.width / 2,
                                y: barRect.top - rect.top,
                              })
                            }}
                            onMouseLeave={() => setHoveredBar(null)}
                          />
                        </div>

                        <div className="flex flex-col items-center justify-end">
                          <div
                            className="w-20 rounded-t-[1rem] rounded-b-[0.35rem] bg-[#ef9a9a] transition-all duration-300 hover:brightness-105"
                            style={{ height: `${Math.max(wrongHeight, 10)}px` }}
                            onMouseEnter={(e) => {
                              const rect =
                                e.currentTarget.parentElement?.parentElement?.parentElement?.getBoundingClientRect()
                              const barRect = e.currentTarget.getBoundingClientRect()

                              if (!rect) return

                              setHoveredBar({
                                type: "wrong",
                                item,
                                x: barRect.left - rect.left + barRect.width / 2,
                                y: barRect.top - rect.top,
                              })
                            }}
                            onMouseLeave={() => setHoveredBar(null)}
                          />
                        </div>
                      </div>

                      <p className="mt-4 text-center text-[1rem] font-semibold text-slate-600">
                        {item.name}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#79c6a1]" />
                Acertos
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#ef9a9a]" />
                Erros
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgressBarChart