using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

using backend.models;
using backend.models.DTO;
using backend.services;
using backend.DTO;

namespace backend.controllers
{
    [ApiController]
    [Route("api/documents")]
    public class DocumentController(CEDigitalService db_ap) : ControllerBase
    {
        private readonly CEDigitalService db = db_ap;
        // ------------------------------------------ Metodos GET ------------------------------------------

        // ------------------------------------------ Metodos POST ------------------------------------------
    }
}