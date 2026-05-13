import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./AdminPage.css";

function OperadorPage() {

  const [vista, setVista] = useState("crear");

  const [pedidos, setPedidos] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const [form, setForm] = useState({
    cliente: "",
    producto: "",
    cantidad: "",
    direccion: ""
  });

  const token = localStorage.getItem("token");

  // 🔥 VALIDAR OPERADOR
  useEffect(() => {

    if (!token) {
      window.location.href = "/";
      return;
    }

    try {

      const data = jwtDecode(token);

      if (data.rol !== "OPERADOR") {
        alert("No tienes permisos");
        window.location.href = "/";
        return;
      }

      // 🔥 CLIENTE VACÍO
      setForm(prev => ({
        ...prev,
        cliente: ""
      }));

      cargarPedidos();

    } catch {

      localStorage.removeItem("token");
      window.location.href = "/";

    }

  }, []);

  // 🔥 CARGAR PEDIDOS
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

  // 🔥 CREAR PEDIDO
  const crearPedido = async () => {

    try {

      setMensaje("");

      if (
        !form.cliente ||
        !form.producto ||
        !form.cantidad ||
        !form.direccion
      ) {
        throw new Error("Completa todos los campos");
      }

      const res = await fetch("/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          ...form,
          cantidad: Number(form.cantidad),
          estado: "PENDIENTE"
        })
      });

      if (!res.ok) {
        throw new Error("Error al crear pedido");
      }

      setMensaje("Pedido creado correctamente");

      setForm({
        cliente: "",
        producto: "",
        cantidad: "",
        direccion: ""
      });

      cargarPedidos();

      setVista("pedidos");

    } catch (error) {

      setMensaje(error.message);

    }
  };

  // 🔥 LOGOUT
  const logout = () => {

    localStorage.removeItem("token");
    window.location.href = "/";

  };

  // 🔥 RENDER VISTAS
  const renderVista = () => {

    // 🔹 CREAR PEDIDO
    if (vista === "crear") {

      return (
        <>

          <h3>Crear Pedido</h3>

          <div className="form">

            <input
              className="input"
              placeholder="Cliente"
              value={form.cliente}
              onChange={(e) =>
                setForm({
                  ...form,
                  cliente: e.target.value
                })
              }
            />

            <input
              className="input"
              placeholder="Producto"
              value={form.producto}
              onChange={(e) =>
                setForm({
                  ...form,
                  producto: e.target.value
                })
              }
            />

            <input
              className="input"
              type="number"
              placeholder="Cantidad"
              value={form.cantidad}
              onChange={(e) =>
                setForm({
                  ...form,
                  cantidad: e.target.value
                })
              }
            />

            <input
              className="input"
              placeholder="Dirección"
              value={form.direccion}
              onChange={(e) =>
                setForm({
                  ...form,
                  direccion: e.target.value
                })
              }
            />

            <button
              className="btn btn-primary"
              onClick={crearPedido}
            >
              Crear Pedido
            </button>

          </div>

          <p className="message">{mensaje}</p>

        </>
      );
    }

    // 🔹 VER PEDIDOS
    if (vista === "pedidos") {

      return (
        <>

          <h3>📋 Mis Pedidos</h3>

          <table className="table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Cliente</th>
                <th>Dirección</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>

              {pedidos.length > 0 ? (

                pedidos.map((p) => (

                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>{p.producto}</td>
                    <td>{p.cantidad}</td>
                    <td>{p.cliente}</td>
                    <td>{p.direccion}</td>

                    <td>
                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: "10px",
                          fontWeight: "bold",
                          background:
                            p.estado === "ENTREGADO"
                              ? "#dcfce7"
                              : p.estado === "EN_PROCESO"
                              ? "#fef3c7"
                              : "#dbeafe",
                          color:
                            p.estado === "ENTREGADO"
                              ? "#166534"
                              : p.estado === "EN_PROCESO"
                              ? "#92400e"
                              : "#1d4ed8"
                        }}
                      >
                        {p.estado}
                      </span>
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
  };

  return (

    <div>

      {/* 🔥 NAVBAR */}
      <div className="navbar">

        <div className="nav-title">
          SmartLogix Operador
        </div>

        <div className="nav-left">

          <button
            className={`nav-btn ${
              vista === "crear" ? "nav-active" : ""
            }`}
            onClick={() => setVista("crear")}
          >
            Crear Pedido
          </button>

          <button
            className={`nav-btn ${
              vista === "pedidos" ? "nav-active" : ""
            }`}
            onClick={() => setVista("pedidos")}
          >
            Ver Pedidos
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

        </div>

      </div>

    </div>
  );
}

export default OperadorPage;
