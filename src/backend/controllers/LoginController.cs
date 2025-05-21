using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

using backend.services;
using backend.utils;
using backend.models;

namespace backend.controllers {
    
    [ApiController]
    [Route("api/login")]
    public class LoginController(CEDigitalService db_ap) : ControllerBase{
        private readonly CEDigitalService db = db_ap;
        private readonly Hashcrypt encryptor = new();

        [HttpGet("students/{email}/{password}")]
        public ActionResult<Student> LoginStudent(String email, String password)
        {
            var results = db.mongo_db!.find<Student>("Students", s => s.Email == email);
            foreach (var student in results)
            {
                student.Password = encryptor.DecryptString(student.Password);
                if (student.Password == password)
                {
                    return Ok(student);
                }    
            }
            return NotFound();
        }

        [HttpGet("professors/{email}/{password}")]
        public ActionResult<Professor> LoginProfessor(String email, String password){
            var results = db.mongo_db!.find<Professor>("Professors", p => p.Email == email);
            foreach (var professor in results)
            {
                professor.Password = encryptor.DecryptString(professor.Password);
            
                if (professor.Password == password)
                {
                    return Ok(professor);
                }    
            }
            return NotFound();
        }
        
        [HttpGet("admins/{email}/{password}")]
        public ActionResult<Admin> LoginAdministrator(String email, String password){
            //var results = db.mongo_db!.find<Admin>("Administrators", a => a.Email == email);
            var results = db.mongo_db!.find<Admin>("Administrators", a => true);
            Console.WriteLine($"Se encontraron {results.Count} admins");

            foreach (var admin in results)
            {
                admin.Password = encryptor.DecryptString(admin.Password);
                Console.WriteLine($"Intentando comparar: desencriptado={admin.Password} vs ingresado={password}");


                if (admin.Password == password)
                {
                    return Ok(admin);
                }
            }
            return NotFound();
        }

    }
}