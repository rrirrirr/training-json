// src/hooks/useParticleEffect.ts
"use client"

import { useEffect, useRef, useState, RefObject } from "react"

// --- Color Helper Functions ---

function hexToHSL(hex: string): { h: number; s: number; l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null
  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2
  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return { h: h * 360, s: s, l: l }
}

function hslToHex(h: number, s: number, l: number): string {
  let r: number, g: number, b: number
  h /= 360
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// --- Simulation Classes ---

// Seed point class
class SeedPoint {
  x: number
  y: number
  baseX: number
  baseY: number
  color: string
  angle: number
  phaseOffset: number
  constructor(baseX: number, baseY: number, initialAngle: number, color: string) {
    this.baseX = baseX
    this.baseY = baseY
    this.x = baseX
    this.y = baseY
    this.angle = initialAngle
    this.color = color
    this.phaseOffset = Math.random() * Math.PI * 2
  }
  update(
    time: number,
    textCenterX: number,
    textCenterY: number,
    movementScale: number,
    movementSpeed: number
  ) {
    const currentAngle = time * movementSpeed + this.phaseOffset
    this.x = this.baseX + Math.cos(currentAngle) * movementScale
    this.y = this.baseY + Math.sin(currentAngle) * movementScale
    if (Math.abs(this.x - textCenterX) > 0.01 || Math.abs(this.y - textCenterY) > 0.01) {
      this.angle = Math.atan2(this.y - textCenterY, this.x - textCenterX)
    }
  }
}

// Fractal particle class
class FractalParticle {
  x: number
  y: number
  size: number
  color: string
  targetColor: string
  angle: number
  speed: number
  age: number
  maxAge: number
  parent: FractalParticle | null
  children: FractalParticle[]
  trail: { x: number; y: number }[]
  trailLength: number
  phase: number
  constructor(
    x: number,
    y: number,
    size: number,
    color: string,
    angle: number,
    lifespanMultiplier = 1.0
  ) {
    this.x = x
    this.y = y
    this.size = Math.max(1, size)
    this.color = color
    this.targetColor = color
    this.angle = angle
    this.speed = Math.random() * 0.3 + 0.15
    this.age = 0
    this.maxAge = (80 + Math.random() * 60) * lifespanMultiplier
    this.parent = null
    this.children = []
    this.trail = Array(10).fill({ x, y })
    this.trailLength = Math.floor(Math.random() * 6) + 7
    this.phase = Math.random() * Math.PI * 2
  }
  blendColors(color1: string, color2: string, ratio: number): string {
    if (color1 === color2) return color1
    try {
      const r1 = parseInt(color1.slice(1, 3), 16),
        g1 = parseInt(color1.slice(3, 5), 16),
        b1 = parseInt(color1.slice(5, 7), 16)
      const r2 = parseInt(color2.slice(1, 3), 16),
        g2 = parseInt(color2.slice(3, 5), 16),
        b2 = parseInt(color2.slice(5, 7), 16)
      const r = Math.round(r1 * (1 - ratio) + r2 * ratio),
        g = Math.round(g1 * (1 - ratio) + g2 * ratio),
        b = Math.round(b1 * (1 - ratio) + b2 * ratio)
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
    } catch (e) {
      return color1
    }
  }
  lerpColor(color1: string, color2: string, amount: number): string {
    return this.blendColors(color1, color2, amount)
  }
  hexToRgba(hex: string, alpha: number): string {
    try {
      const r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r},${g},${b},${alpha})`
    } catch (e) {
      return `rgba(255,255,255,${alpha})`
    }
  }
  update(
    time: number,
    textBounds: { x: number; y: number; width: number; height: number },
    flowFieldLookup: (x: number, y: number, time: number) => number
  ) {
    this.trail.unshift({ x: this.x, y: this.y })
    if (this.trail.length > this.trailLength) {
      this.trail.pop()
    }
    const flowAngle = flowFieldLookup(this.x, this.y, time)
    const flowSteeringForce = 0.015
    let angleDiff = flowAngle - this.angle
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
    this.angle += angleDiff * flowSteeringForce
    const centerX = textBounds.x + textBounds.width / 2
    const centerY = textBounds.y + textBounds.height / 2
    const gravityForce = 0.001
    if (Math.abs(this.x - centerX) > 1 || Math.abs(this.y - centerY) > 1) {
      const angleToCenter = Math.atan2(centerY - this.y, centerX - this.x)
      angleDiff = angleToCenter - this.angle
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
      this.angle += angleDiff * gravityForce
    }
    const wobbleFreq1 = 3.0
    const wobbleAmp1 = 0.1
    const wobbleFreq2 = 1.0
    const wobbleAmp2 = 0.2
    const w1 = Math.sin(time * wobbleFreq1 + this.phase) * wobbleAmp1
    const w2 = Math.sin(time * wobbleFreq2 + this.phase * 0.7) * wobbleAmp2
    const currentAngle = this.angle + w1 + w2
    this.x += Math.cos(currentAngle) * this.speed
    this.y += Math.sin(currentAngle) * this.speed
    this.speed *= 0.99
    this.age++
    if (this.color !== this.targetColor) {
      this.color = this.lerpColor(this.color, this.targetColor, 0.05)
    }
    const dx = this.x - centerX
    const dy = this.y - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const maxDistance = Math.max(textBounds.width, textBounds.height) * 1.2 + 40
    if (distance > maxDistance && textBounds.width > 0 && textBounds.height > 0) {
      const targetAngle = Math.atan2(centerY - this.y, centerX - this.x)
      angleDiff = targetAngle - this.angle
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
      const correctionForce = 0.1
      const randomFactor = (Math.random() - 0.5) * 0.2
      this.angle += angleDiff * correctionForce + randomFactor
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    const opacity = Math.max(0, 1 - this.age / this.maxAge)
    if (opacity <= 0) return
    const originalCompositeOperation = ctx.globalCompositeOperation
    ctx.globalCompositeOperation = "lighter"
    const baseGlowSize = this.size * 2.8
    const softGlowSize = baseGlowSize * 1.8
    try {
      const softGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, softGlowSize)
      softGradient.addColorStop(0, this.hexToRgba(this.color, opacity * 0.08))
      softGradient.addColorStop(0.7, this.hexToRgba(this.color, opacity * 0.04))
      softGradient.addColorStop(1, this.hexToRgba(this.color, 0))
      ctx.beginPath()
      ctx.arc(this.x, this.y, softGlowSize, 0, Math.PI * 2)
      ctx.fillStyle = softGradient
      ctx.fill()
    } catch (e) {}
    ctx.globalCompositeOperation = "source-over"
    if (this.trail.length > 1) {
      const trailOpacity = opacity * 0.4
      ctx.beginPath()
      ctx.moveTo(this.trail[0].x, this.trail[0].y)
      for (let i = 1; i < this.trail.length; i++) {
        const xc = (this.trail[i].x + this.trail[i - 1].x) / 2
        const yc = (this.trail[i].y + this.trail[i - 1].y) / 2
        ctx.quadraticCurveTo(this.trail[i - 1].x, this.trail[i - 1].y, xc, yc)
      }
      ctx.strokeStyle = this.hexToRgba(this.color, trailOpacity)
      ctx.lineWidth = Math.max(0.5, this.size * 0.4)
      ctx.lineCap = "round"
      ctx.stroke()
    }
    try {
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, baseGlowSize)
      gradient.addColorStop(0, this.hexToRgba(this.color, opacity * 0.5))
      gradient.addColorStop(0.4, this.hexToRgba(this.color, opacity * 0.25))
      gradient.addColorStop(1, this.hexToRgba(this.color, 0))
      ctx.beginPath()
      ctx.arc(this.x, this.y, baseGlowSize, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
    } catch (e) {
      ctx.beginPath()
      ctx.arc(this.x, this.y, baseGlowSize * 0.8, 0, Math.PI * 2)
      ctx.fillStyle = this.hexToRgba(this.color, opacity * 0.2)
      ctx.fill()
    }
    ctx.beginPath()
    ctx.arc(this.x, this.y, Math.max(0.5, this.size * 0.8), 0, Math.PI * 2)
    ctx.fillStyle = this.hexToRgba(this.color, opacity * 0.95)
    ctx.fill()
  }
}

// Connection class
class Connection {
  particleA: FractalParticle
  particleB: FractalParticle
  strength: number
  constructor(particleA: FractalParticle, particleB: FractalParticle, strength: number) {
    this.particleA = particleA
    this.particleB = particleB
    this.strength = strength
  }
  hexToRgba(hex: string, alpha: number): string {
    try {
      const r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r},${g},${b},${alpha})`
    } catch (e) {
      return `rgba(255,255,255,${alpha})`
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    const opacityA = Math.max(0, 1 - this.particleA.age / this.particleA.maxAge)
    const opacityB = Math.max(0, 1 - this.particleB.age / this.particleB.maxAge)
    const connectionOpacity = Math.min(opacityA, opacityB) * this.strength * 0.7
    if (connectionOpacity < 0.01) return
    const isParentChild =
      this.particleA.parent === this.particleB || this.particleB.parent === this.particleA
    const baseLineWidth = (this.particleA.size + this.particleB.size) * 0.1 * this.strength
    const lineWidth = isParentChild
      ? Math.max(0.4, baseLineWidth * 2.5)
      : Math.max(0.2, baseLineWidth)
    try {
      const gradient = ctx.createLinearGradient(
        this.particleA.x,
        this.particleA.y,
        this.particleB.x,
        this.particleB.y
      )
      const gradOpacity = connectionOpacity * (isParentChild ? 1.1 : 1.0)
      gradient.addColorStop(0, this.hexToRgba(this.particleA.color, Math.min(1.0, gradOpacity)))
      gradient.addColorStop(1, this.hexToRgba(this.particleB.color, Math.min(1.0, gradOpacity)))
      ctx.beginPath()
      ctx.moveTo(this.particleA.x, this.particleA.y)
      if (isParentChild) {
        const midX = (this.particleA.x + this.particleB.x) / 2
        const midY = (this.particleA.y + this.particleB.y) / 2
        const dx = this.particleB.x - this.particleA.x
        const dy = this.particleB.y - this.particleA.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const curveFactor = 0.2
        const perpX = dist > 0 ? (-dy / dist) * dist * curveFactor : 0
        const perpY = dist > 0 ? (dx / dist) * dist * curveFactor : 0
        ctx.quadraticCurveTo(midX + perpX, midY + perpY, this.particleB.x, this.particleB.y)
      } else {
        ctx.lineTo(this.particleB.x, this.particleB.y)
      }
      ctx.strokeStyle = gradient
      ctx.lineWidth = lineWidth
      ctx.stroke()
    } catch (e) {
      ctx.beginPath()
      ctx.moveTo(this.particleA.x, this.particleA.y)
      ctx.lineTo(this.particleB.x, this.particleB.y)
      ctx.strokeStyle = this.hexToRgba(this.particleA.color, connectionOpacity * 0.5)
      ctx.lineWidth = lineWidth
      ctx.stroke()
    }
  }
}

// Fractal Particle System Manager class
class FractalParticleSystem {
  particles: FractalParticle[]
  connections: Connection[]
  seedPoints: SeedPoint[]
  ctx: CanvasRenderingContext2D
  textBounds: { x: number; y: number; width: number; height: number }
  time: number
  colorPalettes: { [key: string]: string[] }
  activePalette: string
  maxParticles: number
  maxConnections: number
  baseSpawnInterval: number
  spawnIntervalRandomness: number
  currentRequiredSpawnInterval: number
  timeSinceLastSpawn: number
  constructor(
    ctx: CanvasRenderingContext2D,
    textBounds: { x: number; y: number; width: number; height: number }
  ) {
    this.ctx = ctx
    this.textBounds = textBounds
    this.particles = []
    this.connections = []
    this.seedPoints = []
    this.time = 0
    this.maxParticles = 200
    this.maxConnections = 500
    this.colorPalettes = {
      warm: ["#ff7e5f", "#feb47b", "#ffac81", "#ff5f40", "#ff9166"],
      cool: ["#5f9ea0", "#66cdaa", "#7fffd4", "#48d1cc", "#40e0d0"],
      vibrant: ["#ff1493", "#ff00ff", "#9370db", "#7b68ee", "#00bfff"],
      fire: ["#FF4500", "#FF8C00", "#FF6347", "#FF0000", "#DC143C"],
      forest: ["#228B22", "#556B2F", "#8FBC8F", "#006400", "#9ACD32"],
      monoBlue: ["#e3f2fd", "#bbdefb", "#90caf9", "#64b5f6", "#42a5f5"],
      monoGreen: ["#e8f5e9", "#c8e6c9", "#a5d6a7", "#81c784", "#66bb6a"],
      purpleDream: ["#e1bee7", "#ce93d8", "#ba68c8", "#ab47bc", "#9c27b0"],
      sunset: ["#fff3e0", "#ffe0b2", "#ffcc80", "#ffb74d", "#ffa726"],
    }
    this.activePalette = "monoBlue"
    this.baseSpawnInterval = 1.0 / 25.0
    this.spawnIntervalRandomness = 0.6
    this.timeSinceLastSpawn = 0
    this.currentRequiredSpawnInterval = this.calculateNextInterval()
    this.initSeedPoints()
  }
  calculateNextInterval(): number {
    const randomMultiplier = 1.0 + (Math.random() - 0.5) * this.spawnIntervalRandomness
    return Math.max(0.001, this.baseSpawnInterval * randomMultiplier)
  }
  updateTextBounds(newBounds: { x: number; y: number; width: number; height: number }) {
    this.textBounds = newBounds
    if (this.seedPoints.length === 0 && newBounds.width > 0 && newBounds.height > 0) {
      this.initSeedPoints()
    }
  }
  initSeedPoints() {
    this.seedPoints = []
    if (!this.textBounds || this.textBounds.width <= 0 || this.textBounds.height <= 0) return
    const { x: textX, y: textY, width: textWidth, height: textHeight } = this.textBounds
    const centerX = textX + textWidth / 2
    const centerY = textY + textHeight / 2
    const numPoints = 25
    const perimeterOffsetScale = 15
    for (let i = 0; i < numPoints; i++) {
      let px = 0,
        py = 0
      const edge = Math.random()
      if (edge < 0.25) {
        px = textX + Math.random() * textWidth
        py = textY
      } else if (edge < 0.5) {
        px = textX + Math.random() * textWidth
        py = textY + textHeight
      } else if (edge < 0.75) {
        px = textX
        py = textY + Math.random() * textHeight
      } else {
        px = textX + textWidth
        py = textY + Math.random() * textHeight
      }
      let angleToCenter = 0
      if (Math.abs(px - centerX) > 0.01 || Math.abs(py - centerY) > 0.01) {
        angleToCenter = Math.atan2(py - centerY, px - centerX)
      }
      const randomOffset = (Math.random() - 0.5) * 2 * perimeterOffsetScale
      const offsetX = Math.cos(angleToCenter) * randomOffset
      const offsetY = Math.sin(angleToCenter) * randomOffset
      const baseX = px + offsetX
      const baseY = py + offsetY
      let initialAngle = 0
      if (Math.abs(baseX - centerX) > 0.01 || Math.abs(baseY - centerY) > 0.01) {
        initialAngle = Math.atan2(baseY - centerY, baseX - centerX)
      }
      this.seedPoints.push(new SeedPoint(baseX, baseY, initialAngle, this.getRandomColor()))
    }
  }
  getRandomColor(): string {
    const palette = this.colorPalettes[this.activePalette]
    if (!palette || palette.length === 0) return "#ffffff"
    return palette[Math.floor(Math.random() * palette.length)]
  }
  blendColors(color1: string, color2: string, ratio: number): string {
    if (color1 === color2) return color1
    try {
      const r1 = parseInt(color1.slice(1, 3), 16),
        g1 = parseInt(color1.slice(3, 5), 16),
        b1 = parseInt(color1.slice(5, 7), 16)
      const r2 = parseInt(color2.slice(1, 3), 16),
        g2 = parseInt(color2.slice(3, 5), 16),
        b2 = parseInt(color2.slice(5, 7), 16)
      const r = Math.round(r1 * (1 - ratio) + r2 * ratio),
        g = Math.round(g1 * (1 - ratio) + g2 * ratio),
        b = Math.round(b1 * (1 - ratio) + b2 * ratio)
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
    } catch (e) {
      return color1
    }
  }
  getFlowAngle(x: number, y: number, time: number): number {
    const scale = 0.003
    const speed = 0.1
    const angle1 = Math.sin(x * scale + time * speed) * Math.PI
    const angle2 = Math.cos(y * scale * 1.5 - time * speed * 0.7) * Math.PI
    const angle3 = Math.sin((x + y) * scale * 0.5 + time * speed * 1.2) * Math.PI
    let combinedAngle = (angle1 + angle2 + angle3) / 3
    combinedAngle += Math.sin(time * 0.03) * 0.5
    return ((combinedAngle + Math.PI) % (Math.PI * 2)) - Math.PI
  }
  update(deltaTime: number) {
    const timeStep = 1 / 60.0
    this.time += timeStep
    if (this.textBounds.width > 0 && this.textBounds.height > 0) {
      const textCenterX = this.textBounds.x + this.textBounds.width / 2
      const textCenterY = this.textBounds.y + this.textBounds.height / 2
      const seedMovementScale = 8
      const seedMovementSpeed = 0.1
      this.seedPoints.forEach((seed) => {
        seed.update(this.time, textCenterX, textCenterY, seedMovementScale, seedMovementSpeed)
      })
    }
    // Palette shifting is enabled
    if (Math.random() < 0.0005) {
      const palettes = Object.keys(this.colorPalettes)
      let newPalette = this.activePalette
      while (newPalette === this.activePalette && palettes.length > 1) {
        newPalette = palettes[Math.floor(Math.random() * palettes.length)]
      }
      this.activePalette = newPalette
      this.seedPoints.forEach((seed) => (seed.color = this.getRandomColor()))
    }
    // Spawning with random interval
    this.timeSinceLastSpawn += deltaTime
    if (
      this.timeSinceLastSpawn >= this.currentRequiredSpawnInterval &&
      this.particles.length < this.maxParticles
    ) {
      this.timeSinceLastSpawn = 0
      this.currentRequiredSpawnInterval = this.calculateNextInterval()
      if (this.seedPoints.length > 0) {
        const seed = this.seedPoints[Math.floor(Math.random() * this.seedPoints.length)]
        const particle = new FractalParticle(
          seed.x,
          seed.y,
          Math.random() * 3 + 4,
          seed.color,
          seed.angle + (Math.random() * 0.5 - 0.25)
        )
        this.particles.push(particle)
      }
    }
    // Update loop with multi-branching and color inheritance
    const nextParticles: FractalParticle[] = []
    const particlesToAdd: FractalParticle[] = []
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i]
      particle.update(this.time, this.textBounds, this.getFlowAngle.bind(this))
      if (particle.age < particle.maxAge) {
        nextParticles.push(particle)
        const branchChance = 0.15
        const branchMinAge = 25
        const branchSpeedThreshold = 0.22
        const branchMinSize = 1.5
        if (
          particle.age > branchMinAge &&
          particle.speed < branchSpeedThreshold &&
          particle.size > branchMinSize &&
          Math.random() < branchChance &&
          this.particles.length + particlesToAdd.length + 1 < this.maxParticles
        ) {
          particle.size *= 0.85
          const angleOffset = Math.PI / 4.0 + (Math.random() - 0.5) * (Math.PI / 6)
          const childSize = particle.size * 0.7
          const childLifespanMultiplier = 0.95
          const childSpeedBoost = 1.8
          const childColor = particle.color
          const angle1 = particle.angle + angleOffset
          const child1 = new FractalParticle(
            particle.x,
            particle.y,
            childSize,
            childColor,
            angle1,
            childLifespanMultiplier
          )
          child1.targetColor = childColor
          child1.speed = Math.max(particle.speed * childSpeedBoost, 0.2)
          child1.parent = particle
          particle.children.push(child1)
          particlesToAdd.push(child1)
          const angle2 = particle.angle - angleOffset
          const child2 = new FractalParticle(
            particle.x,
            particle.y,
            childSize,
            childColor,
            angle2,
            childLifespanMultiplier
          )
          child2.targetColor = childColor
          child2.speed = Math.max(particle.speed * childSpeedBoost, 0.2)
          child2.parent = particle
          particle.children.push(child2)
          particlesToAdd.push(child2)
        }
      }
    }
    this.particles = nextParticles.reverse().concat(particlesToAdd)
    this.updateConnections()
  }
  updateConnections() {
    this.connections = []
    this.particles.forEach((particle) => {
      if (particle.parent && this.particles.includes(particle.parent)) {
        if (
          !this.connections.some(
            (c) =>
              (c.particleA === particle && c.particleB === particle.parent) ||
              (c.particleA === particle.parent && c.particleB === particle)
          )
        ) {
          this.connections.push(new Connection(particle, particle.parent, 1.0))
        }
      }
    })
    const maxDistFactor = 4
    const checkLimit = Math.min(this.particles.length, 200)
    for (let i = 0; i < checkLimit; i++) {
      for (let j = i + 1; j < checkLimit; j++) {
        if (this.connections.length >= this.maxConnections) break
        const particleA = this.particles[i]
        const particleB = this.particles[j]
        if (particleA.parent === particleB || particleB.parent === particleA) continue
        const dx = particleA.x - particleB.x
        const dy = particleA.y - particleB.y
        const distanceSq = dx * dx + dy * dy
        const maxDistance = (particleA.size + particleB.size) * maxDistFactor
        const maxDistanceSq = maxDistance * maxDistance
        if (distanceSq < maxDistanceSq && distanceSq > 0.01) {
          const distance = Math.sqrt(distanceSq)
          const strength = Math.max(0, 1 - distance / maxDistance)
          this.connections.push(new Connection(particleA, particleB, strength * strength))
          this.mergeParticles(particleA, particleB, strength)
        }
      }
      if (this.connections.length >= this.maxConnections) break
    }
  }
  mergeParticles(particleA: FractalParticle, particleB: FractalParticle, strength: number) {
    const influenceAmount = strength * 0.02
    let angleDiff = particleB.angle - particleA.angle
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
    particleA.angle += angleDiff * influenceAmount
    angleDiff = particleA.angle - particleB.angle
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
    particleB.angle += angleDiff * influenceAmount
    if (strength > 0.5 && Math.random() < 0.01) {
      const blendedColor = this.blendColors(particleA.color, particleB.color, 0.5)
      particleA.targetColor = blendedColor
      particleB.targetColor = blendedColor
    }
  }
  draw() {
    const connectionsToDraw = this.connections.slice(0, this.maxConnections)
    connectionsToDraw.forEach((connection) => {
      connection.draw(this.ctx)
    })
    this.particles.forEach((particle) => {
      particle.draw(this.ctx)
    })
  }
}

// --- Reusable Particle Effect Hook ---
// Takes a RefObject pointing to the element to center the effect on
export function useParticleEffect(targetRef: RefObject<HTMLElement | null>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // State to hold the bounds of the target element relative to the canvas
  const [targetBounds, setTargetBounds] = useState({ x: 0, y: 0, width: 0, height: 0 })
  // Refs for internal state of the effect
  const particleSystemRef = useRef<FractalParticleSystem | null>(null)
  const animationRef = useRef<number>()
  const lastTimestampRef = useRef<number>(0)

  // --- Configuration for the effect canvas size ---
  // Fixed size ensures the effect area is consistent
  const CANVAS_WIDTH = 450 // Adjust for desired effect spread around button/title
  const CANVAS_HEIGHT = 150 // Adjust for desired effect spread

  useEffect(() => {
    const canvas = canvasRef.current
    const targetElement = targetRef.current // The button or h1

    // Need both canvas and target element to proceed
    if (!canvas || !targetElement) {
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("Could not get 2D context for particle effect.")
      return
    }

    // --- Calculate Target Bounds relative to Canvas Center ---
    const updateBounds = () => {
      if (!canvas || !targetElement) return
      const targetRect = targetElement.getBoundingClientRect()
      // Note: Canvas position isn't needed because we assume CSS centers it.
      // We calculate bounds assuming the target is centered within the fixed canvas size.
      const newBounds = {
        x: CANVAS_WIDTH / 2 - targetRect.width / 2,
        y: CANVAS_HEIGHT / 2 - targetRect.height / 2,
        width: targetRect.width,
        height: targetRect.height,
      }

      setTargetBounds((prevBounds) => {
        // Only update state if values actually change
        if (
          prevBounds.x !== newBounds.x ||
          prevBounds.y !== newBounds.y ||
          prevBounds.width !== newBounds.width ||
          prevBounds.height !== newBounds.height
        ) {
          return newBounds
        }
        return prevBounds
      })
    }

    // --- Set Fixed Canvas Size ---
    const resizeCanvas = () => {
      if (!canvas) return
      canvas.width = CANVAS_WIDTH
      canvas.height = CANVAS_HEIGHT
      updateBounds() // Update bounds after setting size
    }

    // --- Handle Window Resize ---
    // Recalculate bounds as target element might move relative to viewport
    let resizeTimeout: NodeJS.Timeout | null = null
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        updateBounds()
      }, 100) // Debounce
    }

    resizeCanvas() // Initial setup
    window.addEventListener("resize", handleResize)

    // --- Animation Loop ---
    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === 0) {
        lastTimestampRef.current = timestamp
      } // Init timestamp
      const deltaTime = (timestamp - lastTimestampRef.current) / 1000.0 // Delta time in seconds
      lastTimestampRef.current = timestamp
      const clampedDeltaTime = Math.min(deltaTime, 0.1) // Clamp max delta time

      // Ensure context and canvas are still valid
      if (!ctx || canvas.width <= 0 || canvas.height <= 0) {
        animationRef.current = undefined // Stop animation if canvas/context lost
        return
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height) // Clear canvas

      // Initialize system if needed (and bounds are valid)
      if (!particleSystemRef.current && targetBounds.width > 0 && targetBounds.height > 0) {
        particleSystemRef.current = new FractalParticleSystem(ctx, targetBounds)
      }

      // Update and draw the particle system
      if (particleSystemRef.current) {
        particleSystemRef.current.updateTextBounds(targetBounds) // Update target bounds
        if (particleSystemRef.current.textBounds.width > 0) {
          // Check validity
          particleSystemRef.current.update(clampedDeltaTime) // Update simulation
          particleSystemRef.current.draw() // Draw simulation
        }
      }
      animationRef.current = requestAnimationFrame(animate) // Request next frame
    }

    // Start the animation loop if it's not already running
    if (!animationRef.current) {
      lastTimestampRef.current = 0
      animate(performance.now())
    }

    // --- Cleanup Function ---
    return () => {
      window.removeEventListener("resize", handleResize) // Remove listener
      if (resizeTimeout) clearTimeout(resizeTimeout) // Clear pending resize
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = undefined
      } // Stop animation
      particleSystemRef.current = null // Clear system instance
    }
  }, [targetBounds, targetRef]) // Effect dependencies

  // The hook returns the canvas ref to be attached in the component
  return canvasRef
}
