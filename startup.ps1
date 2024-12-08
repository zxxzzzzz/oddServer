# 设置脚本执行策略为 RemoteSigned 以便运行脚本
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned

# 定义项目路径，这里假设项目路径为 C:\path\to\your\project
$projectPath = "D:\oddServer"


# 启动一个新的 PowerShell 窗口并运行 npm start
Write-Output "Starting npm start in a new terminal window..."
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command `"cd '$projectPath'; deno task data`""

# 启动一个新的 PowerShell 窗口并运行 npm install
Write-Output "Starting npm install in a new terminal window..."
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command `"cd '$projectPath'; deno task http`""