"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

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

      // Add random fluctuation (smaller near the endpoints to ensure accuracy)
      const fluctuationFactor = Math.min(i, hours - 1 - i) / ((hours - 1) / 2)
      const maxFluctuation = Math.abs(valueChange24h) * 0.75 * fluctuationFactor
      const randomFluctuation = (Math.random() * 2 - 1) * maxFluctuation

      // For the first and last points, use exact values
      let value
      if (i === 0) {
        value = startingValue
      } else if (i === hours - 1) {
        value = currentValue
      } else {
        value = baseValue + randomFluctuation
      }

      data.push({
        hour: i,
        value: Math.max(0, value), // Ensure no negative values
        label: `${(24 - i) % 24}:00`,
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
        <div className={`text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"} mb-2`}>
          {formattedChange} (24h)
        </div>
        <div className="h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={false} axisLine={false} tickLine={false} />
              <YAxis domain={["dataMin - 100", "dataMax + 100"]} hide />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
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
