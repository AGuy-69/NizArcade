
@echo off
setlocal

set "ROOT=D:\Coding\HTML_Stuff\OH Niz 2026\main\PROJECTS\SCRATCH"

for /r "%ROOT%" %%F in (*.html) do (
    if /i not "%%~nxF"=="index.html" (
        if not exist "%%~dpFindex.html" (
            ren "%%F" "index.html"
            echo Renamed: %%F
        ) else (
            echo Skipped: %%F
        )
    )
)

echo.
echo Done!
pause
