/**
 * Web Audio API sound manager — no external library, fully synthetic.
 * All sounds generated programmatically to keep bundle size at zero.
 */
class AudioManager {
  private ctx: AudioContext | null = null;
  private _enabled: boolean = false;
  private scanOsc: OscillatorNode | null = null;
  private scanGain: GainNode | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this._enabled = localStorage.getItem("jf-sound") === "true";
    }
  }

  get isEnabled() { return this._enabled; }

  toggle(): boolean {
    this._enabled = !this._enabled;
    if (typeof window !== "undefined") localStorage.setItem("jf-sound", String(this._enabled));
    if (!this._enabled) this.stopScan();
    return this._enabled;
  }

  private ctx_(): AudioContext {
    if (!this.ctx || this.ctx.state === "closed") this.ctx = new AudioContext();
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  /** Whoosh down — played on submit */
  playWhoosh() {
    if (!this._enabled) return;
    const ctx = this.ctx_();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "sawtooth";
    o.frequency.setValueAtTime(700, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.31);
  }

  /** Subtle click — played on progress stage change */
  playTick() {
    if (!this._enabled) return;
    const ctx = this.ctx_();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "sine"; o.frequency.value = 1100;
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.07);
  }

  /** Scanning ambient hum during AI analysis */
  startScan() {
    if (!this._enabled || this.scanOsc) return;
    const ctx = this.ctx_();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "sine"; o.frequency.value = 180;
    g.gain.setValueAtTime(0.025, ctx.currentTime);
    o.start(ctx.currentTime);
    this.scanOsc = o; this.scanGain = g;
  }

  stopScan() {
    if (!this.scanOsc || !this.ctx) return;
    try {
      this.scanGain!.gain.setValueAtTime(0, this.ctx.currentTime);
      this.scanOsc.stop(this.ctx.currentTime + 0.05);
    } catch { /* already stopped */ }
    this.scanOsc = null; this.scanGain = null;
  }

  /** Rising suspense before reveal */
  playSuspense() {
    if (!this._enabled) return;
    const ctx = this.ctx_();
    [280, 380].forEach((freq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "sine";
      const t = ctx.currentTime + i * 0.28;
      o.frequency.setValueAtTime(freq, t);
      o.frequency.linearRampToValueAtTime(freq * 1.4, t + 0.28);
      g.gain.setValueAtTime(0.07, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.start(t); o.stop(t + 0.36);
    });
  }

  /** Ascending C major chord — FAKTA */
  playFakta() {
    if (!this._enabled) return;
    const ctx = this.ctx_();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "sine"; o.frequency.value = freq;
      const t = ctx.currentTime + i * 0.1;
      g.gain.setValueAtTime(0.14, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      o.start(t); o.stop(t + 1.21);
    });
  }

  /** Pulsing square alarm — HOAKS */
  playHoaks() {
    if (!this._enabled) return;
    const ctx = this.ctx_();
    for (let i = 0; i < 3; i++) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "square"; o.frequency.value = 330;
      const t = ctx.currentTime + i * 0.22;
      g.gain.setValueAtTime(0.09, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      o.start(t); o.stop(t + 0.17);
    }
  }

  /** Two-note warning — KONTEKS / TIDAK_DAPAT_DIVERIFIKASI */
  playWarning() {
    if (!this._enabled) return;
    const ctx = this.ctx_();
    [440, 550].forEach((freq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "triangle"; o.frequency.value = freq;
      const t = ctx.currentTime + i * 0.2;
      g.gain.setValueAtTime(0.1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      o.start(t); o.stop(t + 0.51);
    });
  }

  /** Mobile haptic shorthand */
  vibrate(pattern: number | number[]) {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }

  /** Play the correct verdict sound + haptic */
  playVerdict(verdict: string) {
    switch (verdict) {
      case "FAKTA": this.playFakta(); this.vibrate(200); break;
      case "HOAKS": this.playHoaks(); this.vibrate([100, 60, 100]); break;
      default: this.playWarning(); this.vibrate(120);
    }
  }
}

export const audioManager = new AudioManager();
