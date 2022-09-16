import { BoletoType } from "./types/boleto-type";
import { CodeType } from "./types/code-type";
import { addDays } from "./utils/date";
import { leaveOnlyNumbers, substringReplace } from "./utils/string";

/**
 * Identifica o tipo de código inserido (se baseando na quantidade de dígitos).
 */
export function codeTypeIdentifier(code: string): CodeType {
  const cleanedUpCode = leaveOnlyNumbers(code);

  const length = cleanedUpCode.length;

  // Códigos de barra tem 44 posições
  if (length === 44) {
    return "CÓDIGO_DE_BARRAS";
  }

  // A linha digitável tem 46, 47 ou 48 posições
  if (length === 46 || length === 47 || length === 48) {
    return "LINHA_DIGITÁVEL";
  }

  return "TAMANHO_INCORRETO";
}

/**
 * Identifica o tipo de boleto inserido a partir da validação de seus dois dígitos iniciais.
 */
export function boletoTypeIdentifier(code: string): BoletoType {
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
    const secondChar = parseInt(cleanedUpCode.charAt(1), 10);

    switch (secondChar) {
      case 1:
        return "ARRECADAÇÃO_PREFEITURA";
      case 2:
        return "CONVÊNIO_SANEAMENTO";
      case 3:
        return "CONVÊNIO_ENERGIA_ELÉTRICA_E_GAS";
      case 4:
        return "CONVÊNIO_TELECOMUNICAÇÕES";
      case 5:
        return "ARRECADAÇÃO_ÓRGÃOS_GOVERNAMENTAIS";
      case 6:
        return "OUTROS";
      case 7:
        return "ARRECADAÇÃO_TAXAS_DE_TRANSITO";
      case 9:
        return "OUTROS";
    }
  }

  return "BANCO";
}

/**
 * Identifica o o código de referência do boleto para determinar qual módulo
 * será utilizado para calcular os dígitos verificadores
 */
export function identifyReference(code: string) {
  const cleanedUpCode = code.replace(/[^0-9]/g, "");

  const reference = parseInt(cleanedUpCode.substr(2, 1));

  if (typeof cleanedUpCode !== "string") {
    throw new TypeError("Insira uma string válida!");
  }

  switch (reference) {
    case 6:
      return {
        mod: 10,
        effective: true,
      };
    case 7:
      return {
        mod: 10,
        effective: false,
      };
    case 8:
      return {
        mod: 11,
        effective: true,
      };
    case 9:
      return {
        mod: 11,
        effective: false,
      };
  }
}

/**
 * Identifica o fator da data de vencimento do boleto.
 *
 * O valor é calculado usando uma data base (07/10/1997) somado com os
 * dias passados entre essa data e a data de vencimento.
 * Os dias passados estão presentes no código na forma de quatro dígitos, no último
 * campo do valor.
 */
export function identifyDate(code: string, codeType: CodeType) {
  const cleanedUpCode = code.replace(/[^0-9]/g, "");

  const typeOfBoleto = boletoTypeIdentifier(cleanedUpCode);

  let dateFactor = "";

  const baseDate = new Date("Tue, 07 Oct 1997 14:00:00 GMT");

  if (typeOfBoleto == "BANCO" || typeOfBoleto == "CARTÃO_DE_CRÉDITO") {
    if (codeType === "CÓDIGO_DE_BARRAS") {
      dateFactor = cleanedUpCode.substr(5, 4);
    } else if (codeType === "LINHA_DIGITÁVEL") {
      dateFactor = cleanedUpCode.substr(33, 4);
    }
  } else {
    dateFactor = "0";
  }

  const parsedDateFactor = parseInt(dateFactor, 10);

  return addDays(baseDate, parsedDateFactor);
}

/**
 * Identifica o valor no CÓDIGO DE BARRAS do boleto do tipo 'Arrecadação'
 */
export function identifyBarcodeCollectionValue(
  code: string,
  codeType: CodeType
) {
  const cleanedUpCode = code.replace(/[^0-9]/g, "");

  const isEffectiveValue = identifyReference(cleanedUpCode)?.effective;

  let boletoValue = "";
  let boletoValueArray = [];
  let finalValue: string;

  if (isEffectiveValue) {
    if (codeType === "LINHA_DIGITÁVEL") {
      boletoValue = cleanedUpCode.substr(4, 14);
      boletoValueArray = cleanedUpCode.split("");
      boletoValueArray.splice(11, 1);
      boletoValue = boletoValueArray.join("");
      boletoValue = boletoValue.substr(4, 11);
    } else if (codeType === "CÓDIGO_DE_BARRAS") {
      boletoValue = cleanedUpCode.substr(4, 11);
    }

    finalValue = `${boletoValue.substr(0, 9)}.${boletoValue.substr(9, 2)}`;

    let char = finalValue.substr(1, 1);

    while (char === "0") {
      finalValue = substringReplace(finalValue, "", 0, 1);
      char = finalValue.substr(1, 1);
    }
  } else {
    finalValue = "0";
  }

  return parseFloat(finalValue);
}
