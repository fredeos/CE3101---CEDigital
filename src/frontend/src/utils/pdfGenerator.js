import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateStudentReport = (students = [], course = {}, group = {}) => {
    
    if (students.length === 0) {
        console.warn("No hay estudiantes para generar el reporte");
        return;
    }

    // Crea objeto de jsPDF para crearlo
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

export function generateGradeReport(students, reports, course, group) {
  const doc = new jsPDF();
 
  doc.setFontSize(16);
  doc.text(`Reporte de notas`, 14, 15);
  doc.setFontSize(11);
  doc.text(`Curso: ${course?.name || ""}`, 14, 23);
  doc.text(`Grupo: ${group?.name || ""}`, 14, 30);
 
  let y = 38;
 
  students.forEach((student, idx) => {
    const report = reports[student.id] || { rubrics: [] };
    const rubrics = report.rubrics || [];
    const finalGrade = rubrics.reduce((sum, r) => sum + (r.earnedPercentage || 0), 0);
 
    doc.setFontSize(13);
    doc.text(`${idx + 1}. ${student.name}`, 14, y);
 
    y += 6;
    doc.setFontSize(11);
    doc.text(`Nota final: ${finalGrade ? finalGrade.toFixed(1) : "--"}%`, 14, y);
 
    y += 6;
 
    // Tabla de asignaciones
    const allAssignments = rubrics.flatMap(r =>
      (r.assignments || []).map(a => ({
        name: a.name,
        category: r.name,
        totalPercentage: a.totalPercentage,
        earnedGrade: a.earnedGrade,
      }))
    );
 
    // Tabla de asignaciones
    if (allAssignments.length > 0) {
      doc.text("Notas obtenidas por evaluación:", 14, y);
      y += 2;
 
      autoTable(doc, {
        startY: y,
        head: [["Evaluación", "Rubro", "Peso (%)", "Nota"]],
        body: allAssignments.map(a => [
          a.name,
          a.category,
          a.totalPercentage,
          a.earnedGrade !== null && a.earnedGrade !== undefined ? `${a.earnedGrade}/100` : "-",
        ]),
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 14, right: 14 },
      });
      y = doc.lastAutoTable.finalY + 4;
    }
 
    // Tabla de rubros
    if (rubrics.length > 0) {
      doc.text("Porcentajes obtenidos por rubros:", 14, y);
      y += 2;
      autoTable(doc, {
        startY: y,
        head: [["Rubro", "Peso (%)", "Porcentaje obtenido"]],
        body: rubrics.map(r => [
          r.name,
          r.totalPercentage,
          r.earnedPercentage !== null && r.earnedPercentage !== undefined ? `${r.earnedPercentage.toFixed(1)}%` : "-",
        ]),
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [39, 174, 96] },
        margin: { left: 14, right: 14 },
      });
      y = doc.lastAutoTable.finalY + 8;
    } else {
      y += 8;
    }
 
    // Salto de página si es necesario
    if (y > 250 && idx < students.length - 1) {
      doc.addPage();
      y = 15;
    }
  });
 
  doc.save("reporte_notas.pdf");
};
 

