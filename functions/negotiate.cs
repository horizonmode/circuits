using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Extensions.SignalRService;
using Newtonsoft.Json;

namespace CSharp
{
    public static class Function
    {
        private static int ActiveTime = 10;
        private static int RestTime = 5;

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
        [SignalR(HubName = "serverless_dev")] IAsyncCollector<SignalRMessage> signalRMessages)
        {
            if (ActiveTime <= 0 && RestTime <= 0)
            {
                ActiveTime = 10;
                RestTime = 5;
            }

            var mode = ActiveTime > 0 ? "active" : "rest";
            var timeLeft = ActiveTime <= 0 ? RestTime-- : ActiveTime--;


            await signalRMessages.AddAsync(
                new SignalRMessage
                {
                    Target = "newMessage",
                    Arguments = new[] { $"{timeLeft}", $"{mode}" }
                });
        }
    }
}