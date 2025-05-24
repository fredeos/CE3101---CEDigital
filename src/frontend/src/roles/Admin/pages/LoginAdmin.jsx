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
    localStorage.setItem("admin", JSON.stringify(res.data));
    navigate("/cedigital-admin/dashboard");
  } catch (err) {
    console.error("❌ Login fallido:", err);
    alert("Credenciales incorrectas o error de conexión");
  }
};

  return (
    <div className="admin-login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h1>CEDigital</h1>
        <p>Ingrese sus credenciales para continuar</p>

        <div className="demo-credentials">
          <strong>Email:</strong> admin@itcr.ac.cr<br /> 
          <strong>Password:</strong> admin
        </div>

        <label htmlFor="email">Correo Institucional</label>
        <input
          type="email"
          required
          id="email"
          placeholder="admin@itcr.ac.cr"
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
      </form>
    </div>
  );
}

export default AdminLogin;

