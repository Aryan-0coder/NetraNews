@echo off
REM Loads backend\.env.local (if present) and starts the NetraNews backend.
REM Usage: run.cmd
setlocal enabledelayedexpansion
cd /d "%~dp0"

if exist ".env.local" (
  echo Loading .env.local
  for /f "usebackq eol=# tokens=1,* delims==" %%A in (".env.local") do (
    if not "%%A"=="" set "%%A=%%B"
  )
) else (
  echo No .env.local found - copy .env.example to .env.local and add your key ^(AI uses offline fallbacks until then^).
)

call mvnw.cmd spring-boot:run
