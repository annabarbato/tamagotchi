import { Renderer } from './renderer.js';
import { SaveManager } from './save.js';
import { SoundBoard } from './sounds.js';
import { Tamagotchi } from './tamagotchi.js';
import { UIController } from './ui.js';

const canvas = document.querySelector('#screen');
const startPanel = document.querySelector('#startPanel');
const petNameInput = document.querySelector('#petName');
const petTitle = document.querySelector('#petTitle');
const careLog = document.querySelector('#careLog');
const resetButton = document.querySelector('#resetButton');
const statusLight = document.querySelector('#statusLight');

const renderer = new Renderer(canvas);
const sounds = new SoundBoard();
const saveManager = new SaveManager();
const pendingMessages = [];

let pet = null;
let lastFrame = performance.now();
let saveTimer = 0;
let commentTimer = 0;

const loaded = saveManager.load();
if (loaded.notification) pendingMessages.push(loaded.notification);

if (loaded.pet) {
  pet = loaded.pet;
  const offline = saveManager.applyOfflineProgress(pet, Date.now(), loaded.lastSavedAt);
  if (offline.notification) pendingMessages.push(offline.notification);
  pendingMessages.push(...offline.events.map((event) => event.message));
  saveManager.save(pet);
}

const ui = new UIController({
  elements: {
    actionButtons: [...document.querySelectorAll('[data-action]')],
    navButtons: [...document.querySelectorAll('[data-nav]')],
    log: careLog
  },
  sounds,
  onAction: handleAction
});

startPanel.addEventListener('submit', (event) => {
  event.preventDefault();
  if (event.isTrusted) {
    sounds.unlock();
    sounds.play('evolution');
  }

  pet = new Tamagotchi(petNameInput.value || 'Pixel');
  saveManager.save(pet);
  startPanel.classList.add('is-hidden');
  careLog.replaceChildren();
  ui.clearStatus();
  ui.notify(`${pet.name} broke shell.`);
  updateChrome();
});

resetButton.addEventListener('click', (event) => {
  if (event.isTrusted) {
    sounds.unlock();
    sounds.play('button');
  }
  saveManager.clear();
  pet = null;
  careLog.replaceChildren();
  startPanel.classList.remove('is-hidden');
  petNameInput.focus();
  ui.clearStatus();
  ui.notify('New egg loaded.', 1600);
  updateChrome();
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && pet) {
    saveManager.save(pet);
  }
});

window.addEventListener('beforeunload', () => {
  if (pet) saveManager.save(pet);
});

for (const message of pendingMessages) {
  ui.notify(message, 3200);
}

updateChrome();
requestAnimationFrame(loop);

function loop(now) {
  const delta = Math.min(1000, now - lastFrame);
  lastFrame = now;

  if (pet) {
    const result = pet.update(delta);
    handleEvents(result.events);

    saveTimer += delta;
    commentTimer += delta;

    if (commentTimer > 12000 && !ui.hasFreshMessage(now)) {
      ui.notify(pet.getComment(), 2300);
      commentTimer = 0;
    }

    if (saveTimer > 10000) {
      saveManager.save(pet);
      saveTimer = 0;
    }
  }

  updateChrome();
  renderer.render({ pet, ui: ui.getRenderState(now), now });
  requestAnimationFrame(loop);
}

function handleAction(action) {
  if (!pet) {
    return { ok: false, action: 'blocked', message: 'Hatch an egg first.' };
  }

  const handlers = {
    feed: () => pet.feed(),
    play: () => pet.play(),
    clean: () => pet.clean(),
    sleep: () => pet.toggleSleep(),
    medicine: () => pet.medicine()
  };

  const result = handlers[action]?.() || { ok: false, action: 'blocked', message: 'Nope.' };
  if (result.ok) {
    saveManager.save(pet);
  }
  return result;
}

function handleEvents(events) {
  if (!events.length) return;

  for (const event of events) {
    ui.notify(event.message, event.type === 'death' ? 5000 : 3000);
    if (event.type === 'death') sounds.play('death');
    if (event.type === 'evolution') sounds.play('evolution');
    if (event.type === 'sick') sounds.play('cry');
  }

  saveManager.save(pet);
}

function updateChrome() {
  startPanel.classList.toggle('is-hidden', Boolean(pet));

  if (!pet) {
    petTitle.textContent = 'No egg loaded';
    statusLight.classList.remove('is-alert');
    return;
  }

  petTitle.textContent = pet.isDead() ? `RIP ${pet.name}` : `${pet.name} / ${pet.stage}`;
  const alerting = pet.getNeeds().some((need) => ['hungry', 'sick', 'dirty', 'hurt'].includes(need));
  statusLight.classList.toggle('is-alert', alerting);
  document.title = pet.isDead() ? `RIP ${pet.name}` : `${pet.name} the Tamagotchi`;
}
