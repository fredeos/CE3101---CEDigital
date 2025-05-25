import { useState } from "react"
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import './login_estudiante.css'
import {AlmacenarInfo} from '../sessionStorage/sessionStorage.js'

const Login = () => {

    const navigate = useNavigate();

    // Se guarda la información que se coloca en la entrada del formulario cada vez que hay un cambio en este
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    // se manejan errores
    const [error, setError] = useState(null);

    // Estados para cargando y notifcaciones
    const [isLoading, setIsLoading] = useState(false)
    const [notification, setNotification] = useState({
        show: false,
        message: "",
        isError: false,
    })

    // Maneja el cambio de los inputs (el name del input debe ser igual que el name utilizado aqui, si no no se observa lo que se escribe)
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    // Muestra la notificación
    const showNotification = (message, isError = false) => {
    setNotification({show: true, message, isError})

    // Esconde las notifaciones después de 3 segundos
    setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }))
        }, 3000)
    }

     // Función para hacer la solicitud a la api, sobre los credenciales del inicio de sesión
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const encodedEmail = encodeURIComponent(formData.email);
            const encodedPassword = encodeURIComponent(formData.password);
            await new Promise((resolve) => setTimeout(resolve, 1000))
            
            const response = await fetch(`http://localhost:5039/api/login/students/${encodedEmail}/${encodedPassword}`);
            
            if (!response.ok) {
                // Manejo específico por código de estado
                if (response.status === 404) {
                    showNotification("Correo electrónico o contraseña inválida.", true)
                }
            }else{
                showNotification("Inicio de sesión exitoso!", false)
                const data = await response.json();
                data.password = ""; // se elimina información sensible
                data.phoneNumber = "";
                AlmacenarInfo.setItem('studentInfo',data);

                // se pasa a la ventana de incio, pues el login fue exitoso
                navigate("/inicio-estudiantes")
            }
            
        } catch (err) {
            showNotification("Ha ocurrido un error en el servidor. Por favor intente de nuevo más tarde.", true)
            setError(err.message);
        } finally {
            setIsLoading(false)
        }
    }
    
    return (
        <div className="login-container">
            <Card className="login-card">
                <CardHeader className="space-y-1">
                    <CardTitle className="login-title">CE-Digital</CardTitle>
                    <CardDescription className="login-description">
                        Ingrese sus credenciales para acceder
                    </CardDescription>
                </CardHeader>

                {/* Notificación de alerta */}
                {notification.show && (
                    <div className="notification-container">
                        <Alert className={notification.isError ? "error-notification" : "success-notification"}>
                            <AlertDescription>{notification.message}</AlertDescription>
                        </Alert>
                    </div>
                )}

                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-field">
                                <Label htmlFor="email">Correo electrónico</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    placeholder="Ingrese su correo electrónico"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Ingrese su contraseña"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <Button type="submit" className="submit-button" disabled={isLoading} onSubmit={handleSubmit}>
                                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default Login
