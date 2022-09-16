/**
 * Dígito verificador ou algarismo de controle é um mecanismo de autenticação utilizado para verificar a validade
 * e a autenticidade de um valor numérico, evitando dessa forma fraudes ou erros de transmissão ou digitação.
 *
 * O método de cálculo desses dígitos varia conforme o caso, porém muitos deles se baseiam em duas rotinas tradicionais: Módulo 11 e Módulo 10.
 *
 * [Utilizando Módulo 10 para calcular dígito verificador 10](http://blog.marvinsiq.com/2008/09/30/utilizando-modulo-10-para-calcular-digito-verificador/#:~:text=O%20c%C3%A1lculo%20do%20M%C3%B3dulo%2010,depois%201%20e%20assim%20sucessivamente.)
 */

import { NumericString } from "../types/numeric-string";

/**
 * Calcula o dígito verificador de uma numeração a partir do módulo 10.
 *
 * Cada dígito do número, começando da direita para a esquerda (menos significativo para o mais significativo)
 * é multiplicado, na ordem, por 2, depois 1, depois 2, depois 1 e assim sucessivamente.
 */
function calculateModule10(numeration: NumericString) {
  // Transforma a string em array e inverte a ordem desse array
  // "123" -> [3, 2, 1]
  const numbers = numeration
    .split("")
    .map((num) => parseInt(num))
    .reverse();

  // Alterna entre dois e um
  let multiplier = 2;

  let sum = 0;

  // [3, 2, 1] -> (3 * 2) + (2 * 1) + (1 * 2) -> [2, 2, 6]
  numbers.forEach((num) => {
    const result = num * multiplier;

    // Ao invés de permitir que o número passe de dez, fazemos ele começar de novo a partir de 1
    // 10 vira 1; 11 vira 2; 12 vira 3...
    sum += result > 9 ? result - 9 : result;

    // Alterna o multiplicador entre 2 e 1
    multiplier = multiplier === 2 ? 1 : 2;
  });

  if (sum === 10) return 0;
  return 10 - (sum % 10);
}

/**
 * Calcula o dígito verificador de uma numeração a partir do módulo 11
 *
 * Cada dígito do número, começando da direita para a esquerda (menos significativo para o mais significativo)
 * é multiplicado, na ordem, por números de 2 até 9.
 */
function calculateModule11(numeration: NumericString) {
  // Transforma a string em array e inverte a ordem desse array
  // "123" -> [3, 2, 1]
  const numbers = numeration
    .split("")
    .map((num) => parseInt(num))
    .reverse();

  // Vai de dois a nove e reinicia a contagem se passar disso
  let multiplier = 2;
  let sum = 0;

  // [3, 2, 1] -> (3 * 2) + (2 * 3) + (1 * 4) -> [6, 6, 4]
  numbers.forEach((num) => {
    const result = num * multiplier;

    sum += result;

    multiplier++;

    // Reinicia a contagem
    if (multiplier > 9) {
      multiplier = 2;
    }
  });

  // Calcula-se o módulo 11
  const digit = sum % 11;

  // Se o módulo for zero ou um retornamos zero, se for maior que isso subtraímos ele de 11
  if (digit === 0 || digit === 1) return 0;

  if (digit === 10) return 1;

  return 11 - digit;
}

export { calculateModule11, calculateModule10 };
