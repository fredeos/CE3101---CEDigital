using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.models{

    // Entidad Estudiante
    public class Student {
        [BsonId]
        private ObjectId object_id {get; set;}
        
        [BsonElement("id")]  // Carnet (PK)
        required public int StudentID {get; set;}

        [BsonElement("ssn")]  // Cédula
        required public int IDCard {get; set;}

        [BsonElement("Fname")] // Nombre
        required public string FirstName {get; set;}   

        [BsonElement("Lname1")]    // Apellido1
        required public string FirstLastName {get; set;}  

        [BsonElement("Lname2")]   
        required public string SecondLastName {get; set;} // Apellido2

        [BsonElement("email")]
        required public string Email {get; set;}    // Correo electronico

        [BsonElement("phone_num")]    
        required public string PhoneNumber {get; set;}  // Telefóno

        [BsonElement("password")]
        required public string Password {get; set;}    // Contraseña

    }
}