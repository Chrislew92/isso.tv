import { useCallback, useEffect, useRef, useState } from 'react'
import { getDialogue } from '../content/dialogue/index.js'

const SILENT_VOICE = {
  active: false,
  speaker: null,
  performance: null,
  level: 0,
  mouth: 0,
}

const AMBIENCE_MIX = {
  room: { rain: 0.008, hum: 0.014 },
  hallway: { rain: 0.014, hum: 0.018 },
  awning: { rain: 0.050, hum: 0.008 },
  harbor: { rain: 0.072, hum: 0.006 },
}

const FOOTSTEP_TONE = {
  room: { frequency: 72, duration: 0.12 },
  hallway: { frequency: 118, duration: 0.10 },
  awning: { frequency: 96, duration: 0.11 },
  harbor: { frequency: 82, duration: 0.13 },
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
  const ambienceZone = useRef('room')
  const ambience = useRef({ started: false, master: null, rain: null, hum: null, sources: [] })

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

  const applyAmbienceMix = useCallback((zone = ambienceZone.current, audible = true) => {
    const graph = context.current
    const bed = ambience.current
    if (!graph || !bed.started) return
    const mix = AMBIENCE_MIX[zone] ?? AMBIENCE_MIX.harbor
    const now = graph.currentTime
    bed.master.gain.setTargetAtTime(audible ? 1 : 0, now, 0.12)
    bed.rain.gain.setTargetAtTime(mix.rain, now, 0.75)
    bed.hum.gain.setTargetAtTime(mix.hum, now, 0.9)
  }, [])

  const startAmbience = useCallback((graph) => {
    if (ambience.current.started) return
    const master = graph.createGain()
    const rainGain = graph.createGain()
    const humGain = graph.createGain()
    const highpass = graph.createBiquadFilter()
    const lowpass = graph.createBiquadFilter()
    const hum = graph.createOscillator()
    const noise = graph.createBufferSource()

    master.gain.value = 0
    rainGain.gain.value = 0
    humGain.gain.value = 0
    highpass.type = 'highpass'
    highpass.frequency.value = 520
    highpass.Q.value = 0.22
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 4800
    lowpass.Q.value = 0.15
    hum.type = 'sine'
    hum.frequency.value = 48

    const buffer = graph.createBuffer(1, graph.sampleRate * 3, graph.sampleRate)
    const samples = buffer.getChannelData(0)
    let brown = 0
    for (let index = 0; index < samples.length; index += 1) {
      const white = Math.random() * 2 - 1
      brown = (brown + white * 0.022) / 1.022
      samples[index] = brown * 3.2
    }
    noise.buffer = buffer
    noise.loop = true

    noise.connect(highpass)
    highpass.connect(lowpass)
    lowpass.connect(rainGain)
    rainGain.connect(master)
    hum.connect(humGain)
    humGain.connect(master)
    master.connect(graph.destination)
    noise.start()
    hum.start()

    ambience.current = {
      started: true,
      master,
      rain: rainGain,
      hum: humGain,
      sources: [noise, hum],
    }
    applyAmbienceMix(ambienceZone.current, voiceState.current.enabled !== false)
  }, [applyAmbienceMix])

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
    startAmbience(context.current)
    if (context.current.state === 'suspended') await context.current.resume()
    return context.current
  }, [startAmbience])

  const unlock = useCallback(async () => {
    setEnabled(true)
    voiceState.current.enabled = true
    try {
      await ensureAudioGraph()
      applyAmbienceMix(ambienceZone.current, true)
      setNeedsGesture(false)
      return true
    } catch {
      setNeedsGesture(true)
      return false
    }
  }, [applyAmbienceMix, ensureAudioGraph])

  const setAmbienceZone = useCallback((zone) => {
    ambienceZone.current = zone
    applyAmbienceMix(zone, voiceState.current.enabled !== false)
  }, [applyAmbienceMix])

  const playFootstep = useCallback((zone, intensity = 0.65) => {
    const graph = context.current
    const master = ambience.current.master
    if (!graph || !master || graph.state !== 'running' || voiceState.current.enabled === false) return
    const tone = FOOTSTEP_TONE[zone] ?? FOOTSTEP_TONE.harbor
    const now = graph.currentTime
    const level = Math.min(1, Math.max(0.25, intensity))
    const oscillator = graph.createOscillator()
    const click = graph.createOscillator()
    const bodyGain = graph.createGain()
    const clickGain = graph.createGain()

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(tone.frequency, now)
    oscillator.frequency.exponentialRampToValueAtTime(tone.frequency * 0.56, now + tone.duration)
    click.type = 'square'
    click.frequency.setValueAtTime(tone.frequency * 4.2, now)
    click.frequency.exponentialRampToValueAtTime(tone.frequency * 2.1, now + 0.035)

    bodyGain.gain.setValueAtTime(0.0001, now)
    bodyGain.gain.exponentialRampToValueAtTime(0.027 * level, now + 0.004)
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + tone.duration)
    clickGain.gain.setValueAtTime(0.0001, now)
    clickGain.gain.exponentialRampToValueAtTime(0.0065 * level, now + 0.002)
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038)

    oscillator.connect(bodyGain)
    click.connect(clickGain)
    bodyGain.connect(master)
    clickGain.connect(master)
    oscillator.onended = () => {
      oscillator.disconnect()
      bodyGain.disconnect()
    }
    click.onended = () => {
      click.disconnect()
      clickGain.disconnect()
    }
    oscillator.start(now)
    click.start(now)
    oscillator.stop(now + tone.duration + 0.02)
    click.stop(now + 0.05)
  }, [])

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
      applyAmbienceMix(ambienceZone.current, false)
      stop()
      return false
    }
    return unlock()
  }, [applyAmbienceMix, enabled, stop, unlock])

  useEffect(() => {
    voiceState.current.enabled = enabled
  }, [enabled])

  useEffect(() => () => {
    stop()
    for (const sourceNode of ambience.current.sources) {
      try { sourceNode.stop() } catch { /* already stopped */ }
    }
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
    playFootstep,
    stop,
    setAmbienceZone,
    toggle,
    unlock,
  }
}
