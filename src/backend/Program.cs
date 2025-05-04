using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using backend.services;
using backend.services.connections;
using backend.models;

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

var dbservice = app.Services.GetRequiredService<ShopDBService>();
dbservice.sql_db = new SQLContext("sql.log");
dbservice.sql_db.Configure("LAPTOP-FREDE","EShop");

dbservice.mongo_db = new MongoContext("mongo.log"); 
dbservice.mongo_db.Configure("localhost",27017,"People");

Console.WriteLine($"Attribute name: {nameof(Item.id)}");

app.Run();
