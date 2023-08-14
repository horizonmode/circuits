using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Extensions.SignalRService;
using Microsoft.Extensions.Logging;

namespace HorizonMode.GymScreens
{
    public static class signalR
    {
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
        [CosmosDB(
                    databaseName: "screens",
                    containerName: "programmes",
                    Id = "active",
                    PartitionKey ="active",
                    Connection = "CosmosDBConnection")] ActiveProgramme workout,
                [CosmosDB(
                    databaseName: "screens",
                    containerName: "programmes",
                    Connection = "CosmosDBConnection")]
                    IAsyncCollector<ActiveProgramme> programmesOut,
                ILogger log)
        {

            if (workout.CurrentActiveTime <= 0 && workout.CurrentRestTime <= 0)
            {
                workout.CurrentActiveTime = workout.ActiveTime;
                workout.CurrentRestTime = workout.RestTime;
            }

            var mode = workout.CurrentActiveTime > 0 ? "active" : "rest";
            var timeLeft = workout.CurrentActiveTime <= 0 ? workout.CurrentRestTime-- : workout.CurrentActiveTime--;

            await programmesOut.AddAsync(workout);

            log.LogInformation($"{timeLeft}");
            await signalRMessages.AddAsync(
                new SignalRMessage
                {
                    Target = "newMessage",
                    Arguments = new[] { $"{timeLeft}", $"{mode}", $"{workout.SourceWorkoutId}", workout.LastUpdated.ToString("s"), $"{workout.IsPlaying}" }
                });
        }
    }
}