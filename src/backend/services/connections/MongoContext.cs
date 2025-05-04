using MongoDB.Driver;
using MongoDB.Bson.IO;
using MongoDB.Bson.Serialization;
using System.Collections.Generic;
using System.Threading;

using backend.services.logger;
using System.Linq.Expressions;

namespace backend.services.connections {
    class MongoConfig {
        public string? __database_name {get; set;}
        public string? __address {get; set;}
        public string? __ip {get; set;}
        public int? __port {get; set;}

        public String getConnectionString(){
            if (__ip != null && __port != null){
                return $"mongodb://{__ip}:{__port}";
            }
            return $"mongodb://{__address}";
        }
    }

    /// <summary>
    /// Sets up a conection to a Mongo database
    /// </summary>
    public class MongoContext {
        // ------------------------------------- [Attributes] ------------------------------------- //
        private LogConsole? console;
        private SemaphoreSlim traffic = new(1);
        private MongoConfig configs = new();

        // ------------------------------------- [Constructor] ------------------------------------- //
        public MongoContext(){
            this.console = null;
        }

        public MongoContext(String logfile){
            this.console = new (logfile);
            console.bootup(1000);
        }

        // ------------------------------------- [Methods and functions] ------------------------------------- //
        public void Configure(string address, string database){
            try{
                traffic.Wait();
                configs.__address = address;
                configs.__database_name = database;
            } catch (System.Exception){
                throw;
            } finally {
                traffic.Release();
            }
        }

        public void Configure(string ip, int port, string database){
            try{
                traffic.Wait();
                configs.__ip = ip;
                configs.__port = port;
                configs.__database_name = database;
            } catch (System.Exception){
                throw;
            } finally {
                traffic.Release();
            }
        }

        public List<T> find<T>(String collection, Expression<Func<T,bool> > filter){
            try{
                traffic.Wait();
                using (var client = new MongoClient(configs.getConnectionString())){
                    var db = client.GetDatabase(configs.__database_name);
                    var group = db.GetCollection<T>(collection);
                    var results = group.Find<T>(filter).ToList();
                    Console.WriteLine("Mongo Query succesful");
                    return results;
                }
            } catch (System.Exception e){
                Console.WriteLine($"Mongo Query failed: {e}");
                return [];
            } finally {
                traffic.Release();
            }
        }

        public void insert<T>(String collection, List<T> objs){
            try{
                traffic.Wait();
                using (var client = new MongoClient(configs.getConnectionString())){
                    var db = client.GetDatabase(configs.__database_name);
                    var group = db.GetCollection<T>(collection);
                    group.InsertManyAsync(objs);
                }
            } catch (System.Exception){
                throw;
            } finally {
                traffic.Release();
            }
        }

        public void delete<T>(String collection, Expression<Func<T,bool> > filter){
            try{
               traffic.Wait();
                using (var client = new MongoClient(configs.getConnectionString())){
                    var db = client.GetDatabase(configs.__database_name);
                    var group = db.GetCollection<T>(collection);
                    group.DeleteMany(filter);
                }
            } catch (System.Exception){
                throw;
            } finally {
                traffic.Release();
            }
        }

        public void update<T>(String collection, Expression< Func<T,bool> > filter, T obj){
            try{
               traffic.Wait();
               using (var client = new MongoClient(configs.getConnectionString())){
                    var db = client.GetDatabase(configs.__database_name);
                    var group = db.GetCollection<T>(collection);
                    group.ReplaceOne(filter,obj);
                }
            } catch (System.Exception){
                throw;
            } finally {
                traffic.Release();
            }
        }

        internal void update<T>(string v, Func<T, bool> value, UpdateDefinitionBuilder<T> update)
        {
            throw new NotImplementedException();
        }
    }
}