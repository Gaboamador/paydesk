import test from "node:test";
import assert from "node:assert/strict";
import {
  esEntradaNumericaPermitida,
  formatearNumeroLocalizado,
  parseNumeroLocalizado,
  prepararNumeroParaEdicion,
} from "./numeros.mjs";

const casos = [
  ["159.758,93  ", 159758.93],
  ["159.758,93", 159758.93],
  ["159758,93", 159758.93],
  ["$ 159.758,93", 159758.93],
  ["159758.93", 159758.93],
  ["159,758.93", 159758.93],
  ["159.758,93\u00a0", 159758.93],
  ["159.758", 159758],
  ["1.234.567,89", 1234567.89],
  ["1,234,567", 1234567],
  ["0,50", 0.5],
  ["", 0],
];

test("interpreta entradas monetarias habituales", () => {
  for (const [entrada, esperado] of casos) {
    assert.equal(parseNumeroLocalizado(entrada), esperado, entrada);
  }
});

test("rechaza entradas ambiguas o inválidas", () => {
  assert.equal(parseNumeroLocalizado("15,2,3"), null);
  assert.equal(parseNumeroLocalizado("hola"), null);
  assert.equal(parseNumeroLocalizado("12-3"), null);
});

test("formatea al perder el foco y permite continuar editando", () => {
  assert.equal(formatearNumeroLocalizado("159758,93"), "159.758,93");
  assert.equal(prepararNumeroParaEdicion("159.758,93"), "159758,93");
  assert.equal(parseNumeroLocalizado(`${prepararNumeroParaEdicion("159.758,93")}4`), 159758.934);
});

test("admite caracteres de pegado esperados", () => {
  assert.equal(esEntradaNumericaPermitida("$ 159.758,93  "), true);
  assert.equal(esEntradaNumericaPermitida("159758.93"), true);
  assert.equal(esEntradaNumericaPermitida("159k"), false);
});
