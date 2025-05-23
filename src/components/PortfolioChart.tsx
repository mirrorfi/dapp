"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

interface PortfolioChartProps {
  currentValue: number
  valueChange24h: number
}

export function PortfolioChart({ currentValue, valueChange24h }: PortfolioChartProps) {
  // Calculate the starting value 24 hours ago
  const startingValue = currentValue - valueChange24h

  // Generate 24 data points (one for each hour) with random fluctuations
  // but ensuring the start and end values match our actual data
  const generateChartData = () => {
    const data = []
    const hours = 24

    // Create random fluctuations that eventually reach our target
    for (let i = 0; i < hours; i++) {
      // Linear progression from start to end value as the base
      const baseValue = startingValue + (valueChange24h * i) / (hours - 1)

      // Add random fluctuation with higher volatility
      const fluctuationFactor = 1.5 // Increased for more volatility
      const maxFluctuation = Math.abs(valueChange24h) * 0.2 * fluctuationFactor

      // Add occasional spikes for more erratic movement
      const spikeChance = Math.random()
      let randomFluctuation = (Math.random() * 2 - 1) * maxFluctuation

      // Add occasional larger spikes (10% chance)
      if (spikeChance > 0.9 && i > 1 && i < hours - 2) {
        randomFluctuation = randomFluctuation * 2.5
      }

      // For the first and last points, use exact values
      let value
      if (i === 0) {
        value = startingValue
      } else if (i === hours - 1) {
        value = currentValue
      } else {
        value = baseValue + randomFluctuation
      }

      // Calculate the hour label based on the current time
      const now = new Date()
      const hour = new Date(now.getTime() - (hours - 1 - i) * 60 * 60 * 1000).getHours()
      const hourLabel = `${hour.toString().padStart(2, "0")}:00`
      // Only show every 4 hours for cleaner x-axis
      const displayLabel = i % 4 === 0 ? hourLabel : ""

      data.push({
        hour: i,
        value: Math.max(0, value), // Ensure no negative values
        label: hourLabel,
        displayLabel: displayLabel,
      })
    }

    return data
  }

  const chartData = generateChartData()
  const isPositive = valueChange24h >= 0
  const formattedChange = valueChange24h.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: "always",
  })

  const percentChange = (valueChange24h / (currentValue - valueChange24h)) * 100
  const formattedPercentChange =
    percentChange.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      signDisplay: "always",
    }) + "%"

  // Format the tooltip value
  const formatTooltipValue = (value: number) => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Format Y-axis ticks
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`
    }
    return `$${value}`
  }

  // Format X-axis ticks to show the correct hour label from chartData
  const formatXAxis = (value: number) => {
    const dataPoint = chartData.find((item) => item.hour === value)
    return dataPoint?.displayLabel || ""
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#171923] p-3 border border-[#2D3748] rounded-md shadow-lg">
          <p className="text-gray-300 text-xs">{payload[0].payload.label}</p>
          <p className="text-white font-medium">{formatTooltipValue(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  // Calculate min and max for Y-axis domain
  const dataMin = Math.min(...chartData.map((item) => item.value))
  const dataMax = Math.max(...chartData.map((item) => item.value))
  const yAxisDomain = [
    Math.floor(dataMin * 0.995), // Slightly below min
    Math.ceil(dataMax * 1.005), // Slightly above max
  ]

  return (
    <Card className="bg-[#171923] border-[#2D3748]/30">
      <CardHeader className="pb-2">
        <CardDescription className="text-gray-400">Portfolio Value (24h)</CardDescription>
        <div className="flex items-baseline gap-2">
          <CardTitle className="text-2xl text-white">
            ${currentValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </CardTitle>
          <span className={`text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {formattedPercentChange}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" opacity={0.3} vertical={false} />
              <XAxis
                dataKey="hour"
                tickFormatter={formatXAxis}
                axisLine={{ stroke: "#2D3748" }}
                tickLine={{ stroke: "#2D3748" }}
                tick={{ fill: "#94A3B8", fontSize: 10 }}
                ticks={[]}
              />
              <YAxis
                domain={yAxisDomain}
                tickFormatter={formatYAxis}
                axisLine={{ stroke: "#2D3748" }}
                tickLine={{ stroke: "#2D3748" }}
                tick={{ fill: "#94A3B8", fontSize: 10 }}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="natural"
                dataKey="value"
                stroke={isPositive ? "#10B981" : "#EF4444"}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
                activeDot={{ r: 6, fill: isPositive ? "#10B981" : "#EF4444", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
