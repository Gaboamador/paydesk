import { useState, useRef, useEffect } from "react";
import styles from "./CopiarDropdown.module.scss";

export default function CopiarDropdown({ opciones }) {
  const [abierto, setAbierto] = useState(false);
  const [copiadoLabel, setCopiadoLabel] = useState(null);
  const dropdownRef = useRef();

  // Cerramos el dropdown al clickear fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = async (texto, label) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiadoLabel(`${label} copiado`);
    } catch {
      setCopiadoLabel("No se pudo copiar");
    }
    setTimeout(() => setCopiadoLabel(null), 1500);
    setAbierto(false);
  };

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button className={`btn btn--secundario ${styles.botonPrincipal}`} onClick={() => setAbierto(!abierto)} aria-expanded={abierto} aria-haspopup="menu">
        {copiadoLabel || 'Copiar'}
        <span className={styles.flecha}>{abierto ? "▲" : "▼"}</span>
      </button>

      {abierto && (
        <div className={styles.menu} role="menu">
          {opciones.map((op) => (
            <button
              type="button"
              key={op.label}
              className={styles.item}
              onClick={() => handleClick(op.texto, op.label)}
              role="menuitem"
            >
            {op.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
