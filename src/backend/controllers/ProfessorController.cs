using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

using backend.models;
using backend.services;
using backend.DTO;

using backend.utils;

namespace backend.controllers {

    [ApiController]
    [Route("api")]
    public class ProfessorController(CEDigitalService db_ap) : ControllerBase
    {
        private readonly CEDigitalService db = db_ap;

        Hashcrypt encryptor = new();

        [HttpGet("professors")]
        public ActionResult<IEnumerable<Professor>> GetProfessors()
        {

            var professors = db.mongo_db!.find<Professor>("Professors", _ => true);
            if (professors == null || !professors.Any())
            {
                return NotFound("No se encontraron profesores.");
            }

            var result = professors.Select(p => new
            {

                p.IDCard,
                p.FirstName,
                p.FirstLastName,
                p.SecondLastName,
                p.Email,
                DecryptedPassword = encryptor.DecryptString(p.Password)
            }).ToList();

            return Ok(result);
        }

        [HttpGet("professors/{ssn}")]
        public ActionResult<Professor> GetProfessor(int ssn)
        {
            var professor = db.mongo_db!.find<Professor>("Professors", c => c.IDCard == ssn);
            if (professor == null || professor.Count == 0)
            {
                return NotFound("No se encontró el profesor.");
            }

            var result = professor.Select(p => new
            {

                p.IDCard,
                p.FirstName,
                p.FirstLastName,
                p.SecondLastName,
                p.Email,
                DecryptedPassword = encryptor.DecryptString(p.Password)
            }).ToList();

            return Ok(result.FirstOrDefault());
        }
        
        
    
    }
}