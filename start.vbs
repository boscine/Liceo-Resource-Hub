' start.vbs
' Main dev orchestration script for background processes

Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")
strPath = FSO.GetParentFolderName(WScript.ScriptFullName)

Function PortIsInUse(port)
    Set shell = CreateObject("WScript.Shell")
    Set exec = shell.Exec("cmd /c netstat -ano | findstr :" & port & " | findstr LISTENING")
    strOutput = exec.Stdout.ReadAll
    If InStr(strOutput, ":" & port) > 0 Then
        PortIsInUse = True
    Else
        PortIsInUse = False
    End If
End Function

' 1. Clean up if ports in use
If PortIsInUse(3000) Or PortIsInUse(4200) Then
    WshShell.Run "wscript.exe """ & strPath & "\stop-dev.vbs""", 0, True
    WScript.Sleep 3000
End If

' 2. Start Services in background
WshShell.Run "wscript.exe """ & strPath & "\launch_be.vbs""", 0, False
WshShell.Run "wscript.exe """ & strPath & "\launch_fe.vbs""", 0, False

' 3. Wait for health check
WScript.Sleep 15000

' 4. Health Check - Restart if failed
If Not PortIsInUse(3000) Or Not PortIsInUse(4200) Then
    WshShell.Run "wscript.exe """ & strPath & "\stop-dev.vbs""", 0, True
    WScript.Sleep 3000
    WshShell.Run "wscript.exe """ & strPath & "\launch_be.vbs""", 0, False
    WshShell.Run "wscript.exe """ & strPath & "\launch_fe.vbs""", 0, False
End If

Set WshShell = Nothing
Set FSO = Nothing
