using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using backend.services;
using backend.services.connections;
using backend.models;
using backend.services.encryption;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<ShopDBService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()){
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();


string pass = "1234";
Hashcrypt encryptor = new();

Console.WriteLine("Encrypting...");
string encrypted_pass = encryptor.EncryptString(pass);
string decrypted_pass = encryptor.DecryptString(encrypted_pass);
Console.WriteLine($"[Encrypted] is \'{encrypted_pass}\' \n [Decrypted] is \'{decrypted_pass}\'");

var dbservice = app.Services.GetRequiredService<ShopDBService>();
dbservice.sql_db = new SQLContext();
dbservice.sql_db.Configure("LAPTOP-FREDE","EShop");

dbservice.mongo_db = new MongoContext();
dbservice.mongo_db.Configure("localhost",27017,"People");

app.Run();
