import { useState } from "react";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Modal from "../Modal";
import "../../styles/Notas/Grades.css";
import { useStudentsData } from "../../hooks/useStudentsData";
import { useStudentReports } from "../../hooks/useGradesReport";
import { generateGradeReport } from "../../../../utils/pdfGenerator";

export default function GradesModule({ course, group }) {
    const { students, isLoading: studentsLoading, error: studentsError } = useStudentsData(course?.id, group?.id);
    const [expandedStudents, setExpandedStudents] = useState(new Set());
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const { reports, fetchReport } = useStudentReports(group?.id);

    const toggleStudent = (studentId) => {
        const newExpanded = new Set(expandedStudents);
        if (newExpanded.has(studentId)) {
            newExpanded.delete(studentId);
        } else {
            newExpanded.add(studentId);
            if (!reports[studentId]) {
                fetchReport(studentId);
            }
        }
        setExpandedStudents(newExpanded);
    };

    const calculateFinalGrade = (rubrics) =>
        rubrics.reduce((sum, r) => sum + (r.earnedPercentage || 0), 0);

    const calculateCategoryGrade = (rubric) => rubric.earnedPercentage ?? 0;

    // Abre el modal de confirmación
    const handleDownloadPdf = () => {
        setShowConfirmModal(true);
    };

    // Lógica real de descarga PDF
    const confirmDownloadPdf = () => {
        setIsGeneratingPdf(true);
        setShowConfirmModal(false);
        generateGradeReport(students, reports, course, group);
        setIsGeneratingPdf(false);
    };


    return (
        <div className="dashboard-module">
            <div className="grade-report">
                {/* Encabezado y acciones */}
                <div className="module-header">
                    <h1>Reporte de notas</h1>
                    <Button onClick={handleDownloadPdf} className="btn-submit" disabled={isGeneratingPdf}>
                        <Download className="button-icon" size={18} /> PDF
                    </Button>
                </div>

                {/* Modal de confirmación */}
                <Modal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    title="Confirmar descarga"
                    actions={
                        <>
                            <button onClick={() => setShowConfirmModal(false)} className="btn-cancel">Cancelar</button>
                            <button onClick={confirmDownloadPdf} className="btn-submit">Descargar</button>
                        </>
                    }
                >
                    <p>¿Descargar el reporte de notas en PDF?</p>
                </Modal>

                {/* Lista de estudiantes */}
                <div className="grade-student-list">
                    {studentsLoading && <div>Cargando estudiantes...</div>}
                    {studentsError && <div>Error: {studentsError}</div>}
                    {!studentsLoading && students.length === 0 && <div>No hay estudiantes en el grupo.</div>}
                    {!studentsLoading && students.map((student) => {
                        const isExpanded = expandedStudents.has(student.id);
                        const report = reports[student.id] || { rubrics: [], isLoading: false, error: null };
                        const rubrics = report.rubrics || [];
                        const finalGrade = calculateFinalGrade(rubrics);

                        // Obtener todas las categorías (rubros)
                        const categories = rubrics.map(r => ({
                            name: r.name,
                            totalPercentage: r.totalPercentage,
                            earnedPercentage: r.earnedPercentage,
                            assignments: r.assignments
                        }));

                        // Unificar todas las asignaciones para la lista plana
                        const allAssignments = rubrics.flatMap(r =>
                            (r.assignments || []).map(a => ({
                                ...a,
                                category: r.name
                            }))
                        );

                        return (
                            <Card key={student.id} className="grade-student-item">
                                <Collapsible open={isExpanded} onOpenChange={() => toggleStudent(student.id)}>
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="grade-student-header">
                                            <CardTitle className="grade-student-title">
                                                <span>{student.name}</span>
                                                <div className="grade-info">
                                                    {isExpanded ? (
                                                        <ChevronDown className="chevron-icon" />
                                                    ) : (
                                                        <ChevronRight className="chevron-icon" />
                                                    )}
                                                </div>
                                            </CardTitle>
                                        </CardHeader>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <CardContent className="grade-student-content">
                                            {report.isLoading && <div>Cargando...</div>}
                                            {report.error && <div>Error: {report.error}</div>}
                                            {!report.isLoading && !report.error && (
                                                <div className="grade-content-sections">

                                                    {/* Detalles de evaluaciones */}
                                                    <div className="grade-section">
                                                        <h4 className="grade-section-title">Notas obtenidas por evaluación</h4>
                                                        <div className="grade-assignment-list">
                                                            {allAssignments.map((assignment, index) => (
                                                                <div key={index} className="grade-assignment-item">
                                                                    <div className="grade-assignment-info">
                                                                        <div>
                                                                            <span className="grade-assignment-name">{assignment.name}</span>
                                                                            <span className="weight">({assignment.totalPercentage}%)</span>
                                                                        </div>
                                                                        <span className="grade-assignment-category">{assignment.category}</span>
                                                                    </div>
                                                                    <div className="grade-assignment-grade">
                                                                        <span className="score">
                                                                            {assignment.earnedGrade ?? "-"}
                                                                            {assignment.earnedGrade !== null ? "/100" : ""}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Detalles de rubros */}
                                                    <div className="grade-section">
                                                        <h4 className="grade-section-title">Porcentajes obtenidos por rubros</h4>
                                                        <div className="category-list">
                                                            {categories.map((category, idx) => (
                                                                <div key={category.name + idx} className="category-item">
                                                                    <div>
                                                                        <span className="category-name">{category.name}</span>
                                                                        <span className="weight">({category.totalPercentage}%)</span>
                                                                    </div>
                                                                    <div className="category-grade">
                                                                        <span className="score">{calculateCategoryGrade(category).toFixed(1)}%</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Nota final */}
                                            <div className="final-section">
                                                <div className="final-grade-display">
                                                    <span className="final-label">Nota final del curso</span>
                                                    <span className="final-value">
                                                        {finalGrade ? `${finalGrade.toFixed(1)}%` : "--"}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Collapsible>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}