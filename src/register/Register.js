import { useState } from "react";
import "./Register.css";

function Register() {

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [rol, setRol] = useState("OPERADOR");

  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 REGISTRAR USUARIO
  const registrar = async () => {

    try {

      setMensaje("");
      setLoading(true);

      const nombreLimpio = nombre.trim();

      const correoLimpio = correo
        .trim()
        .toLowerCase();

      // 🔥 VALIDACIÓN NOMBRE
      // Solo letras y espacios
      const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

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

      // 🔥 VALIDACIÓN CORREO
      // Permite letras, números, .com y .cl
      const regexCorreo =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|cl)$/;

      if (!regexCorreo.test(correoLimpio)) {
        throw new Error(
          "Ingrese un correo válido (.com o .cl)"
        );
      }

      // 🔥 VALIDACIÓN CONTRASEÑA
      if (
        contrasena.length < 8 ||
        contrasena.length > 24
      ) {
        throw new Error(
          "La contraseña debe tener entre 8 y 24 caracteres"
        );
      }

      // 🔥 PETICIÓN
      const response = await fetch(
        "/usuarios",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            nombre: nombreLimpio,
            correo: correoLimpio,
            contrasena,
            rol
          })
        }
      );

      if (!response.ok) {
        throw new Error(
          "Error al registrar usuario"
        );
      }

      setMensaje(
        "Usuario creado correctamente"
      );

      // 🔥 LIMPIAR FORM
      setNombre("");
      setCorreo("");
      setContrasena("");
      setRol("OPERADOR");

      // 🔥 REDIRECCIÓN
      setTimeout(() => {

        window.location.href = "/";

      }, 1400);

    } catch (error) {

      setMensaje(error.message);

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="container">

      <div className="card">

        <h2>Crear Cuenta</h2>

        <p>
          Registra un nuevo usuario en SmartLogix
        </p>

        {/* 🔥 NOMBRE */}
        <input
          className="input"
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) =>
            setNombre(e.target.value)
          }
        />

        {/* 🔥 CORREO */}
        <input
          className="input"
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) =>
            setCorreo(e.target.value)
          }
        />

        {/* 🔥 CONTRASEÑA */}
        <input
          className="input"
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) =>
            setContrasena(e.target.value)
          }
        />

        {/* 🔥 ROL */}
        <select
          className="input"
          value={rol}
          onChange={(e) =>
            setRol(e.target.value)
          }
        >
          <option value="ADMIN">
            👑 ADMIN
          </option>

          <option value="OPERADOR">
            OPERADOR
          </option>

          <option value="LOGISTICA">
            LOGÍSTICA
          </option>

        </select>

        {/* 🔥 BOTÓN */}
        <button
          className="button"
          onClick={registrar}
          disabled={
            loading ||
            !nombre ||
            !correo ||
            !contrasena
          }
        >

          {loading
            ? "Registrando..."
            : "Registrarse"}

        </button>

        {/* 🔥 MENSAJE */}
        {mensaje && (
          <p className="message">
            {mensaje}
          </p>
        )}

        {/* 🔥 LINK LOGIN */}
        <p
          className="link"
          onClick={() =>
            (window.location.href = "/")
          }
        >
          ¿Ya tienes cuenta? Inicia sesión
        </p>

      </div>

    </div>
  );
}

export default Register;
