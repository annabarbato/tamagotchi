import { formatAge } from './tamagotchi.js';

const LCD = '#9aa673';
const DARK = '#20281a';
const MID = '#4b5635';
const FAINT = '#7d885f';

const FONT = {
  A: ['111', '101', '111', '101', '101'],
  B: ['110', '101', '110', '101', '110'],
  C: ['111', '100', '100', '100', '111'],
  D: ['110', '101', '101', '101', '110'],
  E: ['111', '100', '110', '100', '111'],
  F: ['111', '100', '110', '100', '100'],
  G: ['111', '100', '101', '101', '111'],
  H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'],
  J: ['001', '001', '001', '101', '111'],
  K: ['101', '101', '110', '101', '101'],
  L: ['100', '100', '100', '100', '111'],
  M: ['101', '111', '111', '101', '101'],
  N: ['101', '111', '111', '111', '101'],
  O: ['111', '101', '101', '101', '111'],
  P: ['111', '101', '111', '100', '100'],
  Q: ['111', '101', '101', '111', '001'],
  R: ['110', '101', '110', '101', '101'],
  S: ['111', '100', '111', '001', '111'],
  T: ['111', '010', '010', '010', '010'],
  U: ['101', '101', '101', '101', '111'],
  V: ['101', '101', '101', '101', '010'],
  W: ['101', '101', '111', '111', '101'],
  X: ['101', '101', '010', '101', '101'],
  Y: ['101', '101', '010', '010', '010'],
  Z: ['111', '001', '010', '100', '111'],
  0: ['111', '101', '101', '101', '111'],
  1: ['010', '110', '010', '010', '111'],
  2: ['111', '001', '111', '100', '111'],
  3: ['111', '001', '111', '001', '111'],
  4: ['101', '101', '111', '001', '001'],
  5: ['111', '100', '111', '001', '111'],
  6: ['111', '100', '111', '101', '111'],
  7: ['111', '001', '010', '010', '010'],
  8: ['111', '101', '111', '101', '111'],
  9: ['111', '101', '111', '001', '111'],
  '!': ['010', '010', '010', '000', '010'],
  '?': ['111', '001', '011', '000', '010'],
  '.': ['000', '000', '000', '000', '010'],
  ':': ['000', '010', '000', '010', '000'],
  '-': ['000', '000', '111', '000', '000'],
  '/': ['001', '001', '010', '100', '100'],
  "'": ['010', '010', '000', '000', '000'],
  ' ': ['000', '000', '000', '000', '000']
};

const SPRITES = {
  egg: [
    '...XX...',
    '..XXXX..',
    '.XXXXXX.',
    '.XX..XX.',
    '.XXXXXX.',
    '..XXXX..',
    '...XX...'
  ],
  baby_idle_0: [
    '..X..X..',
    '.XXXXXX.',
    'XX.XX.XX',
    'XXXXXXXX',
    'XXX..XXX',
    '.XXXXXX.',
    '..X..X..',
    '.X....X.'
  ],
  baby_idle_1: [
    '.X....X.',
    '..XXXX..',
    'XX.XX.XX',
    'XXXXXXXX',
    'XXX..XXX',
    '.XXXXXX.',
    '.X.XX.X.',
    '........'
  ],
  baby_eating: [
    '..X..X..',
    '.XXXXXX.',
    'XX.XX.XX',
    'XXX..XXX',
    'XXXXXXXX',
    '.XXXXXX.',
    '..XXXX..',
    '...XX...'
  ],
  teen_idle_0: [
    '.X......X.',
    '..X.XX.X..',
    '.XXXXXXXX.',
    'XX.XXXX.XX',
    'XXXXXXXXXX',
    'XXX....XXX',
    '.XXXXXXXX.',
    '.XX.XX.XX.',
    '..X....X..',
    '.X......X.'
  ],
  teen_idle_1: [
    '..X....X..',
    '.X.XXXX.X.',
    '.XXXXXXXX.',
    'XX.XXXX.XX',
    'XXXXXXXXXX',
    'XXX....XXX',
    '.XXXXXXXX.',
    '..XX..XX..',
    '.X......X.',
    '..........'
  ],
  teen_playing: [
    'X........X',
    '..X.XX.X..',
    '.XXXXXXXX.',
    'XX.XXXX.XX',
    'XXXXXXXXXX',
    'XXX....XXX',
    '.XXXXXXXX.',
    'X.XX..XX.X',
    '..X....X..'
  ],
  adult_idle_0: [
    'X............X',
    '.X..XXXXXX..X.',
    '..XXXXXXXXXX..',
    '.XXX.XXXX.XXX.',
    'XXXXXXXXXXXXXX',
    'XXXX....XXXXXX',
    '.XXXXXXXXXXXX.',
    '..XXX..XXX...',
    '.XX......XX..',
    'XX........XX.'
  ],
  adult_idle_1: [
    '.X..........X.',
    'X...XXXXXX...X',
    '..XXXXXXXXXX..',
    '.XXX.XXXX.XXX.',
    'XXXXXXXXXXXXXX',
    'XXXX....XXXXXX',
    '.XXXXXXXXXXXX.',
    '.XXX....XXX..',
    'XX........XX.',
    '..............'
  ],
  adult_sick: [
    'X............X',
    '.X..XXXXXX..X.',
    '..XXXXXXXXXX..',
    '.XX.X.XX.X.XX.',
    'XXXXXXXXXXXXXX',
    'XXXX....XXXXXX',
    '.XX..XXXX..XX.',
    '..XXX..XXX...',
    '.XX......XX..',
    'XX........XX.'
  ],
  old_idle_0: [
    '..X.........X.',
    '...XXXXXXX....',
    '..XXXXXXXXX...',
    '.XX.X.XX.XX..',
    '.XXXXXXXXXX..',
    '..XX.XX.XX...',
    '...XXXXXX..X.',
    '..XX....XX.X.',
    '.XX......XXX.',
    '.........X...'
  ],
  old_idle_1: [
    '...X.......X..',
    '..XXXXXXX.....',
    '.XXXXXXXXX....',
    '.XX.X.XX.XX...',
    '.XXXXXXXXXX...',
    '...XXXXXX..X..',
    '..XX....XX.X..',
    '.XX......XXX..',
    '..........X...',
    '..............'
  ],
  sleeping: [
    '..........',
    '..XXXXXX..',
    '.XXXXXXXX.',
    'XXXXXXXXXX',
    'XXX....XXX',
    '.XXXXXXXX.',
    '..XXXXXX..'
  ],
  dead: [
    '....XX....',
    '....XX....',
    '..XXXXXX..',
    '....XX....',
    '....XX....',
    '....XX....',
    '..XXXXXX..',
    '.XXXXXXXX.',
    'XXXXXXXXXX'
  ]
};

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
  }

  render({ pet, ui, now = performance.now() }) {
    this._lcd(now, pet);

    if (!pet) {
      this._drawText('PXL PET', 36, 5);
      this._drawMatrix(SPRITES.egg, 42, 20, 2);
      this._drawText('EGG 04', 38, 40);
      this._drawText('TAG?', 42, 50);
      return;
    }

    if (ui?.showStatus) {
      this._statusScreen(pet);
      return;
    }

    this._topLine(pet);
    if (pet.isDead()) {
      this._deadScreen(pet);
    } else {
      this._statStack(pet);
      this._petScene(pet, ui, now);
      this._bottomLine(pet, ui, now);
    }
  }

  _lcd(now, pet) {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = LCD;
    ctx.fillRect(0, 0, 100, 60);

    ctx.fillStyle = 'rgba(32, 40, 26, 0.08)';
    for (let y = Math.floor(now / 160) % 3; y < 60; y += 4) {
      ctx.fillRect(0, y, 100, 1);
    }

    if (pet?.getNeeds().some((need) => ['hungry', 'sick', 'dirty', 'hurt'].includes(need)) && Math.floor(now / 280) % 2 === 0) {
      ctx.fillStyle = 'rgba(32, 40, 26, 0.18)';
      ctx.fillRect(0, 0, 100, 2);
      ctx.fillRect(0, 58, 100, 2);
      ctx.fillRect(0, 0, 2, 60);
      ctx.fillRect(98, 0, 2, 60);
    }
  }

  _topLine(pet) {
    this.ctx.fillStyle = FAINT;
    this.ctx.fillRect(0, 0, 100, 8);
    this._drawText(pet.name, 3, 2, { maxWidth: 40 });
    this._drawText(pet.stage.slice(0, 3), 58, 2, { maxWidth: 17 });
    this._drawText(formatAge(pet.ageSeconds), 78, 2, { maxWidth: 20 });
  }

  _statusScreen(pet) {
    this.ctx.fillStyle = FAINT;
    this.ctx.fillRect(0, 0, 100, 9);
    this._drawText('METER', 3, 2);
    this._drawText(pet.stage, 57, 2, { maxWidth: 38 });
    this._drawText(`AGE ${formatAge(pet.ageSeconds)}`, 3, 12, { maxWidth: 48 });
    this._drawText(`MESS ${pet.poopCount}`, 62, 12, { maxWidth: 34 });

    this._meterRow('NOM', 3, 23, 30, pet.hunger, true);
    this._meterRow('JOY', 3, 31, 30, pet.happiness);
    this._meterRow('BAT', 3, 39, 30, pet.energy);
    this._meterRow('LIF', 3, 47, 30, pet.health);
    this._meterRow('CLN', 55, 47, 21, pet.cleanliness);
  }

  _deadScreen(pet) {
    this._drawMatrix(SPRITES.dead, 40, 20, 2);
    this._drawText('RIP', 44, 42);
    this._drawText((pet.deathCause || 'DEAD').slice(0, 10), 30, 51, { maxWidth: 62 });
  }

  _statStack(pet) {
    const stats = [
      ['N', pet.hunger, true],
      ['J', pet.happiness, false],
      ['B', pet.energy, false],
      ['L', pet.health, false],
      ['W', pet.cleanliness, false]
    ];

    stats.forEach(([label, value, dangerHigh], index) => {
      const y = 12 + index * 8;
      this._drawText(label, 72, y);
      this.ctx.strokeStyle = DARK;
      this.ctx.strokeRect(80, y, 16, 5);
      const width = Math.round(clamp(value) / 100 * 14);
      const danger = dangerHigh ? value > 72 : value < 30;
      this.ctx.fillStyle = danger ? DARK : MID;
      this.ctx.fillRect(81, y + 1, width, 3);
    });
  }

  _petScene(pet, ui, now) {
    const sprite = this._spriteFor(pet, ui, now);
    const scale = pet.stage === 'baby' ? 2 : 2;
    const width = Math.max(...sprite.map((row) => row.length)) * scale;
    const height = sprite.length * scale;
    const bounce = pet.isSleeping ? 0 : Math.floor(now / 420) % 2;
    const x = Math.floor(38 - width / 2);
    const y = Math.floor(27 - height / 2 + bounce);

    this._floor(8, 43, 54);
    this._drawMatrix(sprite, x, y, scale);

    if (pet.isSick) {
      this._drawText('!', Math.min(62, x + width + 2), y);
    }

    if (pet.isSleeping) {
      this._drawText('ZZZ', Math.min(54, x + width - 2), Math.max(10, y - 7));
    }

    for (let i = 0; i < pet.poopCount; i += 1) {
      this._poop(8 + i * 8, 45 + (i % 2));
    }
  }

  _bottomLine(pet, ui, now) {
    const action = ui?.selectedLabel || 'MEAL';
    const message = ui?.message || action;
    const showMessage = ui?.message && now < ui.messageUntil;
    const text = showMessage ? message : `A:${action}`;

    this.ctx.fillStyle = FAINT;
    this.ctx.fillRect(0, 51, 100, 9);
    this._drawText(text, 3, 53, { maxWidth: 94 });

    if (pet.getNeeds().length > 0 && Math.floor(now / 360) % 2 === 0) {
      this._drawText('CALL', 80, 44);
    }
  }

  _spriteFor(pet, ui, now) {
    if (pet.isSleeping) return SPRITES.sleeping;
    if (pet.isSick) return SPRITES.adult_sick;
    if (ui?.action === 'feed') return SPRITES.baby_eating;
    if (ui?.action === 'play') return SPRITES.teen_playing;

    const frame = Math.floor(now / 520) % 2;
    if (pet.stage === 'baby') return SPRITES[`baby_idle_${frame}`];
    if (pet.stage === 'teen') return SPRITES[`teen_idle_${frame}`];
    if (pet.stage === 'adult') return SPRITES[`adult_idle_${frame}`];
    return SPRITES[`old_idle_${frame}`];
  }

  _poop(x, y) {
    this.ctx.fillStyle = DARK;
    this.ctx.fillRect(x + 2, y, 2, 1);
    this.ctx.fillRect(x + 1, y + 1, 4, 1);
    this.ctx.fillRect(x, y + 2, 6, 2);
  }

  _meterRow(label, x, y, width, value, dangerHigh = false) {
    this._drawText(label, x, y, { maxWidth: 18 });
    this.ctx.strokeStyle = DARK;
    this.ctx.strokeRect(x + 21, y, width, 5);
    const fill = Math.round(clamp(value) / 100 * (width - 2));
    const danger = dangerHigh ? value > 72 : value < 30;
    this.ctx.fillStyle = danger ? DARK : MID;
    this.ctx.fillRect(x + 22, y + 1, fill, 3);
  }

  _floor(x, y, width) {
    this.ctx.fillStyle = 'rgba(32, 40, 26, 0.16)';
    for (let i = 0; i < width; i += 4) {
      this.ctx.fillRect(x + i, y + (i % 8 === 0 ? 0 : 1), 2, 1);
    }
  }

  _drawMatrix(matrix, x, y, scale = 1) {
    const ctx = this.ctx;
    matrix.forEach((row, rowIndex) => {
      [...row].forEach((pixel, colIndex) => {
        if (pixel === '.') return;
        ctx.fillStyle = pixel === 'x' ? MID : DARK;
        ctx.fillRect(x + colIndex * scale, y + rowIndex * scale, scale, scale);
      });
    });
  }

  _drawText(text, x, y, options = {}) {
    const scale = options.scale || 1;
    const maxWidth = options.maxWidth || 100;
    let output = String(text || '').toUpperCase();

    while (this._measure(output, scale) > maxWidth && output.length > 0) {
      output = output.slice(0, -1);
    }

    let cursor = x;
    this.ctx.fillStyle = DARK;
    for (const raw of output) {
      const char = FONT[raw] ? raw : '?';
      const glyph = FONT[char];
      glyph.forEach((row, rowIndex) => {
        [...row].forEach((pixel, colIndex) => {
          if (pixel === '1') {
            this.ctx.fillRect(cursor + colIndex * scale, y + rowIndex * scale, scale, scale);
          }
        });
      });
      cursor += (char === ' ' ? 2 : 4) * scale;
    }
  }

  _measure(text, scale = 1) {
    return [...String(text)].reduce((width, char) => width + (char === ' ' ? 2 : 4) * scale, 0);
  }
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}
