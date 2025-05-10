using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.models{

    // Entidad Estudiante
    public class Student {
        [BsonElement("StudentID")]  // Carnet
        required public int StudentID {get; set;}

        [BsonElement("IDCard")]  // Cédula
        required public int IDCard {get; set;}

        [BsonElement("FirstName")] // Nombre
        required public string FirstName {get; set;}   

        [BsonElement("FirstLastName")]    // Apellido1
        required public string FirstLastName {get; set;}  

        [BsonElement("SecondLastName")]   
        required public string SecondLastName {get; set;} // Apellido2

        [BsonElement("Email")]
        required public string Email {get; set;}    // Correo electronico

        [BsonElement("PhoneNumber")]    
        required public int PhoneNumber {get; set;}  // Telefóno

        [BsonElement("Password")]
        required public string Password {get; set;}    // Contraseña

    }
}