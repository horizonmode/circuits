using System.Linq;
using System.Threading.Tasks;
using Azure.Data.Tables;
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
         [Table("Workouts", "programmes")] TableClient tableClient, ILogger log)
        {
            var tableData = tableClient.Query<TableEntity>(filter: $"RowKey eq 'active'", maxPerPage: 10).FirstOrDefault();
            if (tableData == null) return;

            var workout = Utils<ActiveProgramme>.GetDto(tableData);

            if (workout.CurrentActiveTime <= 0 && workout.CurrentRestTime <= 0)
            {
                workout.CurrentActiveTime = workout.ActiveTime;
                workout.CurrentRestTime = workout.RestTime;
            }

            var mode = workout.CurrentActiveTime > 0 ? "active" : "rest";
            var timeLeft = workout.CurrentActiveTime <= 0 ? workout.CurrentRestTime-- : workout.CurrentActiveTime--;

            var entity = Utils<ActiveProgramme>.GetTableEntity(workout, TableKeys.ProgrammeKey, "active");
            tableClient.UpsertEntity<TableEntity>(entity);

            log.LogInformation($"{timeLeft}");
            await signalRMessages.AddAsync(
                new SignalRMessage
                {
                    Target = "newMessage",
                    Arguments = new[] { $"{timeLeft}", $"{mode}", $"{workout.Id}" }
                });
        }
    }
}