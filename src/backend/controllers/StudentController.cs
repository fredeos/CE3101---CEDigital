using backend.models;
using backend.services;
using backend.utils;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace backend.controllers {

    [ApiController]
    [Route("api/students")]
    public class StudentController(CEDigitalService db_ap) : ControllerBase
    {
        private readonly CEDigitalService db = db_ap;
        private readonly Hashcrypt encryptor = new();

        [HttpGet]
        public ActionResult<IEnumerable<Student>> GetAllStudents()
        {
            var results = db.mongo_db!.find<Student>("Students", s => true);
            foreach (var student in results)
            {
                student.Password = encryptor.DecryptString(student.Password);
            }
            return Ok(results);    
        }
    }
}