using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Documents.Client;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace HorizonMode.GymScreens
{
    public static class Exercises
    {
        [FunctionName("GetExerciseById")]
        public static IActionResult GetExerciseById([HttpTrigger(methods: "get", Route = "exercise/{id}")] HttpRequest req,
        [CosmosDB(
                databaseName: "screens",
                collectionName: "exercises",
                ConnectionStringSetting = "CosmosDBConnection",
                Id = "{id}",
                PartitionKey = "{id}")] Exercise exercise, ILogger log)
        {
            log.LogInformation($"GetExerciseById function processed");

            return new OkObjectResult(exercise);
        }

        [FunctionName("GetExercises")]
        public static IActionResult GetExercises([HttpTrigger(methods: "get", Route = "exercise")] HttpRequest req,
        [CosmosDB(
                databaseName: "screens",
                collectionName: "exercises",
                ConnectionStringSetting = "CosmosDBConnection",
                SqlQuery = "SELECT * FROM c order by c._ts desc")]
                IEnumerable<Exercise> exercises, ILogger log)
        {
            log.LogInformation($"GetExercises function processed");

            return new OkObjectResult(exercises);
        }

        [FunctionName("CreateExercise")]
        public static IActionResult CreateExercise([HttpTrigger(methods: "post", Route = "exercise")] HttpRequest req,
         [CosmosDB(
                databaseName: "screens",
                collectionName: "exercises",
                ConnectionStringSetting = "CosmosDBConnection")] out Exercise exercise)
        {

            string requestBody = String.Empty;
            using (StreamReader streamReader = new StreamReader(req.Body))
            {
                requestBody = streamReader.ReadToEnd();
            }

            Exercise data = JsonConvert.DeserializeObject<Exercise>(requestBody);
            exercise = data;
            exercise.Id = Guid.NewGuid().ToString();

            // Handle screen maps
            return new CreatedResult($"/excercise/{data.Id}", data);
        }

        [FunctionName("UpdateExercise")]
        public static IActionResult UpdateExercise(
         [HttpTrigger(methods: "put", Route = "exercise/{id}")] HttpRequest req,
          [CosmosDB(
                databaseName: "screens",
                collectionName: "exercises",
                Id = "{id}",
                PartitionKey ="{id}",
                ConnectionStringSetting = "CosmosDBConnection")] out Exercise exercise,
                ILogger logger, string id)
        {
            var requestBody = string.Empty;
            using (StreamReader streamReader = new StreamReader(req.Body))
            {
                requestBody = streamReader.ReadToEnd();
            }

            exercise = JsonConvert.DeserializeObject<Exercise>(requestBody);
            return new OkObjectResult(exercise);
        }

        [FunctionName("DeleteExercise")]
        public async static Task<IActionResult> DeleteBook(
            [HttpTrigger(methods: "delete", Route = "exercise/{id}")] HttpRequest req,
            [CosmosDB(ConnectionStringSetting = "CosmosDBConnection")] DocumentClient client,
            ILogger logger, string id)
        {

            var option = new FeedOptions { EnableCrossPartitionQuery = true };
            var collectionUri = UriFactory.CreateDocumentCollectionUri("screens", "exercises");

            var document = client.CreateDocumentQuery(collectionUri, option).Where(t => t.Id == id)
                  .AsEnumerable().FirstOrDefault();

            await client.DeleteDocumentAsync(document.SelfLink, new RequestOptions
            {
                PartitionKey = new Microsoft.Azure.Documents.PartitionKey(id)
            });

            return new OkResult();
        }
    }
}