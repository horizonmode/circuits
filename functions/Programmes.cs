using System;
using System.IO;
using System.Linq;
using Azure.Data.Tables;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace HorizonMode.GymScreens
{
    public static class Function
    {
        [FunctionName("ReadActiveProgramme")]
        public static void ReadActiveProgramme([QueueTrigger("active-programmes")] string input,
        [Table("Workouts", "programme", "{queueTrigger}")] TableEntity programme,
        ILogger log)
        {
            log.LogInformation($"PK={programme.PartitionKey}, RK={programme.RowKey}, ActiveTime={programme["ActiveTime"]}");
        }

        [FunctionName("SetActiveProgramme")]
        [return: Queue("active-programmes")]
        public static string SetActiveWorkout([HttpTrigger(methods: "post", Route = "programme/setActive")] HttpRequest req,
         [Table("Workouts", Connection = "AzureWebJobsStorage")] TableClient workoutTable, ILogger log)
        {
            log.LogInformation($"SetActiveWorkout function processed");

            string requestBody = String.Empty;
            using (StreamReader streamReader = new StreamReader(req.Body))
            {
                requestBody = streamReader.ReadToEnd();
            }

            ActiveProgramme data = JsonConvert.DeserializeObject<ActiveProgramme>(requestBody);

            var workout = Utils<ActiveProgramme>.GetTableEntity(data, TableKeys.ProgrammeKey, "active");
            workoutTable.UpsertEntity<TableEntity>(workout);
            return workout.RowKey;
        }

        [FunctionName("GetProgrammeById")]
        public static IActionResult GetProgrammeById([HttpTrigger(methods: "get", Route = "programme/{id}")] HttpRequest req,
        [Table("Workouts", "programme", Connection = "AzureWebJobsStorage")] TableClient tableClient, ILogger log, string id)
        {
            log.LogInformation($"SetActiveWorkout function processed");

            var tableData = tableClient.Query<TableEntity>(filter: $"RowKey eq '{id}'", maxPerPage: 10).FirstOrDefault();
            if (tableData == null) return new NotFoundResult();

            var workout = Utils<ActiveProgramme>.GetDto(tableData);
            return new OkObjectResult(workout);
        }

        [FunctionName("GetProgrammes")]
        public static IActionResult GetProgrammes([HttpTrigger(methods: "get", Route = "programme")] HttpRequest req,
        [Table("Workouts", "programme", Connection = "AzureWebJobsStorage")] TableClient tableClient, ILogger log)
        {
            log.LogInformation($"SetActiveWorkout function processed");

            var tables = tableClient.Query<TableEntity>().ToList();
            if (tables == null) return new NotFoundResult();

            var workouts = tables.Select(t => Utils<Programme>.GetDto(t));
            return new OkObjectResult(workouts);
        }

        [FunctionName("CreateProgramme")]
        public static IActionResult CreateProgramme([HttpTrigger(methods: "post", Route = "programme")] HttpRequest req,
        [Table("Workouts", Connection = "AzureWebJobsStorage")] TableClient workoutTable, ILogger log)
        {
            log.LogInformation($"SetActiveWorkout function processed");

            string requestBody = String.Empty;
            using (StreamReader streamReader = new StreamReader(req.Body))
            {
                requestBody = streamReader.ReadToEnd();
            }

            Programme data = JsonConvert.DeserializeObject<Programme>(requestBody);
            if (string.IsNullOrEmpty(data.Id)) data.Id = Guid.NewGuid().ToString();

            // Handle screen maps

            var workout = Utils<Programme>.GetTableEntity(data, TableKeys.ProgrammeKey, data.Id);
            workoutTable.UpsertEntity<TableEntity>(workout);
            return new CreatedResult($"/programme/{data.Id}", data);
        }
    }
}