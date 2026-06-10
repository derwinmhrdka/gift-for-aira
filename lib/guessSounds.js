/** @type {AudioContext | null} */
let sharedCtx = null;

function getContextClass() {
  if (typeof window === "undefined") return null;
  return window.AudioContext || window.webkitAudioContext || null;
}

export function unlockGuessSounds() {
  const Ctx = getContextClass();
  if (!Ctx) return;
  if (!sharedCtx) sharedCtx = new Ctx();
  if (sharedCtx.state === "suspended") {
    void sharedCtx.resume();
  }
}

function withContext(run) {
  const Ctx = getContextClass();
  if (!Ctx) return;
  if (!sharedCtx) sharedCtx = new Ctx();

  const play = () => {
    if (!sharedCtx) return;
    run(sharedCtx);
  };

  if (sharedCtx.state === "suspended") {
    sharedCtx.resume().then(play).catch(() => {});
    return;
  }

  play();
}

export function playGuessSuccessSound() {
  withContext((ctx) => {
    const duration = 0.45;
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      const t = i / length;
      data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.22;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    filter.Q.value = 0.7;
    source.connect(filter);
    filter.connect(ctx.destination);
    source.start();
    source.stop(ctx.currentTime + duration);
  });
}

export function playGuessAlmostSound() {
  withContext((ctx) => {
    const master = ctx.createGain();
    master.gain.value = 0.2;
    master.connect(ctx.destination);

    [523.25, 659.25].forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + index * 0.1;
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(1, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + 0.24);
    });
  });
}

export function playGuessWrongSound() {
  withContext((ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.28);
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.34);
  });
}

export function playGuessLetterRevealSound() {
  withContext((ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 640 + Math.random() * 120;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  });
}

export function playGuessFeedbackSound(feedback) {
  if (feedback === "success") playGuessSuccessSound();
  else if (feedback === "close") playGuessAlmostSound();
  else if (feedback === "wrong") playGuessWrongSound();
}

export function playCardMatchSound() {
  withContext((ctx) => {
    const master = ctx.createGain();
    master.gain.value = 0.18;
    master.connect(ctx.destination);

    [523.25, 659.25, 783.99].forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + index * 0.07;
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(1, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + 0.24);
    });
  });
}

export function playCardMismatchSound() {
  playGuessWrongSound();
}

export function playCardCompleteSound() {
  withContext((ctx) => {
    const master = ctx.createGain();
    master.gain.value = 0.2;
    master.connect(ctx.destination);

    [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + index * 0.11;
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(1, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.42);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + 0.45);
    });
  });
}

export function playSpinStartSound() {
  withContext((ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.32);
    filter.type = "lowpass";
    filter.frequency.value = 900;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.36);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.38);
  });
}

export function playSpinTickSound() {
  withContext((ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  });
}

export function playSpinZonkSound() {
  withContext((ctx) => {
    [311.13, 261.63, 207.65].forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + index * 0.14;
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.14, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.34);
    });
  });
}

export function playSpinWinSound() {
  withContext((ctx) => {
    const master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);

    [659.25, 783.99, 987.77, 1174.66].forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + index * 0.09;
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(1, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.48);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + 0.5);
    });
  });
}

function playToneSequence(
  ctx,
  notes,
  { type = "sine", masterGain = 0.2, gap = 0.09, noteLength = 0.28 } = {},
) {
  const master = ctx.createGain();
  master.gain.value = masterGain;
  master.connect(ctx.destination);

  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + index * gap;
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(1, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + noteLength);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + noteLength + 0.02);
  });
}

export function playGlobeShakeSound() {
  withContext((ctx) => {
    const duration = 0.4;
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      const t = i / length;
      data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.16;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 420;
    filter.Q.value = 0.55;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.55;
    source.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    source.start();
    source.stop(ctx.currentTime + duration);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(96, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(62, ctx.currentTime + 0.34);
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  });
}

export function playReactionLoveSound() {
  withContext((ctx) => {
    playToneSequence(ctx, [523.25, 659.25], {
      type: "sine",
      masterGain: 0.18,
      gap: 0.11,
      noteLength: 0.24,
    });
  });
}

export function playReactionLikeSound() {
  withContext((ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(740, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(980, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  });
}

export function playReactionSnowflakeSound() {
  withContext((ctx) => {
    playToneSequence(ctx, [1318.51, 1760, 2093], {
      type: "sine",
      masterGain: 0.14,
      gap: 0.06,
      noteLength: 0.2,
    });
  });
}

export function playGlobeReactionSound(type) {
  if (type === "love") playReactionLoveSound();
  else if (type === "like") playReactionLikeSound();
  else if (type === "snowflake") playReactionSnowflakeSound();
}

export function playGachaShakeSound() {
  withContext((ctx) => {
    const duration = 0.55;
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      const t = i / length;
      const wobble = Math.sin(i * 0.09) * 0.5 + 0.5;
      data[i] = (Math.random() * 2 - 1) * wobble * (1 - t * 0.65) * 0.14;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 680;
    filter.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.value = 0.7;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    source.stop(ctx.currentTime + duration);
  });
}

export function playFortuneGreatSound() {
  withContext((ctx) => {
    playToneSequence(ctx, [523.25, 659.25, 783.99, 1046.5, 1318.51], {
      type: "sine",
      masterGain: 0.2,
      gap: 0.08,
      noteLength: 0.38,
    });
  });
}

export function playFortuneGoodSound() {
  withContext((ctx) => {
    playToneSequence(ctx, [587.33, 739.99], {
      type: "triangle",
      masterGain: 0.17,
      gap: 0.12,
      noteLength: 0.3,
    });
  });
}

export function playFortuneBadSound() {
  withContext((ctx) => {
    playToneSequence(ctx, [392, 349.23, 311.13], {
      type: "triangle",
      masterGain: 0.13,
      gap: 0.14,
      noteLength: 0.34,
    });
  });
}

export function playFortuneResultSound(tierKey) {
  if (tierKey === "great") playFortuneGreatSound();
  else if (tierKey === "good") playFortuneGoodSound();
  else playFortuneBadSound();
}
