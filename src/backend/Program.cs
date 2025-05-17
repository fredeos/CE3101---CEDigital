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
builder.Services.AddSingleton<CEDigitalService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()){
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();

var dbservice = app.Services.GetRequiredService<CEDigitalService>();
dbservice.sql_db = new SQLContext();
dbservice.sql_db.Configure("LAPTOP-FREDE","CEDigital");

dbservice.mongo_db = new MongoContext();
dbservice.mongo_db.Configure("localhost",27017,"CEDigital");

app.Run(); 
