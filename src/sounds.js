const TONE_SETS = {
  button: [[680, 0.035, 0.08]],
  feed: [[520, 0.05, 0.1], [780, 0.07, 0.09]],
  play: [[620, 0.04, 0.08], [920, 0.04, 0.08], [740, 0.07, 0.08]],
  clean: [[860, 0.06, 0.08], [1140, 0.05, 0.06]],
  sleep: [[420, 0.08, 0.08], [300, 0.12, 0.08]],
  medicine: [[760, 0.05, 0.08], [980, 0.08, 0.08]],
  cry: [[300, 0.08, 0.08], [220, 0.12, 0.08]],
  death: [[440, 0.1, 0.1], [330, 0.12, 0.1], [220, 0.22, 0.1]],
  evolution: [[520, 0.07, 0.1], [680, 0.07, 0.1], [880, 0.11, 0.1]]
};

export class SoundBoard {
  constructor() {
    this.context = null;
    this.enabled = true;
  }

  unlock() {
    if (!this._canStartAudio()) return false;

    const context = this._context();
    if (context?.state === 'suspended') {
      context.resume();
    }

    return Boolean(context);
  }

  play(name) {
    if (!this.enabled) return;
    if (!this._canStartAudio()) return;

    const tones = TONE_SETS[name] || TONE_SETS.button;
    const context = this._context();
    if (!context) return;

    let offset = 0;
    for (const [frequency, duration, gain] of tones) {
      this._tone(context.currentTime + offset, frequency, duration, gain);
      offset += duration + 0.035;
    }
  }

  _context() {
    if (!this.context) {
      const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AudioContext) return null;
      this.context = new AudioContext();
    }

    return this.context;
  }

  _canStartAudio() {
    if (this.context) return true;

    const activation = globalThis.navigator?.userActivation;
    return !activation || activation.isActive || activation.hasBeenActive;
  }

  _tone(startTime, frequency, duration, volume) {
    const context = this._context();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.006);
    gain.gain.setValueAtTime(volume, startTime + Math.max(0.006, duration - 0.012));
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  }
}
