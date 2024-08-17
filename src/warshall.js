import React, { useState } from 'react';

function FloydWarshall() {
    const [graph, setGraph] = useState([]);
    const [vertices, setVertices] = useState(0);
    const [distances, setDistances] = useState([]);
    const [nextNode, setNextNode] = useState([]);
    const [paths, setPaths] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [iterations, setIterations] = useState([]);

    const handleVerticesChange = (e) => {
        const v = parseInt(e.target.value);
        if (!isNaN(v) && v > 0) {
            setVertices(v);
            setGraph(Array(v).fill(null).map(() => Array(v).fill(0)));
        }
    };

    const handleGraphChange = (row, col, value) => {
        const newGraph = [...graph];
        const parsedValue = value.trim().toLowerCase();
        if (parsedValue === 'inf') {
            newGraph[row][col] = Infinity;
        } else {
            const numericValue = parseFloat(parsedValue);
            newGraph[row][col] = isNaN(numericValue) ? Infinity : numericValue;
        }
        setGraph(newGraph);
    };

    const floydWarshall = () => {
        let dist = Array.from({ length: vertices }, () => Array(vertices).fill(Infinity));
        let next = Array.from({ length: vertices }, () => Array(vertices).fill(null));

        for (let i = 0; i < vertices; i++) {
            dist[i][i] = 0;
        }

        for (let u = 0; u < vertices; u++) {
            for (let v = 0; v < vertices; v++) {
                if (graph[u][v] !== Infinity) {
                    dist[u][v] = graph[u][v];
                    next[u][v] = v;
                }
            }
        }

        const iterationSnapshots = [];

        for (let k = 0; k < vertices; k++) {
            for (let i = 0; i < vertices; i++) {
                for (let j = 0; j < vertices; j++) {
                    if (dist[i][j] > dist[i][k] + dist[k][j]) {
                        dist[i][j] = dist[i][k] + dist[k][j];
                        next[i][j] = next[i][k];
                    }
                }
            }

            // Save the state of the distance matrix after each iteration
            iterationSnapshots.push(dist.map(row => row.slice()));
        }

        setDistances(dist);
        setNextNode(next);
        calculatePaths(next, dist);
        setIterations(iterationSnapshots);
        setShowResults(true);
    };

    const calculatePaths = (next, dist) => {
        const allPaths = [];

        for (let i = 0; i < vertices; i++) {
            for (let j = 0; j < vertices; j++) {
                if (i !== j) {
                    const path = constructPath(next, i, j);
                    if (path.length > 0) {
                        allPaths.push({
                            from: i + 1,  // Convert to 1-based indexing
                            to: j + 1,    // Convert to 1-based indexing
                            path: path.map(p => p + 1).join(' -> '),  // Convert each vertex to 1-based indexing
                            distance: dist[i][j]
                        });
                    }
                }
            }
        }

        setPaths(allPaths);
    };

    const constructPath = (next, start, end) => {
        if (next[start][end] === null) {
            return [];
        }
        const path = [start];
        while (start !== end) {
            start = next[start][end];
            if (start === null) {
                return [];
            }
            path.push(start);
        }
        return path;
    };

    return (
        <div style={{paddingLeft:"25px"}}>
            <h1>Floyd-Warshall Algorithm</h1>

            <div>
                <label>Number of vertices: </label>
                <input
                    type="number"
                    value={vertices}
                    onChange={handleVerticesChange}
                    min="1"
                />
            </div>

            {vertices > 0 && (
                <div>
                    <h3>Enter Adjacency Matrix (use 'inf' for infinity):</h3>
                    {graph.map((row, i) => (
                        <div key={i}>
                            {row.map((value, j) => (
                                <input
                                    key={j}
                                    type="text"
                                    value={value === Infinity ? 'inf' : value}
                                    onChange={(e) => handleGraphChange(i, j, e.target.value)}
                                    style={{ width: '50px', margin: '2px' }}
                                />
                            ))}
                        </div>
                    ))}
                    <button onClick={floydWarshall}>Calculate Shortest Paths</button>
                </div>
            )}
            {showResults && (
                <div>
                    <h3>Distance Matrix Iterations:</h3>

                    {iterations.map((iteration, index) => (
                        <div key={index}>
                            <h4>Iteration {index + 1}:</h4>
                            <table border="1" style={{ marginBottom: '20px', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr>
                                        <th style={{ padding: '5px' }}></th> {/* Empty cell */}
                                        {iteration[0].map((_, j) => (
                                            <th key={`header-${j}`} style={{ padding: '5px' }}>{j + 1}</th>
                                        ))}
                                    </tr>
                                    {iteration.map((row, i) => (
                                        <tr key={`row-${i}`}>
                                            <th style={{ padding: '5px' }}>{i + 1}</th>
                                            {row.map((value, j) => (
                                                <td key={`cell-${i}-${j}`} style={{ padding: '5px', textAlign: 'center' }}>
                                                    {value === Infinity ? 'inf' : value}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}




                    <h3>Final Shortest Path Matrix:</h3>
                    <table border="1" style={{ marginBottom: '20px', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <th style={{ padding: '5px' }}></th> {/* Empty cell */}
                                {distances[0].map((_, j) => (
                                    <th key={`final-header-${j}`} style={{ padding: '5px' }}>{j + 1}</th>
                                ))}
                            </tr>
                            {distances.map((row, i) => (
                                <tr key={`final-row-${i}`}>
                                    <th style={{ padding: '5px' }}>{i + 1}</th>
                                    {row.map((value, j) => (
                                        <td key={`final-cell-${i}-${j}`} style={{ padding: '5px', textAlign: 'center' }}>
                                            {value === Infinity ? 'inf' : value}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>


                    <h3>Paths:</h3>
                    {paths.map((path, index) => (
                        <div key={index}>
                            <p>
                                Shortest path from {path.from} to {path.to}: {path.path}, Distance: {path.distance}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FloydWarshall;
