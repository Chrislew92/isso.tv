// ============================================================
//  353L.exe — Starter für ISSO.TV
//  © 2026 Christoph Lewandowski. Alle Rechte vorbehalten.
//
//  Doppelklick -> ISSO.TV geht auf.
//  Solange die lokale Datei existiert, wird die genommen.
//  Ist sie weg, geht der Starter automatisch auf die Domain.
//
//  Neu bauen:
//  %WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe ^
//      /nologo /target:winexe /reference:System.Windows.Forms.dll ^
//      /out:"%USERPROFILE%\Desktop\353L.exe" 353L.cs
// ============================================================

using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;

[assembly: AssemblyTitle("353L")]
[assembly: AssemblyDescription("ISSO.TV")]
[assembly: AssemblyProduct("ISSO.TV")]
[assembly: AssemblyCompany("Christoph Lewandowski")]
[assembly: AssemblyCopyright("\u00A9 2026 Christoph Lewandowski")]
[assembly: AssemblyVersion("1.1.0.0")]
[assembly: AssemblyFileVersion("1.1.0.0")]

static class Starter
{
    const string LIVE  = "https://isso.tv";
    const string LOKAL = @"C:\Users\chris\AndroidStudioProjects\isso.tv\index.html";

    static int Main()
    {
        // Cache-Buster: sonst zeigt der Browser eine alte Kopie.
        string stempel = DateTime.Now.ToString("yyyyMMddHHmmss");
        string ziel = File.Exists(LOKAL)
            ? "file:///" + LOKAL.Replace('\\', '/') + "?v=" + stempel
            : LIVE + "?v=" + stempel;
        try
        {
            var psi = new ProcessStartInfo(ziel);
            psi.UseShellExecute = true;
            Process.Start(psi);
            return 0;
        }
        catch (Exception e)
        {
            System.Windows.Forms.MessageBox.Show(
                "ISSO.TV lie\u00DF sich nicht \u00F6ffnen.\n\n" + e.Message,
                "353L", System.Windows.Forms.MessageBoxButtons.OK,
                System.Windows.Forms.MessageBoxIcon.Warning);
            return 1;
        }
    }
}
