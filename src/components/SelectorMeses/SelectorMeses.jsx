import React, { useState, useEffect, useContext } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase";
import UserContext from "../../context/userContext";

export default function SelectorMeses({ onSeleccionarMes }) {
  const { user } = useContext(UserContext);
  const [meses, setMeses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchMeses = async () => {
      setLoading(true);
      try {
        const planillasRef = collection(db, "users", user.uid, "planillas");
        const snapshot = await getDocs(planillasRef);
        const mesesExistentes = snapshot.docs.map(doc => doc.id).sort().reverse(); // ordenar descendente
        setMeses(mesesExistentes);
      } catch (err) {
        console.error("Error al traer meses:", err);
      }
      setLoading(false);
    };

    fetchMeses();
  }, [user]);

  if (!user) return null;
  if (loading) return <p>Cargando meses...</p>;
  if (meses.length === 0) return <p>No hay planillas guardadas.</p>;

  return (
    <div>
      <label>Seleccionar mes:</label>
      <select onChange={e => onSeleccionarMes(e.target.value)}>
        <option value="">--Seleccione--</option>
        {meses.map(mes => (
          <option key={mes} value={mes}>
            {mes}
          </option>
        ))}
      </select>
    </div>
  );
}
