using Microsoft.AspNetCore.SignalR;
using Microsoft.Azure.Cosmos;
using Quartz;
using SignalRChat.Hubs;
using System.Diagnostics;

namespace SignalRTest
{
    public class TimerJob : IJob
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly CosmosClient _client;

        public TimerJob(IHubContext<ChatHub> hubContext, CosmosClient client)
        {
            _hubContext = hubContext;
            _client = client;
        }
        public async Task Execute(IJobExecutionContext context)
        {
            Debug.WriteLine("test");

   
            var container = _client.GetContainer("screens", "programmes");
            var workout = container.GetItemLinqQueryable<ActiveProgramme>(true).Where(t => t.id == "active").AsEnumerable().FirstOrDefault();

            if (workout.CurrentActiveTime <= 0 && workout.CurrentRestTime <= 0)
            {
                workout.CurrentActiveTime = workout.ActiveTime;
                workout.CurrentRestTime = workout.RestTime;
            }

            var mode = workout.CurrentActiveTime > 0 ? "active" : "rest";
            var timeLeft = workout.CurrentActiveTime <= 0 ? workout.CurrentRestTime-- : workout.CurrentActiveTime--;

            //await programmesOut.AddAsync(workout);

    
            await _hubContext.Clients.All.SendAsync("newMessage",  $"{timeLeft}", $"{mode}", $"{workout.SourceWorkoutId}", workout.LastUpdated.ToString("s"), $"{workout.IsPlaying}");
        }
    }
}
