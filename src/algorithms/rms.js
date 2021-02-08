//Rate-monotonic scheduling  (https://en.wikipedia.org/wiki/Rate-monotonic_scheduling)
const rmsSolve = (processes, tillNum) => {
    const uti = processes.reduce(
        (acc, proc) => acc + proc.execTime / proc.period,
        0
    );
    const n = processes.length;
    const limit = n * (Math.pow(2, 1 / n) - 1);
    console.log(uti);
    console.log(limit);
    //Fails if uti > 0.6932
    const queue = processes.map((p) => ({ ...p, instace: 1 }));
    const op = [];
    const instances = Array.from(Array(processes.length), (_) => 2);
    let currProc = null;
    for (let i = 0; i < tillNum; i++) {
        let maxPriProc = null;
        let index = -1;
        queue.forEach((process, j) => {
            if (maxPriProc == null) {
                maxPriProc = process;
                index = j;
                return;
            }
            if (maxPriProc.execTime > process.execTime) {
                maxPriProc = process;
                index = j;
            }
        });
        if (maxPriProc != null) {
            if (currProc == null || currProc?.execTime > maxPriProc?.execTime) {
                queue.splice(index, 1);
                if (currProc) queue.push({ ...currProc });
                maxPriProc.startFrom = i;
                currProc = maxPriProc;
                currProc.completed = 0;
                op.push(maxPriProc);
            }
        }
        // eslint-disable-next-line no-loop-func
        processes.forEach((process, pi) => {
            if ((i + 1) % process.period === 0) {
                if (queue.some((p) => p.pid === process.pid)) {
                    //TODO: Fails
                    console.log(`Fails at ${i + 1} for proc ${process.pid}`);
                    i = tillNum;
                } else {
                    queue.push({ ...process, instace: instances[pi]++ });
                }
            }
        });
        if (currProc != null) {
            currProc.processed++;
            currProc.completed++;
            if (currProc.processed >= currProc.execTime) {
                currProc = null;
            }
        }
    }
    return op;
};
export default rmsSolve;
