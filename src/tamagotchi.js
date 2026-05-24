const DAY_SECONDS = 86400;
const HOUR_SECONDS = 3600;

export const STAGE_LIMITS = [
  { stage: 'baby', minAge: 0 },
  { stage: 'teen', minAge: HOUR_SECONDS },
  { stage: 'adult', minAge: HOUR_SECONDS * 2 },
  { stage: 'old', minAge: HOUR_SECONDS * 4 }
];

const STAGE_TITLES = {
  baby: 'baby',
  teen: 'teen',
  adult: 'adult',
  old: 'old'
};

const PERSONALITY_LINES = {
  hungry: ['NOM light on.', 'Belly empty.', 'Meal? meal?'],
  bored: ['Tap game?', 'No toys here.', 'Button A?'],
  tired: ['Lamp off?', 'Eyes heavy.', 'Battery low.'],
  dirty: ['Room stinks.', 'Bath time.', 'Mess alert.'],
  sick: ['Dose, please.', 'Bad beep.', 'Head hot.'],
  happy: ['Good keeper.', 'Soft beep.', 'Still here.'],
  sleeping: ['Zzz...', 'Tiny dream.', 'Lamp is off.'],
  dead: ['Memory saved.']
};

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}

function numberOr(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function makeId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `pet-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function pick(lines) {
  return lines[Math.floor(Math.random() * lines.length)];
}

export class Tamagotchi {
  constructor(name = 'Pixel', options = {}) {
    const now = numberOr(options.now, Date.now());

    this.id = options.id || makeId();
    this.name = String(name || options.name || 'Pixel').trim().slice(0, 10) || 'Pixel';
    this.createdAt = numberOr(options.createdAt, now);
    this.ageSeconds = clamp(numberOr(options.ageSeconds, 0), 0, Number.MAX_SAFE_INTEGER);
    this.stage = options.stage || this.getStage();
    this.hunger = clamp(numberOr(options.hunger, 50));
    this.happiness = clamp(numberOr(options.happiness, 55));
    this.energy = clamp(numberOr(options.energy, 62));
    this.health = clamp(numberOr(options.health, 100));
    this.cleanliness = clamp(numberOr(options.cleanliness, 72));
    this.poopCount = clamp(numberOr(options.poopCount, 0), 0, 6);
    this.lastFed = options.lastFed || null;
    this.lastPlayed = options.lastPlayed || null;
    this.lastCleaned = options.lastCleaned || null;
    this.lastSlept = options.lastSlept || null;
    this.isSleeping = Boolean(options.isSleeping);
    this.isSick = Boolean(options.isSick);
    this.deathDate = options.deathDate || null;
    this.deathCause = options.deathCause || null;
    this.mode = options.mode === 'hardcore' ? 'hardcore' : 'casual';
    this.achievements = Array.isArray(options.achievements) ? [...new Set(options.achievements)] : [];
    this.poopTimerSeconds = clamp(numberOr(options.poopTimerSeconds, 0), 0, Number.MAX_SAFE_INTEGER);
    this.starvingSeconds = clamp(numberOr(options.starvingSeconds, 0), 0, Number.MAX_SAFE_INTEGER);
    this.sickSeconds = clamp(numberOr(options.sickSeconds, 0), 0, Number.MAX_SAFE_INTEGER);
    this._syncStage();
  }

  update(deltaMs) {
    const events = [];
    if (this.isDead()) {
      return { state: 'dead', events };
    }

    const seconds = clamp(deltaMs / 1000, 0, 3600);
    if (seconds <= 0) {
      return { state: 'alive', events };
    }

    const previousStage = this.stage;
    this.ageSeconds += seconds;
    this._syncStage();

    if (this.stage !== previousStage) {
      events.push({ type: 'evolution', message: `${this.name} grew into a ${STAGE_TITLES[this.stage]}!` });
      this._grant(`evolved-${this.stage}`, events, `${this.name} reached ${this.stage}.`);
      if (this.stage === 'old') {
        this._grant('old-age', events, `${this.name} reached old age.`);
      }
    }

    const rate = seconds;
    if (this.isSleeping) {
      this.energy += 0.16 * rate;
      this.hunger += 0.045 * rate;
      this.happiness -= 0.018 * rate;
      this.cleanliness -= 0.012 * rate;
    } else {
      this.hunger += 0.12 * rate;
      this.energy -= 0.052 * rate;
      this.happiness -= 0.038 * rate;
      this.cleanliness -= 0.022 * rate;
      this.poopTimerSeconds += rate;
    }

    if (!this.isSleeping && this.poopTimerSeconds > 480 + Math.random() * 240 && this.poopCount < 6) {
      this.poopCount += 1;
      this.cleanliness -= 13;
      this.poopTimerSeconds = 0;
      events.push({ type: 'poop', message: `${this.name} left a mess.` });
    }

    if (!this.isSick && this.cleanliness < 35 && Math.random() < 0.0011 * seconds) {
      this.isSick = true;
      this.sickSeconds = 0;
      events.push({ type: 'sick', message: `${this.name} needs a dose.` });
    }

    if (this.hunger > 96) {
      this.starvingSeconds += seconds;
      this.health -= 0.1 * seconds;
    } else {
      this.starvingSeconds = Math.max(0, this.starvingSeconds - seconds * 2);
    }

    if (this.isSick) {
      this.sickSeconds += seconds;
      this.health -= 0.062 * seconds;
    }

    if (this.cleanliness < 15) {
      this.health -= 0.026 * seconds;
    }

    if (this.energy <= 1 && !this.isSleeping) {
      this.health -= 0.026 * seconds;
      this.happiness -= 0.024 * seconds;
    }

    if (this.ageSeconds >= DAY_SECONDS) {
      this._grant('alive-24h', events, `${this.name} lived a whole day.`);
    }

    this._clampStats();

    if (this.starvingSeconds > 420) {
      this.health = 0;
      this._die('starvation', events);
    } else if (this.sickSeconds > 900) {
      this.health = 0;
      this._die('sickness', events);
    } else if (this.health <= 0) {
      this._die('neglect', events);
    }

    return { state: this.isDead() ? 'dead' : 'alive', events };
  }

  feed(now = Date.now()) {
    if (this.isDead()) return this._blocked('It is too late.');
    if (this.isSleeping) return this._blocked(`${this.name} is asleep.`);

    this.hunger = clamp(this.hunger - 28);
    this.happiness = clamp(this.happiness + 4);
    this.cleanliness = clamp(this.cleanliness - 4);
    this.health = clamp(this.health + 2);
    this.lastFed = now;
    this._grant('first-feed');
    return { ok: true, action: 'feed', message: pick(['NOM NOM.', 'Good meal.', 'Crumbs.']) };
  }

  play(now = Date.now()) {
    if (this.isDead()) return this._blocked('It is too late.');
    if (this.isSleeping) return this._blocked(`${this.name} is asleep.`);
    if (this.isSick && Math.random() < 0.45) return this._blocked(`${this.name} feels too sick.`);
    if (this.energy < 10) return this._blocked(`${this.name} is wiped out.`);

    this.happiness = clamp(this.happiness + 32);
    this.energy = clamp(this.energy - 16);
    this.hunger = clamp(this.hunger + 10);
    this.cleanliness = clamp(this.cleanliness - 3);
    this.lastPlayed = now;
    return { ok: true, action: 'play', message: pick(['Nice jump.', 'One more?', 'Tiny win.']) };
  }

  clean(now = Date.now()) {
    if (this.isDead()) return this._blocked('It is too late.');

    this.cleanliness = 100;
    this.poopCount = 0;
    this.poopTimerSeconds = 0;
    this.happiness = clamp(this.happiness - 3);
    this.health = clamp(this.health + 4);
    this.lastCleaned = now;
    return { ok: true, action: 'clean', message: pick(['Room reset.', 'Clean tile.', 'Smells okay.']) };
  }

  toggleSleep(now = Date.now()) {
    if (this.isDead()) return this._blocked('It is too late.');

    this.isSleeping = !this.isSleeping;
    this.lastSlept = now;
    return {
      ok: true,
      action: 'sleep',
      message: this.isSleeping ? pick(['Lamp off.', 'Zzz...', 'Quiet room.']) : pick(['Lamp on.', 'Awake.', 'Blink blink.'])
    };
  }

  medicine(now = Date.now()) {
    if (this.isDead()) return this._blocked('It is too late.');

    if (this.isSick) {
      this.isSick = false;
      this.sickSeconds = 0;
      this.health = clamp(this.health + 26);
      this.lastMedicine = now;
      this._grant('survived-sickness');
      return { ok: true, action: 'medicine', message: pick(['Dose worked.', 'Fever down.', 'Good pulse.']) };
    }

    this.health = clamp(this.health + 5);
    return { ok: true, action: 'medicine', message: pick(['No fever.', 'Dose logged.', 'Steady beep.']) };
  }

  getStage() {
    if (this.ageSeconds < HOUR_SECONDS) return 'baby';
    if (this.ageSeconds < HOUR_SECONDS * 2) return 'teen';
    if (this.ageSeconds < HOUR_SECONDS * 4) return 'adult';
    return 'old';
  }

  getNeeds() {
    if (this.isDead()) return ['dead'];

    const needs = [];
    if (this.isSick) needs.push('sick');
    if (this.hunger >= 72) needs.push('hungry');
    if (this.happiness <= 30) needs.push('bored');
    if (this.energy <= 24) needs.push('tired');
    if (this.cleanliness <= 36 || this.poopCount > 0) needs.push('dirty');
    if (this.health <= 38) needs.push('hurt');
    if (this.isSleeping) needs.push('sleeping');
    return needs;
  }

  getComment() {
    const needs = this.getNeeds();
    if (needs.includes('dead')) return PERSONALITY_LINES.dead[0];
    if (needs.includes('sick')) return pick(PERSONALITY_LINES.sick);
    if (needs.includes('hungry')) return pick(PERSONALITY_LINES.hungry);
    if (needs.includes('dirty')) return pick(PERSONALITY_LINES.dirty);
    if (needs.includes('tired')) return pick(PERSONALITY_LINES.tired);
    if (needs.includes('bored')) return pick(PERSONALITY_LINES.bored);
    if (needs.includes('sleeping')) return pick(PERSONALITY_LINES.sleeping);
    return pick(PERSONALITY_LINES.happy);
  }

  isDead() {
    return Boolean(this.deathDate);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      ageSeconds: this.ageSeconds,
      stage: this.stage,
      hunger: this.hunger,
      happiness: this.happiness,
      energy: this.energy,
      health: this.health,
      cleanliness: this.cleanliness,
      poopCount: this.poopCount,
      lastFed: this.lastFed,
      lastPlayed: this.lastPlayed,
      lastCleaned: this.lastCleaned,
      lastSlept: this.lastSlept,
      isSleeping: this.isSleeping,
      isSick: this.isSick,
      deathDate: this.deathDate,
      deathCause: this.deathCause,
      mode: this.mode,
      achievements: this.achievements,
      poopTimerSeconds: this.poopTimerSeconds,
      starvingSeconds: this.starvingSeconds,
      sickSeconds: this.sickSeconds
    };
  }

  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid Tamagotchi save data.');
    }

    return new Tamagotchi(data.name, data);
  }

  _grant(id, events, message) {
    if (this.achievements.includes(id)) return false;
    this.achievements.push(id);
    if (events && message) {
      events.push({ type: 'achievement', message });
    }
    return true;
  }

  _blocked(message) {
    return { ok: false, action: 'blocked', message };
  }

  _die(cause, events) {
    if (this.deathDate) return;

    this.health = 0;
    this.isSleeping = false;
    this.deathDate = Date.now();
    this.deathCause = cause;
    events.push({ type: 'death', message: `${this.name} died from ${cause}.` });
  }

  _syncStage() {
    this.stage = this.getStage();
  }

  _clampStats() {
    this.hunger = clamp(this.hunger);
    this.happiness = clamp(this.happiness);
    this.energy = clamp(this.energy);
    this.health = clamp(this.health);
    this.cleanliness = clamp(this.cleanliness);
    this.poopCount = clamp(this.poopCount, 0, 6);
  }
}

export function formatAge(ageSeconds) {
  const total = Math.max(0, Math.floor(ageSeconds));
  const days = Math.floor(total / DAY_SECONDS);
  const hours = Math.floor((total % DAY_SECONDS) / HOUR_SECONDS);
  const minutes = Math.floor((total % HOUR_SECONDS) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
