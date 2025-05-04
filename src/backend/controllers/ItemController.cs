using Microsoft.AspNetCore.Mvc;

using backend.models;
using backend.services;

namespace backend.controllers {

    [ApiController]
    [Route("items")]
    public class ItemController(ShopDBService db_ap) : ControllerBase {
        private readonly ShopDBService db = db_ap;
        
        [HttpGet("find/{id}")]
        public ActionResult<Item> GetItem(int id){
            var results = db.sql_db.SELECT<Item>("Store.Items as I",
            $"I.ID as {nameof(Item.id)}, I.item_name as {nameof(Item.name)}, I.price as {nameof(Item.price)}, I.on_stock as {nameof(Item.stock)}", 
            $"I.ID = {id}"
            );
            return Ok(results.FirstOrDefault());
        }

        [HttpPost("new")]
        public ActionResult<Item> AddItem([FromBody] Item item){
            var results = db.sql_db.INSERT<Item>("Store.Items", "item_name, price, on_stock", 
            [item], 
            $"(@{nameof(Item.name)}, @{nameof(Item.price)}, @{nameof(Item.stock)})");
            if (results <= 0){
                return BadRequest();
            }
            return Ok(item);
        }

        [HttpPut("modify/{id}")]
        public ActionResult ModifyItem(int id, [FromBody] Item item){
            String modifed_attributes = $"item_name = {item.name}, price = {item.price}, on_stock = {item.stock}";
            // Realizar la consulta a la base
            var results = db.sql_db.UPDATE("Store.Items",modifed_attributes, $"ID = {id}");
            return Ok(results);
        }

        [HttpDelete("remove/{id}")]
        public ActionResult RemoveItem(int id){
            var results = db.sql_db.DELETE("Store.Items", $"ID = {id}");
            return Ok(results);
        }
    }
}