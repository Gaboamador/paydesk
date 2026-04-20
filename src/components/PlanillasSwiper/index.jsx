import React, { useEffect, useState, useRef, useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import { obtenerTodasLasPlanillas, eliminarPlanilla } from "../../utils/firestoreHelper";
import TablaCuentas from "../TablaCuentas";
import UserContext from "../../context/userContext";
import formatearMes from "../../utils/formatearMes";
import styles from './estilos/planillasSwiper.module.scss'
import globalStyles from '../../styles/globalStyles.module.scss'
import { GrTableAdd } from "react-icons/gr";

export default function PlanillasSwiper() {
  const { user } = useContext(UserContext);
  const [planillas, setPlanillas] = useState([]);
  const [planillaActivaIndex, setPlanillaActivaIndex] = useState(0);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [nuevoMes, setNuevoMes] = useState("");
  const [nuevoAnio, setNuevoAnio] = useState(new Date().getFullYear());
  const swiperRef = useRef(null);
  // const [planillaModal, setPlanillaModal] = useState(null);

  const meses = ["01","02","03","04","05","06","07","08","09","10","11","12"];

  // Traer todas las planillas del usuario
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const data = await obtenerTodasLasPlanillas(user.uid);
      const adaptadas = data.map(p => ({
        mes: p.id || p.mes,
        data: p,
        guardada: true
      }));
      
      adaptadas.sort((a,b) => a.mes.localeCompare(b.mes));
      setPlanillas(adaptadas);

      // Mes actual
    const mesActual = new Date().toISOString().slice(0,7); // 'YYYY-MM'

    // Buscar índice de la planilla del mes actual
    let index = adaptadas.findIndex(p => p.mes === mesActual);

    if (index === -1) {
      // Si no existe, buscar la planilla más reciente anterior
      const anteriores = adaptadas.filter(p => p.mes < mesActual);
      if (anteriores.length > 0) {
        index = adaptadas.findIndex(p => p.mes === anteriores[anteriores.length - 1].mes);
      } else {
        // Si no hay ninguna planilla anterior, mostrar la primera
        index = 0;
      }
    }

      // Activar último mes (más reciente)
      setPlanillaActivaIndex(index);
      setTimeout(() => swiperRef.current?.slideTo(index), 100);
    };
    fetchData();
  }, [user]);

  // Crear planilla en blanco localmente
  const crearPlanillaEnBlanco = () => setMostrarSelector(true);

  const confirmarNuevoMes = () => {
    if (!nuevoMes || !nuevoAnio) return;
    const mesFormateado = `${nuevoAnio}-${nuevoMes}`;

    // Verificar duplicado
    if (planillas.some(p => p.mes === mesFormateado)) {
      alert("Ya existe una planilla para ese mes");
      return;
    }

    const nueva = { mes: mesFormateado, data: {}, guardada: false };

    setPlanillas(prev => {
      const nuevoArray = [...prev, nueva].sort((a,b) => a.mes.localeCompare(b.mes));
      const index = nuevoArray.findIndex(p => p.mes === mesFormateado);
      setPlanillaActivaIndex(index);
      setTimeout(() => swiperRef.current?.slideTo(index), 100);
      return nuevoArray;
    });

    setMostrarSelector(false);
  };

  const irAlMes = (mes) => {
    const index = planillas.findIndex(p => p.mes === mes);
    if (index !== -1) {
      setPlanillaActivaIndex(index);
      swiperRef.current?.slideTo(index);
    }
  };

  // Callback para marcar planilla como guardada después de guardar
  const handleGuardarLocal = (mes, data) => {
    setPlanillas(prev =>
      prev.map(p => p.mes === mes ? { ...p, data, guardada: true } : p)
    );
  };

  // En el componente padre que contiene el Swiper
const handleEliminarPlanilla = async (mesAEliminar) => {
  const confirmacion = window.confirm(
    `Va a eliminarse la planilla perteneciente a ${formatearMes(mesAEliminar).toUpperCase()}. Confirmar?`
  );
  if (!confirmacion) return;

  try {
    // Borra del servidor
    await eliminarPlanilla(user.uid, mesAEliminar);
    alert("Planilla eliminada correctamente.");
    
    // Actualiza la lista local de planillas
    const nuevasPlanillas = planillas.filter(p => p.mes !== mesAEliminar);
    setPlanillas(nuevasPlanillas);

    // Ajusta índice activo
    let nuevoIndex = planillaActivaIndex;
    if (nuevoIndex >= nuevasPlanillas.length) {
      nuevoIndex = nuevasPlanillas.length - 1;
    }
    setPlanillaActivaIndex(nuevoIndex);

    // Mueve el Swiper a la slide correcta
    swiperRef.current?.slideTo(nuevoIndex);

  } catch (error) {
    console.error("Error al eliminar la planilla:", error);
    alert("No se pudo eliminar la planilla. Intente nuevamente.");
  }
};


  // if (!user) return <p className={styles.notLoggedIn}>Inicie sesión para ver sus planillas</p>;

  return (
      <div>
        <div className={`${styles.controles}`}>
          <div className={styles.irAplanillaContainer}>
            <div className={styles.irAplanilla}>Ir a planilla</div>
            <select
              onChange={(e) => irAlMes(e.target.value)}
              value={planillas[planillaActivaIndex]?.mes || ""}
            >
              {planillas.map(p => (
                <option key={p.mes} value={p.mes}>{p.mes}</option>
              ))}
            </select>
          </div>
          <div className={styles.agregarPlanilla}>
            <button className={`btn btn--primario ${styles.agregarPlanillaButton}`} onClick={crearPlanillaEnBlanco}>
                <span><GrTableAdd/></span>
                <span>Nuevo mes</span>
            </button>
          </div>
        </div>

      {mostrarSelector && (
        <div className={styles.agregarPlanillaContainer}>
          <div className={styles.agregarPlanillaTitulo}>Agregar planilla</div>
          <div className={styles.agregarPlanillaBotones}>
            <select value={nuevoMes} onChange={(e) => setNuevoMes(e.target.value)}>
              <option value="">Mes</option>
              {meses.map((m,i) => (
                <option key={m} value={m}>{new Date(0,i).toLocaleString("es-AR",{month:"long"})}</option>
              ))}
            </select>
            <select value={nuevoAnio} onChange={(e)=>setNuevoAnio(e.target.value)}>
              {Array.from({length:11},(_,i)=> new Date().getFullYear()+i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button className={`btn btn--primario ${styles.confirmarButton}`} onClick={confirmarNuevoMes}>Confirmar</button>
            <button className={`btn btn--primario ${styles.cancelarButton}`} onClick={()=>setMostrarSelector(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <Swiper
        centeredSlides={true}
        spaceBetween={30}
        slidesPerView={1}
        onSwiper={(swiper)=>swiperRef.current = swiper}
        onSlideChange={(swiper)=>setPlanillaActivaIndex(swiper.activeIndex)}
      >
        {planillas.map((planilla,i)=>(
          <SwiperSlide key={i}>
            <div className={styles.slideContainer}>
              {/* <div>{planilla.mes}</div> */}
              <TablaCuentas
                planilla={planilla}
                onGuardar={handleGuardarLocal}
                onEliminar={handleEliminarPlanilla}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}