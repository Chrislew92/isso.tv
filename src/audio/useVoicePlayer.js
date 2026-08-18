import { useCallback, useEffect, useRef, useState } from 'react'
import { getDialogue } from '../content/dialogue/index.js'

const SILENT_VOICE = {
  active: false,
  speaker: null,
  performance: null,
  level: 0,
  mouth: 0,
}

export default function useVoicePlayer() {
  const [caption, setCaption] = useState(null)
  const [active, setActive] = useState(false)
  const [enabled, setEnabled] = useState(true)
  const [needsGesture, setNeedsGesture] = useState(false)
  const voiceState = useRef({ ...SILENT_VOICE })
  const audio = useRef(null)
  const context = useRef(null)
  const analyser = useRef(null)
  const source = useRef(null)
  const animationFrame = useRef(0)
  const captionTimer = useRef(0)
  const finishCurrent = useRef(null)

  const settleCurrent = useCallback((played) => {
    if (finishCurrent.current) {
      finishCurrent.current(played)
      finishCurrent.current = null
    }
  }, [])

  const stop = useCallback((keepCaption = false) => {
    cancelAnimationFrame(animationFrame.current)
    clearTimeout(captionTimer.current)
    if (audio.current) {
      audio.current.onended = null
      audio.current.onerror = null
      audio.current.pause()
      audio.current.removeAttribute('src')
      audio.current.load()
      audio.current = null
    }
    if (source.current) {
      source.current.disconnect()
      source.current = null
    }
    voiceState.current = { ...SILENT_VOICE }
    setActive(false)
    if (!keepCaption) setCaption(null)
    settleCurrent(false)
  }, [settleCurrent])

  const ensureAudioGraph = useCallback(async () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return null
    if (!context.current) {
      context.current = new AudioContext()
      analyser.current = context.current.createAnalyser()
      analyser.current.fftSize = 256
      analyser.current.smoothingTimeConstant = 0.68
      analyser.current.connect(context.current.destination)
    }
    if (context.current.state === 'suspended') await context.current.resume()
    return context.current
  }, [])

  const unlock = useCallback(async () => {
    setEnabled(true)
    voiceState.current.enabled = true
    try {
      await ensureAudioGraph()
      setNeedsGesture(false)
      return true
    } catch {
      setNeedsGesture(true)
      return false
    }
  }, [ensureAudioGraph])

  const play = useCallback(async (id) => {
    const line = getDialogue(id)
    if (!line || !voiceState.current.enabled && !enabled) return false
    stop()
    setCaption(line)
    // A media element can resolve play() yet never emit ended (device handoff,
    // suspended tab, broken decoder). Never let a subtitle become permanent HUD.
    captionTimer.current = window.setTimeout(() => setCaption(null), 6800)

    const element = new Audio(line.audio)
    element.preload = 'auto'
    audio.current = element

    try {
      const graph = await ensureAudioGraph()
      if (graph && analyser.current) {
        source.current = graph.createMediaElementSource(element)
        source.current.connect(analyser.current)
      }

      const result = new Promise((resolve) => {
        finishCurrent.current = resolve
      })

      element.onended = () => {
        cancelAnimationFrame(animationFrame.current)
        voiceState.current = { ...SILENT_VOICE, enabled: true }
        setActive(false)
        clearTimeout(captionTimer.current)
        captionTimer.current = window.setTimeout(() => setCaption(null), 520)
        settleCurrent(true)
      }
      element.onerror = () => {
        setNeedsGesture(false)
        stop(true)
        captionTimer.current = window.setTimeout(() => setCaption(null), 5200)
      }

      await element.play()
      setNeedsGesture(false)
      setActive(true)
      voiceState.current = {
        active: true,
        speaker: line.speaker,
        performance: line.performance,
        level: 0,
        mouth: 0,
        enabled: true,
      }

      const samples = analyser.current ? new Uint8Array(analyser.current.fftSize) : null
      const updateLevel = () => {
        if (!audio.current || audio.current.paused) return
        let target = 0.34
        if (samples && analyser.current) {
          analyser.current.getByteTimeDomainData(samples)
          let sum = 0
          for (const sample of samples) {
            const centered = (sample - 128) / 128
            sum += centered * centered
          }
          const rms = Math.sqrt(sum / samples.length)
          target = Math.min(1, Math.max(0, (rms - 0.012) * 7.4))
        }
        const nextLevel = voiceState.current.level + (target - voiceState.current.level) * 0.42
        voiceState.current.level = nextLevel
        voiceState.current.mouth = line.speaker === '353L' && line.performance !== 'inner' ? nextLevel : 0
        animationFrame.current = requestAnimationFrame(updateLevel)
      }
      animationFrame.current = requestAnimationFrame(updateLevel)
      return result
    } catch (error) {
      console.warn('[ISSO.TV voice] Playback needs a user gesture or failed.', error)
      setNeedsGesture(error?.name === 'NotAllowedError')
      stop(true)
      captionTimer.current = window.setTimeout(() => setCaption(null), 5200)
      return false
    }
  }, [enabled, ensureAudioGraph, settleCurrent, stop])

  const replay = useCallback(async () => {
    if (!caption) return false
    await unlock()
    return play(caption.id)
  }, [caption, play, unlock])

  const toggle = useCallback(async () => {
    if (enabled) {
      setEnabled(false)
      voiceState.current.enabled = false
      stop()
      return false
    }
    return unlock()
  }, [enabled, stop, unlock])

  useEffect(() => {
    voiceState.current.enabled = enabled
  }, [enabled])

  useEffect(() => () => {
    stop()
    context.current?.close()
  }, [stop])

  return {
    active,
    caption,
    enabled,
    needsGesture,
    voiceState,
    play,
    replay,
    stop,
    toggle,
    unlock,
  }
}
