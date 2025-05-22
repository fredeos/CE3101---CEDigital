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

/* Estructura de la información del estudiante (item = 'studentInfo')
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

Estructura de la información de los cursos del estudiante (item = 'semestreCursos')

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


*/



