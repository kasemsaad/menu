import type { NotificationSounds } from "@/types";

let audioCtx: AudioContext | null = null;

export type SoundType = "newOrder" | "urgent" | "success" | "update";

const soundKey: Record<SoundType, keyof NotificationSounds> = {
  newOrder: "newOrder",
  urgent: "urgent",
  success: "success",
  update: "update",
};

let customSounds: NotificationSounds = {};
let volume = 0.85;

const audioCache = new Map<string, HTMLAudioElement>();

export const configureNotificationSounds = (
  sounds?: NotificationSounds,
  soundVolume?: number
) => {
  customSounds = sounds ?? {};
  if (soundVolume != null) volume = Math.max(0, Math.min(1, soundVolume));
};

export const unlockAudio = () => {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") void audioCtx.resume();
};

const getCtx = () => {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
};

const beep = (freq: number, start: number, duration: number, vol = 0.12) => {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol * volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration);
};

const playBuiltin = (type: SoundType) => {
  const ctx = getCtx();
  const t = ctx.currentTime;
  switch (type) {
    case "newOrder":
      beep(880, t, 0.12);
      beep(1100, t + 0.14, 0.18, 0.14);
      break;
    case "urgent":
      beep(520, t, 0.1, 0.16);
      beep(520, t + 0.14, 0.1, 0.16);
      beep(520, t + 0.28, 0.14, 0.16);
      break;
    case "success":
      beep(660, t, 0.1);
      beep(880, t + 0.1, 0.1);
      beep(1040, t + 0.2, 0.2, 0.1);
      break;
    default:
      beep(740, t, 0.15);
      break;
  }
};

const playCustom = async (url: string) => {
  let audio = audioCache.get(url);
  if (!audio) {
    audio = new Audio(url);
    audioCache.set(url, audio);
  }
  audio.volume = volume;
  audio.currentTime = 0;
  await audio.play();
};

export const previewSoundUrl = (url: string) => {
  try {
    unlockAudio();
    void playCustom(url).catch(() => {});
  } catch {
    /* ignore */
  }
};

export const playNotificationSound = (type: SoundType = "update") => {
  try {
    unlockAudio();
    const url = customSounds[soundKey[type]];
    if (url) {
      void playCustom(url).catch(() => playBuiltin(type));
      return;
    }
    playBuiltin(type);
  } catch {
    /* ignore */
  }
};
