Set WshShell = CreateObject("WScript.Shell")
' This line automatically finds the folder the script is sitting in
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = strPath
WshShell.Run "cmd /c ng serve", 0
Set WshShell = Nothing