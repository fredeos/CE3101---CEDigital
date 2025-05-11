using Dapper;
using Microsoft.Data.SqlClient;

using System.Diagnostics;
using System.Collections.Generic;
using System.Threading;

using backend.services.logger;
using System.Threading.Tasks;

namespace backend.services.connections{
    class SQLConfig {
        public String? __server_name {get; set;}
        public String? __username {get; set;}
        public String? __password {get; set;}
        public String? __database_name {get; set;}

        public String getConnectionString(){
            return @$"Server={__server_name};Database={__database_name};Trusted_Connection=True;TrustServerCertificate=True";
        }

        public String getCMDString(){
            if (__username == null && __password == null){
                return $"sqlcmd -S {__server_name} -d {__database_name} -E";
            }
            return $"sqlcmd -S {__server_name} -d {__database_name} -U {__username} -P {__password}";
        }
    }

    /// <summary>
    /// Interfaz(clase) de conexion para una base de datos en SQL Server 
    /// </summary>
    public class SQLContext {
        // ------------------------------------- [Attributes] ------------------------------------- //
        private LogConsole? console; // Consola de logs
        private SemaphoreSlim traffic = new(1); // Semaforo para controlar el acceso a la base de datos

        private SQLConfig configs = new(); // Configuracion de atributos de la base de datos
        // ------------------------------------- [Constructor] ------------------------------------- //
        public SQLContext(){
            this.console = null;
        }

        public SQLContext(String logfile){
            this.console = new (logfile);
            console.bootup(1000);
        }

        // ------------------------------------- [Methods and functions] ------------------------------------- //
        
        /// <summary>
        /// Configuracion de propiedades de la base de datos
        /// </summary>
        /// <param name="server">nombre del servidor de SQL</param>
        /// <param name="database">nombre de la base de datos</param>
        /// <param name="user">nombre del usuario</param>
        /// <param name="password">contraseña de acceso</param>
        public void Configure(String server, String database, String user, String password){
            try{
                traffic.Wait();
                configs.__server_name = server;
                configs.__database_name = database;
                configs.__username = user;
                configs.__password = password;
            } catch (System.Exception){
                throw;
            } finally {
                traffic.Release();
            }
        }

        /// <summary>
        /// Configuracion de propiedades de la base de datos
        /// </summary>
        /// <param name="server">nombre del servidor de SQL</param>
        /// <param name="database">nombre de la base de datos</param>
        public void Configure(String server, String database){
            try{
                traffic.Wait();
                configs.__server_name = server;
                configs.__database_name = database;
            } catch (System.Exception){ 
                throw;
            } finally {
                traffic.Release();
            }
        }

        /// <summary>
        /// Realiza un log en la consola predefinida
        /// </summary>
        /// <param name="message"></param>
        private void logQuery(String message){
            if (console != null){
                console.log(LogTypes.INFO, $"(SQLContext) {message}");
            } else {
                Console.WriteLine($"(SQLContext) {message}");
            }
        }

        /// <summary>
        /// Realiza un log de error en la consola predefinida
        /// </summary>
        /// <param name="message"></param>
        private void logError(String message){
            if (console != null){
                console.log(LogTypes.ERROR, $"(SQLContext) {message}");
            } else {
                Console.WriteLine($"(SQLContext) {message}");
            }
        }

        /// <summary>
        /// Realiza una consulta a la base de datos para obtener una lista de registros
        /// </summary>
        /// <typeparam name="T">clase modelo para mapear los registros</typeparam>
        /// <param name="sql_query">string de consulta SQL</param>
        /// <returns>Lista de objetos T </returns>
        /// <remarks>
        /// La consulta SQL debe incluir una condicion WHERE para evitar saturar la memoria
        /// </remarks>
        public List<T> SELECT<T>(String sql_query){
            try{
                traffic.Wait();
                this.logQuery($"Executing query: {sql_query}");
                using (var connection = new SqlConnection(configs.getConnectionString())){
                    var results = connection.Query<T>(sql_query).ToList();
                    this.logQuery($"Query success: {results.Count} results found");
                    return results;
                }
            } catch (System.Exception e){
                this.logError($"Query failed: {e.Message}");
                return [];
            } finally  {
                traffic.Release();
            }
        }

        /// <summary>
        /// Elimina todos los registros de una tabla
        /// </summary>
        /// <typeparam name="T">clase modelo para mapear los registros</typeparam>
        /// <param name="sql_query">string de consulta SQL</param>
        /// <returns>Retorna una lista de los registros borrados de la tabla</returns>
        /// <remarks> 
        /// La consulta SQL debe incluir una condicion WHERE ... para evitar borrar todos los registros 
        /// y una premisa OUTPUT ... para obtener una lista de registros eliminados 
        /// </remarks>
        public List<T> DELETE<T>(String sql_query){
            try {
                traffic.Wait();
                this.logQuery($"Executing query: {sql_query}");
                using (var connection = new SqlConnection(configs.getConnectionString())){
                    var deleted = connection.Query<T>(sql_query).ToList();
                    this.logQuery($"Query success: {deleted.Count} registers deleted");
                    return deleted;
                }
            } catch (System.Exception e){
                this.logError($"Query failed: {e.Message}");
                return [];
            } finally {
                traffic.Release();
            }
        }

        /// <summary>
        /// Realiza una consulta a la base de datos para insertar un nuevo registro basado en un objeto T 
        /// </summary>
        /// <typeparam name="T">clase modelo para mapear los registros</typeparam>
        /// <param name="sql_query">string de consulta SQL</param>
        /// <param name="obj">objeto que se desea insertar</param>
        /// <returns> Registro actualizado posterior a su insercion </returns>
        /// <remarks>
        /// La consulta SQL debe incluir una premisa OUTPUT ... para obtener el registro insertado
        /// </remarks>
        public T? INSERT<T>(String sql_query, T obj){
            try{
                traffic.Wait();
                this.logQuery($"Executing query: {sql_query}");
                using (var connection = new SqlConnection(configs.getConnectionString()) ) {
                    var inserted = connection.QuerySingle<T>(sql_query, obj);
                    this.logQuery($"Query success: {nameof(inserted.GetType)} object inserted");
                    return inserted;
                }
            } catch (System.Exception e){
                this.logError($"Query failed: {e.Message}");
                return default(T);
            } finally {
                traffic.Release();
            }
        }

        /// <summary>
        /// Realiza una consulta a la base de datos para actualizar un registro basado en un objeto T
        /// </summary>
        /// <typeparam name="T">clase modelo para mapear los registros</typeparam>
        /// <param name="sql_query">string de consulta SQL</param>
        /// <param name="obj">objeto que se desea insertar</param>
        /// <returns> Lista de los registros actualizados </returns>
        /// <remarks>
        /// La consulta SQL debe incluir condicion WHERE ... para evitar saturar la memoria y 
        /// una premisa OUTPUT ... para obtener los registros actualizado
        /// </remarks>
        public List<T> UPDATE<T>(String sql_query, T obj){
            try{
                traffic.Wait();
                this.logQuery($"Executing query: {sql_query}");
                using (var connection = new SqlConnection(configs.getConnectionString()) ) {
                    var modified = connection.Query<T>(sql_query, obj).ToList();
                    this.logQuery($"Query success: {modified.Count} registers modified");
                    return modified;
                }
            } catch (System.Exception e){
                this.logError($"Query failed: {e.Message}");
                return [];
            } finally {
                traffic.Release();
            }
        }
    
    }
}