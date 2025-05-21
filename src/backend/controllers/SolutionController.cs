using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

using backend.models;
using backend.services;
using backend.DTO;

namespace backend.controllers
{
    [ApiController]
    [Route("api")]
    public class SolutionController(CEDigitalService db_ap, IWebHostEnvironment env) : ControllerBase
    {
        private readonly CEDigitalService db = db_ap;
        private readonly IWebHostEnvironment _env = env;

        // ------------------------------------------ Metodos GET ------------------------------------------

        // ------------------------------------------ Metodos POST ------------------------------------------
        // [HttpPost("group/{group_id}/assignment/{assignment_id}/submitt/{submission_id}")]
        // public Task<ActionResult<Solution>> UploadSolution(int group_id, int assignment_id, int submission_id, IFormFile submission_file)
        // {
           
        // }

        // ------------------------------------------ Metodos PUT ------------------------------------------

        // ------------------------------------------ Metodos DELETE ------------------------------------------

    }
}