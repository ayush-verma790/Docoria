"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

interface SignaturePadProps {
  onSignatureChange: (dataUrl: string) => void
}

export function SignaturePad({ onSignatureChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scrollHandler = (e: TouchEvent) => {
        if(e.target === canvas) {
            e.preventDefault()
        }
    }
    
    // Check if passive false is supported to prevent scrolling while signing on mobile
    canvas.addEventListener('touchmove', scrollHandler, { passive: false })

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    return () => {
        canvas.removeEventListener('touchmove', scrollHandler)
    }
  }, [])

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    let clientX, clientY

    if ('touches' in e) {
       clientX = e.touches[0].clientX
       clientY = e.touches[0].clientY
    } else if ('nativeEvent' in e && e.nativeEvent instanceof TouchEvent) {
         clientX = e.nativeEvent.touches?.[0]?.clientX 
         clientY = e.nativeEvent.touches?.[0]?.clientY
    } else {
       clientX = (e as React.MouseEvent).clientX
       clientY = (e as React.MouseEvent).clientY
    }

    // Fallback if undefined (rare but possible in some edge cases)
    if(clientX === undefined || clientY === undefined) return { x: 0, y: 0 }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { x, y } = getCoordinates(e, canvas)

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { x, y } = getCoordinates(e, canvas)

    ctx.lineTo(x, y)
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      onSignatureChange(canvas.toDataURL("image/png"))
    }
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    onSignatureChange("")
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white touch-none">
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair block"
          style={{ touchAction: 'none' }} 
        />
      </div>
      <Button onClick={clear} variant="outline" className="w-full bg-transparent">
        <RotateCcw className="mr-2" size={20} />
        Clear Signature
      </Button>
    </div>
  )
}
