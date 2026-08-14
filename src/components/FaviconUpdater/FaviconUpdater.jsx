import React, { useEffect } from "react";

const readCssVar = (name, fallback) => {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name);
  return (v || fallback).trim();
};

const buildSvgString = (primary, secondary, tertiary, size = 64) => {
  // Ajustá el contenido SVG si tu isotipo cambia.
  return `
    <svg xmlns="http://www.w3.org/2000/svg"
      width="${size}"
      height="${size}"
      viewBox="0 0 183.79 195.46"
      preserveAspectRatio="xMidYMid meet">
      <g>
        <path fill="${primary}" d="M0,.11c2.37,1.85,5.2,4.5,7.73,8.18,5.98,8.68,6.53,17.65,6.5,21.75v165.38c3.58.16,20.39.53,33.66-11.78,7.06-6.54,10.17-13.94,11.55-18.15V42.64h57.26c-3.87-1.9-9.63-5.18-15.38-10.57-10.08-9.45-10.98-16.79-19.58-23.59-4.13-3.27-10.95-7.13-22.18-8.36H0Z"/>
        <path fill="${secondary}" d="M62.25,149.89h60.3c5.57-.99,29.48-5.87,46.35-28.2,14.14-18.72,14.88-38.51,14.85-45,.21-6.34.13-27.97-15.3-48C149.46,4.03,121.73.63,116.78.11h-58.39c6.57.33,15.76,1.9,23.21,8.33,5.6,4.82,6.63,9.3,11.7,15.9,4.15,5.4,11.17,12.45,23.48,18.3,3.06,1.73,8.03,5.08,12.22,10.95,6.25,8.75,6.96,17.75,7.05,21.41.35,3.21,1.11,13.99-5.85,24.34-4.54,6.74-10.32,10.26-13.42,11.85-3.38,1.7-8.01,3.6-13.73,4.8-7.07,1.48-13.15,1.34-17.4.9-3.25,1.36-10.02,4.72-15.6,12-6.58,8.59-7.59,17.52-7.8,21Z"/>
        <path fill="${tertiary}" d="M58.39.11c9.47-.77,19.75,2.49,26.73,9.32,6.81,6.48,10.76,15.47,17.23,21.89,4.15,4.29,9.01,8.02,14.36,11.32-6.16-1.38-11.98-4.36-17.02-8.43-4.99-3.96-8.8-9.38-12.37-14.47C80.22,8.95,70.98,3.24,58.39.11h0Z"/>
      </g>
    </svg>
  `.trim();
};

const setFaviconDataUrl = (svgString) => {
  // encodeURIComponent para data URL seguro
  const dataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);

  // Creamos/actualizamos 2 links: rel="icon" y rel="shortcut icon" (compatibilidad)
  let link = document.querySelector('link[rel="icon"]');
  let shortcut = document.getElementById("react-dynamic-shortcut-icon");

  const created = {
    link: false,
    shortcut: false,
  };

  if (!link) {
    link = document.createElement("link");
    link.id = "react-dynamic-favicon";
    link.rel = "icon";
    document.head.appendChild(link);
    created.link = true;
  }
  link.id = "react-dynamic-favicon";
  link.type = "image/svg+xml";
  link.href = dataUrl;

  if (!shortcut) {
    shortcut = document.createElement("link");
    shortcut.id = "react-dynamic-shortcut-icon";
    shortcut.rel = "shortcut icon";
    document.head.appendChild(shortcut);
    created.shortcut = true;
  }
  shortcut.href = dataUrl;

  // devolvemos función cleanup: eliminar solo si los creamos nosotros
  return () => {
    if (created.link) {
      const l = document.getElementById("react-dynamic-favicon");
      if (l && l.parentNode) l.parentNode.removeChild(l);
    }
    if (created.shortcut) {
      const s = document.getElementById("react-dynamic-shortcut-icon");
      if (s && s.parentNode) s.parentNode.removeChild(s);
    }
  };
};

const FaviconUpdater = ({ primary, secondary, tertiary, size = 64 }) => {
  useEffect(() => {
    // Si no nos pasaron colores, intentamos leer CSS variables
    const p = primary || readCssVar("--color-primary", "#008080");
    const s = secondary || readCssVar("--color-secondary", "#c0c0c0");
    const t = tertiary || readCssVar("--color-tertiary", "#ff6f61");

    // Build SVG and set as favicon
    const svg = buildSvgString(p, s, t, size);
    const cleanup = setFaviconDataUrl(svg);

    // cleanup solo si el link fue creado por esta invocación (handled inside)
    return cleanup;
  }, [primary, secondary, tertiary, size]);

  return null;
};

export default FaviconUpdater;
