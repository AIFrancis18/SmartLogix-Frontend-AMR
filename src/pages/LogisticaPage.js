import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./LogisticaPage.css";

function LogisticaPage() {

  const [vista, setVista] = useState("pedidos");

  const [pedidos, setPedidos] = useState([]);
  const [envios, setEnvios] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const token = localStorage.getItem("token");

  // 🔐 VALIDACIÓN
  useEffect(() => {

    if (!token) {
      window.location.href = "/";
      return;
    }

    try {

      const data = jwtDecode(token);

      if (data.rol !== "LOGISTICA") {
        alert("No tienes permisos");
        window.location.href = "/";
        return;
      }

      cargarPedidos();
      cargarEnvios();

    } catch {

      localStorage.removeItem("token");
      window.location.href = "/";
    }

  }, []);

  // 🔹 CARGAR PEDIDOS
  const cargarPedidos = async () => {

    try {

      const res = await fetch("/pedidos", {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      const data = await res.json();

      setPedidos(data);

    } catch {

      setMensaje("Error al cargar pedidos");

    }
  };

  // 🔹 CARGAR ENVÍOS
  const cargarEnvios = async () => {

    try {

      const res = await fetch("/envios", {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      const data = await res.json();

      setEnvios(data);

    } catch {

      setMensaje("Error al cargar envíos");

    }
  };

  // 🔥 CAMBIAR ESTADO PEDIDO
  const cambiarEstadoPedido = async (id, estado) => {

    if (!estado) return;

    try {

      await fetch(
        `/pedidos/${id}/estado?estado=${estado}`,
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      setMensaje("Estado de pedido actualizado");

      cargarPedidos();

    } catch {

      setMensaje("Error al actualizar pedido");

    }
  };

  // 🔥 CAMBIAR ESTADO ENVÍO
  const cambiarEstadoEnvio = async (id, estado) => {

    if (!estado) return;

    try {

      await fetch(
        `/envios/${id}/estado?estado=${estado}`,
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      setMensaje("Estado de envío actualizado");

      cargarEnvios();

    } catch {

      setMensaje("Error al actualizar envío");

    }
  };

  // 🔥 ELIMINAR PEDIDO
  const eliminarPedido = async (id) => {

    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este pedido?"
    );

    if (!confirmar) return;

    try {

      const res = await fetch(
        `/pedidos/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      setMensaje("Pedido y envío eliminados");

      cargarPedidos();
      cargarEnvios();

    } catch {

      setMensaje("Error al eliminar pedido");

    }
  };

  // 🔥 LOGOUT
  const logout = () => {

    localStorage.removeItem("token");

    window.location.href = "/";
  };

  // 🔥 ESTILOS VISUALES PARA ESTADOS
  const obtenerColorEstado = (estado) => {

    if (estado === "ENTREGADO") {
      return {
        background: "#dcfce7",
        color: "#166534"
      };
    }

    if (estado === "EN_PROCESO" || estado === "EN_CAMINO") {
      return {
        background: "#fef3c7",
        color: "#92400e"
      };
    }

    return {
      background: "#dbeafe",
      color: "#1d4ed8"
    };
  };

  // 🔥 VISTAS
  const renderVista = () => {

    // 🔹 PEDIDOS
    if (vista === "pedidos") {

      return (
        <>

          <div className="section-header">
            <h3>Gestión de Pedidos</h3>
          </div>

          <table className="table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Estado</th>
                <th>Cambiar Estado</th>
                <th>Eliminar</th>
              </tr>
            </thead>

            <tbody>

              {pedidos.length > 0 ? (

                pedidos.map((p) => (

                  <tr key={p.id}>

                    <td>#{p.id}</td>
                    <td>{p.cliente}</td>
                    <td>{p.producto}</td>

                    <td>
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "12px",
                          fontWeight: "bold",
                          fontSize: "14px",
                          ...obtenerColorEstado(p.estado)
                        }}
                      >
                        {p.estado}
                      </span>
                    </td>

                    <td>

                      <select
                        className="status-select"
                        onChange={(e) =>
                          cambiarEstadoPedido(
                            p.id,
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Seleccionar
                        </option>

                        <option value="PENDIENTE">
                          PENDIENTE
                        </option>

                        <option value="EN_PROCESO">
                          EN PROCESO
                        </option>

                        <option value="ENTREGADO">
                          ENTREGADO
                        </option>

                      </select>

                    </td>

                    <td>

                      <button
                        className="btn btn-delete"
                        onClick={() => eliminarPedido(p.id)}
                      >
                        Eliminar
                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan="6">
                    No hay pedidos registrados
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </>
      );
    }

    // 🔹 ENVÍOS
    if (vista === "envios") {

      return (
        <>

          <div className="section-header">
            <h3>Gestión de Envíos</h3>
          </div>

          <table className="table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Pedido</th>
                <th>Dirección</th>
                <th>Estado</th>
                <th>Cambiar Estado</th>
              </tr>
            </thead>

            <tbody>

              {envios.length > 0 ? (

                envios.map((e) => (

                  <tr key={e.id}>

                    <td>#{e.id}</td>

                    <td>
                      Pedido #{e.pedidoId}
                    </td>

                    <td>{e.direccion}</td>

                    <td>

                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "12px",
                          fontWeight: "bold",
                          fontSize: "14px",
                          ...obtenerColorEstado(e.estado)
                        }}
                      >
                        {e.estado}
                      </span>

                    </td>

                    <td>

                      <select
                        className="status-select"
                        onChange={(ev) =>
                          cambiarEstadoEnvio(
                            e.id,
                            ev.target.value
                          )
                        }
                      >
                        <option value="">
                          Seleccionar
                        </option>

                        <option value="EN_CAMINO">
                          EN CAMINO
                        </option>

                        <option value="ENTREGADO">
                          ENTREGADO
                        </option>

                      </select>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan="5">
                    No hay envíos registrados
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </>
      );
    }
  };

  return (

    <div>

      {/* 🔥 NAVBAR */}
      <div className="navbar">

        <div className="nav-title">
          SmartLogix Logística
        </div>

        <div className="nav-left">

          <button
            className={`nav-btn ${
              vista === "pedidos"
                ? "nav-active"
                : ""
            }`}
            onClick={() => setVista("pedidos")}
          >
            Pedidos
          </button>

          <button
            className={`nav-btn ${
              vista === "envios"
                ? "nav-active"
                : ""
            }`}
            onClick={() => setVista("envios")}
          >
            Envíos
          </button>

        </div>

        <button
          className="logout"
          onClick={logout}
        >
          Cerrar sesión
        </button>

      </div>

      {/* 🔥 CONTENIDO */}
      <div className="container">

        <div className="section">

          {renderVista()}

          {mensaje && (
            <p className="message">
              {mensaje}
            </p>
          )}

        </div>

      </div>

    </div>
  );
}

export default LogisticaPage;
