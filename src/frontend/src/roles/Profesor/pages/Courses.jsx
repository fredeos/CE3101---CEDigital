import { useEffect } from "react";
import { useProfessorAuth } from "../hooks/useProfessorAuth";
import { useProfessorGroupsWithCourses } from "../hooks/useProfessorGroupsWithCourses";
import { LogOut, Users } from "lucide-react";
import "../styles/Courses.css";

export default function CourseSelection() {
    const { professor, logout, checkAuth } = useProfessorAuth();
    const { data, isLoading } = useProfessorGroupsWithCourses();

    // Agrupa los datos por curso
    const coursesMap = {};
    data.forEach(item => {
        if (!coursesMap[item.courseCode]) {
            coursesMap[item.courseCode] = {
                id: item.courseCode,
                name: item.courseName,
                code: item.courseCode,
                groups: []
            };
        }
        coursesMap[item.courseCode].groups.push({
            id: item.groupId,
            name: `Grupo ${item.groupNumber}`,
            semesterId: item.semesterId
        });
    });
    const courses = Object.values(coursesMap);

    // En caso de no haber iniciado sesion redirige a login
    useEffect(() => {
        if (!checkAuth()) {
            window.location.href = "/cedigital-profesores";
        }
    }, []);

    // Gestiona el cierre de sesion
    const handleLogout = () => {
        logout(); // Llama a la funcion para limpiar los datos del usuario 
        window.location.href = "/cedigital-profesores";
    };

    // Gestiona el grupo X del curso X seleccionado redirigiendo
    const handleSelectGroup = (course, group) => {
        window.location.href = `/gestion-grupo?courseId=${course.id}&groupId=${group.id}`;
    };

    if (!professor || isLoading) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="course-selection-container">
            <div className="selection-header">
                <div className="professor-profile">
                    <h1>{professor.firstName} {professor.firstLastName}</h1>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                    <LogOut size={16} />
                    Cerrar sesión
                </button>
            </div>

            <div className="selection-content">
                <div className="selection-head"></div>
                <div className="direct-selection-grid">
                    {courses.map((course) => (
                        <div key={course.id} className="course-card">
                            <div className="course-card-header">
                                <h3>{course.name} [{course.code}]</h3>
                            </div>
                            <div className="course-groups">
                                {course.groups.map((group) => (
                                    <div key={group.id} className="group-item">
                                        <div className="group-info">
                                            <Users size={17} />
                                            <h1>{group.name}</h1>
                                        </div>
                                        <button
                                            className="btn-select-group"
                                            onClick={() => handleSelectGroup(course, group)}
                                        >
                                            Seleccionar
                                        </button>
                                    </div>
                                ))}
                                {course.groups.length === 0 && (
                                    <div className="no-groups">
                                        No hay grupos disponibles para este curso
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}