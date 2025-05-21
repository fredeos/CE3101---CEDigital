USE CEDigital;
GO

INSERT INTO Academic.Professors (ssn)
VALUES
(310807683), (310230015), (309801693);

INSERT INTO Academic.Students (ssn)
VALUES
(2023087683), (2023074492), (2021476501), (2021430403), (2021032537);

INSERT INTO Academic.Semesters (year, period)
VALUES (2025,1);

INSERT INTO Academic.Courses (code, course_name, credits, career_name)
VALUES 
('CE-1101', 'Fundamentos de Programación', 2, 'Ingenieria en Computadores'),
('CE-2101', 'Fundamentos de Arquitectura', 4, 'Ingenieria en Computadores'),
('CE-2102', 'Algoritmos y Estructuras de Datos', 4, 'Ingenieria en Computadores'),
('CE-3101', 'Bases de Datos', 3, 'Ingenieria en Computadores'),
('CE-4101', 'Sistemas Embebidos', 4, 'Ingenieria en Computadores');

INSERT INTO Academic.Groups (course_code, semester_id, num)
VALUES
('CE-1101', 1, 1),
('CE-1101', 1, 2),
('CE-2102', 1, 1),
('CE-3101', 1, 1),
('CE-4101', 1, 1);

-- Insertar raices de los cursos
INSERT INTO Files.Folders (group_id, parent_id, folder_name)
VALUES
(1, NULL, 'root'),
(2, NULL, 'root'),
(3, NULL, 'root'),
(4, NULL, 'root'),
(5, NULL, 'root');

-- Insertar estructura basica de todos los cursos
INSERT INTO Files.Folders (group_id, parent_id, folder_name)
VALUES
(1, 1, 'Documentos públicos'), (1, 1, 'Examenes'), (1, 1, 'Proyectos'), (1, 1, 'Tareas'), (1, 1, 'Apuntes'),
(2, 2, 'Documentos públicos'), (2, 2, 'Examenes'), (2, 2, 'Proyectos'), (2, 2, 'Tareas'), (2, 2, 'Apuntes'),
(3, 3, 'Documentos públicos'), (3, 3, 'Examenes'), (3, 3, 'Proyectos'), (3, 3, 'Tareas'), (3, 3, 'Apuntes'),
(4, 4, 'Documentos públicos'), (4, 4, 'Examenes'), (4, 4, 'Proyectos'), (4, 4, 'Tareas'), (4, 4, 'Apuntes'),
(5, 5, 'Documentos públicos'), (5, 5, 'Examenes'), (5, 5, 'Proyectos'), (5, 5, 'Tareas'), (5, 5, 'Apuntes');

SELECT * FROM Files.Documents;

-- Insertar subfolder y documento de prueba para un folder curso de un curso
INSERT INTO Files.Folders (group_id, parent_id, folder_name)
VALUES
(1,6,'Notas');

INSERT INTO Files.Documents (folder_id, file_name, file_type, size, filepath)
VALUES
(1, 'archivo', 'txt', 500, '<invalid>'), (6, 'Plan de curso', 'pdf', 20000, '<invalid>');


INSERT INTO Academic.ProfessorGroups (group_id, professor_id)
VALUES
(1, 309801693), (5, 309801693),
(2, 310230015), (3, 310230015),
(4, 310807683);

INSERT INTO Academic.CourseGroups (group_id, student_id)
VALUES
(3, 2023087683), (4, 2023087683),
(4, 2023074492),
(4, 2021476501), (5, 2021476501),
(4, 2021430403), (5, 2021430403),
(4, 2021032537), (5, 2021032537);