// Web Audio API 工具
let audioContext: AudioContext | null = null
let analyserNode: AnalyserNode | null = null
let sourceNode: MediaElementAudioSourceNode | null = null

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

export function createAnalyser(): AnalyserNode {
  const ctx = getAudioContext()
  analyserNode = ctx.createAnalyser()
  analyserNode.fftSize = 256
  analyserNode.smoothingTimeConstant = 0.8
  return analyserNode
}

export function connectAudioElement(audio: HTMLAudioElement): AnalyserNode {
  const ctx = getAudioContext()
  const analyser = createAnalyser()

  if (sourceNode) {
    sourceNode.disconnect()
  }

  sourceNode = ctx.createMediaElementSource(audio)
  sourceNode.connect(analyser)
  analyser.connect(ctx.destination)

  return analyser
}

export function getFrequencyData(): Uint8Array {
  if (!analyserNode) return new Uint8Array(128)
  const data = new Uint8Array(analyserNode.frequencyBinCount)
  analyserNode.getByteFrequencyData(data)
  return data
}

export function getTimeDomainData(): Uint8Array {
  if (!analyserNode) return new Uint8Array(128)
  const data = new Uint8Array(analyserNode.frequencyBinCount)
  analyserNode.getByteTimeDomainData(data)
  return data
}

export function resumeContext() {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume()
  }
}

export function closeContext() {
  if (audioContext) {
    audioContext.close()
    audioContext = null
    analyserNode = null
    sourceNode = null
  }
}