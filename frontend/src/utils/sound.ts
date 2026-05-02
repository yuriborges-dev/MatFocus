import type { IntensityLevel } from "../services/auth"

type SoundLevel = IntensityLevel | "low" | "medium" | "high"

const sounds = {
  success: new Audio("/sounds/success.wav"),
  error: new Audio("/sounds/error.wav"),
  unlock: new Audio("/sounds/unlock.wav"),
  click: new Audio("/sounds/click.wav"),
  levelup: new Audio("/sounds/levelup.wav"),
}

Object.values(sounds).forEach((sound) => {
  sound.preload = "auto"
})

function normalizeSoundLevel(level?: SoundLevel) {
  if (level === "baixo" || level === "low") return "low"
  if (level === "alto" || level === "high") return "high"
  return "medium"
}

function play(audio: HTMLAudioElement, volume: number) {
  const sound = audio.cloneNode(true) as HTMLAudioElement

  sound.volume = volume
  sound.currentTime = 0

  sound.play().catch(() => {})
}

export function playSuccessSound(level?: SoundLevel) {
  const normalizedLevel = normalizeSoundLevel(level)

  if (normalizedLevel === "low") play(sounds.success, 0.25)
  if (normalizedLevel === "medium") play(sounds.success, 0.4)
  if (normalizedLevel === "high") play(sounds.success, 0.6)
}

export function playErrorSound(level?: SoundLevel) {
  const normalizedLevel = normalizeSoundLevel(level)

  if (normalizedLevel === "low") play(sounds.error, 0.2)
  if (normalizedLevel === "medium") play(sounds.error, 0.35)
  if (normalizedLevel === "high") play(sounds.error, 0.5)
}

export function playUnlockSound(level?: SoundLevel) {
  const normalizedLevel = normalizeSoundLevel(level)

  if (normalizedLevel === "low") return

  play(sounds.unlock, normalizedLevel === "medium" ? 0.4 : 0.6)
}

export function playClickSound(level?: SoundLevel) {
  const normalizedLevel = normalizeSoundLevel(level)

  if (normalizedLevel === "low") return

  play(sounds.click, normalizedLevel === "medium" ? 0.25 : 0.35)
}

export function playLevelUpSound(level?: SoundLevel) {
  const normalizedLevel = normalizeSoundLevel(level)

  if (normalizedLevel === "low") return

  play(sounds.levelup, normalizedLevel === "medium" ? 0.45 : 0.65)
}