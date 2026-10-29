@echo off
echo ===================================================
echo     ZamHelper Desktop App Installation
echo ===================================================
echo Creating desktop launcher for ZamHelper...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut(\"$Home\Desktop\ZamHelper.lnk\"); $Shortcut.TargetPath = \"https://ais-dev-qhrgmzqnqogykzqi4kiace-65595851929.europe-west2.run.app\"; $Shortcut.IconLocation = \"https://ais-dev-qhrgmzqnqogykzqi4kiace-65595851929.europe-west2.run.app/favicon.png\"; $Shortcut.Save()"
echo ZamHelper has been installed on your Desktop!
pause
