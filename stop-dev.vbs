' stop-dev.vbs
' This script kills all node-related processes in the background.

Set WshShell = CreateObject("WScript.Shell")

' Force kill node, tsx, and ng processes
WshShell.Run "taskkill /F /IM node.exe /T", 0, True
WshShell.Run "taskkill /F /IM tsx.exe /T", 0, True
WshShell.Run "taskkill /F /IM ng.exe /T", 0, True

' Give some time for the OS to release the ports
WScript.Sleep 2000

Set WshShell = Nothing
