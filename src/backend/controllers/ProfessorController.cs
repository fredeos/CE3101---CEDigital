using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

using backend.models;
using backend.services;

using backend.utils;

namespace backend.controllers {

    [ApiController]
    [Route("api")]
    public class ProfessorController(CEDigitalService db_ap) : ControllerBase {
        private readonly CEDigitalService db = db_ap;

        Hashcrypt encryptor = new();
        
        [HttpGet("professors")]
        public ActionResult<IEnumerable<Professor>> GetProfessors (){

            var professors = db.mongo_db!.find<Professor>("Professors", _ => true);
            if (professors == null || !professors.Any())
            {
                return NotFound("No se encontraron profesores.");
            }
            
            var result = professors.Select(p => new{

                p.IDCard,
                p.FirstName,
                p.FirstLastName,
                p.SecondLastName,
                p.Email,
                DecryptedPassword = encryptor.DecryptString(p.Password)
            }).ToList();

            return Ok(result); 
        }
        
    
    }
}