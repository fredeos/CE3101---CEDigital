

namespace backend.models {
    public class Item {
        public int id {get; set;}
        required public string name {get; set;}
        public int price {get; set;}
        public int stock {get; set;}
    }
}