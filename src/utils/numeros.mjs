const LIMPIAR_ESPACIOS_Y_MONEDA = /[\s\u00a0$]/g;
const CARACTERES_PERMITIDOS = /^[\d.,+\-\s\u00a0$]*$/;

export const esEntradaNumericaPermitida = (valor) =>
  CARACTERES_PERMITIDOS.test(String(valor ?? ""));

export const parseNumeroLocalizado = (valor) => {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;

  const limpio = String(valor ?? "").replace(LIMPIAR_ESPACIOS_Y_MONEDA, "");
  if (limpio === "") return 0;
  if (!/^[+-]?\d+(?:[.,]\d+)*$/.test(limpio)) return null;

  const signo = limpio.startsWith("-") ? -1 : 1;
  const cuerpo = limpio.replace(/^[+-]/, "");
  const puntos = [...cuerpo.matchAll(/\./g)].map(({ index }) => index);
  const comas = [...cuerpo.matchAll(/,/g)].map(({ index }) => index);
  let decimal = null;

  if (puntos.length && comas.length) {
    decimal = puntos.at(-1) > comas.at(-1) ? "." : ",";
  } else if (comas.length === 1) {
    decimal = ",";
  } else if (puntos.length === 1) {
    const decimales = cuerpo.length - puntos[0] - 1;
    decimal = decimales === 3 ? null : ".";
  } else if (puntos.length > 1 || comas.length > 1) {
    const separador = puntos.length ? "." : ",";
    const partes = cuerpo.split(separador);
    const agrupacionValida = partes[0].length >= 1 && partes.slice(1).every((parte) => parte.length === 3);
    if (!agrupacionValida) return null;
  }

  let normalizado;
  if (decimal) {
    const posicionDecimal = cuerpo.lastIndexOf(decimal);
    const enteros = cuerpo.slice(0, posicionDecimal).replace(/[.,]/g, "");
    const decimales = cuerpo.slice(posicionDecimal + 1).replace(/[.,]/g, "");
    if (!enteros || !decimales) return null;
    normalizado = `${enteros}.${decimales}`;
  } else {
    normalizado = cuerpo.replace(/[.,]/g, "");
  }

  const numero = Number(normalizado) * signo;
  return Number.isFinite(numero) ? numero : null;
};

export const formatearNumeroLocalizado = (valor) => {
  const numero = parseNumeroLocalizado(valor);
  if (numero === null) return null;
  if (String(valor ?? "").trim() === "") return "";

  return new Intl.NumberFormat("es-AR", {
    useGrouping: true,
    maximumFractionDigits: 20,
  }).format(numero);
};

export const prepararNumeroParaEdicion = (valor) => {
  const numero = parseNumeroLocalizado(valor);
  if (numero === null || String(valor ?? "").trim() === "") return String(valor ?? "").trim();
  return String(numero).replace(".", ",");
};
