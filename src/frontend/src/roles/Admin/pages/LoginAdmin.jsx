import "../styles/LoginAdmin.css"; 
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../Services/api"

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

 const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await api.get(`/login/admins/${email}/${password}`);
    console.log("✅ Login exitoso:", res.data);
    alert(`Bienvenido/a ${res.data.Fname}`);
    navigate("/cedigital-admin/dashboard");
  } catch (err) {
    console.error("❌ Login fallido:", err);
    alert("Credenciales incorrectas o error de conexión");
  }
};

  return (
    <div className="admin-login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h1>CE Digital</h1>
        <p>Ingrese sus credenciales para continuar</p>

        <div className="demo-credentials">
          <strong>Email:</strong> admin@cedigital.com<br /> 
          <strong>Password:</strong> 1234
        </div>

        <label htmlFor="email">Correo Institucional</label>
        <input
          type="email"
          required
          id="email"
          placeholder="admin@cedigital.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          required
          id="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Iniciar sesión</button>
        <a href="#" className="forgot-password">¿Olvidó su contraseña?</a>
      </form>
    </div>
  );
}

export default AdminLogin;

