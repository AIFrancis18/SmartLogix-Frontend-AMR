import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./BodegaPage.css";

function BodegaPage() {

  const [vista, setVista] = useState("productos");

  const [productos, setProductos] = useState([]);

  const [mensaje, setMensaje] = useState("");

  const [modoEdicion, setModoEdicion] = useState(false);

  const [form, setForm] = useState({
    id: null,
    nombre: "",
    categoria: "",
    descripcion: "",
    stock: "",
    precio: ""
  });

  const token = localStorage.getItem("token");

  useEffect(() => {

    if (!token) {
      window.location.href = "/";
      return;
    }

    try {

      const data = jwtDecode(token);

      if (data.rol !== "BODEGA") {

        alert("No tienes permisos");

        window.location.href = "/";
        return;
      }

      cargarProductos();

    } catch {

      localStorage.removeItem("token");
      window.location.href = "/";
    }

  }, []);

  const cargarProductos = async () => {

    try {

      const res = await fetch(
        "http://localhost:9090/productos",
        {
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      const data = await res.json();

      setProductos(data);

    } catch {

      setMensaje("❌ Error al cargar productos");

    }

  };

  const limpiarFormulario = () => {

    setForm({
      id: null,
      nombre: "",
      categoria: "",
      descripcion: "",
      stock: "",
      precio: ""
    });

    setModoEdicion(false);

  };

  const guardarProducto = async () => {

    try {

      setMensaje("");

      if (
        !form.nombre ||
        !form.categoria ||
        !form.descripcion
      ) {
        throw new Error("Completa todos los campos");
      }

      if (Number(form.stock) < 0) {
        throw new Error("Stock inválido");
      }

      if (Number(form.precio) <= 0) {
        throw new Error("Precio inválido");
      }

      const metodo =
        modoEdicion ? "PUT" : "POST";

      const url =
        modoEdicion
          ? `http://localhost:9090/productos/${form.id}`
          : "http://localhost:9090/productos";

      const res = await fetch(url, {

        method: metodo,

        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },

        body: JSON.stringify({
          ...form,
          stock: Number(form.stock),
          precio: Number(form.precio)
        })

      });

      if (!res.ok) {
        throw new Error("Error al guardar producto");
      }

      setMensaje(
        modoEdicion
          ? "✅ Producto actualizado"
          : "✅ Producto creado"
      );

      limpiarFormulario();

      cargarProductos();

      setVista("productos");

    } catch (error) {

      setMensaje("❌ " + error.message);

    }

  };

  const editarProducto = (producto) => {

    setForm(producto);

    setModoEdicion(true);

    setVista("crear");

  };

  const eliminarProducto = async (id) => {

    const confirmar = window.confirm(
      "¿Deseas eliminar este producto?"
    );

    if (!confirmar) return;

    try {

      const res = await fetch(
        `http://localhost:9090/productos/${id}`,
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

      setMensaje("✅ Producto eliminado");

      cargarProductos();

    } catch {

      setMensaje("❌ Error al eliminar producto");

    }

  };

  const logout = () => {

    localStorage.removeItem("token");

    window.location.href = "/";

  };

  const renderVista = () => {

    if (vista === "productos") {

      return (
        <>
          <h3>📦 Inventario</h3>

          <table className="table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Stock</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {productos.map((p) => (

                <tr key={p.id}>

                  <td>#{p.id}</td>

                  <td>{p.nombre}</td>

                  <td>{p.categoria}</td>

                  <td>{p.descripcion}</td>

                  <td>{p.stock}</td>

                  <td>${p.precio}</td>

                  <td>

                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        editarProducto(p)
                      }
                    >
                      Editar
                    </button>

                    <button
                      className="btn btn-delete"
                      onClick={() =>
                        eliminarProducto(p.id)
                      }
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

    if (vista === "crear") {

      return (
        <>
          <h3>
            {modoEdicion
              ? "Editar Producto"
              : "Crear Producto"}
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
              placeholder="Categoría"
              value={form.categoria}
              onChange={(e) =>
                setForm({
                  ...form,
                  categoria: e.target.value
                })
              }
            />

            <input
              className="input"
              placeholder="Descripción"
              value={form.descripcion}
              onChange={(e) =>
                setForm({
                  ...form,
                  descripcion: e.target.value
                })
              }
            />

            <input
              className="input"
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) =>
                setForm({
                  ...form,
                  stock: e.target.value
                })
              }
            />

            <input
              className="input"
              type="number"
              placeholder="Precio"
              value={form.precio}
              onChange={(e) =>
                setForm({
                  ...form,
                  precio: e.target.value
                })
              }
            />

          </div>

          <button
            className="btn btn-primary"
            onClick={guardarProducto}
          >
            {modoEdicion
              ? "Actualizar Producto"
              : "Crear Producto"}
          </button>

          <button
            className="btn"
            onClick={limpiarFormulario}
          >
            Limpiar
          </button>

          <p className="message">
            {mensaje}
          </p>
        </>
      );
    }
  };

  return (

    <div>

      <div className="navbar">

        <div className="nav-title">
          📦 SmartLogix Bodega
        </div>

        <div className="nav-left">

          <button
            className={`nav-btn ${
              vista === "productos"
                ? "nav-active"
                : ""
            }`}
            onClick={() =>
              setVista("productos")
            }
          >
            Inventario
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
            Producto
          </button>

        </div>

        <button
          className="logout"
          onClick={logout}
        >
          Cerrar sesión
        </button>

      </div>

      <div className="container">

        <div className="section">

          {renderVista()}

        </div>

      </div>

    </div>

  );

}

export default BodegaPage;