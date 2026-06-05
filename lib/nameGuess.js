export function normalizeName(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** @typedef {'hidden' | 'correct' | 'wrong'} BoxState */

/**
 * @returns {{ state: BoxState, letter: string | null }[]}
 */
export function boxStatesFromGuess(guessPart, targetName) {
  const g = normalizeName(guessPart);
  const t = normalizeName(targetName);

  return targetName.split("").map((targetChar, index) => {
    if (index >= g.length) {
      return { state: "hidden", letter: null };
    }
    if (g[index] === t[index]) {
      return { state: "correct", letter: targetChar };
    }
    const typed =
      guessPart[index] ?? String(guessPart).charAt(index) ?? g[index];
    return { state: "wrong", letter: typed };
  });
}

export function splitGuessInput(value, firstName = "") {
  const spaceIndex = value.indexOf(" ");
  if (spaceIndex !== -1) {
    return {
      first: value.slice(0, spaceIndex),
      last: value.slice(spaceIndex + 1),
    };
  }

  const firstLen = firstName.length;
  if (firstLen > 0 && value.length > firstLen) {
    return {
      first: value.slice(0, firstLen),
      last: value.slice(firstLen),
    };
  }

  return { first: value, last: "" };
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
  const g = normalizeName(guess);
  const t = normalizeName(target);
  if (!t || g.length !== t.length) return false;

  const prefix = sequentialPrefixLength(guess, target);
  const threshold = Math.ceil(t.length * 0.5);
  return prefix >= threshold && prefix < t.length;
}

export function isNameInputComplete(guessPart, targetName) {
  return guessPart.length === targetName.length;
}

export function isFullGuessComplete(value, firstName, lastName) {
  const { first, last } = splitGuessInput(value, firstName);
  return (
    isNameInputComplete(first, firstName) &&
    isNameInputComplete(last, lastName)
  );
}

export function evaluateGuessFeedback(firstPart, lastPart, firstName, lastName) {
  const firstDone = isNameInputComplete(firstPart, firstName);
  const lastDone = isNameInputComplete(lastPart, lastName);

  if (!firstDone || !lastDone) return null;

  const firstExact = isExactNameMatch(firstPart, firstName);
  const lastExact = isExactNameMatch(lastPart, lastName);

  if (firstExact && lastExact) {
    return "success";
  }

  const firstAlmost = isSequentialAlmost(firstPart, firstName);
  const lastAlmost = isSequentialAlmost(lastPart, lastName);

  if (firstAlmost || lastAlmost) {
    return "close";
  }

  return "wrong";
}
