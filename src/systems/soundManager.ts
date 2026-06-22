type SoundName = 'click' | 'move' | 'card_play' | 'confrontation' | 'dice_roll' | 'success' | 'failure' | 'taboo' | 'hide_heartbeat' | 'night_fall' | 'victory' | 'defeat' | 'ambient';

type SynthFn = (ctx: AudioContext, dest: AudioNode, volume: number) => { stop: () => void };

const SYNTH_MAP: Partial<Record<SoundName, SynthFn>> = {
  click: (ctx, dest, vol) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(vol * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain).connect(dest);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
    return { stop: () => { try { osc.stop(); } catch {} } };
  },

  move: (ctx, dest, vol) => {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    gain.gain.setValueAtTime(vol * 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    src.connect(gain).connect(dest);
    src.start(ctx.currentTime);
    return { stop: () => { try { src.stop(); } catch {} } };
  },

  card_play: (ctx, dest, vol) => {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - t / 0.15) * 0.4;
    }
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    gain.gain.setValueAtTime(vol * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    src.connect(gain).connect(dest);
    src.start(ctx.currentTime);
    return { stop: () => { try { src.stop(); } catch {} } };
  },

  confrontation: (ctx, dest, vol) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(vol * 0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain).connect(dest);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
    return { stop: () => { try { osc.stop(); } catch {} } };
  },

  dice_roll: (ctx, dest, vol) => {
    const dur = 0.6;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - t / dur);
    }
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    gain.gain.setValueAtTime(vol * 0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(gain).connect(dest);
    src.start(ctx.currentTime);
    return { stop: () => { try { src.stop(); } catch {} } };
  },

  success: (ctx, dest, vol) => {
    const notes = [523, 659, 784];
    const gains: GainNode[] = [];
    const oscs: OscillatorNode[] = [];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
      gain.gain.linearRampToValueAtTime(vol * 0.2, ctx.currentTime + i * 0.08 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain).connect(dest);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + 0.5);
      oscs.push(osc);
      gains.push(gain);
    });
    return { stop: () => oscs.forEach(o => { try { o.stop(); } catch {} }) };
  },

  failure: (ctx, dest, vol) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(vol * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain).connect(dest);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
    return { stop: () => { try { osc.stop(); } catch {} } };
  },

  taboo: (ctx, dest, vol) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(vol * 0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol * 0.3, ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc.connect(gain).connect(dest);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.7);

    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const src = ctx.createBufferSource();
    const sg = ctx.createGain();
    src.buffer = buf;
    sg.gain.setValueAtTime(vol * 0.1, ctx.currentTime);
    sg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    src.connect(sg).connect(dest);
    src.start(ctx.currentTime);

    return { stop: () => { try { osc.stop(); src.stop(); } catch {} } };
  },

  hide_heartbeat: (ctx, dest, vol) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(50, ctx.currentTime);
    gain.gain.setValueAtTime(vol * 0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(vol * 0.3, ctx.currentTime + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    gain.gain.setValueAtTime(0, ctx.currentTime + 0.55);
    osc.connect(gain).connect(dest);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
    return { stop: () => { try { osc.stop(); } catch {} } };
  },

  night_fall: (ctx, dest, vol) => {
    const dur = 1.5;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.min(1, t * 3) * (1 - t / dur) * 0.5;
    }
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(300, ctx.currentTime);
    lpf.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + dur);
    gain.gain.setValueAtTime(vol * 0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(lpf).connect(gain).connect(dest);
    src.start(ctx.currentTime);
    return { stop: () => { try { src.stop(); } catch {} } };
  },

  victory: (ctx, dest, vol) => {
    const notes = [392, 523, 659, 784, 1047];
    const oscs: OscillatorNode[] = [];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.12;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol * 0.15, t + 0.06);
      gain.gain.setValueAtTime(vol * 0.15, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(gain).connect(dest);
      osc.start(t);
      osc.stop(t + 0.6);
      oscs.push(osc);
    });
    return { stop: () => oscs.forEach(o => { try { o.stop(); } catch {} }) };
  },

  defeat: (ctx, dest, vol) => {
    const notes = [400, 350, 300, 200];
    const oscs: OscillatorNode[] = [];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = ctx.currentTime + i * 0.2;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol * 0.12, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(gain).connect(dest);
      osc.start(t);
      osc.stop(t + 0.6);
      oscs.push(osc);
    });
    return { stop: () => oscs.forEach(o => { try { o.stop(); } catch {} }) };
  },

  ambient: (ctx, dest, vol) => {
    const buf = ctx.createBuffer(2, ctx.sampleRate * 8, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < data.length; i++) {
        const t = i / ctx.sampleRate;
        data[i] = (Math.random() * 2 - 1) * (0.2 + 0.3 * Math.sin(t * 0.3) * Math.sin(t * 0.7));
      }
    }
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    const lpf = ctx.createBiquadFilter();
    src.buffer = buf;
    src.loop = true;
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(200, ctx.currentTime);
    lpf.Q.setValueAtTime(1, ctx.currentTime);
    gain.gain.setValueAtTime(vol * 0.03, ctx.currentTime);
    src.connect(lpf).connect(gain).connect(dest);
    src.start(ctx.currentTime);
    return { stop: () => { try { src.stop(); } catch {} } };
  },
};

class SoundManager {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private active: Map<SoundName, { stop: () => void }> = new Map();
  private volumes: Partial<Record<SoundName, number>> = {};
  private ambientPlaying = false;

  private getCtx() {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(1, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
    }
    return { ctx: this.audioCtx, dest: this.masterGain! };
  }

  play(name: SoundName) {
    const synth = SYNTH_MAP[name];
    if (!synth) return;
    const { ctx, dest } = this.getCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    this.active.get(name)?.stop();
    const vol = this.volumes[name] ?? 1;
    const control = synth(ctx, dest, vol);
    this.active.set(name, control);
  }

  stop(name: SoundName) {
    this.active.get(name)?.stop();
    this.active.delete(name);
  }

  stopAll() {
    this.active.forEach(s => s.stop());
    this.active.clear();
    this.ambientPlaying = false;
  }

  setVolume(name: SoundName, volume: number) {
    this.volumes[name] = Math.max(0, Math.min(1, volume));
  }

  startAmbient() {
    if (this.ambientPlaying) return;
    this.play('ambient');
    this.ambientPlaying = true;
  }

  stopAmbient() {
    this.stop('ambient');
    this.ambientPlaying = false;
  }

  resume() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }
}

export const soundManager = new SoundManager();
