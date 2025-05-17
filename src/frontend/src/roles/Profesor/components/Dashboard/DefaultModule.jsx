export default function DefaultModule({ course, group }) {
  return (
    <div className=".module-default-content">
        <div className="module-default">
            <h1 className="module-default-title"> 
              Bienvenido(a) al panel de gestión del grupo "{group.name}" perteneciente al curso de "{course.name}".
              <br /> <br />
              Por favor, selecciona una de las opciones del menú lateral para gestionar el curso.
            </h1>
      </div>
    </div>
  )
}

