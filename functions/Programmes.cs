using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.SignalRService;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace HorizonMode.GymScreens
{
    public static class Programmes
    {
        public static ActiveProgramme ConvertToActiveProgramme(Programme programme, bool isPlaying)
        {
            var ap = new ActiveProgramme();
            ap.ActiveTime = programme.ActiveTime;
            ap.CurrentActiveTime = programme.ActiveTime;
            ap.CurrentRestTime = programme.RestTime;
            ap.Name = programme.Name;
            ap.Mappings = programme.Mappings;
            ap.RestTime = programme.RestTime;
            ap.id = "active";
            ap.SourceWorkoutId = programme.id;
            ap.Message = programme.Message;
            ap.IsPlaying = isPlaying;
            ap.Rounds = programme.Rounds;

            return ap;
        }

        public static void UpdateProgrammeWithExercise(Programme p, Exercise ex)
        {
            p.Mappings.ForEach(m =>
                                   {
                                       if (m.Exercise1.id == ex.id)
                                       {
                                           m.Exercise1 = ex;
                                       }
                                       if (m.Exercise2.id == ex.id)
                                       {
                                           m.Exercise2 = ex;
                                       }
                                   });

            p.LastUpdated = DateTime.Now;
        }

        [FunctionName("CosmosTrigger_Exercises")]
        public static async Task CosmosTrigger_Exercises([CosmosDBTrigger(
            databaseName: "screens",
            containerName: "exercises",
            Connection = "CosmosDBConnection",
            LeaseConnection = "CosmosDBConnection",
            CreateLeaseContainerIfNotExists = true)]IReadOnlyList<Exercise> exercises,
            [CosmosDB(Connection = "CosmosDBConnection")] CosmosClient client, ILogger log)
        {
            if (exercises != null && exercises.Count > 0)
            {
                log.LogInformation("exercises modified " + exercises.Count);
                log.LogInformation("First exercises Id " + exercises[0].id);

                var container = client.GetContainer("screens", "programmes");

                foreach (var updatedExercise in exercises)
                {
                    var programmes = container.GetItemLinqQueryable<Programme>(true).Where(p => p.id != "active" && p.Mappings.Any(m => m.Exercise1.id == updatedExercise.id
                    || m.Exercise2.id == updatedExercise.id)).AsEnumerable().ToList();

                    var activeProgramme = container.GetItemLinqQueryable<ActiveProgramme>(true).Where(p => p.id == "active" && p.Mappings.Any(m => m.Exercise1.id == updatedExercise.id
                    || m.Exercise2.id == updatedExercise.id)).AsEnumerable().FirstOrDefault();

                    foreach (var programme in programmes)
                    {
                        UpdateProgrammeWithExercise(programme, updatedExercise);
                        await container.UpsertItemAsync<Programme>(programme);
                    }

                    if (activeProgramme != null)
                    {
                        UpdateProgrammeWithExercise(activeProgramme, updatedExercise);
                        await container.UpsertItemAsync<ActiveProgramme>(activeProgramme);
                    }
                }
            }
        }

        [FunctionName("CosmosTrigger_Programmes")]
        public static async Task CosmosTrigger_Programmes([CosmosDBTrigger(
            databaseName: "screens",
            containerName: "programmes",
            Connection = "CosmosDBConnection",
            LeaseConnection = "CosmosDBConnection",
            CreateLeaseContainerIfNotExists = true)]IReadOnlyList<Programme> programmes,
            [SignalR(HubName = "serverless")] IAsyncCollector<SignalRMessage> signalRMessages,
            [CosmosDB(Connection = "CosmosDBConnection")] CosmosClient client, ILogger log)
        {
            if (programmes != null && programmes.Count > 0)
            {
                if (!programmes.Any(p => p.id != "active")) return;
                log.LogInformation("programmes modified " + programmes.Count);
                log.LogInformation("First programme Id " + programmes[0].id);

                var container = client.GetContainer("screens", "programmes");

                var activeProgramme = container.GetItemLinqQueryable<ActiveProgramme>(
                        true
                     )
                     .Where(a => a.id == "active").AsEnumerable().FirstOrDefault();

                if (activeProgramme == null) return;

                foreach (var updatedProgramme in programmes.Where(p => p.id != "active"))
                {
                    if (activeProgramme.SourceWorkoutId == updatedProgramme.id && activeProgramme.LastUpdated < updatedProgramme.LastUpdated)
                    {
                        activeProgramme = ConvertToActiveProgramme(updatedProgramme, activeProgramme.IsPlaying);
                        await container.UpsertItemAsync<ActiveProgramme>(activeProgramme);

                        await signalRMessages.AddAsync(
                            new SignalRMessage
                            {
                                Target = "newProgramme",
                                Arguments = new[] { $"{activeProgramme.SourceWorkoutId}", activeProgramme.LastUpdated.ToString("s"), $"{activeProgramme.IsPlaying}" }
                            });
                    }
                }
            }
        }

        [FunctionName("SetActiveProgramme")]
        public static IActionResult SetActiveWorkout(
            [HttpTrigger(methods: "get", Route = "programme/setActive/{id}")] HttpRequest req,
            [SignalR(HubName = "serverless_dev")] IAsyncCollector<SignalRMessage> signalRMessages,
         [CosmosDB(
                databaseName: "screens",
                containerName: "programmes",
                Id = "{id}",
                PartitionKey ="{id}",
                Connection = "CosmosDBConnection")] Programme programme,
          [CosmosDB(
                databaseName: "screens",
                containerName: "programmes",
                Connection = "CosmosDBConnection")] out ActiveProgramme activeProgramme, ILogger log)
        {
            log.LogInformation($"SetActiveWorkout function processed");

            bool isPlaying = string.IsNullOrEmpty(req.Query["isPlaying"]) ? true : bool.Parse(req.Query["isPlaying"]);

            activeProgramme = ConvertToActiveProgramme(programme, isPlaying);

            return new OkObjectResult(activeProgramme);
        }


        [FunctionName("GetProgrammeById")]
        public static IActionResult GetProgrammeById([HttpTrigger(methods: "get", Route = "programme/{id}")] HttpRequest req,
         [CosmosDB(
                databaseName: "screens",
                containerName: "programmes",
                Connection = "CosmosDBConnection",
                Id = "{id}",
                PartitionKey = "{id}")] Programme programme, ILogger log)
        {
            log.LogInformation($"GetProgrammeById function processed");

            if (programme == null) return new NotFoundResult();
            return new OkObjectResult(programme);
        }

        [FunctionName("GetActiveProgramme")]
        public static IActionResult GetActiveProgramme([HttpTrigger(methods: "get", Route = "programme/getActive")] HttpRequest req,
        [CosmosDB(
                databaseName: "screens",
                containerName: "programmes",
                Connection = "CosmosDBConnection",
                Id = "active",
                PartitionKey = "active")] ActiveProgramme programme, ILogger log)
        {
            log.LogInformation($"GetActiveProgramme function processed");
            if (programme == null) return new NotFoundResult();
            return new OkObjectResult(programme);
        }

        [FunctionName("GetProgrammes")]
        public static IActionResult GetProgrammes([HttpTrigger(methods: "get", Route = "programme")] HttpRequest req,
        [CosmosDB(
                databaseName: "screens",
                containerName: "programmes",
                Connection = "CosmosDBConnection",
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
                containerName: "programmes",
                Connection = "CosmosDBConnection")] out Programme programme,
                [CosmosDB(Connection = "CosmosDBConnection")] CosmosClient client)
        {

            string requestBody = String.Empty;
            using (StreamReader streamReader = new StreamReader(req.Body))
            {
                requestBody = streamReader.ReadToEnd();
            }

            Programme data = JsonConvert.DeserializeObject<Programme>(requestBody);
            programme = data;
            programme.id = Guid.NewGuid().ToString();

            var screenContainer = client.GetContainer("screens", "screens");
            var exerciseContainer = client.GetContainer("screens", "exercises");

            foreach (var screenMap in programme.Mappings)
            {
                if (screenMap.Screen == null || screenMap.Screen.Tag == null) return new BadRequestResult();

                var screen = screenContainer.GetItemLinqQueryable<Screen>(true).Where(t => t.Tag == screenMap.Screen.Tag).AsEnumerable().FirstOrDefault();

                if (screen == null)
                {
                    return new BadRequestResult();
                }

                if (screenMap.Exercise1 != null)
                {
                    var exercise1 = exerciseContainer.GetItemLinqQueryable<Exercise>(true).Where(t => t.id == screenMap.Exercise1.id).AsEnumerable().FirstOrDefault();

                    if (exercise1 == null)
                    {
                        return new BadRequestResult();
                    }

                    screenMap.Exercise1.Name = exercise1.Name;
                    screenMap.Exercise1.VideoUrl = exercise1.VideoUrl;
                }

                if (!screenMap.SplitScreen) continue;

                if (screenMap.Exercise2 != null)
                {
                    var exercise2 = exerciseContainer.GetItemLinqQueryable<Exercise>(true).Where(t => t.id == screenMap.Exercise2.id).AsEnumerable().FirstOrDefault();

                    if (exercise2 == null)
                    {
                        return new BadRequestResult();
                    }

                    screenMap.Exercise2.Name = exercise2.Name;
                    screenMap.Exercise2.VideoUrl = exercise2.VideoUrl;
                }
            }

            // Handle screen maps
            return new CreatedResult($"/programme/{data.id}", data);
        }

        [FunctionName("UpdateProgramme")]
        public static IActionResult UpdateProgramme(
         [HttpTrigger(methods: "put", Route = "programme/{id}")] HttpRequest req,
          [CosmosDB(
                databaseName: "screens",
                containerName: "programmes",
                Id = "{id}",
                PartitionKey ="{id}",
                Connection = "CosmosDBConnection")] out Programme programme,
                [CosmosDB(Connection = "CosmosDBConnection")] CosmosClient client,
                ILogger logger)
        {
            // getting book to add from request body
            var requestBody = string.Empty;
            using (StreamReader streamReader = new StreamReader(req.Body))
            {
                requestBody = streamReader.ReadToEnd();
            }

            Programme data = JsonConvert.DeserializeObject<Programme>(requestBody);
            programme = data;
            programme.LastUpdated = DateTime.Now;

            var screenContainer = client.GetContainer("screens", "screens");
            var exerciseContainer = client.GetContainer("screens", "exercises");

            foreach (var screenMap in programme.Mappings)
            {
                if (screenMap.Screen == null || screenMap.Screen.Tag == null) return new BadRequestResult();

                var screen = screenContainer.GetItemLinqQueryable<Screen>(true).Where(t => t.Tag == screenMap.Screen.Tag).AsEnumerable().FirstOrDefault();

                if (screen == null)
                {
                    return new BadRequestResult();
                }

                screenMap.Screen.id = screen.id;

                if (screenMap.Exercise1 != null)
                {
                    var exercise1 = exerciseContainer.GetItemLinqQueryable<Exercise>(true).Where(t => t.id == screenMap.Exercise1.id).AsEnumerable().FirstOrDefault();

                    if (exercise1 == null)
                    {
                        return new BadRequestResult();
                    }

                    screenMap.Exercise1.Name = exercise1.Name;
                    screenMap.Exercise1.VideoUrl = exercise1.VideoUrl;
                }

                if (!screenMap.SplitScreen) continue;

                if (screenMap.Exercise2 != null)
                {
                    var exercise2 = exerciseContainer.GetItemLinqQueryable<Exercise>(true).Where(t => t.id == screenMap.Exercise2.id).AsEnumerable().FirstOrDefault();

                    if (exercise2 == null)
                    {
                        return new BadRequestResult();
                    }

                    screenMap.Exercise2.Name = exercise2.Name;
                    screenMap.Exercise2.VideoUrl = exercise2.VideoUrl;
                }

            }

            return new OkObjectResult(programme);
        }

        [FunctionName("DeleteProgramme")]
        public async static Task<IActionResult> DeleteProgramme(
             [HttpTrigger(methods: "delete", Route = "programme/{id}")] HttpRequest req,
             [CosmosDB(Connection = "CosmosDBConnection")] CosmosClient client,
             ILogger logger, string id)
        {

            var container = client.GetContainer("screens", "programmes");

            await container.DeleteItemAsync<Programme>(id, new PartitionKey(id));

            return new OkResult();
        }

        [FunctionName("DuplicateProgramme")]
        public static IActionResult DuplicateProgramme(
            [HttpTrigger(methods: "get", Route = "programme/duplicate/{id}")] HttpRequest req,
              [CosmosDB(
                databaseName: "screens",
                containerName: "programmes",
                Id = "{id}",
                PartitionKey ="{id}",
                Connection = "CosmosDBConnection")] Programme programme,
         [CosmosDB(
                databaseName: "screens",
                containerName: "programmes",
                Connection = "CosmosDBConnection")] out Programme duplicatedProgramme, ILogger log)
        {

            duplicatedProgramme = programme.Clone();

            return new OkObjectResult(duplicatedProgramme);
        }
    }
}