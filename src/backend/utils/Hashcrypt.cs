using System.Text;
using System.Security.Cryptography;
using System.IO;
using MongoDB.Bson;


namespace backend.services.encryption {
    public class Hashcrypt {
        private static byte[] key = Encoding.UTF8.GetBytes("1234567890123456"); // 16 bytes = 128 bit
        private static byte[] iv  = Encoding.UTF8.GetBytes("abcdefghijklmnop"); // 16 bytes = AES block size

        public Hashcrypt(){}

        public String EncryptString(String non_encrypted){
            using Aes aes = Aes.Create();
            aes.Key = key;
            aes.IV = iv;

            ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
            MemoryStream ms = new();
            CryptoStream cs = new(ms, encryptor, CryptoStreamMode.Write);
            StreamWriter sw = new(cs);
            sw.Write(non_encrypted);
            sw.Close();
            return Convert.ToBase64String(ms.ToArray());
        }

        public String DecryptString(String encrypted){
            byte[] buffer = Convert.FromBase64String(encrypted);

            using Aes aes = Aes.Create();
            aes.Key = key;
            aes.IV = iv;

            ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
            using MemoryStream ms = new(buffer);
            using CryptoStream cs = new(ms, decryptor, CryptoStreamMode.Read);
            using StreamReader sr = new(cs);
            return sr.ReadToEnd();
        }
    }
}