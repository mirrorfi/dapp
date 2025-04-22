"use client"

import { useEffect, useRef } from "react"

export function FallbackFlow() {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Create a simple visual representation of nodes
    const createNode = (id: string, label: string, x: number, y: number, type: string) => {
      const nodeEl = document.createElement("div")
      nodeEl.className = `flow-node node-${type}`
      nodeEl.style.left = `${x}px`
      nodeEl.style.top = `${y}px`
      nodeEl.innerHTML = `<div class="custom-node-header">${label}</div>`
      return nodeEl
    }

    // Add nodes
    const nodes = [
      { id: "1", label: "Deposit SOL", x: 50, y: 150, type: "deposit" },
      { id: "2", label: "Stake via Sanctum", x: 300, y: 50, type: "stake" },
      { id: "3", label: "Jupiter Swap", x: 300, y: 250, type: "swap" },
      { id: "4", label: "APR Check", x: 550, y: 150, type: "apr" },
      { id: "5", label: "Yield Distribution", x: 800, y: 150, type: "yield" },
    ]

    // Clear previous content
    canvas.innerHTML = ""

    // Add nodes with a delay to prevent layout thrashing
    setTimeout(() => {
      nodes.forEach((node) => {
        canvas.appendChild(createNode(node.id, node.label, node.x, node.y, node.type))
      })

      // Create SVG for connections
      const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      svgEl.setAttribute("width", "100%")
      svgEl.setAttribute("height", "100%")
      svgEl.style.position = "absolute"
      svgEl.style.top = "0"
      svgEl.style.left = "0"
      svgEl.style.pointerEvents = "none"

      // Define marker for arrows
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
      const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker")
      marker.setAttribute("id", "arrowhead")
      marker.setAttribute("markerWidth", "10")
      marker.setAttribute("markerHeight", "7")
      marker.setAttribute("refX", "9")
      marker.setAttribute("refY", "3.5")
      marker.setAttribute("orient", "auto")
      marker.setAttribute("fill", "rgba(59, 130, 246, 0.5)")

      const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
      polygon.setAttribute("points", "0 0, 10 3.5, 0 7")
      marker.appendChild(polygon)
      defs.appendChild(marker)
      svgEl.appendChild(defs)

      // Add connections
      const connections = [
        { source: "1", target: "2" },
        { source: "1", target: "3" },
        { source: "2", target: "4" },
        { source: "3", target: "4" },
        { source: "4", target: "5" },
      ]

      connections.forEach((conn) => {
        const sourceNode = nodes.find((n) => n.id === conn.source)
        const targetNode = nodes.find((n) => n.id === conn.target)

        if (sourceNode && targetNode) {
          const sourceX = sourceNode.x + 150 // Right side of source node
          const sourceY = sourceNode.y + 40 // Middle of source node
          const targetX = targetNode.x // Left side of target node
          const targetY = targetNode.y + 40 // Middle of target node

          const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
          path.setAttribute(
            "d",
            `M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`,
          )
          path.setAttribute("stroke", "rgba(59, 130, 246, 0.5)")
          path.setAttribute("stroke-width", "2")
          path.setAttribute("stroke-dasharray", "5,5")
          path.setAttribute("fill", "none")
          path.setAttribute("marker-end", "url(#arrowhead)")

          svgEl.appendChild(path)
        }
      })

      canvas.appendChild(svgEl)
    }, 100)

    return () => {
      // Clean up
      if (canvas) {
        canvas.innerHTML = ""
      }
    }
  }, [])

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0 bg-background">
        <div
          className="absolute w-full h-full"
          style={{
            backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
            backgroundSize: "16px 16px",
            opacity: 0.2,
          }}
        ></div>
      </div>
      <div ref={canvasRef} className="flow-canvas w-full h-full relative" />

      {/* Tip panel */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-card/80 backdrop-blur-sm p-2 rounded-t-md border border-border border-b-0 z-20">
        <div className="text-xs text-muted-foreground">Tip: Click nodes to select them.</div>
      </div>
    </div>
  )
}
