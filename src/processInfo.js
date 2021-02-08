function getRandomColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
}
class processInfo {
    constructor(pid, period, execTime, color) {
        this.pid = pid;
        this.period = +period; //casting of string to number
        this.execTime = +execTime;
        this.color = color || getRandomColor(); //Getnerate randiom color for the process
        this.completed = 0;
        this.processed = 0;
        this.startFrom = 0;
    }
}
export default processInfo;
