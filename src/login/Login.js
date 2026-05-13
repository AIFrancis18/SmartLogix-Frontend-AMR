import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔥 SI YA ESTÁ LOGEADO
  useEffect(() => {

    const token = localStorage.getItem("token");

    if (token) {

      try {

        const data = jwtDecode(token);

        if (data.rol === "ADMIN") {
          navigate("/admin");
        }

        else if (data.rol === "OPERADOR") {
          navigate("/operador");
        }

        else if (data.rol === "LOGISTICA") {
          navigate("/logistica");
        }

      } catch {

        localStorage.removeItem("token");

      }

    }

  }, [navigate]);

  // 🔥 LOGIN
  const login = async () => {

    try {

      setMensaje("");
      setLoading(true);

      const correoLimpio = correo.trim().toLowerCase();

      // 🔥 VALIDAR CORREO (.COM Y .CL)
      const regexCorreo =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|cl)$/;

      if (!regexCorreo.test(correoLimpio)) {

        throw new Error(
          "Ingrese un correo válido terminado en .com o .cl"
        );

      }

      // 🔥 VALIDAR CONTRASEÑA
      if (
        contrasena.length < 8 ||
        contrasena.length > 24
      ) {

        throw new Error(
          "La contraseña debe tener entre 8 y 24 caracteres"
        );

      }

      // 🔥 PETICIÓN LOGIN
      const response = await fetch(
        "/usuarios/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            correo: correoLimpio,
            contrasena
          })
        }
      );

      if (!response.ok) {

        throw new Error(
          "Credenciales incorrectas"
        );

      }

      const token = await response.text();

      localStorage.setItem("token", token);

      const data = jwtDecode(token);

      setMensaje(`Bienvenido ${data.sub}`);

      // 🔥 REDIRECCIÓN
      setTimeout(() => {

        if (data.rol === "ADMIN") {

          navigate("/admin");

        }

        else if (data.rol === "OPERADOR") {

          navigate("/operador");

        }

        else if (data.rol === "LOGISTICA") {

          navigate("/logistica");

        }

        else {

          navigate("/");

        }

      }, 1000);

    } catch (error) {

      setMensaje(error.message);

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="login-container">

      <div className="login-card">

        <h2>SmartLogix</h2>

        <p className="login-subtitle">
          Sistema de Gestión Logística
        </p>

        <input
          className="login-input"
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) =>
            setCorreo(e.target.value)
          }
        />

        <input
          className="login-input"
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) =>
            setContrasena(e.target.value)
          }
        />

        <button
          className="login-button"
          onClick={login}
          disabled={
            loading ||
            !correo ||
            !contrasena
          }
        >

          {loading
            ? "Ingresando..."
            : "Ingresar"}

        </button>

        <p className="login-message">
          {mensaje}
        </p>

        <p
          className="login-link"
          onClick={() =>
            navigate("/register")
          }
        >
          ¿No tienes cuenta? Regístrate
        </p>

      </div>

    </div>

  );

}

export default Login;
