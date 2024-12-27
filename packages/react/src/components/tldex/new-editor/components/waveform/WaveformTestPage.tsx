// import React, { useEffect, useRef, useState } from "react";
// import { WaveformRenderer } from "./TestPage";

// // Main React Component
// const WaveformTestPage = () => {
//   const canvasRef = useRef(null);
//   const rendererRef = useRef<WaveformRenderer | null>(null);
//   const [timeRange, setTimeRange] = useState({ start: 0, end: 1 });
//   const [waveformData, setWaveformData] = useState(null);
//   const [maxTime, setMaxTime] = useState(1);

//   useEffect(() => {
//     if (canvasRef.current && !rendererRef.current) {
//       rendererRef.current = new WaveformRenderer(canvasRef.current);
//     }
//   }, []);

//   useEffect(() => {
//     if (waveformData && rendererRef.current) {
//       rendererRef.current.setData(waveformData);
//       const lastTime = waveformData[waveformData.length - 1][0];
//       setMaxTime(lastTime);
//       setTimeRange({ start: 0, end: lastTime });
//     }
//   }, [waveformData]);

//   useEffect(() => {
//     const renderer = rendererRef.current;
//     if (renderer && timeRange.end != null) {
//       renderer.resize();
//       renderer.renderRange(timeRange.start, timeRange.end);
//     }
//   }, [timeRange]);

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         try {
//           const json = JSON.parse(e.target.result);
//           setWaveformData(json.waveform);
//         } catch (error) {
//           console.error("Error parsing JSON:", error);
//         }
//       };
//       reader.readAsText(file);
//     }
//   };

//   // Ensure start time is never greater than end time
//   const handleStartChange = (value) => {
//     const newStart = Math.min(value, timeRange.end - 0.1);
//     setTimeRange((prev) => ({ ...prev, start: newStart }));
//   };

//   // Ensure end time is never less than start time
//   const handleEndChange = (value) => {
//     const newEnd = Math.max(value, timeRange.start + 0.1);
//     setTimeRange((prev) => ({ ...prev, end: newEnd }));
//   };

//   return (
//     <Card className="w-full max-w-4xl">
//       <CardContent className="space-y-4 p-6">
//         <div>
//           <input
//             type="file"
//             accept=".json"
//             onChange={handleFileChange}
//             className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
//           />
//         </div>

//         <div className="space-y-2">
//           <div className="flex items-center space-x-2">
//             <span className="w-16">Start:</span>
//             <input
//               type="range"
//               min={0}
//               max={maxTime}
//               step="0.1"
//               value={timeRange.start || 0}
//               onChange={(e) => handleStartChange(parseFloat(e.target.value))}
//               className="flex-1"
//             />
//             <span className="w-12 text-right">
//               {(timeRange.start || 0).toFixed(1)}s
//             </span>
//           </div>

//           <div className="flex items-center space-x-2">
//             <span className="w-16">End:</span>
//             <input
//               type="range"
//               min={0}
//               max={maxTime}
//               step="0.1"
//               value={timeRange.end || 1}
//               onChange={(e) => handleEndChange(parseFloat(e.target.value))}
//               className="flex-1"
//             />
//             <span className="w-12 text-right">
//               {(timeRange.end || 1).toFixed(1)}s
//             </span>
//           </div>
//         </div>

//         <canvas
//           ref={canvasRef}
//           className="h-48 w-full rounded-md border bg-gray-50"
//         />
//       </CardContent>
//     </Card>
//   );
// };

// export default WaveformTestPage;
