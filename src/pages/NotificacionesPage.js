import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NotificacionesPage.css";

function NotificacionesPage() {

  const navigate = useNavigate();

  const [notificaciones, setNotificaciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {

    cargarNotificaciones();

  }, []);

  const cargarNotificaciones = async () => {

    try {

      setLoading(true);

      const res = await fetch(
        "http://localhost:9090/notificaciones",
        {
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      if (!res.ok) {

        throw new Error(
          "Error al cargar notificaciones"
        );

      }

      const data = await res.json();

      const ordenadas = data.sort(
        (a, b) => b.id - a.id
      );

      setNotificaciones(ordenadas);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  const notificacionesFiltradas = notificaciones.filter((n) => {

    const texto = busqueda.toLowerCase();

    return (

      n.usuario.toLowerCase().includes(texto)||
      n.tipo.toLowerCase().includes(texto)||
      n.mensaje.toLowerCase().includes(texto)||
      n.id.toString().includes(texto)

    );

  });

  const formatearFecha = (fecha) => {

    return new Date(fecha).toLocaleString(
      "es-CL",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  };

  return (

    <div className="notificaciones-container">

      <div className="notificaciones-card">

        <div className="notificaciones-header">

          <div>

            <h2>
              Centro de Notificaciones
            </h2>

            <input
              className="input-busqueda"
              placeholder="Buscar notificación..."
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
              style={{
                maxWidth: "250px"
              }}
            />

            <p>
              Total de notificaciones:{" "}
              <strong>
                {notificaciones.length}
              </strong>
            </p>

          </div>

          <div
            style={{
              display: "flex",
              gap: "10px"
            }}
          >

            <button
              className="btn-volver"
              onClick={cargarNotificaciones}
            >
              Actualizar
            </button>

            <button
              className="btn-volver"
              onClick={() => navigate("/admin")}
            >
              Volver
            </button>

          </div>

        </div>

        {loading ? (

          <div className="sin-notificaciones">
            Cargando notificaciones...
          </div>

        ) : notificaciones.length === 0 ? (

          <div className="sin-notificaciones">
            No existen notificaciones.
          </div>

        ) : (

          <div className="notificaciones-grid">

            {notificacionesFiltradas.map((n) => (

              <div
              key={n.id}
              className="notificacion"
            >

              <div className="timeline-dot"></div>

              <div className="notificacion-contenido">

                <div className="notificacion-top">

                  <div>

                    <span className="notificacion-usuario">
                      📦 {n.usuario}
                    </span>

                    <div className="notificacion-id">
                      Evento #{n.id}
                    </div>

                  </div>

                  <span className="notificacion-fecha">
                    {formatearFecha(n.fecha)}
                  </span>

                </div>

                <div className="notificacion-mensaje">
                  {n.mensaje}
                </div>

                <div className="notificacion-footer">

                  <span
                    className="badge badge-tipo"
                  >
                    {n.tipo}
                  </span>

                </div>

              </div>

            </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

}

export default NotificacionesPage;