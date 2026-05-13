import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

import {
  FaUsers,
  FaBoxOpen,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaArrowLeft
} from "react-icons/fa";

import "./DashboardPage.css";

function Dashboard() {

  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [envios, setEnvios] = useState([]);

  const token = localStorage.getItem("token");

  // 🔥 VALIDAR ADMIN
  useEffect(() => {

    if (!token) {
      navigate("/");
      return;
    }

    try {

      const data = jwtDecode(token);

      if (data.rol !== "ADMIN") {
        navigate("/");
        return;
      }

      cargarDatos();

    } catch {

      localStorage.removeItem("token");
      navigate("/");

    }

  }, []);

  // 🔥 CARGAR DATOS
  const cargarDatos = async () => {

    try {

      // 🔹 USUARIOS
      const usuariosRes = await fetch(
        "/usuarios",
        {
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      // 🔹 PEDIDOS
      const pedidosRes = await fetch(
        "/pedidos",
        {
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      // 🔹 ENVÍOS
      const enviosRes = await fetch(
        "/envios",
        {
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      setUsuarios(await usuariosRes.json());
      setPedidos(await pedidosRes.json());
      setEnvios(await enviosRes.json());

    } catch (error) {

      console.log(error);

    }
  };

  // 🔥 ESTADÍSTICAS
  const pedidosPendientes = pedidos.filter(
    p => p.estado === "PENDIENTE"
  ).length;

  const pedidosEntregados = pedidos.filter(
    p => p.estado === "ENTREGADO"
  ).length;

  const enviosActivos = envios.filter(
    e => e.estado !== "ENTREGADO"
  ).length;

  return (

    <div className="dashboard-container">

      {/* 🔥 NAVBAR */}
      <div className="dashboard-navbar">

        <div>
          <h2>SmartLogix Dashboard</h2>
          <p>Panel administrativo general</p>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/admin")}
        >
          <FaArrowLeft />
          Volver
        </button>

      </div>

      {/* 🔥 CARDS */}
      <div className="stats-grid">

        {/* USUARIOS */}
        <div className="stat-card">

          <div className="icon blue">
            <FaUsers />
          </div>

          <div>
            <h3>{usuarios.length}</h3>
            <p>Usuarios</p>
          </div>

        </div>

        {/* PEDIDOS */}
        <div className="stat-card">

          <div className="icon yellow">
            <FaBoxOpen />
          </div>

          <div>
            <h3>{pedidos.length}</h3>
            <p>Pedidos Totales</p>
          </div>

        </div>

        {/* PENDIENTES */}
        <div className="stat-card">

          <div className="icon orange">
            <FaClock />
          </div>

          <div>
            <h3>{pedidosPendientes}</h3>
            <p>Pendientes</p>
          </div>

        </div>

        {/* ENTREGADOS */}
        <div className="stat-card">

          <div className="icon green">
            <FaCheckCircle />
          </div>

          <div>
            <h3>{pedidosEntregados}</h3>
            <p>Entregados</p>
          </div>

        </div>

        {/* ENVÍOS */}
        <div className="stat-card">

          <div className="icon purple">
            <FaTruck />
          </div>

          <div>
            <h3>{enviosActivos}</h3>
            <p>Envíos Activos</p>
          </div>

        </div>

      </div>

      {/* 🔥 TABLA RESUMEN */}
      <div className="dashboard-table">

        <h3>Últimos Pedidos</h3>

        <table>

          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Producto</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>

            {[...pedidos]
                .sort((a, b) => a.id - b.id)
                .slice(-5)
                .map((p) => (

              <tr key={p.id}>
                <td>#{p.id}</td>
                <td>{p.cliente}</td>
                <td>{p.producto}</td>
                <td>{p.estado}</td>
              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Dashboard;
