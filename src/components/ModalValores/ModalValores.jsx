import React, { useState, useEffect, useContext, useMemo } from "react";
import UserContext from '../../context/userContext'
import getValoresMapping from "../../utils/valoresMapping";
import styles from "./ModalValores.module.scss";
import bbva from "../../logos/bbva.svg"
import bna from "../../logos/bna.svg"
import dolares from "../../logos/dolar.svg"
import expensas from "../../logos/octopus.svg"
import mc from "../../logos/mc.svg"
import visa from "../../logos/visa.svg"
import formatearMes from "../../utils/formatearMes";
import { GoArrowLeft, GoX } from "react-icons/go";
import {
  esEntradaNumericaPermitida,
  formatearNumeroLocalizado,
  parseNumeroLocalizado,
  prepararNumeroParaEdicion,
} from "../../utils/numeros.mjs";

export default function ModalValores({ valores, onApply, onClose, mesActual, embedded = false }) {
  const { profile } = useContext(UserContext);
  const depto = profile?.depto;
  const cochera = profile?.cochera;
  const valoresMapping = useMemo(() => getValoresMapping(depto, cochera), [depto, cochera]);
  const [localValores, setLocalValores] = useState({});
  const [localVencimientos, setLocalVencimientos] = useState({});
  const [dirty, setDirty] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [erroresCampos, setErroresCampos] = useState({});
  const sinVencimiento = ["colchon", "cajaAhorroActual", "dbRg5617", "dolares", "valorUSD"];

  useEffect(() => {
    if (embedded) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [embedded]);

  useEffect(() => {
    const preventUnload = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", preventUnload);
    return () => window.removeEventListener("beforeunload", preventUnload);
  }, [dirty]);

  const intentarCerrar = () => {
    if (dirty && !window.confirm("Hay cambios sin guardar. ¿Querés descartarlos?")) return;
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") intentarCerrar();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dirty, onClose]);

  // Inicializamos valores con formato (coma + puntos) o vacíos
  useEffect(() => {
  // if (!valores || Object.keys(valoresMapping).length === 0) return;
  if (Object.keys(valoresMapping).length === 0) return;

  const inicial = {};
  const inicialVenc = {};
  Object.keys(valoresMapping).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(valores, key)) {
      const val = valores[key];
      // if (val !== undefined && val !== null) {
      if (val !== undefined && val !== null && val !== 0) {
        const partes = val.toString().split(".");
        const entera = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        const decimal = partes[1] || "";
        inicial[key] = decimal ? `${entera},${decimal}` : entera;
      } else {
        inicial[key] = "";
      }
      inicialVenc[key] = valores?.[`venc_${key}`] || "";
    } else {
      inicial[key] = "";
      inicialVenc[key] = "";
    }
  });
  setLocalValores(inicial);
  setLocalVencimientos(inicialVenc);
}, [valores, valoresMapping]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (esEntradaNumericaPermitida(value)) {
      setLocalValores((prev) => ({ ...prev, [name]: value }));
      setErroresCampos((prev) => ({ ...prev, [name]: false }));
      setDirty(true);
    }
  };

  const handleVencChange = (e) => {
  const { name, value } = e.target;
  const cleanName = name.replace(/^venc_/, ""); // quitamos prefijo al guardar
  setLocalVencimientos((prev) => ({ ...prev, [cleanName]: value }));
  setDirty(true);
};

  const handleFocus = (name, event) => {
    setLocalValores((prev) => ({ ...prev, [name]: prepararNumeroParaEdicion(prev[name]) }));
    event.target.select();
  };

  const handleBlur = (name) => {
    setLocalValores((prev) => {
      const formateado = formatearNumeroLocalizado(prev[name]);
      const invalido = formateado === null;
      setErroresCampos((erroresPrevios) => ({ ...erroresPrevios, [name]: invalido }));
      return invalido ? prev : { ...prev, [name]: formateado };
    });
  };

  const handleCerrar = async () => {
    const nuevosValores = {};
    const nuevosErrores = {};
    Object.keys(localValores).forEach((k) => {
      const numero = parseNumeroLocalizado(localValores[k]);
      nuevosErrores[k] = numero === null;
      nuevosValores[k] = numero;
      nuevosValores[`venc_${k}`] = localVencimientos[k] || "";
    });
    if (Object.values(nuevosErrores).some(Boolean)) {
      setErroresCampos(nuevosErrores);
      setError("Revisá los importes marcados antes de guardar.");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      await onApply(nuevosValores);
      setDirty(false);
    } catch (err) {
      console.error("Error al guardar los valores:", err);
      setError("No se pudieron guardar los cambios. Intentá nuevamente.");
      setGuardando(false);
    }
  };

const grupos = Object.entries(valoresMapping).reduce((acc, [key, { label, group }]) => {
  if (!acc[group]) acc[group] = [];
  acc[group].push({ key, label });
  return acc;
}, {});

const groupClass = {
  colchon: styles.groupColchon,
  inicio: styles.groupInicio,
  bbva: styles.groupBBVA,
  bna: styles.groupBNA,
  dolares: styles.groupDolares,
  expensas: styles.groupExpensas,
};

const groupLogos = {
  bbva: bbva,
  bna: bna,
  dolares: dolares,
  expensas: expensas,
  MasterCard: mc,
  VISA: visa,
  "Total resumen": visa,
};

return (
    <div className={embedded ? styles.editorPage : styles.modalValoresOverlay} onMouseDown={(event) => !embedded && event.target === event.currentTarget && intentarCerrar()}>
        <div className={styles.modalValores} role={embedded ? undefined : "dialog"} aria-modal={embedded ? undefined : "true"} aria-labelledby="modal-valores-titulo">
          <div className={styles.modalHeader}>
            <button
              className={styles.closeButton}
              onClick={intentarCerrar}
              aria-label={embedded ? "Volver a la planilla" : "Cerrar"}
            >
              {embedded ? <><GoArrowLeft /><span>Volver</span></> : <GoX />}
            </button>

            <div className={styles.modalTitulo} id="modal-valores-titulo">
              <span className={styles.tituloAccion}>Editar planilla</span>
              <span>{formatearMes(mesActual)}</span>
            </div>
          </div>
                <div className={styles.inputs}>
                    {Object.entries(grupos).map(([group, items]) => (
                    <div key={group} className={`${styles.groups} ${groupClass[group]} ${styles.groupsDiv}`}>

                        <div>
                          {groupLogos[group] && (
                            <div className={styles.groupLogosDiv}>
                              <img
                                  src={groupLogos[group]}
                                  alt={group}
                                  className={styles.groupLogo}
                              />
                            </div>
                          )}
                        </div>

                        {items.map(({ key, label }) => {
                          const hasLogo = !!groupLogos[label];
                          return (
                          <div key={key} className={styles.inputGroup}>
                            <div className={styles.labelLogoWrapper}>
                              {hasLogo && (
                                <img
                                  src={groupLogos[label]}
                                  alt={label}
                                  className={styles.labelLogo}
                                />
                              )}
                              {(!hasLogo || label === "Total resumen") && (
                              <label className={styles.inputLabel}>{label}</label>
                              )}
                            </div>
                            {sinVencimiento.includes(key) ? (
                              // solo el campo de monto
                              <input
                                type="text"
                                inputMode="decimal"
                                name={key}
                                value={localValores[key] || ""}
                                onChange={handleChange}
                                onBlur={() => handleBlur(key)}
                                onFocus={(e) => handleFocus(key, e)}
                                aria-invalid={erroresCampos[key] || undefined}
                                placeholder="Monto"
                              />
                            ) : (
                              // campo doble: monto + vencimiento
                              <div className={styles.dualInput}>
                                <input
                                  type="date"
                                  name={`venc_${key}`}
                                  value={localVencimientos[key] || ""}
                                  onChange={handleVencChange}
                                  className={styles.inputVenc}
                                  placeholder="Vencimiento"
                                />
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  name={key}
                                  value={localValores[key] || ""}
                                  onChange={handleChange}
                                  onBlur={() => handleBlur(key)}
                                  onFocus={(e) => handleFocus(key, e)}
                                  aria-invalid={erroresCampos[key] || undefined}
                                  placeholder="Monto"
                                />
                              </div>
                            )}
                        </div>
                      )})}
                    </div>
                    ))}
                </div>
                <div className={styles.botones}>
                    <span className={dirty ? styles.estadoPendiente : styles.estadoGuardado}>{dirty ? "Cambios sin guardar" : "Sin cambios pendientes"}</span>
                    {error && <span className={styles.error} role="alert">{error}</span>}
                    <button className={'btn btn--secundario'} onClick={intentarCerrar}>Cancelar</button>
                    <button className={'btn btn--primario'} disabled={!dirty || guardando} onClick={handleCerrar}>{guardando ? "Guardando…" : "Guardar cambios"}</button>
                </div>
        </div>
    </div>
);
}
