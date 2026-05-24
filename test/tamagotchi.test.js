import assert from 'node:assert/strict';
import test from 'node:test';
import { SaveManager, SAVE_KEY } from '../src/save.js';
import { Tamagotchi } from '../src/tamagotchi.js';

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }

  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }

  setItem(key, value) {
    this.map.set(key, String(value));
  }

  removeItem(key) {
    this.map.delete(key);
  }
}

test('awake stats decay over time', () => {
  const pet = new Tamagotchi('Unit', { hunger: 50, happiness: 50, energy: 50, cleanliness: 50 });

  pet.update(10_000);

  assert.ok(pet.hunger > 50);
  assert.ok(pet.happiness < 50);
  assert.ok(pet.energy < 50);
  assert.ok(pet.cleanliness < 50);
});

test('feed and play apply care tradeoffs', () => {
  const pet = new Tamagotchi('Unit', { hunger: 70, happiness: 40, energy: 70, cleanliness: 80 });

  pet.feed();
  assert.ok(pet.hunger < 70);
  assert.ok(pet.cleanliness < 80);
  assert.ok(pet.achievements.includes('first-feed'));

  const hungerAfterFeed = pet.hunger;
  const energyAfterFeed = pet.energy;
  pet.play();

  assert.ok(pet.happiness > 40);
  assert.ok(pet.hunger > hungerAfterFeed);
  assert.ok(pet.energy < energyAfterFeed);
});

test('evolution follows planned age thresholds', () => {
  const pet = new Tamagotchi('Unit', { ageSeconds: 3599, hunger: 0, health: 100 });

  const result = pet.update(2_000);

  assert.equal(pet.stage, 'teen');
  assert.ok(result.events.some((event) => event.type === 'evolution'));
});

test('filthy pets can get sick', () => {
  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    const pet = new Tamagotchi('Unit', { cleanliness: 10, hunger: 0 });
    pet.update(1_000);
    assert.equal(pet.isSick, true);
  } finally {
    Math.random = originalRandom;
  }
});

test('starvation can kill the pet', () => {
  const pet = new Tamagotchi('Unit', { hunger: 100, health: 100 });

  pet.update(421_000);

  assert.equal(pet.isDead(), true);
  assert.equal(pet.deathCause, 'starvation');
});

test('save manager loads, applies offline time, and recovers corrupt saves', () => {
  const storage = new MemoryStorage();
  const save = new SaveManager(storage);
  const pet = new Tamagotchi('Unit', { hunger: 0, health: 100 });
  const savedAt = 1_700_000_000_000;

  save.save(pet, savedAt);
  const loaded = save.load();
  assert.equal(loaded.pet.name, 'Unit');

  const offline = save.applyOfflineProgress(loaded.pet, savedAt + 5 * 60 * 1000, loaded.lastSavedAt);
  assert.equal(offline.appliedMs, 5 * 60 * 1000);
  assert.ok(loaded.pet.ageSeconds >= 299);

  storage.setItem(SAVE_KEY, '{nope');
  const corrupt = save.load();
  assert.equal(corrupt.pet, null);
  assert.match(corrupt.notification, /glitched/i);
});
