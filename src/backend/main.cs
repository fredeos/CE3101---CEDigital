using backend.services.encryption;

class main{
    static void Main(string[] args){
        string pass = "1234";

        Hashcrypt encryptor = new();

        Console.WriteLine("Encrypting...");
        string encrypted_pass = encryptor.EncryptString(pass);
        string decrypted_pass = encryptor.DecryptString(encrypted_pass);
        Console.WriteLine($"[Encrypted] is \'{encrypted_pass}\' \n [Decrypted] is \'{decrypted_pass}\'");
    }
}