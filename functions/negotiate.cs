using System;
using System.Linq;
using System.Threading.Tasks;
using Azure;
using Azure.Data.Tables;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Extensions.SignalRService;
using Microsoft.Extensions.Logging;

namespace CSharp
{
    public static class Function
    {
        [FunctionName("index")]
        public static IActionResult GetHomePage([HttpTrigger(AuthorizationLevel.Anonymous)] HttpRequest req, ExecutionContext context)
        {
            return new OkResult();
        }

        [FunctionName("negotiate")]
        public static SignalRConnectionInfo Negotiate(
            [HttpTrigger(AuthorizationLevel.Anonymous)] HttpRequest req,
            [SignalRConnectionInfo(HubName = "serverless_dev")] SignalRConnectionInfo connectionInfo)
        {
            return connectionInfo;
        }

        [FunctionName("broadcast")]
        public static async Task Broadcast([TimerTrigger("* * * * * *")] TimerInfo myTimer,
        [SignalR(HubName = "serverless_dev")] IAsyncCollector<SignalRMessage> signalRMessages,
         [Table("Workouts", "Active")] TableClient tableClient, ILogger log)
        {
            var workout = tableClient.Query<ActiveWorkout>(filter: $"PartitionKey eq 'Active'", maxPerPage: 10).FirstOrDefault();

            if (workout == null) return;

            log.LogInformation($"PK={workout.PartitionKey}, RK={workout.RowKey}, ActiveTime={workout.CurrentActiveTime}");

            if (workout.CurrentActiveTime <= 0 && workout.CurrentRestTime <= 0)
            {
                workout.CurrentActiveTime = workout.ActiveTime;
                workout.CurrentRestTime = workout.RestTime;
            }

            var mode = workout.CurrentActiveTime > 0 ? "active" : "rest";
            var timeLeft = workout.CurrentActiveTime <= 0 ? workout.CurrentRestTime-- : workout.CurrentActiveTime--;

            tableClient.UpsertEntity<ActiveWorkout>(workout);

            await signalRMessages.AddAsync(
                new SignalRMessage
                {
                    Target = "newMessage",
                    Arguments = new[] { $"{timeLeft}", $"{mode}" }
                });
        }

        [FunctionName("ReadActiveWorkout")]
        public static void ReadActiveWorkout([QueueTrigger("active-workout")] string input,
        [Table("Workouts", "Active", "{queueTrigger}")] ActiveWorkout workout,
        ILogger log)
        {
            log.LogInformation($"PK={workout.PartitionKey}, RK={workout.RowKey}, ActiveTime={workout.ActiveTime}");
        }

        [FunctionName("SetActiveWorkout")]
        [return: Queue("active-workout")]
        public static string SetActiveWorkout([HttpTrigger] HttpRequest req,
         [Table("Workouts", Connection = "AzureWebJobsStorage")] TableClient workoutTable, ILogger log)
        {
            log.LogInformation($"C# http trigger function processed");
            int activeTime = int.Parse(req.Query["activeTime"]);
            int restTime = int.Parse(req.Query["restTime"]);

            string name = req.Query["name"];
            var workout = new ActiveWorkout { PartitionKey = "Active", RowKey = "HFC", ActiveTime = activeTime, RestTime = restTime };
            workoutTable.UpsertEntity<ActiveWorkout>(workout);

            return workout.RowKey;
        }


        public class ActiveWorkout : Azure.Data.Tables.ITableEntity
        {
            public string PartitionKey { get; set; }
            public string RowKey { get; set; }
            public DateTimeOffset? Timestamp { get; set; }
            public ETag ETag { get; set; }
            public int ActiveTime { get; set; }
            public int RestTime { get; set; }
            public int CurrentActiveTime { get; set; }
            public int CurrentRestTime { get; set; }
        }
    }
}