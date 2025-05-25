using Microsoft.AspNetCore.Mvc;

using backend.models;
using backend.services;

namespace backend.controllers {

    [ApiController]
    [Route("items")]
    public class ItemController(CEDigitalService db_ap) : ControllerBase {
        private readonly CEDigitalService db = db_ap;
        
        [HttpGet("find/{id}")]
        public ActionResult<Item> GetItem(int id){
            String tablename = "Store.Items as I";
            String attributes = $"I.ID as {nameof(Item.id)}, I.item_name as {nameof(Item.name)}, I.price as {nameof(Item.price)}, I.on_stock as {nameof(Item.stock)}";

            String query = @$"
            SELECT {attributes} 
            FROM {tablename}
            WHERE I.ID = {id};"; 
            var results = db.sql_db!.SELECT<Item>(query);
            if (results == null || results.Count == 0){
                return NotFound();
            }
            return Ok(results.FirstOrDefault());
        }

        [HttpPost("new")]
        public ActionResult<Item> AddItem([FromBody] Item item){
            String tablename = "Store.Items";
            String attributes = $"item_name, price, on_stock";

            String query = @$"
            INSERT INTO {tablename} ({attributes})
            OUTPUT INSERTED.ID as {nameof(Item.id)}, INSERTED.item_name as {nameof(Item.name)}, INSERTED.price as {nameof(Item.price)}, INSERTED.on_stock as {nameof(Item.stock)}
            VALUES (@{nameof(Item.name)}, @{nameof(Item.price)}, @{nameof(Item.stock)});";
            var result = db.sql_db!.INSERT<Item>(query, item);
            if (result == null){
                return BadRequest("Error inserting item into the database");
            }
            return CreatedAtAction(nameof(AddItem), new { id = result.id }, result);
        }

        [HttpPut("modify/{id}")]
        public ActionResult ModifyItem(int id, [FromBody] Item item){
            String tablename = "Store.Items";
            String retrieval = $"INSERTED.ID as {nameof(Item.id)}, INSERTED.item_name as {nameof(Item.name)}, INSERTED.price as {nameof(Item.price)}, INSERTED.on_stock as {nameof(Item.stock)}";
            String modified_values = $"item_name = @{nameof(Item.name)},price = @{nameof(Item.price)},on_stock = @{nameof(Item.stock)}";
            String condition = $"ID = {id}";

            String query = @$"
            UPDATE {tablename} 
            SET {modified_values}
            OUTPUT {retrieval} 
            WHERE {condition};";

            // Realizar la consulta a la base
            var results = db.sql_db!.UPDATE<Item>(query, item);
            return AcceptedAtAction(nameof(ModifyItem), new { id = id }, results);
        }

        [HttpDelete("remove/{id}")]
        public ActionResult RemoveItem(int id){
            String tablename = "Store.Items";
            String retrieval = $"DELETED.ID as {nameof(Item.id)}, DELETED.item_name as {nameof(Item.name)}, DELETED.price as {nameof(Item.price)}, DELETED.on_stock as {nameof(Item.stock)}";
            String condition = $"ID = {id}";

            String query = @$"
            DELETE FROM {tablename}
            OUTPUT {retrieval}
            WHERE {condition};";

            var results = db.sql_db!.DELETE<Item>(query);
            return AcceptedAtAction(nameof(RemoveItem), new { id = id }, results);
        }
    }
}