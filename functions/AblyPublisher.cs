using System.Threading.Tasks;
using IO.Ably;
using System;

namespace HorizonMode.GymScreens
{
    public class AblyPublisher
    {
        private readonly IRestClient _ablyClient;

        public AblyPublisher()
        {
        }

        public AblyPublisher(IRestClient ablyClient)
        {
            _ablyClient = ablyClient;
        }


        public async Task PublishUpdate(int time, DateTime lastUpdated, string mode, bool isPlaying, string workoutId)
        {
            if (_ablyClient != null)
            {
                var channel = _ablyClient.Channels.Get("street");
                await channel.PublishAsync(
                    "newMessage",
                        new
                        {
                            time = time,
                            lastUpdated = lastUpdated,
                            mode = mode,
                            isPlaying = isPlaying, 
                            sourceWorkoutId = workoutId
                        }
                    );
            }
        }
    }
}