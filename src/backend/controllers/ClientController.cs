using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

using backend.models;
using backend.services;

namespace backend.controllers {

    [ApiController]
    [Route("clients")]
    public class ClientController(CEDigitalService db_ap) : ControllerBase {
        private readonly CEDigitalService db = db_ap;

        [HttpGet("{id}")]
        public ActionResult<Client> GetClient(int id){
            var results = db.mongo_db.find<Client>("Clients", c => c.Ssn == id);
            var client = results.FirstOrDefault();
            return Ok(results.FirstOrDefault());
        }

        [HttpPost("new")]
        public ActionResult<Client> AddClient([FromBody] Client client){
            var inserted = db.mongo_db.insert<Client>("Clients",[client]);
            return Ok(inserted.FirstOrDefault());
        }

        [HttpPut("modify/{id}")]
        public ActionResult ModifyClient(int id, [FromBody] Client client){
            var update = Builders<Client>.Update
                .Set(c => c.Ssn, client.Ssn)
                .Set(c => c.FirstName, client.FirstName)
                .Set(c => c.LastName, client.LastName);
            var updated = db.mongo_db.update<Client>("Clients",c => c.Ssn == id, update);
            return Ok(updated);
        }

        [HttpDelete("remove/{id}")]
        public ActionResult RemoveClient(int id){
            var deleted = db.mongo_db.delete<Client>("Clients", c => c.Ssn == id);
            return Ok(deleted);
        }
    }
}