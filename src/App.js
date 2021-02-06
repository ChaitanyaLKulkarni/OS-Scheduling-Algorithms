import { useState, useCallback, useRef, useEffect } from "react";
import produce from "immer";
import rmsSolve from "./algorithms/rms";
import "./App.css";

function getRandomColor() {
    var letters = "0234678ABDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
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

function App() {
    const [processes, setProcesses] = useState([]); //Input of Process Tabel
    // const [queue, setQueue] = useState([]); //current queue
    const [op, setOp] = useState([]); //Op used for viz
    const [nPid, setNPid] = useState("");
    const [nPer, setNPer] = useState("");
    const [nExec, setNExec] = useState("");

    const tillNum = 50;
    const dist = 25;
    const he = 10;
    const SPEED = 800;

    const [isRunning, setIsRunning] = useState(false);
    const runningRef = useRef(isRunning);
    const [currTime, setCurrTime] = useState(0);

    const nextStep = () => {
        if (!runningRef.current) return;
        setCurrTime((t) => {
            if (t >= tillNum) {
                setIsRunning(false);
                runningRef.current = false;
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
        setNPid("");
        setNPer("");
        setNExec("");
    };
    return (
        <div id="app">
            <div id="inputs">
                <select id="os_type">
                    <option value="rtos">rtos</option>
                </select>
                <select id="algo">
                    <option value="rms">
                        {/* rate-monotonic scheduling https://en.wikipedia.org/wiki/Rate-monotonic_scheduling */}
                        RMS
                    </option>
                </select>
                <table id="process_in">
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
                                    value={nPid}
                                    onChange={(e) => setNPid(e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    value={nPer}
                                    onChange={(e) => setNPer(e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    value={nExec}
                                    onChange={(e) => setNExec(e.target.value)}
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
                <button
                    onClick={() => {
                        setIsRunning(!isRunning);
                        runningRef.current = !isRunning;
                        if (!isRunning) {
                            setCurrTime(0);
                            setOp(rmsSolve(processes, tillNum));
                            nextStep();
                        }
                    }}
                >
                    {isRunning ? "STOP" : "START"}
                </button>
            </div>

            {/* Viz */}
            <div className="svg_container">
                <svg viewBox="0 0 1300 200">
                    <g>
                        <line
                            x1="0"
                            y1="100"
                            x2="1300"
                            y2="100"
                            className="line"
                        />
                        {Array.from(Array(tillNum)).map((_, i) => {
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
