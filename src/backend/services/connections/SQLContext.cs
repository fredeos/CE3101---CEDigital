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
    /// Sets up a connection to SQL Server instance and a specific database
    /// </summary>
    public class SQLContext {
        // ------------------------------------- [Attributes] ------------------------------------- //
        private LogConsole? console;
        private SemaphoreSlim traffic = new(1);

        private SQLConfig configs = new();
        // ------------------------------------- [Constructor] ------------------------------------- //
        public SQLContext(){
            this.console = null;
        }

        public SQLContext(String logfile){
            this.console = new (logfile);
            console.bootup(1000);
        }

        // ------------------------------------- [Methods and functions] ------------------------------------- //
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

        public List<T> SELECT<T>(String sql_query){
            try{
                traffic.Wait();
                using (var connection = new SqlConnection(configs.getConnectionString())){
                    var results = connection.Query<T>(sql_query).ToList();
                    return results;
                }
            } catch (System.Exception e){
                return [];
            } finally  {
                traffic.Release();
            }
        }

        public List<T> DELETE<T>(String sql_query){
            try {
                traffic.Wait();
                using (var connection = new SqlConnection(configs.getConnectionString())){
                    var deleted = connection.Query<T>(sql_query).ToList();
                    return deleted;
                }
            } catch (System.Exception){
                return [];
            } finally {
                traffic.Release();
            }
        }

        public T? INSERT<T>(String sql_query, T obj){
            try{
                traffic.Wait();
                using (var connection = new SqlConnection(configs.getConnectionString()) ) {
                    var inserted = connection.QuerySingle<T>(sql_query, obj);
                    return inserted;
                }
            } catch (System.Exception){
                return default(T);
            } finally {
                traffic.Release();
            }
        }

        public List<T> UPDATE<T>(String sql_query, T obj){
            try{
                traffic.Wait();
                using (var connection = new SqlConnection(configs.getConnectionString()) ) {
                    var modified = connection.Query<T>(sql_query, obj).ToList();
                    return modified;
                }
            } catch (System.Exception){
                return [];
            } finally {
                traffic.Release();
            }
        }
    
    }
}