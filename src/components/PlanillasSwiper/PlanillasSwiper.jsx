import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { GrTableAdd } from "react-icons/gr";
import { eliminarPlanilla, guardarPlanilla, obtenerTodasLasPlanillas } from "../../utils/firestoreHelper";
import UserContext from "../../context/userContext";
import formatearMes from "../../utils/formatearMes";
import { calcularFormulas } from "../../utils/formulas";
import TablaCuentas from "../TablaCuentas";
import ModalValores from "../ModalValores";
import styles from "./PlanillasSwiper.module.scss";

const mesLocalActual = () => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
};

const esMesValido = (mes) => /^\d{4}-(0[1-9]|1[0-2])$/.test(mes || "");

export default function PlanillasApp() {
  const { user } = useContext(UserContext);
  const [planillas, setPlanillas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);

  const cargarPlanillas = useCallback(async () => {
    if (!user) return;
    setCargando(true);
    try {
      const data = await obtenerTodasLasPlanillas(user.uid);
      setPlanillas(data.map((p) => ({ mes: p.id || p.mes, data: p })).sort((a, b) => a.mes.localeCompare(b.mes)));
    } catch (error) {
      console.error("Error al cargar las planillas:", error);
      setMensaje({ tipo: "error", texto: "No pudimos cargar las planillas. Recargá la página para intentar nuevamente." });
    } finally {
      setCargando(false);
    }
  }, [user]);

  useEffect(() => { cargarPlanillas(); }, [cargarPlanillas]);

  const inicio = useMemo(() => {
    if (!planillas.length) return "/planillas/nueva";
    const actual = mesLocalActual();
    const exacta = planillas.find((p) => p.mes === actual);
    const anteriores = planillas.filter((p) => p.mes <= actual);
    return `/planillas/${(exacta || anteriores.at(-1) || planillas.at(-1)).mes}`;
  }, [planillas]);

  if (cargando) return <div className={styles.estado} role="status">Cargando planillas…</div>;

  return (
    <div className={styles.appPlanillas}>
      {mensaje && <div className={`${styles.mensaje} ${styles[mensaje.tipo]}`} role="status">{mensaje.texto}</div>}
      <Routes>
        <Route index element={<Navigate to={inicio} replace />} />
        <Route path="planillas" element={<Navigate to={inicio} replace />} />
        <Route path="planillas/nueva" element={<NuevaPlanillaPage planillas={planillas} user={user} onCreada={(p) => setPlanillas((prev) => [...prev, p].sort((a,b) => a.mes.localeCompare(b.mes)))} />} />
        <Route path="planillas/:mes" element={<PlanillaPage planillas={planillas} user={user} setPlanillas={setPlanillas} setMensaje={setMensaje} />} />
        <Route path="planillas/:mes/editar" element={<EditarPlanillaPage planillas={planillas} user={user} setPlanillas={setPlanillas} setMensaje={setMensaje} />} />
        <Route path="*" element={<Navigate to={inicio} replace />} />
      </Routes>
    </div>
  );
}

function NavegacionMeses({ planillas, mesActivo }) {
  const navigate = useNavigate();
  const indice = planillas.findIndex((p) => p.mes === mesActivo);
  const anterior = indice > 0 ? planillas[indice - 1] : null;
  const siguiente = indice >= 0 && indice < planillas.length - 1 ? planillas[indice + 1] : null;

  return (
    <nav className={styles.controles} aria-label="Navegación de planillas">
      <button className={styles.navMes} disabled={!anterior} onClick={() => anterior && navigate(`/planillas/${anterior.mes}`)}>← <span>{anterior ? formatearMes(anterior.mes) : "Anterior"}</span></button>
      <select aria-label="Seleccionar mes" value={mesActivo || ""} onChange={(e) => navigate(`/planillas/${e.target.value}`)}>
        {planillas.map((p) => <option key={p.mes} value={p.mes}>{formatearMes(p.mes)}</option>)}
      </select>
      <button className={styles.navMes} disabled={!siguiente} onClick={() => siguiente && navigate(`/planillas/${siguiente.mes}`)}><span>{siguiente ? formatearMes(siguiente.mes) : "Siguiente"}</span> →</button>
      <button className="btn btn--primario" onClick={() => navigate("/planillas/nueva")}><GrTableAdd /> Nuevo mes</button>
    </nav>
  );
}

function PlanillaPage({ planillas, user, setPlanillas, setMensaje }) {
  const { mes } = useParams();
  const navigate = useNavigate();
  const planilla = planillas.find((p) => p.mes === mes);
  if (!esMesValido(mes) || !planilla) return <EstadoNoEncontrado />;

  const eliminar = async () => {
    if (!window.confirm(`¿Eliminar la planilla de ${formatearMes(mes)}? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarPlanilla(user.uid, mes);
      const restantes = planillas.filter((p) => p.mes !== mes);
      setPlanillas(restantes);
      setMensaje({ tipo: "exito", texto: "La planilla se eliminó correctamente." });
      const destino = restantes.filter((p) => p.mes < mes).at(-1) || restantes[0];
      navigate(destino ? `/planillas/${destino.mes}` : "/planillas/nueva", { replace: true });
    } catch (error) {
      console.error("Error al eliminar:", error);
      setMensaje({ tipo: "error", texto: "No se pudo eliminar la planilla." });
    }
  };

  return <><NavegacionMeses planillas={planillas} mesActivo={mes} /><TablaCuentas planilla={planilla} onEliminar={eliminar} /></>;
}

function EditarPlanillaPage({ planillas, user, setPlanillas, setMensaje }) {
  const { mes } = useParams();
  const navigate = useNavigate();
  const planilla = planillas.find((p) => p.mes === mes);
  if (!esMesValido(mes) || !planilla) return <EstadoNoEncontrado />;

  const aplicar = async (valores) => {
    const resultados = calcularFormulas(valores);
    await guardarPlanilla(user.uid, mes, { valores, resultados });
    setPlanillas((prev) => prev.map((p) => p.mes === mes ? { ...p, data: { ...p.data, valores, resultados } } : p));
    setMensaje({ tipo: "exito", texto: "Planilla guardada correctamente." });
    navigate(`/planillas/${mes}`);
  };

  return <ModalValores valores={planilla.data?.valores || {}} onApply={aplicar} onClose={() => navigate(`/planillas/${mes}`)} mesActual={mes} embedded />;
}

function NuevaPlanillaPage({ planillas, user, onCreada }) {
  const navigate = useNavigate();
  const [mes, setMes] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const id = `${anio}-${mes}`;

  const crear = async (event) => {
    event.preventDefault();
    if (planillas.some((p) => p.mes === id)) return setError("Ya existe una planilla para ese mes.");
    setGuardando(true);
    try {
      const valores = { colchon: 20000 };
      const resultados = calcularFormulas(valores);
      await guardarPlanilla(user.uid, id, { valores, resultados });
      onCreada({ mes: id, data: { valores, resultados } });
      navigate(`/planillas/${id}/editar`, { replace: true });
    } catch {
      setError("No se pudo crear la planilla.");
      setGuardando(false);
    }
  };

  return <section className={styles.nuevaPage}><h1>Nueva planilla</h1><p>Elegí el período que querés agregar.</p><form onSubmit={crear} className={styles.nuevaForm}><label>Mes<select value={mes} onChange={(e) => setMes(e.target.value)}>{Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m, i) => <option key={m} value={m}>{new Date(2000, i).toLocaleString("es-AR", { month: "long" })}</option>)}</select></label><label>Año<select value={anio} onChange={(e) => setAnio(Number(e.target.value))}>{Array.from({ length: 11 }, (_, i) => new Date().getFullYear() + i).map((y) => <option key={y}>{y}</option>)}</select></label>{error && <div className={styles.error} role="alert">{error}</div>}<div className={styles.acciones}><button type="button" className="btn btn--secundario" onClick={() => navigate(-1)}>Cancelar</button><button className="btn btn--primario" disabled={guardando}>{guardando ? "Creando…" : "Crear y completar"}</button></div></form></section>;
}

function EstadoNoEncontrado() {
  const navigate = useNavigate();
  return <div className={styles.estado}><h1>Planilla no encontrada</h1><p>El mes solicitado no existe o la dirección no es válida.</p><button className="btn btn--primario" onClick={() => navigate("/planillas")}>Volver a las planillas</button></div>;
}
