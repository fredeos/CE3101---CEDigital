using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

using backend.models;
using backend.services;

namespace backend.controllers {

    [ApiController]
    [Route("clients")]
    public class ClientController(ShopDBService db_ap) : ControllerBase {
        private readonly ShopDBService db = db_ap;

        [HttpGet("{id}")]
        public ActionResult<Client> GetClient(int id){
            var results = db.mongo_db.find<Client>("Clients", c => c.Ssn == id);
            var client = results.FirstOrDefault();
            return Ok(results.FirstOrDefault());
        }

        [HttpPost("new")]
        public ActionResult<Client> AddClient([FromBody] Client client){
            db.mongo_db.insert<Client>("Clients",[client]);
            return Ok(client);
        }

        [HttpPut("modify/{id}")]
        public ActionResult ModifyClient(int id, [FromBody] Client client){
            db.mongo_db.update<Client>("Clients",c => c.Ssn == id, client);
            return Ok();
        }

        [HttpDelete("remove/{id}")]
        public ActionResult RemoveClient(int id){
            db.mongo_db.delete<Client>("Clients", c => c.Ssn == id);
            return Ok();
        }
    }
}