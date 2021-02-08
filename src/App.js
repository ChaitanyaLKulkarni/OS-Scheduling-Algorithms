import { useState, useRef, useEffect } from "react";
import Select from "react-select";
import processInfo from "./processInfo";
import rmsSolve from "./algorithms/rms";
import edfSolve from "./algorithms/edf";

import "./App.css";
import { queryByLabelText } from "@testing-library/react";

const osOptions = [{ value: "rtos", label: "RTOS" }];

const scheOptions = {
    rtos: [
        { value: "rms", label: "Rate-monotonic scheduling" },
        { value: "edf", label: "Earliest deadline first scheduling" },
    ],
};

function App() {
    const [processes, setProcesses] = useState([]); //Input of Process Tabel
    const [queue, setQueue] = useState([]); //current queue
    const [op, setOp] = useState([]); //Op used for viz
    const [nPid, setNPid] = useState("T1");
    const [nPer, setNPer] = useState("");
    const [nExec, setNExec] = useState("");
    const [tillNum, setTillNum] = useState(50);
    const [osOpt, setOsOpt] = useState(osOptions[0]);
    const [scheOpt, setSceOpt] = useState(scheOptions[osOptions[0].value][0]);
    const dist = 25;
    const he = 10;
    const SPEED = 1000;

    const pidRef = useRef();
    const nprocs = useRef(1);
    const [isRunning, setIsRunning] = useState(false);
    const runningRef = useRef(isRunning);
    const [currTime, setCurrTime] = useState(0);

    const nextStep = () => {
        if (!runningRef.current) return;
        setCurrTime((t) => {
            if (t >= tillNum || (t >= queue.length && queue.length > 0)) {
                setIsRunning(false);
                runningRef.current = false;
                return t;
            }
            return t + 1;
        });
    };

    useEffect(() => {
        if (!runningRef.current) return;
        setTimeout(nextStep, SPEED);
    });
    const addNewProcess = () => {
        setProcesses((c) => [...c, new processInfo(nPid, nPer, nExec)]);
        setNPid("T" + ++nprocs.current);
        setNPer("");
        setNExec("");
        pidRef.current.focus();
    };

    const startSim = () => {
        let resOp = [];
        let tempQ = [];
        let isOk = true;
        switch (scheOpt.value) {
            case "rms":
                [resOp, tempQ] = rmsSolve(processes, tillNum);
                break;
            case "edf":
                [resOp, tempQ] = edfSolve(processes, tillNum);
                break;
            default:
                console.log("Wrongs");
                isOk = false;
                break;
        }
        if (isOk) {
            setCurrTime(0);
            setOp(resOp);
            setQueue(tempQ);
            nextStep();
        } else {
            setIsRunning(!runningRef.current);
            runningRef.current = !runningRef.current;
        }
    };
    return (
        <div id="app">
            <div id="inputs">
                <Select
                    options={osOptions}
                    onChange={(opt) => {
                        setOsOpt(opt);
                    }}
                    isSearchable={false}
                    value={osOpt}
                    className="select"
                />
                <Select
                    options={scheOptions[osOpt.value]}
                    onChange={(opt) => {
                        setSceOpt(opt);
                    }}
                    value={scheOpt}
                    isSearchable={false}
                    className="select"
                />
                <div className="tables">
                    <table id="process_in" className="table">
                        <tbody>
                            <tr>
                                <th>Process</th>
                                <th>Period</th>
                                <th>Execution Time</th>
                            </tr>
                            {processes.map((proces, i) => (
                                <tr key={proces.pid}>
                                    <td>
                                        {proces.pid}{" "}
                                        <span
                                            style={{
                                                backgroundColor: proces.color,
                                            }}
                                        >
                                                 
                                        </span>
                                    </td>
                                    <td>{proces.period}</td>
                                    <td>{proces.execTime}</td>
                                </tr>
                            ))}
                            <tr>
                                <td>
                                    <input
                                        ref={pidRef}
                                        value={nPid}
                                        onChange={(e) =>
                                            setNPid(e.target.value)
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        value={nPer}
                                        onChange={(e) =>
                                            setNPer(e.target.value)
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        value={nExec}
                                        onChange={(e) =>
                                            setNExec(e.target.value)
                                        }
                                    />
                                    <button
                                        onClick={addNewProcess}
                                        style={{ marginLeft: "10px" }}
                                    >
                                        +
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div id="queue">
                        {queue.length && currTime <= queue.length && (
                            <table>
                                <tbody>
                                    <tr>
                                        <th colSpan={3}>Queue</th>
                                    </tr>
                                    <tr>
                                        <th>Process</th>
                                        <th>Current Deadline</th>
                                        <th>Current Processed</th>
                                    </tr>
                                    {queue[
                                        Math.min(currTime, queue.length - 1)
                                    ][0] ? (
                                        <tr
                                            style={{
                                                backgroundColor:
                                                    "rgba(87, 255, 120,0.2)",
                                            }}
                                        >
                                            <th>
                                                {
                                                    queue[
                                                        Math.min(
                                                            currTime,
                                                            queue.length - 1
                                                        )
                                                    ][0].pid
                                                }
                                            </th>
                                            <th>
                                                {queue[
                                                    Math.min(
                                                        currTime,
                                                        queue.length - 1
                                                    )
                                                ][0].period *
                                                    queue[
                                                        Math.min(
                                                            currTime,
                                                            queue.length - 1
                                                        )
                                                    ][0].instace}
                                            </th>
                                            <th>
                                                {
                                                    queue[
                                                        Math.min(
                                                            currTime,
                                                            queue.length - 1
                                                        )
                                                    ][0].processed
                                                }
                                            </th>
                                        </tr>
                                    ) : (
                                        <tr
                                            style={{
                                                backgroundColor:
                                                    "rgba(87, 255, 120,0.2)",
                                            }}
                                        >
                                            <td>&nbsp;</td>
                                            <td> &nbsp;</td>
                                            <td> &nbsp;</td>
                                        </tr>
                                    )}
                                    {queue[
                                        Math.min(currTime, queue.length - 1)
                                    ][1].map((p, i) => (
                                        <tr key={`queue-${i}`}>
                                            <td>{p.pid}</td>
                                            <td>{p.period * p.instace}</td>
                                            <td>{p.processed}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
                <br />
                Simulate till Time: {tillNum} {"   "}
                <input
                    type="range"
                    min="30"
                    max="200"
                    value={tillNum}
                    className="slider"
                    onChange={(e) => {
                        setTillNum(e.target.value);
                    }}
                />
                <br />
                <button
                    onClick={() => {
                        setIsRunning(!isRunning);
                        runningRef.current = !isRunning;
                        if (!isRunning) {
                            startSim();
                        }
                    }}
                >
                    {isRunning ? "STOP" : "START"}
                </button>
            </div>

            {/* Viz */}
            <div className="svg_container">
                <svg viewBox={`0 0 ${tillNum * 25.5} 200`}>
                    <g>
                        <line
                            x1="0"
                            y1="100"
                            x2="100%"
                            y2="100"
                            className="line"
                        />

                        {Array.from(Array(200)).map((_, i) => {
                            return (
                                <g key={"lt" + i.toString()}>
                                    <line
                                        x1={dist * (i + 1)}
                                        y1={100 - he}
                                        x2={dist * (i + 1)}
                                        y2={100 + he}
                                        className="line"
                                    />
                                    <text
                                        x={dist * (i + 1)}
                                        y={120 + he}
                                        fill="black"
                                        fontSize="12"
                                    >
                                        {i + 1}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                    <g>
                        {op.map(
                            (p, i) =>
                                p.startFrom <= currTime && (
                                    <g
                                        key={
                                            "op" +
                                            p.pid.toString() +
                                            p.startFrom.toString()
                                        }
                                    >
                                        <rect
                                            x={dist * p.startFrom}
                                            y={95 - he}
                                            width={
                                                dist *
                                                (p.completed + p.startFrom >
                                                currTime
                                                    ? currTime - p.startFrom
                                                    : p.completed)
                                            }
                                            height={(he + 5) * 2}
                                            className="op"
                                            fill={p.color + "80"}
                                        />

                                        <text
                                            x={dist * p.startFrom + 5}
                                            y={96}
                                            fontSize="11"
                                        >
                                            {p.instace}
                                        </text>
                                    </g>
                                )
                        )}
                    </g>
                </svg>
            </div>
        </div>
    );
}

export default App;
