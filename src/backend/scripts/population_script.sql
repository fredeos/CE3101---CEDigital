USE CEDigital;
GO

INSERT INTO Academic.Semesters (year, period)
VALUES (2025,1);

INSERT INTO Academic.Courses (code, course_name, credits, career_name)
VALUES 
('CE-1101', 'Fundamentos de Programación', 2, 'Ingenieria en Computadores'),
('CE-2101', 'Fundamentos de Arquitectura', 4, 'Ingenieria en Computadores'),
('CE-2102', 'Algoritmos y Estructuras de Datos', 4, 'Ingenieria en Computadores'),
('CE-3101', 'Bases de Datos', 3, 'Ingenieria en Computadores'),
('CE-4101', 'Sistemas Embebidos', 4, 'Ingenieria en Computadores');