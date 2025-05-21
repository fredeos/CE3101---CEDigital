using Microsoft.AspNetCore.Mvc;

using backend.models;
using backend.services;
using backend.DTO;

namespace backend.controllers
{

    [ApiController]
    [Route("api")]

    public class NewsController(CEDigitalService db_ap) : ControllerBase
    {

        private readonly CEDigitalService db = db_ap;

        /// <summary>
        /// Obtiene todas las noticias de la tabla sin importar nada.
        /// </summary>
        /// <returns></returns>

        [HttpGet("news")]
        public ActionResult<IEnumerable<News>> GetAllNews()
        {
            String tablename = "Academic.News";
            String attributes = $"id, professor_id AS {nameof(News.ProfessorIDCard)}, group_id AS {nameof(News.GroupID)}, title, message, publish_date AS {nameof(News.PublicationDate)}";

            String query = @$"
            SELECT {attributes} 
            FROM {tablename};";

            var news = db.sql_db!.SELECT<News>(query);
            if (news == null || !news.Any())
            {
                return NotFound("No hay noticias creadas para ningún grupo.");
            }

            return Ok(news);
        }

        /// <summary>
        /// Permite obtener las noticias de un grupo especificado junto al nombre del Profesor.
        /// </summary>
        /// <param name="group_id"></param>
        /// <returns></returns>
        /// 
        [HttpGet("news-with-professor/{group_id}")]
        public ActionResult<IEnumerable<NewsWithProfessorDTO>> GetNewsWithProfessor(string group_id)
        {
            // 1. Obtener noticias de SQL
            String sqlQuery = @$"
            SELECT id, professor_id AS ProfessorIDCard, group_id AS GroupID, 
                title, message, publish_date AS {nameof(News.PublicationDate)}
            FROM Academic.News
            WHERE group_id = {group_id};";

            var newsList = db.sql_db!.SELECT<News>(sqlQuery);
            if (newsList == null || !newsList.Any()) return NotFound();

            // 2. Para cada noticia, obtener info del profesor
            var result = new List<NewsWithProfessorDTO>();
            foreach (var news in newsList)
            {
                var professor = db.mongo_db!.find<Professor>("Professors", p => p.IDCard == news.ProfessorIDCard)
                    .FirstOrDefault();

                result.Add(new NewsWithProfessorDTO
                {
                    Id = news.ID,
                    ProfessorIDCard = news.ProfessorIDCard,
                    ProfessorFullName = professor != null
                        ? $"{professor.FirstName} {professor.FirstLastName}"
                        : "Profesor no encontrado",
                    GroupID = news.GroupID,
                    Title = news.Title,
                    Message = news.Message,
                    PublishDate = news.PublicationDate
                });
            }

            return Ok(result);
        }

        /// <summary>
        /// Permite insertar una noticia nueva en un grupo dado.
        /// </summary>
        /// <param name="news"></param>
        /// <returns></returns>

        [HttpPost("add/news")]
        public ActionResult<News> AddNew([FromBody] News news)
        {
            String tablename = "Academic.News";
            String attributes = $"professor_id, group_id, title, message";

            String query = @$"
            INSERT INTO {tablename} ({attributes})
            OUTPUT INSERTED.professor_id as {nameof(News.ProfessorIDCard)}, 
            INSERTED.group_id as {nameof(News.GroupID)}, 
            INSERTED.title as {nameof(News.Title)}, 
            INSERTED.message as {nameof(News.Message)}
            VALUES (@{nameof(News.ProfessorIDCard)}, @{nameof(News.GroupID)}, @{nameof(News.Title)}, @{nameof(News.Message)});";

            var result = db.sql_db!.INSERT<News>(query, news);
            if (result == null)
            {
                return BadRequest("Error inserting new into the database");
            }
            return CreatedAtAction(nameof(AddNew), new { id = result.ID }, result);
        }

        /// <summary>
        /// Permite eliminar una noticia dado su ID.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>

        [HttpDelete("remove/new/{id}")]
        public ActionResult RemoveNew(int id)
        {
            String tablename = "Academic.News";

            // 1. Primero verificamos si existe el registro usando SELECT
            var checkQuery = $"SELECT TOP 1 id FROM {tablename} WHERE id = {id}";
            var existingItems = db.sql_db!.SELECT<News>(checkQuery);

            if (existingItems.Count == 0)
            {
                return NotFound($"No se encontró una noticia con ID {id}");
            }

            // 2. Si existe, procedemos a eliminar
            String retrieval = $"DELETED.id as {nameof(News.ID)}, " +
                            $"DELETED.professor_id as {nameof(News.ProfessorIDCard)}, " +
                            $"DELETED.group_id as {nameof(News.GroupID)}, " +
                            $"DELETED.title as {nameof(News.Title)}, " +
                            $"DELETED.message as {nameof(News.Message)}, " +
                            $"DELETED.publish_date as {nameof(News.PublicationDate)}";

            String query = $@"
            DELETE FROM {tablename}
            OUTPUT {retrieval}
            WHERE id = {id};";

            var results = db.sql_db!.DELETE<News>(query);

            // 3. Verificar resultados (esto es redundante pero buena práctica)
            if (results == null || results.Count == 0)
            {
                // Esto no debería ocurrir porque ya verificamos que existe
                return StatusCode(500, "Error inesperado al eliminar la noticia");
            }

            return AcceptedAtAction(nameof(RemoveNew), new { id = id }, results);
        }
        
        /// <summary>
        /// Permite modificar una noticia ya existente ingresando el id correspondiente.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="updatedNews"></param>
        /// <returns></returns>
        
        [HttpPut("update/new/{id}")]
        public ActionResult UpdateNew(int id, [FromBody] News updatedNews)
        {
            // 1. Validar el modelo recibido
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // 2. Verificar que el ID del cuerpo coincide con el de la ruta
            if (updatedNews.ID != id)
            {
                return BadRequest("El ID de la noticia no coincide con el ID de la ruta");
            }

            // 3. Construir la consulta SQL con parámetros
            String tablename = "Academic.News";
            String retrieval = $"INSERTED.id as {nameof(News.ID)}, " +
                            $"INSERTED.professor_id as {nameof(News.ProfessorIDCard)}, " +
                            $"INSERTED.group_id as {nameof(News.GroupID)}, " +
                            $"INSERTED.title as {nameof(News.Title)}, " +
                            $"INSERTED.message as {nameof(News.Message)}";

            String query = $@"
            UPDATE {tablename}
            SET 
                professor_id = @{nameof(News.ProfessorIDCard)},
                group_id = @{nameof(News.GroupID)},
                title = @{nameof(News.Title)},
                message = @{nameof(News.Message)},
                publish_date = GETDATE()
            OUTPUT {retrieval}
            WHERE id = {id};";

            // 4. Ejecutar la actualización
            var results = db.sql_db!.UPDATE<News>(query, updatedNews);

            // 5. Manejar los resultados
            if (results == null)
            {
                return StatusCode(500, "Error al procesar la actualización");
            }
            
            if (results.Count == 0)
            {
                return NotFound($"No se encontró una noticia con ID {id} para actualizar");
            }

            return Ok(results.First()); // Devuelve la noticia actualizada
        }

    }
}