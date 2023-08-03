using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
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
                containerName: "exercises",
                Connection = "CosmosDBConnection",
                Id = "{id}",
                PartitionKey = "{id}")] Exercise exercise, ILogger log)
        {
            log.LogInformation($"GetExerciseById function processed");

            return new OkObjectResult(exercise);
        }

        [FunctionName("ProcessExercises")]
        public static async Task<IActionResult> ProcessExercises([HttpTrigger(methods: "get", Route = "exercise/process/{name}")] HttpRequest req, string name,
        [CosmosDB(Connection = "CosmosDBConnection")] CosmosClient client,
        [Blob("videos", Connection = "VideosStorageConnection")] BlobContainerClient blobClient, ILogger log)
        {

            log.LogInformation($"Process Exercises called for Container: {blobClient.Name}");

            // get all records in the specific container
            var blobs = blobClient.GetBlobs(prefix: name);

            var exerciseContainer = client.GetContainer("screens", "exercises");
            // create records in cosmos with the correct category
            foreach (var blob in blobs)
            {
                var safeName = blob.Name;

                int index = safeName.IndexOf('_');
                safeName = (index < 0)
                    ? safeName
                    : safeName.Remove(index, 1);

                index = safeName.IndexOf('1');
                safeName = (index < 0)
                    ? safeName
                    : safeName.Remove(index, 1);

                index = safeName.IndexOf('-');
                safeName = (index < 0)
                    ? safeName
                    : safeName.Remove(index, 1);

                safeName = safeName.Remove(0, name.Length + 1);

                var fileNameWithNoExtension = Path.GetFileNameWithoutExtension(safeName);

                var item = exerciseContainer.GetItemLinqQueryable<Exercise>(true).AsEnumerable().FirstOrDefault(ex => ex.VideoFileName == blob.Name);
                if (item == null)
                {
                    item = new Exercise
                    {
                        id = Guid.NewGuid().ToString(),

                    };
                }

                item.Name = fileNameWithNoExtension;
                item.Title = fileNameWithNoExtension;
                item.VideoFileName = blob.Name;
                item.VideoUrl = $"https://signalromm-videos.azureedge.net/videos/{blob.Name}";
                item.Category = name;

                await exerciseContainer.UpsertItemAsync<Exercise>(item);
            }

            return new OkResult();
        }

        [FunctionName("GetExercises")]
        public static IActionResult GetExercises([HttpTrigger(methods: "get", Route = "exercise")] HttpRequest req,
        [CosmosDB(
                databaseName: "screens",
                containerName: "exercises",
                Connection = "CosmosDBConnection",
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
                containerName: "exercises",
                Connection = "CosmosDBConnection")] out Exercise exercise)
        {

            string requestBody = String.Empty;
            using (StreamReader streamReader = new StreamReader(req.Body))
            {
                requestBody = streamReader.ReadToEnd();
            }

            Exercise data = JsonConvert.DeserializeObject<Exercise>(requestBody);
            exercise = data;
            exercise.id = Guid.NewGuid().ToString();

            // Handle screen maps
            return new CreatedResult($"/exercise/{data.id}", data);
        }

        [FunctionName("UpdateExercise")]
        public static IActionResult UpdateExercise(
         [HttpTrigger(methods: "put", Route = "exercise/{id}")] HttpRequest req,
          [CosmosDB(
                databaseName: "screens",
                containerName: "exercises",
                Id = "{id}",
                PartitionKey ="{id}",
                Connection = "CosmosDBConnection")] out Exercise exercise,
                ILogger logger, string id)
        {
            var requestBody = string.Empty;
            using (StreamReader streamReader = new StreamReader(req.Body))
            {
                requestBody = streamReader.ReadToEnd();
            }

            exercise = JsonConvert.DeserializeObject<Exercise>(requestBody);

            return new CreatedResult($"/exercise/{id}", exercise);
        }

        [FunctionName("DeleteExercise")]
        public async static Task<IActionResult> DeleteExercise(
            [HttpTrigger(methods: "delete", Route = "exercise/{id}")] HttpRequest req,
            [CosmosDB(Connection = "CosmosDBConnection")] CosmosClient client,
            ILogger logger, string id)
        {

            var container = client.GetContainer("screens", "exercises");

            await container.DeleteItemAsync<Exercise>(id, new PartitionKey(id));

            return new OkResult();
        }
    }
}