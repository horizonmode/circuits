using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Azure.Data.Tables;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Documents.Client;
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
                collectionName: "screens",
                ConnectionStringSetting = "CosmosDBConnection",
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
                collectionName: "screens",
                ConnectionStringSetting = "CosmosDBConnection")] out Screen Screen)
        {

            string requestBody = String.Empty;
            using (StreamReader streamReader = new StreamReader(req.Body))
            {
                requestBody = streamReader.ReadToEnd();
            }

            Screen data = JsonConvert.DeserializeObject<Screen>(requestBody);
            Screen = data;
            Screen.Id = Guid.NewGuid().ToString();

            return new CreatedResult($"/screen/{data.Id}", data);
        }

        [FunctionName("UpdateScreen")]
        public static IActionResult UpdateScreen(
         [HttpTrigger(methods: "put", Route = "screen/{id}")] HttpRequest req,
          [CosmosDB(
                databaseName: "screens",
                collectionName: "screens",
                Id = "{id}",
                PartitionKey ="{id}",
                ConnectionStringSetting = "CosmosDBConnection")] out Screen Screen,
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
        public async static Task<IActionResult> DeleteBook(
            [HttpTrigger(methods: "delete", Route = "screen/{id}")] HttpRequest req,
            [CosmosDB(ConnectionStringSetting = "CosmosDBConnection")] DocumentClient client,
            ILogger logger, string id)
        {

            var option = new FeedOptions { EnableCrossPartitionQuery = true };
            var collectionUri = UriFactory.CreateDocumentCollectionUri("screens", "Screens");

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