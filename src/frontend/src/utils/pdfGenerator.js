import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateStudentReport = (students = [], course = {}, group = {}) => {
    
    if (students.length === 0) {
        console.warn("No hay estudiantes para generar el reporte");
        return;
    }

    const doc = new jsPDF();

    // Título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`Lista de estudiantes - ${course?.name || "Curso"}`, 15, 20);

    // Subtítulo
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Grupo: ${group?.name || "N/A"} | Fecha: ${new Date().toLocaleDateString()}`, 15, 28);

    // Tabla 
    autoTable(doc, {
        head: [["Carnet", "Nombre", "Email", "Teléfono"]],
        body: students.map((student) => [
            student.id || "N/A",
            student.name || "N/A", 
            student.email || "N/A",
            student.phone || "No disponible"
        ]),
        startY: 33,
        styles: {
            cellPadding: 4,
            fontSize: 10,
            border: {
                horizontal: { style: "solid" },
                vertical: { style: "solid" }
            }
        },
        headStyles: {
            fillColor: "#334e5f",
            textColor: "#fff",
            fontStyle: "bold"
        }
    });

    doc.save(`Reporte_matriculados_${course?.name || "curso"}_${group?.name || "grupo"}.pdf`);
};