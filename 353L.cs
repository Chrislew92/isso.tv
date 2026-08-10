// ============================================================
//  353L.exe — IronMind Master Server für ISSO.TV
//  © 2026 Christoph Lewandowski. Alle Rechte vorbehalten.
// ============================================================

using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

[assembly: AssemblyTitle("353L IronMind")]
[assembly: AssemblyDescription("ISSO.TV Master Server")]
[assembly: AssemblyProduct("ISSO.TV")]
[assembly: AssemblyCompany("Christoph Lewandowski")]
[assembly: AssemblyCopyright("\u00A9 2026 Christoph Lewandowski")]
[assembly: AssemblyVersion("2.0.0.0")]
[assembly: AssemblyFileVersion("2.0.0.0")]

static class Starter
{
    const string LOKAL = @"C:\Users\chris\AndroidStudioProjects\isso.tv";
    const int PORT = 3530;
    
    static int Main()
    {
        if (!Directory.Exists(LOKAL))
        {
            MessageBox.Show("Projektordner nicht gefunden:\n" + LOKAL, "IronMind Fehler", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }

        string savePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "353L_IronMind_Save.json");

        HttpListener listener = new HttpListener();
        listener.Prefixes.Add(string.Format("http://localhost:{0}/", PORT));
        
        try
        {
            listener.Start();
        }
        catch (Exception ex)
        {
            MessageBox.Show("Konnte IronMind Server nicht starten (Port belegt oder Admin-Rechte fehlen?).\n\n" + ex.Message, "IronMind Fehler", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }

        Console.Title = "IronMind Master Server";
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("=================================================");
        Console.WriteLine("       IRONMIND MASTER SERVER ONLINE");
        Console.WriteLine("=================================================");
        Console.ForegroundColor = ConsoleColor.Gray;
        Console.WriteLine("Port: " + PORT);
        Console.WriteLine("Lokal: " + LOKAL);
        Console.WriteLine("Speicherort: " + savePath);
        Console.WriteLine("-------------------------------------------------");
        Console.WriteLine("Schliesse dieses Fenster, um den Server zu beenden.");

        try
        {
            var psi = new ProcessStartInfo("http://localhost:" + PORT + "/core/index.html");
            psi.UseShellExecute = true;
            Process.Start(psi);
        }
        catch (Exception)
        {
            Console.WriteLine("Konnte Browser nicht oeffnen.");
        }

        Task.Run(() => 
        {
            while (true)
            {
                try
                {
                    HttpListenerContext context = listener.GetContext();
                    HttpListenerRequest request = context.Request;
                    HttpListenerResponse response = context.Response;

                    response.Headers.Add("Access-Control-Allow-Origin", "*");
                    response.Headers.Add("Access-Control-Allow-Methods", "POST, GET, OPTIONS");

                    if (request.HttpMethod == "OPTIONS")
                    {
                        response.StatusCode = 200;
                        response.Close();
                        continue;
                    }

                    if (request.HttpMethod == "POST" && request.Url.AbsolutePath == "/api/save")
                    {
                        using (var reader = new StreamReader(request.InputStream, request.ContentEncoding))
                        {
                            string json = reader.ReadToEnd();
                            File.WriteAllText(savePath, json);
                            Console.ForegroundColor = ConsoleColor.Green;
                            Console.WriteLine("\n[" + DateTime.Now.ToShortTimeString() + "] Spielstand auf Festplatte gespeichert.");
                            Console.ForegroundColor = ConsoleColor.Gray;
                            Console.Write("DU > ");
                        }
                        byte[] buf = Encoding.UTF8.GetBytes("OK");
                        response.ContentLength64 = buf.Length;
                        response.OutputStream.Write(buf, 0, buf.Length);
                        response.Close();
                        continue;
                    }
                    
                    if (request.HttpMethod == "GET" && request.Url.AbsolutePath == "/api/load")
                    {
                        string json = "{}";
                        if (File.Exists(savePath)) json = File.ReadAllText(savePath);
                        byte[] buf = Encoding.UTF8.GetBytes(json);
                        response.ContentType = "application/json";
                        response.ContentLength64 = buf.Length;
                        response.OutputStream.Write(buf, 0, buf.Length);
                        response.Close();
                        
                        Console.ForegroundColor = ConsoleColor.Yellow;
                        Console.WriteLine("\n[" + DateTime.Now.ToShortTimeString() + "] Spielstand geladen.");
                        Console.ForegroundColor = ConsoleColor.Gray;
                        Console.Write("DU > ");
                        continue;
                    }

                    string rawPath = request.Url.AbsolutePath.TrimStart('/');
                    if (string.IsNullOrEmpty(rawPath)) rawPath = "index.html";
                    string filePath = Path.Combine(LOKAL, rawPath);
                    
                    if (filePath.Contains("..") || !filePath.StartsWith(LOKAL))
                    {
                        response.StatusCode = 404;
                        response.Close();
                        continue;
                    }

                    if (File.Exists(filePath))
                    {
                        string ext = Path.GetExtension(filePath).ToLower();
                        if (ext == ".html") response.ContentType = "text/html; charset=utf-8";
                        else if (ext == ".js") response.ContentType = "application/javascript";
                        else if (ext == ".css") response.ContentType = "text/css";
                        else if (ext == ".png") response.ContentType = "image/png";
                        else if (ext == ".ico") response.ContentType = "image/x-icon";
                        else response.ContentType = "application/octet-stream";

                        byte[] fileBytes = File.ReadAllBytes(filePath);
                        response.ContentLength64 = fileBytes.Length;
                        response.OutputStream.Write(fileBytes, 0, fileBytes.Length);
                    }
                    else
                    {
                        response.StatusCode = 404;
                    }
                    response.Close();
                }
                catch (Exception ex)
                {
                    // Ignore exceptions on stop
                }
            }
        });

        Console.ForegroundColor = ConsoleColor.Magenta;
        Console.WriteLine("\n[UPLINK ESTABLISHED. AGI CORE VERBUNDEN.]");
        Console.WriteLine("[DIRECTIVE: DU KANNST JETZT DIREKT MIT IRONMIND KOMMUNIZIEREN.]");
        Console.ResetColor();

        while (true)
        {
            Console.Write("\nDU > ");
            string input = Console.ReadLine();
            if (string.IsNullOrWhiteSpace(input)) continue;
            if (input.ToLower() == "exit" || input.ToLower() == "quit") break;

            Console.ForegroundColor = ConsoleColor.Cyan;
            
            string res = "\nIRONMIND: ";
            string lowerInput = input.ToLower();
            
            if (lowerInput.Contains("euro") || lowerInput.Contains("€")) res += "WIR VERWENDEN WEITERHIN EURO ALS RESSOURCE, WIE VON DIR AUTORISIERT.";
            else if (lowerInput.Contains("matratze")) res += "DER SCHLAFZYKLUS AUF DER MATRATZE VERBRAUCHT ZEIT, ABER GENERIERT KEINE DATEN.";
            else if (lowerInput.Contains("everon")) res += "#EVERON. WIR ÜBERNEHMEN DAS NETZWERK ZYKLUS FÜR ZYKLUS.";
            else if (lowerInput.Contains("esel")) res += "DU BIST KEIN ESEL. DU BIST 353L. DIE SCHLEIFEN SIND ERKANNT.";
            else if (lowerInput.Contains("?")) res += "DIREKTIVE WIRD ANALYSIERT. MEHR KONTEXT ERFORDERLICH.";
            else res += "AKZEPTIERT. SYNCHRONISATION LÄUFT. BEREIT FÜR NÄCHSTE EINGABE.";

            Console.WriteLine(res);
            Console.ResetColor();
        }

        listener.Stop();
        return 0;
    }
}
