function substr(str: string, from: number, length?: number) {
  return str.substr(from, length);
}



/**
 * Função auxiliar para remover os zeros à esquerda dos valores detectados no código inserido
 */
function substringReplace(str: any, replacement: any, start: any, size: any) {
  if (start < 0) {
    start += str.length;
  }

  size = size !== undefined ? size : str.length;
  
  if (size < 0) {
    size = size + str.length - start;
  }

  const originalStringHead = str.slice(0, start)
  const replacementStringHead = substr(replacement, 0, size)
  const replacementStringBody =  replacement.slice(size)
  const originalStringBody = str.slice(start + size)
  
  return `${originalStringHead}${replacementStringHead}${replacementStringBody}${originalStringBody}`
}

/**
 * Remove todos os caracteres não numéricos
 */
function leaveOnlyNumbers(str: string) {
  return str.replace(/[^0-9]/g, "");
}

export { substr, substringReplace, leaveOnlyNumbers };

