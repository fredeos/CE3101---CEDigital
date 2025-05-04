using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;


namespace backend.models {
    public class Client {
        [BsonId]
        private ObjectId object_id {get; set;}

        [BsonElement("ssn")]
        public int Ssn {get; set;}

        [BsonElement("first_name")]
        required public string FirstName {get; set;}

        [BsonElement("last_name")]
        required public string LastName {get; set;}
    }
}