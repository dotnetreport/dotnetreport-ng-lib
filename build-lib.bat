@echo off

cd /d "%~dp0"
echo Building dotnetreport-lib...
ng build dotnetreport-lib
if %errorlevel% neq 0 goto error

echo Uninstalling dotnetreport-ng...
npm uninstall dotnetreport-ng
if %errorlevel% neq 0 goto error

echo Installing dotnetreport-ng...
npm install file:dist/dotnetreport-ng --no-save
if %errorlevel% neq 0 goto error

cd /d "%~dp0projects\dotnetreport-app"
echo Starting ng serve...
ng serve
if %errorlevel% neq 0 goto error

echo All done.
goto end

:error
cd /d "%~dp0"
echo An error occurred. Exiting.
exit /b 1

:end
cd /d "%~dp0"