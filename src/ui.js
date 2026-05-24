export const ACTIONS = [
  { id: 'feed', label: 'Meal', key: 'f', sound: 'feed' },
  { id: 'play', label: 'Game', key: 'p', sound: 'play' },
  { id: 'clean', label: 'Bath', key: 'c', sound: 'clean' },
  { id: 'sleep', label: 'Lamp', key: 's', sound: 'sleep' },
  { id: 'medicine', label: 'Dose', key: 'm', sound: 'medicine' },
  { id: 'status', label: 'Meter', key: 'i', sound: 'button' }
];

export class UIController {
  constructor({ elements, sounds, onAction }) {
    this.elements = elements;
    this.sounds = sounds;
    this.onAction = onAction;
    this.selectedIndex = 0;
    this.showStatus = false;
    this.message = '';
    this.messageUntil = 0;
    this.action = null;
    this.actionUntil = 0;

    this._bind();
    this._syncButtons();
  }

  notify(message, ttl = 2600) {
    if (!message) return;

    this.message = message;
    this.messageUntil = performance.now() + ttl;
    this._log(message);
  }

  clearStatus() {
    this.showStatus = false;
  }

  getRenderState(now = performance.now()) {
    return {
      showStatus: this.showStatus,
      selectedLabel: ACTIONS[this.selectedIndex].label,
      message: now < this.messageUntil ? this.message : '',
      messageUntil: this.messageUntil,
      action: now < this.actionUntil ? this.action : null
    };
  }

  hasFreshMessage(now = performance.now()) {
    return now < this.messageUntil;
  }

  _bind() {
    this.elements.actionButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        const index = ACTIONS.findIndex((action) => action.id === button.dataset.action);
        if (index >= 0) this.selectedIndex = index;
        this._syncButtons();
        this._execute(ACTIONS[this.selectedIndex], button, event.isTrusted);
      });
    });

    this.elements.navButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        const nav = button.dataset.nav;
        if (nav === 'left') this._move(-1, button, event.isTrusted);
        if (nav === 'right') this._move(1, button, event.isTrusted);
        if (nav === 'select') this._execute(ACTIONS[this.selectedIndex], button, event.isTrusted);
      });
    });

    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      const direct = ACTIONS.findIndex((action) => action.key === key);

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        this._move(-1, null, event.isTrusted);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        this._move(1, null, event.isTrusted);
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this._execute(ACTIONS[this.selectedIndex], null, event.isTrusted);
      } else if (direct >= 0) {
        event.preventDefault();
        this.selectedIndex = direct;
        this._syncButtons();
        this._execute(ACTIONS[direct], null, event.isTrusted);
      }
    });
  }

  _move(offset, button, allowAudio = true) {
    this._play('button', allowAudio);
    this.selectedIndex = (this.selectedIndex + ACTIONS.length + offset) % ACTIONS.length;
    this._syncButtons();
    this._press(button);
  }

  _execute(action, button, allowAudio = true) {
    this._press(button);

    if (action.id === 'status') {
      this.showStatus = !this.showStatus;
      this._play('button', allowAudio);
      this.notify(this.showStatus ? 'Meter opened.' : 'Back to room.', 1500);
      return;
    }

    this.showStatus = false;
    const result = this.onAction(action.id);
    const sound = result.ok ? action.sound : 'cry';

    this._play(sound, allowAudio);
    this.notify(result.message, result.ok ? 2600 : 1800);

    if (result.ok) {
      this.action = result.action || action.id;
      this.actionUntil = performance.now() + 1200;
    }
  }

  _syncButtons() {
    this.elements.actionButtons.forEach((button) => {
      button.classList.toggle('is-selected', button.dataset.action === ACTIONS[this.selectedIndex].id);
    });
  }

  _press(button) {
    if (!button) return;

    button.classList.add('is-pressed');
    window.setTimeout(() => button.classList.remove('is-pressed'), 130);
  }

  _play(sound, allowAudio) {
    if (!allowAudio) return;

    this.sounds.unlock();
    this.sounds.play(sound);
  }

  _log(message) {
    if (!this.elements.log) return;

    const line = document.createElement('p');
    line.textContent = message;
    this.elements.log.prepend(line);

    while (this.elements.log.children.length > 5) {
      this.elements.log.removeChild(this.elements.log.lastChild);
    }
  }
}
