import {FgBlue, FgRed, Reset} from "@http4t/bidi/util/ascii";

function pad(value: any, count: number = 2) {
    return value.toString().padStart(count, '0');
}

function color(message: string, color: string) {
    return `${color}${message}${Reset}`
}

export function deleteMeLog(from: string, message: string, ...optionalParams: any[]) {
    if(process?.env.VERBOSE_LOGGING == 'true'){
        const t = new Date();
        const time = `${pad(t.getSeconds())}:${pad(t.getSeconds())}.${pad(t.getMilliseconds(), 3)}`;
        console.log(`${color(time, FgRed)} ${pad(color(`[${from}]`, FgBlue), 15)}\n\n${message}`, ...optionalParams);
    }
}
