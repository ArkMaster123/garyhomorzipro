'use client'

// React imports
import React, { useRef, useEffect } from 'react'

// Third-party imports
import { Rocket } from 'lucide-react'

import type { FeasibilityCard } from './types'

// Text wrapping helper function
const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeight: number,
  startX: number,
  startY: number,
  indent: number = 0
): number => {
  const words = text.split(' ')
  let line = ''
  let y = startY

  words.forEach((word, index) => {
    const testLine = line + word + ' '
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width

    if (testWidth > maxWidth - (index === 0 ? indent : 0)) {
      ctx.fillText(line, startX + (line === '' ? indent : 0), y)
      line = word + ' '
      y += lineHeight
    } else {
      line = testLine
    }
  })
  
  if (line.trim() !== '') {
    ctx.fillText(line, startX + (line === words[0] + ' ' ? indent : 0), y)
    y += lineHeight
  }

  return y
}

interface DownloadableCardProps {
  card: FeasibilityCard;
  onReady?: (canvas: HTMLCanvasElement) => void;
}

export const DownloadableCard: React.FC<DownloadableCardProps> = ({ card, onReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 1200
    canvas.height = 1600

    // Load and wait for the font
    const loadFonts = async () => {
      await document.fonts.load('700 48px Inter') // Bold
      await document.fonts.load('600 24px Inter') // Semibold
      await document.fonts.load('500 24px Inter') // Medium
      await document.fonts.load('400 18px Inter') // Regular

      // Create sophisticated background with multiple gradients
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      bgGradient.addColorStop(0, '#0B1121')  // Darker navy
      bgGradient.addColorStop(0.4, '#162033') // Mid tone
      bgGradient.addColorStop(1, '#1E293B')   // Slate
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add subtle gradient overlay for depth
      const overlayGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      )
      overlayGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
      overlayGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = overlayGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Load Gary's image
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = "/garyhprofile.png"

      await new Promise((resolve) => {
        img.onload = resolve
      })

      // Draw Gary's image
      ctx.save()
      ctx.beginPath()
      ctx.arc(100, 100, 40, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(img, 60, 60, 80, 80)
      ctx.restore()

      // Draw header with enhanced gradient
      const titleGradient = ctx.createLinearGradient(60, 160, 60, 200)
      titleGradient.addColorStop(0, '#93C5FD')  // blue-300
      titleGradient.addColorStop(0.5, '#60A5FA') // blue-400
      titleGradient.addColorStop(1, '#2DD4BF')   // teal-400
      
      // Add glow effect for title
      ctx.shadowColor = 'rgba(96, 165, 250, 0.3)'
      ctx.shadowBlur = 12
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = titleGradient
      ctx.font = '700 48px Inter'
      ctx.fillText(card.title, 60, 200)
      
      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0

      // Draw categories with rounded corners and proper styling
      let categoryX = 60
      card.categories.forEach((category: string) => {
        const width = ctx.measureText(category).width + 20
        const height = 30
        const radius = 15

        // Add glow effect
        ctx.shadowColor = 'rgba(96, 165, 250, 0.3)'
        ctx.shadowBlur = 8
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        ctx.beginPath()
        ctx.moveTo(categoryX + radius, 240)
        ctx.lineTo(categoryX + width - radius, 240)
        ctx.quadraticCurveTo(categoryX + width, 240, categoryX + width, 240 + radius)
        ctx.lineTo(categoryX + width, 240 + height - radius)
        ctx.quadraticCurveTo(categoryX + width, 240 + height, categoryX + width - radius, 240 + height)
        ctx.lineTo(categoryX + radius, 240 + height)
        ctx.quadraticCurveTo(categoryX, 240 + height, categoryX, 240 + height - radius)
        ctx.lineTo(categoryX, 240 + radius)
        ctx.quadraticCurveTo(categoryX, 240, categoryX + radius, 240)
        ctx.closePath()

        // Fill with gradient
        const categoryGradient = ctx.createLinearGradient(categoryX, 240, categoryX, 270)
        categoryGradient.addColorStop(0, 'rgba(96, 165, 250, 0.25)')  // blue-400 with opacity
        categoryGradient.addColorStop(1, 'rgba(45, 212, 191, 0.25)')  // teal-400 with opacity
        ctx.fillStyle = categoryGradient
        ctx.fill()

        // Add text
        ctx.fillStyle = '#60A5FA'  // blue-400
        ctx.font = '500 18px Inter'
        ctx.fillText(category, categoryX + 10, 260)
        
        categoryX += width + 20
      })

      // Draw description with proper wrapping
      ctx.fillStyle = '#94a3b8'  // slate-400
      ctx.font = '24px Inter'
      const descriptionY = wrapText(
        ctx,
        card.description,
        canvas.width - 120,  // Max width
        36,                  // Line height
        60,                  // Start X
        320                  // Start Y
      )

      // Draw stats with styled boxes
      const stats = [
        { label: 'Market Size', value: card.marketSize.value, detail: card.marketSize.category },
        { label: 'Growth', value: card.growth.value, detail: card.growth.detail },
        { label: 'Competition', value: card.competition.value, detail: card.competition.detail }
      ]

      stats.forEach((stat, index) => {
        const x = 60 + (index * 380)
        const y = 440
        const width = 340
        const height = 140  // Increased height
        const radius = 16
        const padding = 20  // Added padding

        // Draw box with rounded corners
        ctx.beginPath()
        ctx.moveTo(x + radius, y - 60)
        ctx.lineTo(x + width - radius, y - 60)
        ctx.quadraticCurveTo(x + width, y - 60, x + width, y - 60 + radius)
        ctx.lineTo(x + width, y + height - radius - 60)
        ctx.quadraticCurveTo(x + width, y + height - 60, x + width - radius, y + height - 60)
        ctx.lineTo(x + radius, y + height - 60)
        ctx.quadraticCurveTo(x, y + height - 60, x, y + height - radius - 60)
        ctx.lineTo(x, y - 60 + radius)
        ctx.quadraticCurveTo(x, y - 60, x + radius, y - 60)
        ctx.closePath()

        // Add box shadow effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
        ctx.shadowBlur = 16
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 8

        // Fill with gradient
        const boxGradient = ctx.createLinearGradient(x, y - 60, x, y + height - 60)
        boxGradient.addColorStop(0, 'rgba(30, 41, 59, 0.8)')  // slate-800 with opacity
        boxGradient.addColorStop(1, 'rgba(30, 41, 59, 0.6)')  // slate-800 with less opacity
        ctx.fillStyle = boxGradient
        ctx.fill()

        // Add subtle border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.lineWidth = 1
        ctx.stroke()

        // Reset shadow
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0

        // Draw stat value with gradient
        const valueGradient = ctx.createLinearGradient(x, y - 10, x, y + 30)
        valueGradient.addColorStop(0, '#60A5FA')  // blue-400
        valueGradient.addColorStop(1, '#2DD4BF')  // teal-400
        ctx.fillStyle = valueGradient
        ctx.font = 'bold 36px Inter'
        ctx.fillText(stat.value, x + 20, y)

        // Draw label and detail
        ctx.fillStyle = '#94A3B8'  // slate-400
        ctx.font = '500 18px Inter'
        ctx.fillText(stat.label, x + 20, y - 30)
        ctx.fillText(stat.detail, x + 20, y + 30)
      })

      // Draw sections
      const sections = [
        { title: 'Unfair Advantages 💪', items: card.unfairAdvantages },
        { title: 'Victory Blueprint ⚡️', items: card.victoryBlueprint }
      ]

      let sectionY = 560
      sections.forEach((section) => {
        // Create gradient for section headers
        const sectionGradient = ctx.createLinearGradient(60, sectionY - 24, 60, sectionY)
        sectionGradient.addColorStop(0, '#60A5FA')  // blue-400
        sectionGradient.addColorStop(1, '#2DD4BF')  // teal-400
        
        ctx.fillStyle = sectionGradient
        ctx.font = '600 24px Inter'
        ctx.fillText(section.title, 60, sectionY)

        // Add subtle divider
        ctx.beginPath()
        ctx.moveTo(60, sectionY + 10)
        ctx.lineTo(canvas.width - 60, sectionY + 10)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.lineWidth = 1
        ctx.stroke()

        sectionY += 40
        section.items.forEach((item: string) => {
          ctx.fillStyle = '#94a3b8'  // slate-400
          ctx.font = '18px Inter'
          sectionY = wrapText(
            ctx,
            item,
            canvas.width - 100,  // Max width
            24,                  // Line height
            80,                  // Start X (with space for bullet)
            sectionY
          )
          
          // Draw bullet point
          ctx.fillText('•', 60, sectionY - 24)  // Align with first line
          sectionY += 20  // Add spacing between items
        })
        sectionY += 40
      })

      // Draw boss battles
      ctx.fillStyle = '#f8fafc'  // slate-50
      ctx.font = 'bold 24px Inter'
      ctx.fillText('Boss Battles 🔥', 60, sectionY)

      sectionY += 40
      card.bossBattles.forEach((battle: any) => {
        // Draw battle title
        ctx.fillStyle = '#f8fafc'  // slate-50
        ctx.font = 'bold 18px Inter'
        ctx.fillText(`${battle.number}. ${battle.title}`, 60, sectionY)
        sectionY += 30

        // Draw battle description with wrapping
        ctx.fillStyle = '#94a3b8'  // slate-400
        ctx.font = '18px Inter'
        sectionY = wrapText(
          ctx,
          battle.description,
          canvas.width - 160,  // Max width with indent
          24,                  // Line height
          60,                  // Start X
          sectionY,           
          20                   // Indent
        ) + 20                 // Add spacing between battles
      })

      // Draw competitors section
      ctx.fillStyle = '#f8fafc'  // slate-50
      ctx.font = 'bold 24px Inter'
      ctx.fillText('Top 3 Competitors 🎯', 60, sectionY)

      sectionY += 40
      card.competitors.forEach((competitor: any, index: number) => {
        // Draw competitor name
        ctx.fillStyle = '#f8fafc'  // slate-50
        ctx.font = 'bold 18px Inter'
        ctx.fillText(`${index + 1}. ${competitor.name}`, 60, sectionY)
        sectionY += 30

        // Draw competitor reason with wrapping
        ctx.fillStyle = '#94a3b8'  // slate-400
        ctx.font = '18px Inter'
        sectionY = wrapText(
          ctx,
          competitor.reason,
          canvas.width - 160,  // Max width with indent
          24,                  // Line height
          60,                  // Start X
          sectionY,           
          20                   // Indent
        ) + 20                 // Add spacing between competitors
      })

      sectionY += 20  // Add extra spacing before sources

      // Draw sources section for advanced pathway
      console.log('Checking sources section conditions:', {
        pathway: card.pathway,
        hasSources: !!card.sources,
        sourceCount: card.sources?.length
      });
      
      if (card.pathway === 'advanced' && card.sources && card.sources.length > 0) {
        console.log('Drawing sources section with:', card.sources);
        ctx.fillStyle = '#f8fafc'  // slate-50
        ctx.font = 'bold 24px Inter'
        ctx.fillText('Sources 📚', 60, sectionY)

        sectionY += 40
        card.sources.forEach((source: any, index: number) => {
          // Draw source number and title
          ctx.fillStyle = '#f8fafc'  // slate-50
          ctx.font = 'bold 18px Inter'
          ctx.fillText(`${index + 1}. ${source.title}`, 60, sectionY)
          sectionY += 30

          // Draw source URL with gradient
          const urlGradient = ctx.createLinearGradient(80, sectionY - 24, 80, sectionY)
          urlGradient.addColorStop(0, '#60A5FA')  // blue-400
          urlGradient.addColorStop(1, '#2DD4BF')  // teal-400
          ctx.fillStyle = urlGradient
          ctx.font = '16px Inter'
          ctx.fillText(source.url, 80, sectionY)
          sectionY += 40
        })
      }

      // Draw footer
      const footerY = Math.max(canvas.height - 100, sectionY + 60)
      ctx.fillStyle = '#475569'  // slate-600
      ctx.font = '18px Inter'
      ctx.fillText('', 60, footerY)

      ctx.fillStyle = '#2dd4bf'  // teal-400
      ctx.font = 'bold 18px Inter'
      ctx.fillText(`${card.validation.revenue} • ${card.validation.vibe}`, 60, footerY + 30)

      // Notify parent component that canvas is ready
      if (onReady) {
        onReady(canvas)
      }
    }

    loadFonts()
  }, [card, onReady])

  return <canvas ref={canvasRef} className="hidden" />
}

