"use client"

import { useEffect } from "react"
import { CheckCircle, XCircle, X } from "lucide-react"
import "../styles/Notification.css"

export default function Notification({ type, message, onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        {type === "success" && <CheckCircle className="notification-icon" />}

        {type === "error" && <XCircle className="notification-icon" />}

        <p className="notification-message">{message}</p>
      </div>

      <button className="notification-close" onClick={onClose}>
        <X size={20} />
      </button>
    </div>
  )
}
