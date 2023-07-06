using System;
using System.IO;
using Azure.Data.Tables;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace HorizonMode.GymScreens
{
    public static class Exercises
    {
        public static string CreateExercise([HttpTrigger(methods: "post")] HttpRequest req,
        [Table("Workouts", Connection = "AzureWebJobsStorage")] TableClient workoutTable, ILogger log)
        {
            log.LogInformation($"SetActiveWorkout function processed");

            string requestBody = String.Empty;
            using (StreamReader streamReader = new StreamReader(req.Body))
            {
                requestBody = streamReader.ReadToEnd();
            }

            Exercise data = JsonConvert.DeserializeObject<Exercise>(requestBody);
            data.Id = Guid.NewGuid().ToString();

            TableEntity tableData = Utils<Exercise>.GetTableEntity(data, "exercise", data.Id);
            workoutTable.UpsertEntity<TableEntity>(tableData);
            return tableData.RowKey;
        }
    }
}