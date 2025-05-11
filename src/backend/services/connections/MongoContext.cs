using MongoDB.Driver;
using MongoDB.Bson.IO;
using MongoDB.Bson.Serialization;
using System.Collections.Generic;
using System.Threading;

using backend.services.logger;
using System.Linq.Expressions;
using System.Collections.Immutable;

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
    /// Interfaz(clase) de conexion para una base de datos en MongoDB
    /// </summary>
    public class MongoContext {
        // ------------------------------------- [Attributes] ------------------------------------- //
        private LogConsole? console; // Consola de logs
        private SemaphoreSlim traffic = new(1); // Semaforo para controlar el acceso a la base de datos
        private MongoConfig configs = new(); // Configuracion de atributos de la base de datos

        // ------------------------------------- [Constructor] ------------------------------------- //
        public MongoContext(){
            this.console = null;
        }

        public MongoContext(String logfile){
            this.console = new (logfile);
            console.bootup(1000);
        }

        // ------------------------------------- [Methods and functions] ------------------------------------- //
        
        /// <summary>
        /// Configuracion de propiedades de la base de datos
        /// </summary>
        /// <param name="address"> string url de conexión </param>
        /// <param name="database"> nombre de la base de datos que se desea acceder </param>
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

        /// <summary>
        /// Configuracion de propiedades de la base de datos
        /// </summary>
        /// <param name="ip"> direcction IPv4 del servidor de mongo </param>
        /// <param name="port"> puerto de acceso del servidor </param>
        /// <param name="database"> nombre de la base de datos que se desea acceder </param>
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
        /// <summary>
        /// Escribe un mensaje de log en la consola seleccionada
        /// </summary>
        /// <param name="message"></param>
        private void logQuery(String message){
            if (console != null){
                console.log(LogTypes.INFO, $"(MongoContext) {message}");
            } else {
                Console.WriteLine($"(MongoContext) {message}");
            }
        }

        /// <summary>
        /// Escribe un error de log en la consola seleccionada
        /// </summary>
        /// <param name="message"></param>
        private void logError(String message){
            if (console != null){
                console.log(LogTypes.ERROR, $"(MongoContext) {message}");
            } else {
                Console.WriteLine($"(MongoContext) {message}");
            }
        }


        /// <summary>
        /// Obtiene una lista de objetos en una coleccion de la base de datos
        /// </summary>
        /// <typeparam name="T"> clase modelo para interpretar lo datos </typeparam>
        /// <param name="collection"> nombre de la coleccion </param>
        /// <param name="filter"> criterio booleano de filtrado </param>
        /// <returns></returns>
        public List<T> find<T>(String collection, Expression<Func<T,bool> > filter){
            try{
                traffic.Wait();
                this.logQuery($"Executing find(): For {typeof(T).Name} in {collection} where {filter.ToString()}");
                using (var client = new MongoClient(configs.getConnectionString())){
                    var db = client.GetDatabase(configs.__database_name);
                    var group = db.GetCollection<T>(collection);
                    var results = group.Find<T>(filter).ToList();
                    this.logQuery($"find(): Found {results.Count} results");
                    return results;
                }
            } catch (System.Exception e){
                this.logError($"Error executing find(): {e.Message}");
                return [];
            } finally {
                traffic.Release();
            }
        }

        /// <summary>
        /// Inserta una lista de nuevos objetos en una coleccion de la base de datos
        /// </summary>
        /// <typeparam name="T"> clase modelo para interpretar los datos </typeparam>
        /// <param name="collection"> nombre de la coleccion </param>
        /// <param name="filter"> comparación de filtrado </param>
        /// <returns></returns>
        public List<T> insert<T>(String collection, List<T> objs){
            try{
                traffic.Wait();
                this.logQuery($"Executing insert(): of {typeof(T).Name} object(s) in {collection}");
                using (var client = new MongoClient(configs.getConnectionString())){
                    var db = client.GetDatabase(configs.__database_name);
                    var group = db.GetCollection<T>(collection);
                    group.InsertManyAsync(objs);
                    this.logQuery($"insert(): {objs.Count} new objects inserted");
                    return objs;
                }
            } catch (System.Exception e){
                this.logError($"Error executing insert(): {e.Message}");
                return [];
            } finally {
                traffic.Release();
            }
        }

        /// <summary>
        /// Borra todos los objetos de una coleccion de la base de datos que cumplan el criterio de filtrado
        /// </summary>
        /// <typeparam name="T"> clase modelo para interpretar los datos </typeparam>
        /// <param name="collection"> nombre de la coleccion </param>
        /// <param name="filter"> criterio booleano de filtrado </param>
        /// <returns></returns>
        public List<T> delete<T>(String collection, Expression<Func<T,bool> > filter){
            this.logQuery($"Executing delete(): of {typeof(T).Name} object(s) in {collection} where {filter.ToString()}");
            try{
               traffic.Wait();
                using (var client = new MongoClient(configs.getConnectionString())){
                    var db = client.GetDatabase(configs.__database_name);
                    var group = db.GetCollection<T>(collection);
                    var deleted = group.Find(filter).ToList();
                    group.DeleteMany(filter);
                    this.logQuery($"delete(): {deleted.Count} objects deleted");
                    return deleted;
                }
            } catch (System.Exception e){
                this.logError($"Error executing delete(): {e.Message}");
                return [];
            } finally {
                traffic.Release();
            }
        }

        /// <summary>
        /// Actualiza todos los objetos de una coleccion de la base de datos que cumplan el criterio de filtrado
        /// </summary>
        /// <typeparam name="T">clase modelo para interpretar los datos </typeparam>
        /// <param name="collection">nombre de la coleccion</param>
        /// <param name="filter">criterio booleano de filtrado</param>
        /// <param name="update">contenedor con con valores de los campos actualizados</param>
        /// <returns></returns>
        public List<T> update<T>(String collection, Expression< Func<T,bool> > filter, UpdateDefinition<T> update){
            try{
               traffic.Wait();
               this.logQuery($"Executing update(): of {typeof(T).Name} object(s) in {collection} where {filter.ToString()}");
               using (var client = new MongoClient(configs.getConnectionString())){
                    var db = client.GetDatabase(configs.__database_name);
                    var group = db.GetCollection<T>(collection);
                    group.UpdateMany(filter, update);
                    var updated = group.Find(filter).ToList();
                    this.logQuery($"update(): {updated.Count} objects modified");
                    return updated;
                }
            } catch (System.Exception e){
                this.logError($"Error executing update(): {e.Message}");
                return [];
            } finally {
                traffic.Release();
            }
        }
    }
}