using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Azure.Data.Tables;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace HorizonMode.GymScreens
{
    public static class Screens
    {
        [FunctionName("GetScreens")]
        public static IActionResult GetScreens([HttpTrigger(methods: "get", Route = "screen")] HttpRequest req,
        [CosmosDB(
                databaseName: "screens",
                containerName: "screens",
                Connection = "CosmosDBConnection",
                SqlQuery = "SELECT * FROM c order by c._ts desc")]
                IEnumerable<Screen> Screens, ILogger log)
        {
            log.LogInformation($"GetScreens function processed");

            return new OkObjectResult(Screens);
        }

        [FunctionName("CreateScreen")]
        public static IActionResult CreateScreen([HttpTrigger(methods: "post", Route = "screen")] HttpRequest req,
         [CosmosDB(
                databaseName: "screens",
                containerName: "screens",
                Connection = "CosmosDBConnection")] out Screen Screen)
        {

            string requestBody = String.Empty;
            using (StreamReader streamReader = new StreamReader(req.Body))
            {
                requestBody = streamReader.ReadToEnd();
            }

            Screen data = JsonConvert.DeserializeObject<Screen>(requestBody);
            Screen = data;
            Screen.id = Guid.NewGuid().ToString();

            return new CreatedResult($"/screen/{data.id}", data);
        }

        [FunctionName("UpdateScreen")]
        public static IActionResult UpdateScreen(
         [HttpTrigger(methods: "put", Route = "screen/{id}")] HttpRequest req,
          [CosmosDB(
                databaseName: "screens",
                containerName: "screens",
                Id = "{id}",
                PartitionKey ="{id}",
                Connection = "CosmosDBConnection")] out Screen Screen,
                ILogger logger, string id)
        {
            var requestBody = string.Empty;
            using (StreamReader streamReader = new StreamReader(req.Body))
            {
                requestBody = streamReader.ReadToEnd();
            }

            Screen = JsonConvert.DeserializeObject<Screen>(requestBody);
            return new OkObjectResult(Screen);
        }

        [FunctionName("DeleteScreen")]
        public async static Task<IActionResult> DeleteScreen(
            [HttpTrigger(methods: "delete", Route = "screen/{id}")] HttpRequest req,
            [CosmosDB(Connection = "CosmosDBConnection")] CosmosClient client,
            ILogger logger, string id)
        {

            var container = client.GetContainer("screens", "screens");

            await container.DeleteItemAsync<Screen>(id, new PartitionKey(id));

            return new OkResult();
        }
    }
}