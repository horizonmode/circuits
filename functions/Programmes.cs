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
    public static class Function
    {
        [FunctionName("SetActiveProgramme")]
        public static IActionResult SetActiveWorkout([HttpTrigger(methods: "get", Route = "programme/setActive/{id}")] HttpRequest req,
         [CosmosDB(
                databaseName: "screens",
                collectionName: "programmes",
                Id = "{id}",
                PartitionKey ="{id}",
                ConnectionStringSetting = "CosmosDBConnection")] Programme programme,
          [CosmosDB(
                databaseName: "screens",
                collectionName: "programmes",
                ConnectionStringSetting = "CosmosDBConnection")] out ActiveProgramme activeProgramme, ILogger log)
        {
            log.LogInformation($"SetActiveWorkout function processed");

            var ap = new ActiveProgramme();
            ap.ActiveTime = programme.ActiveTime;
            ap.CurrentActiveTime = programme.ActiveTime;
            ap.CurrentRestTime = programme.RestTime;
            ap.Name = programme.Name;
            ap.Mappings = programme.Mappings;
            ap.RestTime = programme.RestTime;
            ap.Id = "active";

            activeProgramme = ap;

            return new OkObjectResult(activeProgramme);
        }

        [FunctionName("GetProgrammeById")]
        public static IActionResult GetProgrammeById([HttpTrigger(methods: "get", Route = "programme/{id}")] HttpRequest req,
         [CosmosDB(
                databaseName: "screens",
                collectionName: "programmes",
                ConnectionStringSetting = "CosmosDBConnection",
                Id = "{id}",
                PartitionKey = "{id}")] Programme programme, ILogger log)
        {
            log.LogInformation($"GetProgrammeById function processed");

            return new OkObjectResult(programme);
        }

        [FunctionName("GetProgrammes")]
        public static IActionResult GetProgrammes([HttpTrigger(methods: "get", Route = "programme")] HttpRequest req,
        [CosmosDB(
                databaseName: "screens",
                collectionName: "programmes",
                ConnectionStringSetting = "CosmosDBConnection",
                SqlQuery = "SELECT * FROM c order by c._ts desc")]
                IEnumerable<Programme> programmes, ILogger log)
        {
            log.LogInformation($"SetActiveWorkout function processed");

            return new OkObjectResult(programmes);
        }

        [FunctionName("CreateProgramme")]
        public static IActionResult CreateProgramme([HttpTrigger(methods: "post", Route = "programme")] HttpRequest req,
         [CosmosDB(
                databaseName: "screens",
                collectionName: "programmes",
                ConnectionStringSetting = "CosmosDBConnection")] out Programme programme,
                [CosmosDB(ConnectionStringSetting = "CosmosDBConnection")] DocumentClient client)
        {

            string requestBody = String.Empty;
            using (StreamReader streamReader = new StreamReader(req.Body))
            {
                requestBody = streamReader.ReadToEnd();
            }

            Programme data = JsonConvert.DeserializeObject<Programme>(requestBody);
            programme = data;
            programme.Id = Guid.NewGuid().ToString();

            var option = new FeedOptions { EnableCrossPartitionQuery = true };
            var collectionUri = UriFactory.CreateDocumentCollectionUri("screens", "exercises");

            foreach (var screenMap in programme.Mappings)
            {
                if (screenMap.Screen == null || screenMap.Screen.Tag == null) return new BadRequestResult();

                var exercise1 = client.CreateDocumentQuery<Exercise>(collectionUri, option).Where(t => t.Id == screenMap.Exercise1.Id)
                      .AsEnumerable().FirstOrDefault();

                if (exercise1 == null)
                {
                    return new BadRequestResult();
                }

                screenMap.Exercise1.Name = exercise1.Name;
                screenMap.Exercise1.VideoUrl = exercise1.VideoUrl;

                if (!screenMap.SplitScreen) continue;

                var exercise2 = client.CreateDocumentQuery<Exercise>(collectionUri, option).Where(t => t.Id == screenMap.Exercise2.Id)
                                      .AsEnumerable().FirstOrDefault();

                if (exercise2 == null)
                {
                    return new BadRequestResult();
                }

                screenMap.Exercise2.Name = exercise2.Name;
                screenMap.Exercise2.VideoUrl = exercise2.VideoUrl;
            }

            // Handle screen maps
            return new CreatedResult($"/programme/{data.Id}", data);
        }

        [FunctionName("UpdateProgramme")]
        public static IActionResult UpdateProgramme(
         [HttpTrigger(methods: "put", Route = "programme/{id}")] HttpRequest req,
          [CosmosDB(
                databaseName: "screens",
                collectionName: "programmes",
                Id = "{id}",
                PartitionKey ="{id}",
                ConnectionStringSetting = "CosmosDBConnection")] out Programme programme,
                ILogger logger, string id)
        {
            // getting book to add from request body
            var requestBody = string.Empty;
            using (StreamReader streamReader = new StreamReader(req.Body))
            {
                requestBody = streamReader.ReadToEnd();
            }

            programme = JsonConvert.DeserializeObject<Programme>(requestBody);
            return new OkObjectResult(programme);
        }

        [FunctionName("DeleteProgramme")]
        public async static Task<IActionResult> DeleteProgramme(
             [HttpTrigger(methods: "delete", Route = "programme/{id}")] HttpRequest req,
             [CosmosDB(ConnectionStringSetting = "CosmosDBConnection")] DocumentClient client,
             ILogger logger, string id)
        {

            var option = new FeedOptions { EnableCrossPartitionQuery = true };
            var collectionUri = UriFactory.CreateDocumentCollectionUri("screens", "programmes");

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