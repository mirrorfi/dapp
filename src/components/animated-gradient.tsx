"use client"

import { useEffect, useRef } from "react"

export function AnimatedGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ["#051937", "#004d7a", "#008793", "#00bf72", "#a8eb12"]
    let step = 0
    const colorIndices = [0, 1, 2, 3]
    const gradientSpeed = 0.002

    function updateGradient() {
      if (!ctx) return

      step += gradientSpeed

      if (step >= 1) {
        step %= 1
        colorIndices[0] = colorIndices[1]
        colorIndices[2] = colorIndices[3]
        colorIndices[1] = (colorIndices[1] + Math.floor(1 + Math.random() * (colors.length - 1))) % colors.length
        colorIndices[3] = (colorIndices[3] + Math.floor(1 + Math.random() * (colors.length - 1))) % colors.length
      }

      const c0 = colors[colorIndices[0]]
      const c1 = colors[colorIndices[1]]
      const c2 = colors[colorIndices[2]]
      const c3 = colors[colorIndices[3]]

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, c0)
      gradient.addColorStop(1, c1)

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const interval = setInterval(updateGradient, 20)

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      clearInterval(interval)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-20 opacity-10" />
}
