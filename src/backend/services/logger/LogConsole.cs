using System.IO;

namespace backend.services.logger {
    public enum LogTypes {
        WARNING,
        ERROR,
        INFO
    }

    public class LogConsole {
        // --------------------------------[ Class attributes ]--------------------------------
        private String __logfile;
        private readonly String __logs_dir = Path.Combine(".","logs");
        // --------------------------------[ Class functions & methods ]--------------------------------
        public LogConsole(String filename){
            this.__logfile = Path.Combine(__logs_dir,$"{filename}");
            if (!File.Exists(__logfile)){
                File.WriteAllText(__logfile,$"\n[{TimeStamp()}][{TypeStamp(LogTypes.INFO)}]: ============= Log file initialized");
            }
        }

        public void bootup(int log_max){
            if (File.ReadAllLines(__logfile).Count() >= log_max){
                this.clear();
            }
            File.AppendAllText(__logfile, $"\n[{TimeStamp()}][{TypeStamp(LogTypes.INFO)}]: ============= Log Console started");
        }

        public void clear(){
            File.Delete(__logfile);
            File.WriteAllText(__logfile,$"\n[{TimeStamp()}][{TypeStamp(LogTypes.INFO)}]: ============= Log file cleared");
        }

        public void log(LogTypes type, String msg){
            File.AppendAllText(__logfile,$"\n[{TimeStamp()}][{TypeStamp(type)}]: {msg}");
        }

        private static String TimeStamp(){
            return DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        }

        private static String TypeStamp(LogTypes type){
            switch (type){
                case LogTypes.WARNING:
                    return "WARNING";
                case LogTypes.ERROR:
                    return "WARNING";
                case LogTypes.INFO:
                    return "INFO";
            }
            return "";
        }
    }
}