/**
 * Immersive Procedural Web Audio Synthesizer for Garden Focus App
 * Generates beautiful, organic sound effects on-the-fly with no asset weight!
 */

class AudioSynthManager {
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('garden_sound_enabled');
      if (saved === 'false') {
        this.isMuted = true;
      }
    }
  }

  public getMuteState(): boolean {
    return this.isMuted;
  }

  public setMuteState(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('garden_sound_enabled', muted ? 'false' : 'true');
    }
  }

  private getContext(): AudioContext | null {
    if (this.isMuted || typeof window === 'undefined') return null;
    try {
      return new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }

  /**
   * Play a clean, tiny retro-inspired interface click sound
   */
  public playClick(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      osc.type = 'triangle';
      
      // Speed pitch bend down for woodblock transient
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      // Fail silently if audio blocked
    }
  }

  /**
   * Sound of watering: a series of organic high-frequency bubble pops with a subtle water splash
   */
  public playWatering(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Create 5 bubble-popping sounds scheduled quickly after each other
      const frequencies = [680, 890, 1100, 1320, 1550];
      frequencies.forEach((baseFreq, index) => {
        const timeDelay = index * 0.05;
        const playTime = now + timeDelay;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        // Sine or triangle for bubble tone
        osc.type = 'sine';
        
        // Pitch sweep up to simulate expanding water bubble pop
        osc.frequency.setValueAtTime(baseFreq, playTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, playTime + 0.05);

        // Low-pass to keep it wet, warm, and safe for ears
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, playTime);

        gain.gain.setValueAtTime(0.001, playTime);
        gain.gain.linearRampToValueAtTime(0.07, playTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.07);

        osc.start(playTime);
        osc.stop(playTime + 0.09);
      });

      // Subtle water splosh noise stream
      this.playSplashNoise(ctx, now);
    } catch (e) {}
  }

  // Generates a short filtered white noise puff for splash sound
  private playSplashNoise(ctx: AudioContext, startTime: number) {
    try {
      const bufferSize = ctx.sampleRate * 0.2; // 200ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, startTime);
      filter.frequency.exponentialRampToValueAtTime(1400, startTime + 0.15);
      filter.Q.setValueAtTime(2.0, startTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseNode.start(startTime);
      noiseNode.stop(startTime + 0.2);
    } catch {}
  }

  /**
   * Sound of fertilization: rich, resonant organic pitch sweeps representing robust earth and magic growth
   */
  public playFertilizing(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Low foundation oscillator
      const oscBase = ctx.createOscillator();
      const gainBase = ctx.createGain();
      oscBase.connect(gainBase);
      gainBase.connect(ctx.destination);

      oscBase.type = 'sine';
      oscBase.frequency.setValueAtTime(150, now);
      oscBase.frequency.linearRampToValueAtTime(320, now + 0.45);

      gainBase.gain.setValueAtTime(0.12, now);
      gainBase.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

      // Higher sparkly sweep
      const oscSparkle = ctx.createOscillator();
      const gainSparkle = ctx.createGain();
      oscSparkle.connect(gainSparkle);
      gainSparkle.connect(ctx.destination);

      oscSparkle.type = 'triangle';
      oscSparkle.frequency.setValueAtTime(350, now);
      oscSparkle.frequency.exponentialRampToValueAtTime(120, now + 0.4);

      gainSparkle.gain.setValueAtTime(0.06, now);
      gainSparkle.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      oscBase.start(now);
      oscBase.stop(now + 0.5);

      oscSparkle.start(now);
      oscSparkle.stop(now + 0.45);
    } catch {}
  }

  /**
   * Sound of Ancient Evolution: a celestial, magical arpeggio with high chime harmonics
   */
  public playAncientEvolution(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Beautiful pentatonic notes representing expansion (C4, E4, G4, A4, C5, E5, G5, C6)
      const freqs = [261.63, 329.63, 392.00, 440.00, 523.25, 659.25, 783.99, 1046.50];

      freqs.forEach((freq, idx) => {
        const delay = idx * 0.08;
        const playTime = now + delay;

        const osc = ctx.createOscillator();
        const subOsc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        subOsc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, playTime);
        
        // Add subtle chime vibration
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(freq * 1.5, playTime);

        gain.gain.setValueAtTime(0.001, playTime);
        gain.gain.linearRampToValueAtTime(0.07, playTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.6);

        osc.start(playTime);
        osc.stop(playTime + 0.65);

        subOsc.start(playTime);
        subOsc.stop(playTime + 0.65);
      });
    } catch {}
  }

  /**
   * Sound of Short Reading (Bookflip) - quick paper sliding sound effect
   */
  public playReadShort(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      
      const bufferSize = ctx.sampleRate * 0.08; // 80ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.08);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      // Add a small cozy wooden click together
      const wood = ctx.createOscillator();
      const woodGain = ctx.createGain();
      wood.connect(woodGain);
      woodGain.connect(ctx.destination);
      wood.type = 'sine';
      wood.frequency.setValueAtTime(280, now);
      wood.frequency.exponentialRampToValueAtTime(120, now + 0.06);
      woodGain.gain.setValueAtTime(0.06, now);
      woodGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      noise.start(now);
      noise.stop(now + 0.09);

      wood.start(now);
      wood.stop(now + 0.07);
    } catch {}
  }

  /**
   * Sound of Article completion: pleasant dual crystalline chime strum
   */
  public playReadArticle(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [440.00, 554.37, 659.25, 880.00]; // A4 Major chord

      notes.forEach((freq, idx) => {
        const playTime = now + idx * 0.06;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, playTime);

        gain.gain.setValueAtTime(0.001, playTime);
        gain.gain.linearRampToValueAtTime(0.08, playTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.5);

        osc.start(playTime);
        osc.stop(playTime + 0.55);
      });
    } catch {}
  }

  /**
   * Sound of Book completion: Grand celebratory arpeggio in C Major 9th
   */
  public playReadBook(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // C Major 9th (C4, E4, G4, B4, D5, G5, C6)
      const notes = [261.63, 329.63, 392.00, 493.88, 587.33, 783.99, 1046.50];

      notes.forEach((freq, idx) => {
        const playTime = now + idx * 0.06;

        const osc = ctx.createOscillator();
        const sub = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        sub.connect(gain);
        gain.connect(ctx.destination);

        // Blend sine and triangle for musical richness
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, playTime);

        sub.type = 'triangle';
        sub.frequency.setValueAtTime(freq * 2, playTime);

        gain.gain.setValueAtTime(0.001, playTime);
        gain.gain.linearRampToValueAtTime(0.08, playTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.75);

        osc.start(playTime);
        osc.stop(playTime + 0.82);

        sub.start(playTime);
        sub.stop(playTime + 0.82);
      });
    } catch {}
  }

  /**
   * Focus Rain: beautiful, cascading relaxing chime arpeggio sequence
   */
  public playFocusRain(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const pitches = [300, 450, 600, 750, 900, 1100, 1300];
      
      pitches.forEach((freq, index) => {
        const playTime = now + index * 0.09;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, playTime);

        gain.gain.setValueAtTime(0.001, playTime);
        gain.gain.linearRampToValueAtTime(0.08, playTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.5);

        osc.start(playTime);
        osc.stop(playTime + 0.55);
      });
    } catch {}
  }

  /**
   * Sound of Pomodoro starting: focus gong bell
   */
  public playPomodoroStart(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Deep resonating gong freq
      const bell = ctx.createOscillator();
      const ring = ctx.createOscillator();
      const gain = ctx.createGain();

      bell.connect(gain);
      ring.connect(gain);
      gain.connect(ctx.destination);

      bell.type = 'sine';
      bell.frequency.setValueAtTime(174, now); // healing frequency
      
      ring.type = 'triangle';
      ring.frequency.setValueAtTime(348, now); // octave

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      bell.start(now);
      bell.stop(now + 1.8);

      ring.start(now);
      ring.stop(now + 1.8);
    } catch {}
  }

  /**
   * Sound of Pomodoro ending: satisfying melodious notification chime
   */
  public playPomodoroEnd(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Beautiful retro arpeggio
      const notes = [523.25, 659.25, 783.99, 987.77, 1046.50]; // C5, E5, G5, B5, C6

      notes.forEach((freq, idx) => {
        const playTime = now + idx * 0.1;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, playTime);

        gain.gain.setValueAtTime(0.001, playTime);
        gain.gain.linearRampToValueAtTime(0.1, playTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.6);

        osc.start(playTime);
        osc.stop(playTime + 0.65);
      });
    } catch {}
  }

  /**
   * Standard success toast jingle
   */
  public playSuccessToast(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      
      const f1 = ctx.createOscillator();
      const f2 = ctx.createOscillator();
      const gain = ctx.createGain();

      f1.connect(gain);
      f2.connect(gain);
      gain.connect(ctx.destination);

      f1.type = 'sine';
      f1.frequency.setValueAtTime(512, now);
      f1.frequency.exponentialRampToValueAtTime(1024, now + 0.25);

      f2.type = 'sine';
      f2.frequency.setValueAtTime(640, now);
      f2.frequency.exponentialRampToValueAtTime(1280, now + 0.25);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      f1.start(now);
      f1.stop(now + 0.3);

      f2.start(now);
      f2.stop(now + 0.3);
    } catch {}
  }
}

export const audioSynth = new AudioSynthManager();
