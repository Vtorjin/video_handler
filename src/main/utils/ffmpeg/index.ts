export const renderConcatCode = () => {
    return `
    @echo off\n
    for %%i in ("%CD%") do set "dir_name=%%~ni"\n
    set "output_file_name=%dir_name%.mp4"\n
    ffmpeg -allowed_extensions ALL -i index.m3u8 -c copy "%output_file_name%"`
}

// 计算某段文字中时间 占总时间的比重
export const calculateDurationPercentage = (infoString: string, totalDuration: number) => {
    // 提取第一个字符串中的时间值
    const regex = /time=(\d{1,3}):(\d{0,2}):(\d{0,2}\.\d{0,2})/;
    const match = infoString.match(regex);

    if (match) {
        // 将时间值转换为秒
        const hours = parseInt(match[1]) || 0;
        const minutes = parseInt(match[2]) || 0;
        const seconds = parseFloat(match[3]) || 0;
        const durationInSeconds = hours * 3600 + minutes * 60 + seconds;

        // 计算时间占总时长的比重
        const percentage = (durationInSeconds / totalDuration) * 100;
        return parseFloat(percentage.toFixed(3));
    }

    return null; // 如果正则匹配失败，则返回null或者合适的错误码
}