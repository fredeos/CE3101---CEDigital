using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

using backend.models;
using backend.services;
using backend.DTO;

namespace backend.controllers
{
    [ApiController]
    [Route("api")]
    public class FeedbackController(CEDigitalService db_ap, IWebHostEnvironment env) : ControllerBase
    {
        private readonly CEDigitalService db = db_ap;
        private readonly IWebHostEnvironment _env = env;

        // ------------------------------------------ Metodos GET ------------------------------------------

        // ------------------------------------------ Metodos POST ------------------------------------------

        // ------------------------------------------ Metodos PUT ------------------------------------------

        // ------------------------------------------ Metodos DELETE ------------------------------------------

    }
}