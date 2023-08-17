using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Extensions.SignalRService;
using Microsoft.Extensions.Logging;

namespace HorizonMode.GymScreens
{
    public class SignalR
    {
         private AblyPublisher _publisher;

         public SignalR(AblyPublisher publisher)
         {
            _publisher = publisher;
         }

        [FunctionName("negotiate")]
        public SignalRConnectionInfo Negotiate(
            [HttpTrigger(AuthorizationLevel.Anonymous)] HttpRequest req,
            [SignalRConnectionInfo(HubName = "serverless_dev")] SignalRConnectionInfo connectionInfo)
        {
            return connectionInfo;
        }

        [FunctionName("broadcast")]
        public async Task Broadcast([TimerTrigger("* * * * * *")] TimerInfo myTimer,
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

            //await programmesOut.AddAsync(workout);

            log.LogInformation($"TIMELEFT: {timeLeft}");

            await _publisher.PublishUpdate(timeLeft, workout.LastUpdated, mode, workout.IsPlaying, workout.SourceWorkoutId);
          
        }
    }
}