using System;

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

    public class Screen
    {
        public string Id { get; set; }
        public string Tag { get; set; }
        public string DeviceId { get; set; }
    }

    public class Programme : Dto
    {
        public string Name { get; set; }
        public int ActiveTime { get; set; }
        public int RestTime { get; set; }
    }

    public class ScreenMapping : Dto
    {
        public string ProgrammeId { get; set; }
        public string ScreenId { get; set; }
        public bool SplitScreen { get; set; }
        public string Exercise1Id { get; set; }
        public string Exercise2Id { get; set; }
    }

    public class Exercise : Dto
    {
        public string Name { get; set; }
        public string VideoUrl { get; set; }
    }

    public class Dto
    {
        public string Id { get; set; }

        public Dto()
        {
            Id = Guid.NewGuid().ToString();
        }
    }
}