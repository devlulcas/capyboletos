/* eslint-disable */

import moment from "moment-timezone";

/**
 * Identifica o tipo de código inserido (se baseando na quantidade de dígitos).
 */
export function codeTypeIdentifier(code) {
  if (typeof code !== "string") {
    throw new TypeError("Insira uma string válida!");
  }

  const cleanedUpCode = code.replace(/[^0-9]/g, "");

  if (cleanedUpCode.length === 44) {
    return "CÓDIGO_DE_BARRAS";
  }

  if (
    cleanedUpCode.length === 46 ||
    cleanedUpCode.length === 47 ||
    cleanedUpCode.length === 48
  ) {
    return "LINHA_DIGITÁVEL";
  }

  return "TAMANHO_INCORRETO";
}

/**
 * Identifica o tipo de boleto inserido a partir da validação de seus dois dígitos iniciais.
 */
export function boletoTypeIdentifier(code) {
  const cleanedUpCode = code.replace(/[^0-9]/g, "");

  if (typeof cleanedUpCode !== "string") {
    throw new TypeError("Insira uma string válida!");
  }

  if (
    cleanedUpCode.substring(cleanedUpCode.length - 14) === "00000000000000" ||
    cleanedUpCode.substr(5, 14) === "00000000000000"
  ) {
    return "CARTÃO_DE_CRÉDITO";
  }

  if (cleanedUpCode.charAt(0) === "8") {
    const typeOfExpense = {
      1: "ARRECADAÇÃO_PREFEITURA",
      2: "CONVÊNIO_SANEAMENTO",
      3: "CONVÊNIO_ENERGIA_ELÉTRICA_E_GAS",
      4: "CONVÊNIO_TELECOMUNICAÇÕES",
      5: "ARRECADAÇÃO_ÓRGÃOS_GOVERNAMENTAIS",
      6: "OUTROS",
      7: "ARRECADAÇÃO_TAXAS_DE_TRANSITO",
      9: "OUTROS",
    };

    return typeOfExpense[cleanedUpCode.charAt(1)];
  }

  return "BANCO";
}

/**
 * Identifica o o código de referência do boleto para determinar qual módulo
 * será utilizado para calcular os dígitos verificadores
 */
export const identifyReference = (code) => {
  const cleanedUpCode = code.replace(/[^0-9]/g, "");

  const reference = cleanedUpCode.substr(2, 1);

  if (typeof cleanedUpCode !== "string") {
    throw new TypeError("Insira uma string válida!");
  }

  const referenceCodeSheet = {
    6: {
      mod: 10,
      efetivo: true,
    },
    7: {
      mod: 10,
      efetivo: false,
    },
    8: {
      mod: 11,
      efetivo: true,
    },
    9: {
      mod: 11,
      efetivo: false,
    },
  };

  return referenceCodeSheet[reference];
};

/**
 * Identifica o fator da data de vencimento do boleto
 *
 * -------------
 *
 * @param {string} codigo Numeração do boleto
 * @param {string} codeType tipo de código inserido (CÓDIGO_DE_BARRAS / LINHA_DIGITÁVEL)
 *
 * -------------
 *
 * @return {Date} dataBoleto
 */
export const identificarData = (codigo, codeType) => {
  const cleanedUpCode = code.replace(/[^0-9]/g, "");

  const tipoBoleto = boletoTypeIdentifier(cleanedUpCode);

  let fatorData = "";
  const initialDate = moment("1997-10-07 20:54:59.000Z");
  const dataBoleto = initialDate.tz("UTC");

  if (codeType === "CÓDIGO_DE_BARRAS") {
    if (tipoBoleto == "BANCO" || tipoBoleto == "CARTÃO_DE_CRÉDITO") {
      fatorData = cleanedUpCode.substr(5, 4);
    } else {
      fatorData = "0";
    }
  } else if (codeType === "LINHA_DIGITÁVEL") {
    if (tipoBoleto == "BANCO" || tipoBoleto == "CARTÃO_DE_CRÉDITO") {
      fatorData = cleanedUpCode.substr(33, 4);
    } else {
      fatorData = "0";
    }
  }

  dataBoleto.add(Number(fatorData), "days");

  return dataBoleto.toDate();
};

/**
 * Identifica o valor no CÓDIGO DE BARRAS do boleto do tipo 'Arrecadação'
 *
 * -------------
 *
 * @param {string} codigo Numeração do boleto
 * @param {string} codeType tipo de código inserido (CÓDIGO_DE_BARRAS / LINHA_DIGITÁVEL)
 *
 * -------------
 *
 * @return {string} valorFinal
 */
export function identifyBarcodeCollectionValue(code, codeType) {
  code = code.replace(/[^0-9]/g, "");
  const isValorEfetivo = identifyReference(code).efetivo;

  let valorBoleto = "";
  let valorFinal;

  if (isValorEfetivo) {
    if (codeType == "LINHA_DIGITÁVEL") {
      valorBoleto = code.substr(4, 14);
      valorBoleto = code.split("");
      valorBoleto.splice(11, 1);
      valorBoleto = valorBoleto.join("");
      valorBoleto = valorBoleto.substr(4, 11);
    } else if (codeType == "CÓDIGO_DE_BARRAS") {
      valorBoleto = code.substr(4, 11);
    }

    valorFinal = `${valorBoleto.substr(0, 9)}.${valorBoleto.substr(9, 2)}`;

    let char = valorFinal.substr(1, 1);
    while (char === "0") {
      valorFinal = substringReplace(valorFinal, "", 0, 1);
      char = valorFinal.substr(1, 1);
    }
  } else {
    valorFinal = 0;
  }

  return valorFinal;
};

// !
/**
 * Identifica o valor no boleto inserido
 *
 * -------------
 *
 * @param {string} codigo Numeração do boleto
 * @param {string} codeType tipo de código inserido (CÓDIGO_DE_BARRAS / LINHA_DIGITÁVEL)
 *
 * -------------
 *
 * @return {float} valorFinal
 */
export const identifyValue = (codigo, codeType) => {
  const tipoBoleto = boletoTypeIdentifier(codigo);

  let valorBoleto = "";
  let valorFinal;

  if (codeType == "CÓDIGO_DE_BARRAS") {
    if (tipoBoleto == "BANCO" || tipoBoleto == "CARTÃO_DE_CRÉDITO") {
      valorBoleto = codigo.substr(9, 10);
      valorFinal = `${valorBoleto.substr(0, 8)}.${valorBoleto.substr(8, 2)}`;

      let char = valorFinal.substr(1, 1);
      while (char === "0") {
        valorFinal = substringReplace(valorFinal, "", 0, 1);
        char = valorFinal.substr(1, 1);
      }
    } else {
      valorFinal = identifyBarcodeCollectionValue(
        codigo,
        "CÓDIGO_DE_BARRAS"
      );
    }
  } else if (codeType == "LINHA_DIGITÁVEL") {
    if (tipoBoleto == "BANCO" || tipoBoleto == "CARTÃO_DE_CRÉDITO") {
      valorBoleto = codigo.substr(37);
      valorFinal = `${valorBoleto.substr(0, 8)}.${valorBoleto.substr(8, 2)}`;

      let char = valorFinal.substr(1, 1);
      while (char === "0") {
        valorFinal = substringReplace(valorFinal, "", 0, 1);
        char = valorFinal.substr(1, 1);
      }
    } else {
      valorFinal = identifyBarcodeCollectionValue(
        codigo,
        "LINHA_DIGITÁVEL"
      );
    }
  }
  return parseFloat(valorFinal);
};

/**
 * Define qual módulo deverá ser utilizado para calcular os dígitos verificadores
 *
 * -------------
 *
 * @param {string} codigo Numeração do boleto
 * @param {int} mod Modulo 10 ou Modulo 11
 *
 * -------------
 *
 * @return {string} digitoVerificador
 */
export const digitosVerificadores = (codigo, mod) => {
  codigo = codigo.replace(/[^0-9]/g, "");
  switch (mod) {
    case 10:
      return (codigo + calculaMod10(codigo)).toString();
      break;
    case 11:
      return (codigo + calculaMod11(codigo)).toString();
      break;
    default:
      break;
  }
};

/**
 * Converte a numeração do código de barras em linha digitável
 *
 * -------------
 *
 * @param {string} codigo Numeração do boleto
 * @param {boolean} formatada Gerar numeração convertida com formatação (formatado = true / somente números = false)
 *
 * -------------
 *
 * @return {string} resultado
 */
export const codBarras2LinhaDigitavel = (codigo, formatada) => {
  codigo = codigo.replace(/[^0-9]/g, "");

  const tipoBoleto = boletoTypeIdentifier(codigo);

  let resultado = "";

  if (tipoBoleto == "BANCO" || tipoBoleto == "CARTÃO_DE_CRÉDITO") {
    const novaLinha =
      codigo.substr(0, 4) +
      codigo.substr(19, 25) +
      codigo.substr(4, 1) +
      codigo.substr(5, 14);

    const bloco1 =
      novaLinha.substr(0, 9) + calculaMod10(novaLinha.substr(0, 9));
    const bloco2 =
      novaLinha.substr(9, 10) + calculaMod10(novaLinha.substr(9, 10));
    const bloco3 =
      novaLinha.substr(19, 10) + calculaMod10(novaLinha.substr(19, 10));
    const bloco4 = novaLinha.substr(29);

    resultado = (bloco1 + bloco2 + bloco3 + bloco4).toString();

    if (formatada) {
      resultado = `${resultado.slice(0, 5)}.${resultado.slice(
        5,
        10
      )} ${resultado.slice(10, 15)}.${resultado.slice(
        15,
        21
      )} ${resultado.slice(21, 26)}.${resultado.slice(
        26,
        32
      )} ${resultado.slice(32, 33)} ${resultado.slice(33)}`;
    }
  } else {
    const identificacaoValorRealOuReferencia = identifyReference(codigo);
    let bloco1;
    let bloco2;
    let bloco3;
    let bloco4;

    if (identificacaoValorRealOuReferencia.mod == 10) {
      bloco1 = codigo.substr(0, 11) + calculaMod10(codigo.substr(0, 11));
      bloco2 = codigo.substr(11, 11) + calculaMod10(codigo.substr(11, 11));
      bloco3 = codigo.substr(22, 11) + calculaMod10(codigo.substr(22, 11));
      bloco4 = codigo.substr(33, 11) + calculaMod10(codigo.substr(33, 11));
    } else if (identificacaoValorRealOuReferencia.mod == 11) {
      bloco1 = codigo.substr(0, 11) + calculaMod11(codigo.substr(0, 11));
      bloco2 = codigo.substr(11, 11) + calculaMod11(codigo.substr(11, 11));
      bloco3 = codigo.substr(22, 11) + calculaMod11(codigo.substr(22, 11));
      bloco4 = codigo.substr(33, 11) + calculaMod11(codigo.substr(33, 11));
    }

    resultado = bloco1 + bloco2 + bloco3 + bloco4;
  }

  return resultado;
};

/**
 * Converte a numeração da linha digitável em código de barras
 *
 * -------------
 *
 * @param {string} codigo Numeração do boleto
 *
 * -------------
 *
 * @return {string} resultado
 */
export const linhaDigitavel2CodBarras = (codigo) => {
  codigo = codigo.replace(/[^0-9]/g, "");

  const tipoBoleto = boletoTypeIdentifier(codigo);

  let resultado = "";

  if (tipoBoleto == "BANCO" || tipoBoleto == "CARTÃO_DE_CRÉDITO") {
    resultado =
      codigo.substr(0, 4) +
      codigo.substr(32, 1) +
      codigo.substr(33, 14) +
      codigo.substr(4, 5) +
      codigo.substr(10, 10) +
      codigo.substr(21, 10);
  } else {
    codigo = codigo.split("");
    codigo.splice(11, 1);
    codigo.splice(22, 1);
    codigo.splice(33, 1);
    codigo.splice(44, 1);
    codigo = codigo.join("");

    resultado = codigo;
  }

  return resultado;
};

/**
 * Calcula o dígito verificador de toda a numeração do código de barras
 *
 * -------------
 *
 * @param {string} codigo Numeração do boleto
 * @param {int} posicaoCodigo Posição onde deve se encontrar o dígito verificador
 * @param {int} mod Módulo 10 ou Módulo 11
 *
 * -------------
 *
 * @return {string} numero
 */
export const calculaDVCodBarras = (codigo, posicaoCodigo, mod) => {
  codigo = codigo.replace(/[^0-9]/g, "");

  codigo = codigo.split("");
  codigo.splice(posicaoCodigo, 1);
  codigo = codigo.join("");

  if (mod === 10) {
    return calculaMod10(codigo);
  }
  if (mod === 11) {
    return calculaMod11(codigo);
  }
};

/**
 * Informa se o código de barras inserido é válido, calculando seu dígito verificador.
 *
 * -------------
 *
 * @param {string} codigo Numeração do boleto
 *
 * -------------
 *
 * @return {boolean} true = boleto válido / false = boleto inválido
 */
export const validarCodigoComDV = (codigo, codeType) => {
  codigo = codigo.replace(/[^0-9]/g, "");
  let tipoBoleto;

  let resultado;

  if (codeType === "LINHA_DIGITÁVEL") {
    tipoBoleto = boletoTypeIdentifier(codigo, "LINHA_DIGITÁVEL");

    if (tipoBoleto == "BANCO" || tipoBoleto == "CARTÃO_DE_CRÉDITO") {
      const bloco1 = codigo.substr(0, 9) + calculaMod10(codigo.substr(0, 9));
      const bloco2 =
        codigo.substr(10, 10) + calculaMod10(codigo.substr(10, 10));
      const bloco3 =
        codigo.substr(21, 10) + calculaMod10(codigo.substr(21, 10));
      const bloco4 = codigo.substr(32, 1);
      const bloco5 = codigo.substr(33);

      resultado = (bloco1 + bloco2 + bloco3 + bloco4 + bloco5).toString();
    } else {
      const identificacaoValorRealOuReferencia = identifyReference(codigo);
      let bloco1;
      let bloco2;
      let bloco3;
      let bloco4;

      if (identificacaoValorRealOuReferencia.mod == 10) {
        bloco1 = codigo.substr(0, 11) + calculaMod10(codigo.substr(0, 11));
        bloco2 = codigo.substr(12, 11) + calculaMod10(codigo.substr(12, 11));
        bloco3 = codigo.substr(24, 11) + calculaMod10(codigo.substr(24, 11));
        bloco4 = codigo.substr(36, 11) + calculaMod10(codigo.substr(36, 11));
      } else if (identificacaoValorRealOuReferencia.mod == 11) {
        bloco1 = codigo.substr(0, 11);
        bloco2 = codigo.substr(12, 11);
        bloco3 = codigo.substr(24, 11);
        bloco4 = codigo.substr(36, 11);

        const dv1 = parseInt(codigo.substr(11, 1));
        const dv2 = parseInt(codigo.substr(23, 1));
        const dv3 = parseInt(codigo.substr(35, 1));
        const dv4 = parseInt(codigo.substr(47, 1));
        // console.log(dv1)
        // console.log(calculaMod11(bloco1))
        // console.log(dv2)
        // console.log(calculaMod11(bloco2))
        // console.log(dv3)
        // console.log(calculaMod11(bloco3))
        // console.log(dv4)
        // console.log(calculaMod11(bloco4))

        const valid =
          calculaMod11(bloco1) == dv1 &&
          calculaMod11(bloco2) == dv2 &&
          calculaMod11(bloco3) == dv3 &&
          calculaMod11(bloco4) == dv4;

        return valid;
      }

      resultado = bloco1 + bloco2 + bloco3 + bloco4;
    }
  } else if (codeType === "CÓDIGO_DE_BARRAS") {
    tipoBoleto = boletoTypeIdentifier(codigo);

    if (tipoBoleto == "BANCO" || tipoBoleto == "CARTÃO_DE_CRÉDITO") {
      const DV = calculaDVCodBarras(codigo, 4, 11);
      resultado = codigo.substr(0, 4) + DV + codigo.substr(5);
    } else {
      const identificacaoValorRealOuReferencia = identifyReference(codigo);

      resultado = codigo.split("");
      resultado.splice(3, 1);
      resultado = resultado.join("");

      const DV = calculaDVCodBarras(
        codigo,
        3,
        identificacaoValorRealOuReferencia.mod
      );
      resultado = resultado.substr(0, 3) + DV + resultado.substr(3);
    }
  }

  return codigo === resultado;
};

/**
 * Gerar código de barras já realizando o cálculo do dígito verificador
 *
 * -------------
 *
 * @param {string} novoCodigo Numeração do boleto
 *
 * -------------
 *
 * @return {string} numero
 */
export const geraCodBarras = (codigo) => {
  codigo = codigo.replace(/[^0-9]/g, "");

  const tipoBoleto = boletoTypeIdentifier(codigo);

  let novoCodigo;

  novoCodigo = linhaDigitavel2CodBarras(codigo);
  novoCodigo = novoCodigo.split("");
  novoCodigo.splice(4, 1);
  novoCodigo = novoCodigo.join("");
  const dv = calculaMod11(novoCodigo);
  novoCodigo = novoCodigo.substr(0, 4) + dv + novoCodigo.substr(4);

  return novoCodigo;
};

export const validarBoleto = (codigo) => {
  const codeType = codeTypeIdentifier(codigo);

  const retorno = {};
  codigo = codigo.replace(/[^0-9]/g, "");

  /**
   * Boletos de cartão de crédito geralmente possuem 46 dígitos. É necessário adicionar mais um zero no final, para formar 47 caracteres
   * Alguns boletos de cartão de crédito do Itaú possuem 36 dígitos. É necessário acrescentar 11 zeros no final.
   */
  if (codigo.length == 36) {
    codigo += "00000000000";
  } else if (codigo.length == 46) {
    codigo += "0";
  }

  if (
    codigo.length != 44 &&
    codigo.length != 46 &&
    codigo.length != 47 &&
    codigo.length != 48
  ) {
    retorno.sucesso = false;
    retorno.codigoInput = codigo;
    retorno.mensagem = `O código inserido possui ${codigo.length} dígitos. Por favor insira uma numeração válida. Códigos de barras SEMPRE devem ter 44 caracteres numéricos. Linhas digitáveis podem possuir 46 (boletos de cartão de crédito), 47 (boletos bancários/cobrança) ou 48 (contas convênio/arrecadação) caracteres numéricos. Qualquer caractere não numérico será desconsiderado.`;
  } else if (
    codigo.substr(0, 1) == "8" &&
    codigo.length == 46 &&
    codigo.length == 47
  ) {
    retorno.sucesso = false;
    retorno.codigoInput = codigo;
    retorno.mensagem =
      "Este tipo de boleto deve possuir um código de barras 44 caracteres numéricos. Ou linha digitável de 48 caracteres numéricos.";
  } else if (!validarCodigoComDV(codigo, codeType)) {
    retorno.sucesso = false;
    retorno.codigoInput = codigo;
    retorno.mensagem =
      "A validação do dígito verificador falhou. Tem certeza que inseriu a numeração correta?";
  } else {
    retorno.sucesso = true;
    retorno.codigoInput = codigo;
    retorno.mensagem = "Boleto válido";

    switch (codeType) {
      case "LINHA_DIGITÁVEL":
        retorno.codeTypeInput = "LINHA_DIGITÁVEL";
        retorno.tipoBoleto = boletoTypeIdentifier(codigo, "LINHA_DIGITÁVEL");
        retorno.codigoBarras = linhaDigitavel2CodBarras(codigo);
        retorno.linhaDigitavel = codigo;
        retorno.vencimento = identificarData(codigo, "LINHA_DIGITÁVEL");
        retorno.valor = identifyValue(codigo, "LINHA_DIGITÁVEL");
        break;
      case "CÓDIGO_DE_BARRAS":
        retorno.codeTypeInput = "CÓDIGO_DE_BARRAS";
        retorno.tipoBoleto = boletoTypeIdentifier(codigo, "CÓDIGO_DE_BARRAS");
        retorno.codigoBarras = codigo;
        retorno.linhaDigitavel = codBarras2LinhaDigitavel(codigo, false);
        retorno.vencimento = identificarData(codigo, "CÓDIGO_DE_BARRAS");
        retorno.valor = identifyValue(codigo, "CÓDIGO_DE_BARRAS");
        break;
      default:
        break;
    }
  }

  return retorno;
};

/**
 * Calcula o dígito verificador de uma numeração a partir do módulo 10
 *
 * -------------
 *
 * @param {string} numero Numeração
 *
 * -------------
 *
 * @return {string} soma
 */
export const calculaMod10 = (numero) => {
  numero = numero.replace(/\D/g, "");
  let i;
  let mult = 2;
  let soma = 0;
  let s = "";

  for (i = numero.length - 1; i >= 0; i--) {
    s = mult * parseInt(numero.charAt(i)) + s;
    if (--mult < 1) {
      mult = 2;
    }
  }
  for (i = 0; i < s.length; i++) {
    soma += parseInt(s.charAt(i));
  }
  soma %= 10;
  if (soma != 0) {
    soma = 10 - soma;
  }
  return soma;
};

/**
 * Calcula o dígito verificador de uma numeração a partir do módulo 11
 *
 * -------------
 *
 * @param {string} x Numeração
 *
 * -------------
 *
 * @return {string} digito
 */
export const calculaMod11 = (x) => {
  const sequencia = [4, 3, 2, 9, 8, 7, 6, 5];
  let digit = 0;
  let j = 0;
  let DAC = 0;

  // FEBRABAN https://cmsportal.febraban.org.br/Arquivos/documentos/PDF/Layout%20-%20C%C3%B3digo%20de%20Barras%20-%20Vers%C3%A3o%205%20-%2001_08_2016.pdf
  for (let i = 0; i < x.length; i++) {
    const mult = sequencia[j];
    j++;
    j %= sequencia.length;
    digit += mult * parseInt(x.charAt(i));
  }

  DAC = digit % 11;

  if (DAC == 0 || DAC == 1) return 0;
  if (DAC == 10) return 1;

  return 11 - DAC;
};

/**
 * Função auxiliar para remover os zeros à esquerda dos valores detectados no código inserido
 *
 * -------------
 *
 * @param {string} str Texto a ser verificado
 * @param {string} repl Texto que substituirá
 * @param {int} inicio Posição inicial
 * @param {int} tamanho Tamanho
 *
 * -------------
 *
 * @return {string} resultado
 */
function substringReplace(str, repl, inicio, tamanho) {
  if (inicio < 0) {
    inicio += str.length;
  }

  tamanho = tamanho !== undefined ? tamanho : str.length;
  if (tamanho < 0) {
    tamanho = tamanho + str.length - inicio;
  }

  return [
    str.slice(0, inicio),
    repl.substr(0, tamanho),
    repl.slice(tamanho),
    str.slice(inicio + tamanho),
  ].join("");
}
