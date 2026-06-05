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

export function playGuessFeedbackSound(feedback) {
  if (feedback === "success") playGuessSuccessSound();
  else if (feedback === "close") playGuessAlmostSound();
  else if (feedback === "wrong") playGuessWrongSound();
}
