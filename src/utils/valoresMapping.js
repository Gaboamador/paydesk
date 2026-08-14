const getValoresMapping = (depto, cochera) => ({
  colchon: { label: "Colchón", group: "colchon" },
  cajaAhorroActual: { label: "Caja ahorro actual", group: "inicio" },
  visaBBVATotalResumen: { label: "Total resumen", group: "bbva" },
  dbRg5617: { label: "DB.RG 5617 30%", group: "bbva" },
  mcBBVA: { label: "MasterCard", group: "bbva" },
  visaBNA: { label: "VISA", group: "bna" },
  mcBNA: { label: "MasterCard", group: "bna" },
  dolares: { label: "Dólares", group: "dolares" },
  valorUSD: { label: "Valor USD", group: "dolares" },

  // 👇 Campos dinámicos según user
  exp1: {
    label: String(depto || "Expensas 1"),
    group: "expensas",
  },
  exp2: {
    label: String(cochera || "Expensas 2"),
    group: "expensas",
  },
});

export default getValoresMapping;
