using System.Collections.Generic;
using Newtonsoft.Json;

namespace HorizonMode.GymScreens
{
    public class TableKeys
    {
        public static string ProgrammeKey = "programme";
        public static string ClientKey = "hfc";
    }

    public class ActiveProgramme : Programme
    {
        public int CurrentActiveTime { get; set; }
        public int CurrentRestTime { get; set; }
    }

    public class Screen : Dto
    {
        public string Tag { get; set; }
        public string DeviceId { get; set; }
    }

    public class Programme : Dto
    {
        public string Name { get; set; }
        public int ActiveTime { get; set; }
        public int RestTime { get; set; }
        public List<ScreenMapping> Mappings { get; set; } = new List<ScreenMapping>();
    }

    public class ScreenMapping
    {
        public Screen Screen { get; set; }
        public bool SplitScreen { get; set; }
        public Exercise Exercise1 { get; set; }
        public Exercise Exercise2 { get; set; }
    }

    public class Exercise : Dto
    {
        public string Name { get; set; }
        public string VideoUrl { get; set; }
    }

    public class Dto
    {
        [JsonProperty("id")]
        public string Id { get; set; }
    }
}