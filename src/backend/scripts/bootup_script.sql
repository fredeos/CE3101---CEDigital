CREATE DATABASE CEDigital;

USE CEDigital;
GO

-- 1. Creacion de esquemas(schemas) de la base de datos
CREATE SCHEMA Academic;
CREATE SCHEMA Files;

-- 2. Creacion de tablas de la base datos

----------------------- [Tablas de esquema academico] -----------------------
CREATE TABLE Academic.Professors (
	id INT IDENTITY(1,1) UNIQUE,
	ssn INT PRIMARY KEY
);

CREATE TABLE Academic.Students (
	id INT IDENTITY(1,1) UNIQUE,
	ssn INT PRIMARY KEY
);

CREATE TABLE Academic.Semesters (
	id INT IDENTITY(1,1) UNIQUE,
    year INT NOT NULL,
    period INT NOT NULL,
    PRIMARY KEY (year, period)
);

CREATE TABLE Academic.Courses (
    code NVARCHAR(8) PRIMARY KEY,
    course_name NVARCHAR(80), 
    credits INT NOT NULL,
    career_name NVARCHAR(50),
    available_flag INT NOT NULL DEFAULT(1) -- 0: no disponible, 1: disponible
);

ALTER TABLE Academic.Courses
ADD available_flag INT NOT NULL DEFAULT 1;

SELECT S.year as Year, S.period as Period, C.code as CourseCode, C.course_name as Name, C.career_name as Career, COUNT(G.course_code) as AvailableGroups
FROM (Academic.Courses as C JOIN Academic.Groups as G
ON G.course_code = C.code) JOIN Academic.Semesters as S
ON G.semester_id = S.id
WHERE C.available_flag = 1
GROUP BY S.year, S.period, C.code, C.course_name, C.career_name
ORDER BY course_name, Year DESC, Period DESC; 

CREATE TABLE Academic.Groups (
    id INT IDENTITY(1,1) PRIMARY KEY,
    course_code NVARCHAR(8) NOT NULL, -- FK
    semester_id INT NOT NULL, -- FK
    num INT NOT NULL
);

CREATE TABLE Academic.CourseGroups (
    group_id INT NOT NULL, -- FK
    student_id INT NOT NULL, -- FK
    PRIMARY KEY (group_id, student_id),
);

CREATE TABLE Academic.ProfessorGroups (
    group_id INT NOT NULL, -- FK
    professor_id INT NOT NULL, -- FK
    PRIMARY KEY (group_id, professor_id)
);

CREATE TABLE Academic.News (
    id INT IDENTITY(1,1) PRIMARY KEY,
    professor_id INT NOT NULL, -- FK
    group_id INT NOT NULL,  -- FK
    title NVARCHAR(50),
    messsage NVARCHAR(200),
    pubish_date DATETIME DEFAULT(getdate())
);

CREATE TABLE Academic.Rubrics (
    id INT IDENTITY(1,1) PRIMARY KEY,
    group_id INT NOT NULL, -- FK
    rubric_name NVARCHAR(50) NOT NULL,
    percentage FLOAT(2) NOT NULL,
);

CREATE TABLE Academic.Assignments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    rubric_id INT NOT NULL, --FK
    name NVARCHAR(50) NOT NULL,
    percentage FLOAT(5) NOT NULL,
    turnin_date DATETIME,
    individual_flag INT NOT NULL DEFAULT(0), -- 0: individual, 1: group
);

CREATE TABLE Academic.StudentAssignments (
    student_id INT NOT NULL, -- FK
    assignment_id INT NOT NULL, -- FK
    PRIMARY KEY (student_id, assignment_id)
);

CREATE TABLE Academic.AssignmentSubmissions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    assignment_id INT NOT NULL, -- FK
    student_id INT NULL,
    group_id INT NULL,
    grade DECIMAL(5,2) NULL,
    commentary NVARCHAR(200) NULL,
    submitted_file INT NULL, -- FK
    feedback_file INT NULL, -- FK
    submission_date DATETIME NULL DEFAULT(GETDATE()),
	published_flag INT DEFAULT(0) -- 0: no publicado, 1:publicado
);

USE CEDigital;
GO

SELECT * FROM Academic.AssignmentSubmissions;

CREATE TABLE Academic.StudentSubmissions (
    student_id INT NOT NULL, -- FK
    submission_id INT NOT NULL, -- FK
    PRIMARY KEY (student_id, submission_id)
);


CREATE TABLE Academic.AssignmentGroups (
    id INT IDENTITY(1,1) PRIMARY KEY,
    assignment_id INT NOT NULL, -- FK
    group_num INT,
);

CREATE TABLE Academic.AssignmentStudentGroups (
    student_id INT NOT NULL, --FK
    group_id INT NOT NULL, -- FK
    PRIMARY KEY (student_id, group_id)
);

----------------------- [Tablas de esquema de archivos] -----------------------
SELECT * FROM Files.SubmissionFiles;

CREATE TABLE Files.Folders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    group_id INT NOT NULL, -- FK
    parent_id INT NULL, -- FK
    folder_name NVARCHAR(50) NOT NULL,
    upload_date DATETIME DEFAULT(getdate()),
);

-- Ruta de guardado de documentos: CE3101---CEDigital/src/backend/content/documents
CREATE TABLE Files.Documents (
    id INT IDENTITY(1,1) PRIMARY KEY,
    folder_id INT NOT NULL, -- FK
    file_name NVARCHAR(50) NOT NULL,
    file_type NVARCHAR(10) NOT NULL,
    size BIGINT NOT NULL,
    filepath NVARCHAR(160) NOT NULL,
    upload_date DATETIME DEFAULT(getdate()),
);

-- Ruta de guardado de especificaiones: CE3101---CEDigital/src/backend/content/specifications
CREATE TABLE Files.Specifications (
    id INT IDENTITY(1,1) UNIQUE,
    assignment_id INT NOT NULL, -- FK
    file_name NVARCHAR(50) NOT NULL,
    file_type NVARCHAR(10) NOT NULL,
    size BIGINT NOT NULL,
    specification_file NVARCHAR(150), -- filepath: guardado con un nombre autogenerado (GUID)
    upload_date DATETIME DEFAULT(getdate()),
    PRIMARY KEY(assignment_id, specification_file)
);  

-- Ruta de guardado de entregables: CE3101---CEDigital/src/backend/content/submissions
CREATE TABLE Files.SubmissionFiles (
    id INT IDENTITY(1,1) UNIQUE,
    submission_id INT NOT NULL, -- FK
    file_name NVARCHAR(50) NOT NULL,
    file_type NVARCHAR(10) NOT NULL,
    size BIGINT NOT NULL,
    submission_file NVARCHAR(150), -- filepath: guardado con un nombre autogenerado (GUID)
    upload_date DATETIME DEFAULT(getdate()),
    PRIMARY KEY(submission_id, submission_file)
);

-- Ruta de guardado de retroalimentaciones: CE3101---CEDigital/src/backend/content/feedbacks
CREATE TABLE Files.FeedbackFiles (
    id INT IDENTITY(1,1) UNIQUE,
    submission_id INT NOT NULL, -- FK
    file_name NVARCHAR(50) NOT NULL,
    file_type NVARCHAR(10) NOT NULL,
    size BIGINT NOT NULL,
    feedback_file NVARCHAR(150), -- filepath: guardado con un nombre autogenerado (GUID)
    upload_date DATETIME DEFAULT(getdate()),
    PRIMARY KEY(submission_id, feedback_file)
);

-- Función para la tabla AssignmentSubmissions

USE CEDigital;
GO

CREATE FUNCTION dbo.ValidateSubmissionType(
    @assignment_id INT,
    @student_id INT,
    @group_id INT
)
RETURNS BIT
AS
BEGIN
    DECLARE @is_valid BIT = 0;
    DECLARE @individual_flag INT;
    
    SELECT @individual_flag = individual_flag 
    FROM Academic.Assignments 
    WHERE id = @assignment_id;
    
    IF (@individual_flag = 0 AND @student_id IS NOT NULL AND @group_id IS NULL)
        OR (@individual_flag = 1 AND @group_id IS NOT NULL AND @student_id IS NULL)
        SET @is_valid = 1;
    
    RETURN @is_valid;
END;
GO

-- Constraint para la función

ALTER TABLE Academic.AssignmentSubmissions
ADD CONSTRAINT CK_SubmissionType 
CHECK (dbo.ValidateSubmissionType(assignment_id, student_id, group_id) = 1);

-- Fin de Función para la tabla AssignmentSubmissions

-- 3. Modificacion de tablas para agregar restricciones y llaves foraneas
ALTER TABLE Academic.Groups
ADD CONSTRAINT FK_GroupOfCourse FOREIGN KEY (course_code) REFERENCES Academic.Courses (code),
    CONSTRAINT FK_GroupSemester FOREIGN KEY (semester_id) REFERENCES Academic.Semesters (id);

ALTER TABLE Academic.CourseGroups
ADD CONSTRAINT FK_GroupForStudent FOREIGN KEY (group_id) REFERENCES Academic.Groups (id),
    CONSTRAINT FK_StudentInGroup FOREIGN KEY (student_id) REFERENCES Academic.Students (ssn);

ALTER TABLE Academic.ProfessorGroups
ADD CONSTRAINT FK_GroupForProfessor FOREIGN KEY (group_id) REFERENCES Academic.Groups (id),
    CONSTRAINT FK_ProfessorInGroup FOREIGN KEY (professor_id) REFERENCES Academic.Professors (ssn);

ALTER TABLE Academic.News
ADD CONSTRAINT FK_GroupNews FOREIGN KEY (group_id) REFERENCES Academic.Groups (id),
    CONSTRAINT FK_ProfessorNews FOREIGN KEY (professor_id) REFERENCES Academic.Professors (ssn); 

ALTER TABLE Academic.Rubrics 
ADD CONSTRAINT FK_GroupRubrics FOREIGN KEY (group_id) REFERENCES Academic.Groups (id);

ALTER TABLE Academic.Assignments
ADD CONSTRAINT FK_RubricAssignments FOREIGN KEY (rubric_id) REFERENCES Academic.Rubrics (id);

ALTER TABLE Academic.StudentAssignments
ADD CONSTRAINT FK_AssignmentForStudent FOREIGN KEY (assignment_id) REFERENCES Academic.Assignments (id),
    CONSTRAINT FK_StudentOnAssignment FOREIGN KEY (student_id) REFERENCES Academic.Students (ssn);


-------------------------------------- Para AssignmentSubmissions --------------------------------------
-- Para assignment_id
ALTER TABLE Academic.AssignmentSubmissions
ADD CONSTRAINT FK_SubmissionAssignment
FOREIGN KEY (assignment_id) REFERENCES Academic.Assignments (id);

-- Para student_id
ALTER TABLE Academic.AssignmentSubmissions
ADD CONSTRAINT FK_SubmissionStudent_SSN
FOREIGN KEY (student_id) REFERENCES Academic.Students(ssn);

-- Para group_id
ALTER TABLE Academic.AssignmentSubmissions
ADD CONSTRAINT FK_SubmissionGroup
FOREIGN KEY (group_id) REFERENCES Academic.AssignmentGroups(id);

-- Para submitted_file
ALTER TABLE Academic.AssignmentSubmissions
ADD CONSTRAINT FK_SubmittedFile
FOREIGN KEY (submitted_file) REFERENCES Files.SubmissionFiles(id);

-- Para feedback_file
ALTER TABLE Academic.AssignmentSubmissions
ADD CONSTRAINT FK_FeedbackFile
FOREIGN KEY (feedback_file) REFERENCES Files.FeedbackFiles(id);


-------------------------------------- Fin para AssignmentSubmissions --------------------------------------

ALTER TABLE Academic.StudentSubmissions
ADD CONSTRAINT FK_SubmissionForStudent FOREIGN KEY (submission_id) REFERENCES Academic.AssignmentSubmissions (id),
    CONSTRAINT FK_StudentAssignmentSubmission FOREIGN KEY (student_id) REFERENCES Academic.Students (ssn);

ALTER TABLE Academic.AssignmentGroups
ADD CONSTRAINT FK_GroupForAssigment FOREIGN KEY (assignment_id) REFERENCES Academic.Assignments (id);

ALTER TABLE Academic.AssignmentStudentGroups
ADD CONSTRAINT FK_AssignmentGroupForStudent FOREIGN KEY (group_id) REFERENCES Academic.AssignmentGroups (id),
    CONSTRAINT FK_StudentInAssignmentGroup FOREIGN KEY (student_id) REFERENCES Academic.Students (ssn);

ALTER TABLE Files.Folders
ADD CONSTRAINT FK_FolderGroup FOREIGN KEY (group_id) REFERENCES Academic.Groups (id),
    CONSTRAINT FK_FolderParent FOREIGN KEY (parent_id) REFERENCES Files.Folders (id);

ALTER TABLE Files.Documents
ADD CONSTRAINT FK_DocumentFolder FOREIGN KEY (folder_id) REFERENCES Files.Folders (id);

ALTER TABLE Files.Specifications
ADD CONSTRAINT FK_AssignmentSpecification FOREIGN KEY (assignment_id) REFERENCES Academic.Assignments (id);

ALTER TABLE Files.SubmissionFiles
ADD CONSTRAINT FK_SubmissionFile FOREIGN KEY (submission_id) REFERENCES Academic.AssignmentSubmissions (id);

ALTER TABLE Files.FeedbackFiles
ADD CONSTRAINT FK_FeedbackFile FOREIGN KEY (submission_id) REFERENCES Academic.AssignmentSubmissions (id);