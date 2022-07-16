/**
 * Calcula o dígito verificador de uma numeração a partir do módulo 10
 */
function calculateModule10(numeration: string) {
  const cleanNumeration = numeration.replace(/\D/g, "");
  let i;
  let multiplier = 2;
  let sum = 0;
  let s = "";

  for (i = cleanNumeration.length - 1; i >= 0; i--) {
    s = multiplier * parseInt(cleanNumeration.charAt(i)) + s;
    if (--multiplier < 1) {
      multiplier = 2;
    }
  }

  for (i = 0; i < s.length; i++) {
    sum = sum + parseInt(s.charAt(i));
  }

  sum = sum % 10;

  if (sum !== 0) {
    sum = 10 - sum;
  }

  return sum;
}

/**
 * Calcula o dígito verificador de uma numeração a partir do módulo 11
 */
function calculateModule11(numeration: string) {
  const sequence = [4, 3, 2, 9, 8, 7, 6, 5];
  let digit = 0;
  let sequenceIndex = 0;

  for (let char of numeration) {
    let multiplier = sequence[sequenceIndex];
    sequenceIndex++;
    sequenceIndex %= sequence.length;
    digit += multiplier * parseInt(char);
  }

  const DAC = digit % 11;

  if (DAC === 0 || DAC === 1) return 0;
  if (DAC === 10) return 1;
  return 11 - DAC;
}
