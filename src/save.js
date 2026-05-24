import { Tamagotchi } from './tamagotchi.js';

export const SAVE_KEY = 'real-retro-tamagotchi.save.v1';
export const SAVE_VERSION = 1;
export const MAX_OFFLINE_MS = 24 * 60 * 60 * 1000;
const OFFLINE_CHUNK_MS = 30 * 1000;

export class SaveManager {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage;
  }

  load() {
    if (!this.storage) {
      return { pet: null, lastSavedAt: null, notification: 'Storage is unavailable.' };
    }

    const raw = this.storage.getItem(SAVE_KEY);
    if (!raw) {
      return { pet: null, lastSavedAt: null, notification: null };
    }

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== SAVE_VERSION || !parsed.pet) {
        throw new Error('Unsupported save file.');
      }

      const pet = Tamagotchi.fromJSON(parsed.pet);
      return {
        pet,
        lastSavedAt: Number(parsed.lastSavedAt) || pet.createdAt,
        notification: null
      };
    } catch {
      this.clear();
      return {
        pet: null,
        lastSavedAt: null,
        notification: 'Save data glitched. A fresh egg is ready.'
      };
    }
  }

  save(pet, now = Date.now()) {
    if (!this.storage || !pet) return false;

    const payload = {
      version: SAVE_VERSION,
      lastSavedAt: now,
      pet: pet.toJSON()
    };

    this.storage.setItem(SAVE_KEY, JSON.stringify(payload));
    return true;
  }

  clear() {
    if (this.storage) {
      this.storage.removeItem(SAVE_KEY);
    }
  }

  applyOfflineProgress(pet, now = Date.now(), lastSavedAt = now) {
    if (!pet || !lastSavedAt || pet.isDead()) {
      return { elapsedMs: 0, appliedMs: 0, capped: false, events: [], notification: null };
    }

    const elapsedMs = Math.max(0, now - Number(lastSavedAt));
    const appliedMs = Math.min(elapsedMs, MAX_OFFLINE_MS);
    let remaining = appliedMs;
    const events = [];

    while (remaining > 0 && !pet.isDead()) {
      const chunk = Math.min(OFFLINE_CHUNK_MS, remaining);
      const result = pet.update(chunk);
      events.push(...result.events);
      remaining -= chunk;
    }

    const capped = elapsedMs > MAX_OFFLINE_MS;
    const notification = appliedMs >= 60 * 1000
      ? `${formatElapsed(appliedMs)} passed while you were away.`
      : null;

    return { elapsedMs, appliedMs, capped, events, notification };
  }
}

export function formatElapsed(ms) {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}
