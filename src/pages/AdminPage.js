import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "./AdminPage.css";

function AdminPage() {

  const navigate = useNavigate();

  const [vista, setVista] = useState("usuarios");

  const [usuarios, setUsuarios] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [envios, setEnvios] = useState([]);
  const [productos, setProductos] = useState([]);

  const [modoEdicion, setModoEdicion] = useState(false);

  const [form, setForm] = useState({
    id: null,
    nombre: "",
    correo: "",
    contrasena: "",
    rol: "OPERADOR"
  });

  const [mensaje, setMensaje] = useState("");

  const token = localStorage.getItem("token");

  // 🔥 VALIDAR ADMIN
  useEffect(() => {

    if (!token) {
      window.location.href = "/";
      return;
    }

    try {

      const data = jwtDecode(token);

      if (data.rol !== "ADMIN") {

        alert("No tienes permisos");

        window.location.href = "/";
        return;

      }

      cargarUsuarios();
      cargarPedidos();
      cargarEnvios();
      cargarProductos();

    } catch {

      localStorage.removeItem("token");
      window.location.href = "/";

    }

  }, []);

  // 🔥 CARGAR USUARIOS
  const cargarUsuarios = async () => {

    const res = await fetch(
      "http://localhost:9090/usuarios",
      {
        headers: {
          Authorization: "Bearer " + token
        }
      }
    );

    setUsuarios(await res.json());

  };

  // 🔥 CARGAR PEDIDOS
  const cargarPedidos = async () => {

    const res = await fetch(
      "http://localhost:9090/pedidos",
      {
        headers: {
          Authorization: "Bearer " + token
        }
      }
    );

    const data = await res.json();

    // 🔥 MÁS NUEVOS PRIMERO
    const pedidosOrdenados = data.sort(
      (a, b) => b.id - a.id
    );

    setPedidos(pedidosOrdenados);

  };

  // 🔥 CARGAR ENVÍOS
  const cargarEnvios = async () => {

    const res = await fetch(
      "http://localhost:9090/envios",
      {
        headers: {
          Authorization: "Bearer " + token
        }
      }
    );

    const data = await res.json();

    // 🔥 MÁS NUEVOS PRIMERO
    const enviosOrdenados = data.sort(
      (a, b) => b.id - a.id
    );

    setEnvios(enviosOrdenados);

  };

  // 🔥 CARGAR PRODUCTOS
  const cargarProductos = async () => {

    const res = await fetch(
      "http://localhost:9090/productos",
      {
        headers: {
          Authorization: "Bearer " + token
        }
      }
    );

    const data = await res.json();

    const productosOrdenados = data.sort(
      (a, b) => b.id - a.id
    );

    setProductos(productosOrdenados);

  };

  // 🔥 LIMPIAR FORMULARIO
  const limpiarFormulario = () => {

    setForm({
      id: null,
      nombre: "",
      correo: "",
      contrasena: "",
      rol: "OPERADOR"
    });

    setModoEdicion(false);

    setMensaje("");

  };

  // 🔥 VALIDACIONES
  const validarFormulario = () => {

    const nombreLimpio = form.nombre.trim();

    const correoLimpio = form.correo
      .trim()
      .toLowerCase();

    // 🔥 SOLO LETRAS
    const regexNombre =
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    // 🔥 LETRAS + NÚMEROS + .COM/.CL
    const regexCorreo =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|cl)$/;

    if (!nombreLimpio) {
      throw new Error(
        "El nombre es obligatorio"
      );
    }

    if (nombreLimpio.length < 3) {
      throw new Error(
        "El nombre debe tener mínimo 3 caracteres"
      );
    }

    if (!regexNombre.test(nombreLimpio)) {
      throw new Error(
        "El nombre solo puede contener letras"
      );
    }

    if (!regexCorreo.test(correoLimpio)) {
      throw new Error(
        "Ingrese un correo válido (.com o .cl)"
      );
    }

    // 🔥 SOLO VALIDAR CONTRASEÑA SI EXISTE
    if (
      form.contrasena &&
      (
        form.contrasena.length < 8 ||
        form.contrasena.length > 24
      )
    ) {
      throw new Error(
        "La contraseña debe tener entre 8 y 24 caracteres"
      );
    }

    return {
      nombre: nombreLimpio,
      correo: correoLimpio
    };

  };

  // 🔥 GUARDAR USUARIO
  const guardarUsuario = async () => {

    try {

      setMensaje("");

      const datosValidados =
        validarFormulario();

      const metodo =
        modoEdicion ? "PUT" : "POST";

      const url = modoEdicion
        ? `http://localhost:9090/usuarios/${form.id}`
        : "http://localhost:9090/usuarios";

      const bodyData = {
        ...form,
        nombre: datosValidados.nombre,
        correo: datosValidados.correo
      };

      const res = await fetch(url, {

        method: metodo,

        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },

        body: JSON.stringify(bodyData)

      });

      if (!res.ok) {
        throw new Error(
          "Error al guardar usuario"
        );
      }

      setMensaje(
        "✅ Usuario guardado correctamente"
      );

      limpiarFormulario();

      cargarUsuarios();

      setVista("usuarios");

    } catch (error) {

      setMensaje("❌ " + error.message);

    }

  };

  // 🔥 EDITAR
  const editar = (user) => {

    setForm({
      ...user,
      contrasena: ""
    });

    setModoEdicion(true);

    setVista("crear");

  };

  // 🔥 ELIMINAR
  const eliminar = async (id) => {

    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este usuario?"
    );

    if (!confirmar) return;

    try {

      await fetch(
        `http://localhost:9090/usuarios/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      setMensaje("✅ Usuario eliminado");

      cargarUsuarios();

    } catch {

      setMensaje(
        "❌ Error al eliminar usuario"
      );

    }

  };

  // 🔥 LOGOUT
  const logout = () => {

    localStorage.removeItem("token");

    window.location.href = "/";

  };

  // 🔥 RENDER
  const renderVista = () => {

    // 🔹 USUARIOS
    if (vista === "usuarios") {

      return (

        <>
          <div className="header-section">

            <h3>
              Gestión de Usuarios
            </h3>

            <button
              className="btn btn-primary"
              onClick={() => {
                limpiarFormulario();
                setVista("crear");
              }}
            >
              + Nuevo Usuario
            </button>

          </div>

          <table className="table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {usuarios.map((u) => (

                <tr key={u.id}>

                  <td>#{u.id}</td>

                  <td>{u.nombre}</td>

                  <td>{u.correo}</td>

                  <td>
                    <span className="badge">
                      {u.rol}
                    </span>
                  </td>

                  <td className="actions">

                    <button
                      className="btn btn-primary"
                      onClick={() => editar(u)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn btn-delete"
                      onClick={() => eliminar(u.id)}
                    >
                      Eliminar
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>
        </>

      );

    }

    // 🔹 CREAR
    if (vista === "crear") {

      return (

        <>
          <h3>
            {modoEdicion
              ? "Editar Usuario"
              : "Crear Usuario"}
          </h3>

          <div className="form">

            <input
              className="input"
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) =>
                setForm({
                  ...form,
                  nombre: e.target.value
                })
              }
            />

            <input
              className="input"
              placeholder="Correo"
              value={form.correo}
              onChange={(e) =>
                setForm({
                  ...form,
                  correo: e.target.value
                })
              }
            />

            <input
              className="input"
              type="password"
              placeholder={
                modoEdicion
                  ? "Nueva contraseña (opcional)"
                  : "Contraseña"
              }
              value={form.contrasena}
              onChange={(e) =>
                setForm({
                  ...form,
                  contrasena: e.target.value
                })
              }
            />

            <select
              className="input"
              value={form.rol}
              onChange={(e) =>
                setForm({
                  ...form,
                  rol: e.target.value
                })
              }
            >
              <option value="ADMIN">
                ADMIN
              </option>

              <option value="OPERADOR">
                OPERADOR
              </option>

              <option value="LOGISTICA">
                LOGISTICA
              </option>

            </select>

          </div>

          <div className="actions">

            <button
              className="btn btn-primary"
              onClick={guardarUsuario}
            >
              {modoEdicion
                ? "Actualizar Usuario"
                : "Crear Usuario"}
            </button>

            <button
              className="btn"
              onClick={limpiarFormulario}
            >
              Limpiar
            </button>

          </div>

          <p className="message">
            {mensaje}
          </p>
        </>

      );

    }

    // 🔹 PEDIDOS
    if (vista === "pedidos") {

      return (

        <>
          <h3>
            Pedidos del Sistema
          </h3>

          <table className="table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>

              {pedidos.map((p) => (

                <tr key={p.id}>

                  <td>#{p.id}</td>

                  <td>{p.cliente}</td>

                  <td>
                    <span className="badge">
                      {p.estado}
                    </span>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>
        </>

      );

    }

    // 🔹 ENVÍOS
    if (vista === "envios") {

      return (

        <>
          <h3>
            Envíos del Sistema
          </h3>

          <table className="table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Pedido</th>
                <th>Dirección</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>

              {envios.map((e) => (

                <tr key={e.id}>

                  <td>#{e.id}</td>

                  <td>#{e.pedidoId}</td>

                  <td>{e.direccion}</td>

                  <td>
                    <span className="badge">
                      {e.estado}
                    </span>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>
        </>

      );

    }

    // 🔹 INVENTARIO
    if (vista === "inventario") {

      return (

        <>
          <h3>
            Inventario del Sistema
          </h3>

          <table className="table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Stock</th>
              </tr>
            </thead>

            <tbody>

              {productos.map((p) => (

                <tr key={p.id}>

                  <td>#{p.id}</td>

                  <td>{p.nombre}</td>

                  <td>{p.stock}</td>

                </tr>

              ))}

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
          SmartLogix Admin
        </div>

        <div className="nav-left">

          <button
            className="nav-btn"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Dashboard
          </button>

          <button
            className={`nav-btn ${
              vista === "usuarios"
                ? "nav-active"
                : ""
            }`}
            onClick={() =>
              setVista("usuarios")
            }
          >
            Usuarios
          </button>

          <button
            className={`nav-btn ${
              vista === "crear"
                ? "nav-active"
                : ""
            }`}
            onClick={() =>
              setVista("crear")
            }
          >
            Crear
          </button>

          <button
            className={`nav-btn ${
              vista === "pedidos"
                ? "nav-active"
                : ""
            }`}
            onClick={() =>
              setVista("pedidos")
            }
          >
            Pedidos
          </button>

          <button
            className={`nav-btn ${
              vista === "envios"
                ? "nav-active"
                : ""
            }`}
            onClick={() =>
              setVista("envios")
            }
          >
            Envíos
          </button>

          <button
            className={`nav-btn ${
              vista === "inventario"
                ? "nav-active"
                : ""
            }`}
            onClick={() =>
              setVista("inventario")
            }
          >
            Inventario
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

export default AdminPage;