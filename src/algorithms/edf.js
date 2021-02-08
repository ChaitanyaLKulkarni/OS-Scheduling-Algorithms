//Earliest deadline first scheduling (https://en.wikipedia.org/wiki/Earliest_deadline_first_scheduling)
const edfSolve = (processes, tillNum) => {
    const uti = processes.reduce(
        (acc, proc) => acc + proc.execTime / proc.period,
        0
    );
    console.log(uti);
    //Fails if uti > 1
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
            //Having earliest dealine (period * instace)
            if (
                maxPriProc.period * maxPriProc.instace >
                process.period * process.instace
            ) {
                maxPriProc = process;
                index = j;
            }
        });
        if (maxPriProc != null) {
            //there is no currProc or currProc's deadline is greater than maxPrioProc's
            if (
                currProc == null ||
                currProc.period * currProc.instace >
                    maxPriProc.period * maxPriProc.instace
            ) {
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
export default edfSolve;
