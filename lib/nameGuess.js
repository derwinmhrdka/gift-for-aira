export function normalizeName(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function createRevealState(length) {
  return Array.from({ length }, () => false);
}

export function isFullyRevealed(revealed) {
  return revealed.length > 0 && revealed.every(Boolean);
}

/** Kotak terbuka per huruf yang cocok berurutan dari awal; berhenti saat salah. */
export function revealedFromGuess(guessPart, targetName) {
  const g = normalizeName(guessPart);
  const t = normalizeName(targetName);
  return targetName.split("").map((_, index) => index < g.length && g[index] === t[index]);
}

export function splitGuessInput(value) {
  const spaceIndex = value.indexOf(" ");
  if (spaceIndex === -1) {
    return { first: value, last: "" };
  }
  return {
    first: value.slice(0, spaceIndex),
    last: value.slice(spaceIndex + 1),
  };
}

export function sequentialPrefixLength(guess, target) {
  const g = normalizeName(guess);
  const t = normalizeName(target);
  let i = 0;
  while (i < g.length && i < t.length && g[i] === t[i]) i += 1;
  return i;
}

export function isExactNameMatch(guess, target) {
  return normalizeName(guess) === normalizeName(target);
}

export function isSequentialAlmost(guess, target) {
  const t = normalizeName(target);
  if (!t) return false;

  const prefix = sequentialPrefixLength(guess, target);
  const threshold = Math.ceil(t.length * 0.5);
  return prefix >= threshold && prefix < t.length;
}

export function evaluateGuessFeedback(firstPart, lastPart, firstName, lastName) {
  if (isExactNameMatch(firstPart, firstName) && isExactNameMatch(lastPart, lastName)) {
    return "success";
  }

  const firstNormLen = normalizeName(firstPart).length;
  const firstTargetLen = normalizeName(firstName).length;

  if (firstNormLen === firstTargetLen && !isExactNameMatch(firstPart, firstName)) {
    return isSequentialAlmost(firstPart, firstName) ? "close" : "wrong";
  }
  if (firstNormLen > firstTargetLen && isSequentialAlmost(firstPart, firstName)) {
    return "close";
  }

  const lastNormLen = normalizeName(lastPart).length;
  const lastTargetLen = normalizeName(lastName).length;

  if (lastNormLen === lastTargetLen && !isExactNameMatch(lastPart, lastName)) {
    return isSequentialAlmost(lastPart, lastName) ? "close" : "wrong";
  }
  if (lastNormLen > lastTargetLen && isSequentialAlmost(lastPart, lastName)) {
    return "close";
  }

  return null;
}
