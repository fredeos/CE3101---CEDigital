using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;


namespace backend.models {
    public class Employee {
        [BsonElement("ssn")]
        public int Ssn {get; set;}

        [BsonElement("first_name")]
        required public string FirstName {get; set;}

        [BsonElement("last_name")]
        required public string LastName {get; set;}

        [BsonElement("role_id")]
        public int role {get; set;}
    }
}