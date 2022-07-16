/**
 * Função auxiliar para remover os zeros à esquerda dos valores detectados no código inserido
 */
function substringReplace(
  str: string,
  replacement: string,
  start: number,
  size: number
) {
  // Impede que start seja negativo
  const positiveStart = start < 0 ? start + str.length : start;

  // Quando size não é passado, substitui todo o resto da string
  size = size !== undefined ? size : str.length;
  
  // Impede que size seja negativo
  size = size < 0 ? size + str.length - positiveStart : size;

  const startString = str.slice(0, positiveStart);
  const replacementStart = replacement.substring(0, size);
  const replacementString = replacementStart + replacement.slice(size);
  const endString = str.slice(positiveStart + size);
  
  return `${startString}${replacementString}${endString}`;
}

export { substringReplace };
