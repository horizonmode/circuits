using System;
using Azure.Data.Tables;

namespace HorizonMode.GymScreens
{
    public class Utils<T> where T : Dto
    {
        public static TableEntity GetTableEntity(T obj, string partitionKey, string rowKey)
        {
            var entity = new TableEntity(partitionKey, rowKey);
            var properties = obj.GetType().GetProperties();
            foreach (var prop in properties)
            {
                entity.Add(prop.Name, prop.GetValue(obj, null));
            }

            return entity;
        }

        public static T GetDto(TableEntity entity)
        {
            T obj = Activator.CreateInstance<T>() as T;
            var properties = obj.GetType().GetProperties();
            foreach (var prop in properties)
            {
                if (entity.ContainsKey(prop.Name))
                {
                    prop.SetValue(obj, entity[prop.Name]);
                }
            }

            return obj;
        }
    }
}