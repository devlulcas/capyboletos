![O que é o código de barras FEBRABAN](https://blog.mgitech.com.br/blog/bid/112761/O-que-o-c-digo-de-barras-Febraban)
![Composição de um código de barras](https://www.banese.com.br/wps/discovirtual/download?nmInternalFolder=/Empresa_recebimento&nmFile=Composicao%20da%20Linha%20Digitavel%20e%20do%20Codigo%20de%20Barras_05062017.pdf)

- Todo boleto bancário deve conter o código de barras e a linha digitável
- O código de barras deve ser do tipo `2 de 5`, com no máximo 44 dígitos.

```
As posições no código devem conter obrigatoriamente as seguintes informações: código do banco, tipo de moeda, dígito verificador do código de barras, valor do documento, código do cedente, código do documento e data do vencimento em formato Juliano quando o documento tiver vencimento.
```

## Abaixo a explicação de como calcular o dígito verificador para o boleto (código 2 de 5 padrão FEBRABAN) se o código de barras fosse 5555555555:

- Multiplica-se cada digito do numero de 2 à 9, da direita para a esquerda, somando cada resultado

```
//  3 <- 2 (reinicia) 9 <- 8 <- 7 <- 6 <- 5 <- 4 <- 3 <- 2 (início)

(5*3) + (5*2) + (5*9) + (5*8) + (5*7) + (5*6) + (5*5) + (5*4) + (5*3) + (5*2) = 245;
```

- Calcula-se o módulo 11 do resultado da soma

```
245 % 11 = 3;
```

- Se o modulo for igual a 0 ou 1 o digito verificador será 0

- Se o modulo for maior que 1 deve-se diminuir o resultado de 11

- 11 - 3 = 8; Portanto o digito verificador é 8

- 5555555555-8
