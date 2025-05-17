import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import './login_estudiante.css'

const Login = () => {
    // State for form inputs
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    })

    // State for loading and notification
    const [isLoading, setIsLoading] = useState(false)
    const [notification, setNotification] = useState({
        show: false,
        message: "",
        isError: false,
    })

    // Handle input changes
    const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    // Show notification
    const showNotification = (message, isError = false) => {
    setNotification({
        show: true,
        message,
        isError,
    })

    // Hide notification after 3 seconds
    setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }))
        }, 3000)
    }

     // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))

            if (formData.username === "student" && formData.password === "password") {
                showNotification("Login successful! Redirecting to dashboard...", false)
            } else {
                showNotification("Invalid username or password. Please try again.", true)
            }
        } catch (error) {
            showNotification("An error occurred. Please try again later.", true)
            console.error("Login error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="login-container">
            <Card className="login-card">
                <CardHeader className="space-y-1">
                    <CardTitle className="login-title">University Portal</CardTitle>
                    <CardDescription className="login-description">
                        Enter your credentials to access your student account
                    </CardDescription>
                </CardHeader>

                {/* Notification alert */}
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
                                <Label htmlFor="username">Student ID / Username</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    placeholder="Enter your student ID or username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <Button type="submit" className="submit-button" disabled={isLoading}>
                                {isLoading ? "Logging in..." : "Log in"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default Login