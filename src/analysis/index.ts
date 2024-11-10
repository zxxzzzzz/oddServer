import * as fs from 'fs';

// 读取文件内容
const filePath = './log/requestPerformance-2024-11-10.txt';
const content = fs.readFileSync(filePath, 'utf-8');

// 存储每个请求类型的执行时间
const requestTimes: { [key: string]: number[] } = {};

// 解析每一行数据
content.split('\n').forEach(line => {
    const parts = line.trim().split(',');
    if (parts.length >= 3) {
        const requestType = parts[1].trim();
        const duration = parseFloat(parts[2].trim());
        if (!isNaN(duration)) {
            if (!requestTimes[requestType]) {
                requestTimes[requestType] = [];
            }
            requestTimes[requestType].push(duration);
        }
    }
});

// 计算每个请求类型的平均执行时间
const averageTimes: { [key: string]: number } = {};
for (const requestType in requestTimes) {
    if (requestTimes.hasOwnProperty(requestType)) {
        const durations = requestTimes[requestType];
        const averageTime = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
        averageTimes[requestType] = averageTime;
    }
}

// 输出结果
for (const requestType in averageTimes) {
    if (averageTimes.hasOwnProperty(requestType)) {
        console.log(`${requestType}: ${averageTimes[requestType].toFixed(2)} ms`);
    }
}