using Microsoft.AspNetCore.Mvc;

using backend.models;
using backend.services;

namespace backend.controllers
{

    [ApiController]
    [Route("api")]

    // Esqueleto para hacer los endpoints de Asignaciones del profesor
    public class AssignmentEvaluationController(CEDigitalService db_ap) : ControllerBase
    { }
}