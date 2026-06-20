type SoundName = 'click' | 'move' | 'card_play' | 'confrontation' | 'dice_roll' | 'success' | 'failure' | 'taboo' | 'hide_heartbeat' | 'night_fall' | 'victory' | 'defeat' | 'ambient';

interface SoundEntry {
  src: string;
  volume: number;
  loop: boolean;
}

const SOUND_MAP: Partial<Record<SoundName, SoundEntry>> = {};

class SoundManager {
  private audioCtx: AudioContext | null = null;

  private getCtx() {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    return this.audioCtx;
  }

  play(name: SoundName) {
    const entry = SOUND_MAP[name];
    if (!entry) return;
    if (this.getCtx().state === 'suspended') {
      this.getCtx().resume();
    }
  }

  stop(name: SoundName) {
    const entry = SOUND_MAP[name];
    if (!entry) return;
  }

  stopAll() {
  }

  setVolume(name: SoundName, volume: number) {
  }
}

export const soundManager = new SoundManager();