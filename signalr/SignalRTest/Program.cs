using Quartz;
using SignalRTest;
using Microsoft.Extensions.DependencyInjection;
using SignalRChat.Hubs;
using Microsoft.Azure.Cosmos;

var builder = WebApplication.CreateBuilder(args);

ConfigurationManager configuration = builder.Configuration;
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

builder.Services.AddQuartz(q =>
{
    var jobKey = new JobKey("TimerJob");
    q.AddJob<TimerJob>(opts => opts.WithIdentity(jobKey));

    q.AddTrigger(opts => opts
        .ForJob(jobKey)
        .WithIdentity("DemoJob-trigger")
        .WithCronSchedule("* * * * * ?"));

});

builder.Services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

// Use a Singleton instance of the CosmosClient
builder.Services.AddSingleton<CosmosClient>(serviceProvider =>
{
    return new CosmosClient(configuration["CosmosConnection"]);
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapHub<ChatHub>("/chatHub");

app.Run();
