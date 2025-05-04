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

        public List<T> SELECT<T>(String table, String attributes, String conditions){
            String query = $"SELECT {attributes} FROM {table} WHERE {conditions};";
            try{
                traffic.Wait();
                using (var connection = new SqlConnection(configs.getConnectionString())){
                    var results = connection.Query<T>(query).ToList();
                    Console.WriteLine("SQL Query succesful");
                    return results;
                }
            } catch (System.Exception e){
                Console.WriteLine($"SQL Query failed: {e}");
                return [];
            } finally  {
                traffic.Release();
            }
        }

        public int DELETE(String table, String conditions){
            String query = $"DELETE FROM {table} WHERE {conditions};";
            try {
                traffic.Wait();
                int rowsAffected = 0;
                using (var connection = new SqlConnection(configs.getConnectionString())){
                    rowsAffected += connection.Execute(query);
                }
                return rowsAffected;
            } catch (System.Exception){
                return -1;
            } finally {
                traffic.Release();
            }
        }

        public int INSERT<T>(String table, String attributes, List<T> objs, String format){
            String query = $"INSERT INTO {table}({attributes}) VALUES {format}";
            try{
                traffic.Wait();
                int rowsAffected = 0;
                using (var connection = new SqlConnection(configs.getConnectionString()) ) {
                    foreach (var obj in objs){
                        rowsAffected += connection.Execute(query,obj);
                    }
                }
                return rowsAffected;
            } catch (System.Exception){
                return -1;
            } finally {
                traffic.Release();
            }
        }

        public int UPDATE(String table, String attributes, String condition){
            String query = $"UPDATE {table} SET {attributes} WHERE {condition};";
            try{
                traffic.Wait();
                int rowsAffected = 0;
                using (var connection = new SqlConnection(configs.getConnectionString()) ) {
                    rowsAffected += connection.Execute(query);
                }
                return rowsAffected;
            } catch (System.Exception){
                return -1;
            } finally {
                traffic.Release();
            }
        }
    
    }
}