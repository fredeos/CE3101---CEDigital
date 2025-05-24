/**
 * Servicio para manejar la autenticación usando sessionStorage
 * Permite login, logout, obtener y modificar datos mientras la sesión esté activa
 */

export const AlmacenarInfo = {
    // Guardar cualquier dato
    setItem: (key, data) => {
        if (!key || typeof key !== 'string') {
            throw new Error('Key debe ser un string válido');
        }
        localStorage.setItem(key, JSON.stringify(data));
    },

    // Obtener dato por key
    getItem: (key) => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },

    // Eliminar dato por key
    removeItem: (key) => {
        localStorage.removeItem(key);
    },

    // Actualizar propiedades de un item existente
    updateItem: (key, newData) => {
        const currentData = AlmacenarInfoUser.getItem(key);
        if (!currentData) {
            throw new Error(`No existe el item con key: ${key}`);
        }
        const updatedData = { ...currentData, ...newData };
        AlmacenarInfoUser.setItem(key, updatedData);
        return updatedData;
    },

    // Eliminar propiedad específica de un item
    removeItemProperty: (key, property) => {
        const currentData = AlmacenarInfoUser.getItem(key);
        if (!currentData) {
            throw new Error(`No existe el item con key: ${key}`);
        }
        if (property in currentData) {
            delete currentData[property];
            AlmacenarInfoUser.setItem(key, currentData);
        }
    }
};

/*

////////////////////////////  GUIA PARA LAS ESTRUCTURAS DE DATOS QUE SE ALMACENAN EN EL LOCAL STORAGE ///////////////

Estructura de la información del estudiante (item = 'studentInfo')
{
    "studentID": numID,
    "idCard": Cédula,
    "firstName": "nombre",
    "firstLastName": "apellido1",
    "secondLastName": "apellido2",
    "email": "correo@estudiantec.cr",
    "phoneNumber": "numTelf",
    "password": "1234"
}

Estructura de la información de los cursos del estudiante (esto no se guarda)

{
    "semesterID": int,
    "semesterYear": int,
    "semesterPeriod": int,
    "courses":[
        {
            "id": int,
            "groupNum": int,
            "courseName": "name course"
        },
        {
            "id": 5,
            "groupNum": 1,
            "courseName": "name course"
        }
    ]
}

Estructura de la información del curso actual que seleccionó el estudiante (item = 'currentCourse')

 {
    "id": int,
    "groupNum": int,
    "courseName": "name course"
}

Estructura de la información de los rubros y evaluaciones (No se almacena)

{
    "id": 1,
    "name": "Proyecto de investigación",
    "totalPercentage": 5,
    "earnedPercentage": null,
    "assignments": []
},
{
    "id": 2,
    "name": "Pruebas cortas",
    "totalPercentage": 10,
    "earnedPercentage": null,
    "assignments": []
},
{
    "id": 4,
    "name": "Tareas",
    "totalPercentage": 10,
    "earnedPercentage": null,
    "assignments": [
        {
            "id": 3,
            "name": "Tarea 1",
            "dueDate": "2025-05-23T23:50:00.5",
            "totalPercentage": 2,
            "earnedPercentage": null,
            "earnedGrade": null,
            "showPercentage": 0
        },
        {
            "id": 4,
            "name": "Tarea 2",
            "dueDate": "2025-05-24T23:50:00.5",
            "totalPercentage": 2,
            "earnedPercentage": null,
            "earnedGrade": null,
            "showPercentage": 0
        }
    ]
}

Estructura de la información de una asignación específica (item = 'currentAssignmentID')

'currentAssignmentID' = id

*/



