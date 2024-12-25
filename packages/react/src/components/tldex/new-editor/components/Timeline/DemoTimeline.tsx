// import React, { useEffect, useRef } from "react";
// import { Timeline } from ".";

// interface TimelineAlignment {
//   begin: number;
//   end: number;
//   text: string;
//   startIndex?: number;
//   endIndex?: number;
// }

// interface TimelineProps {
//   alignments: TimelineAlignment[];
//   duration: number;
//   onAlignmentChange?: (alignments: TimelineAlignment[]) => void;
//   onTimeUpdate?: (time: number) => void;
//   initialTime?: number;
//   autoScroll?: boolean;
// }

// const defaultColors = {
//   selected: "#3b82f6", // Bright blue - stands out for selection
//   active: "#22c55e", // Vibrant green - clear activity indicator
//   hover: "#64748b", // Muted slate - subtle hover state
//   default: "#475569", // Darker slate - unselected items
//   background: "#0f172a", // Deep navy - dark background
//   text: "#e2e8f0", // Light gray - readable text
//   tooltip: "#94a3b8", // Medium slate - tooltip background
//   scrollTrack: "#1e293b", // Slightly lighter than background
//   scrollThumb: "#475569", // Visible but not distracting
//   timeCursor: "#ef4444", // Bright red - clear position indicator
//   timeGrid: "#334155", // Dark slate - subtle grid lines
// };

// const TimelineComponent: React.FC<TimelineProps> = ({
//   alignments,
//   duration,
//   onAlignmentChange,
//   onTimeUpdate,
//   initialTime = 0,
//   autoScroll = true,
// }) => {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const bgCanvasRef = useRef<HTMLCanvasElement>(null);
//   const timelineRef = useRef<Timeline | null>(null);
//   const playerRef = useRef({
//     currentTime: initialTime,
//     play: () => {},
//   });

//   useEffect(() => {
//     if (!canvasRef.current || !bgCanvasRef.current || !containerRef.current)
//       return;

//     if (timelineRef.current)
//       return () => {
//         timelineRef.current?.destroy();
//         timelineRef.current = null;
//       };

//     timelineRef.current = new Timeline(
//       canvasRef.current,
//       bgCanvasRef.current,
//       alignments,
//       duration,
//       () => playerRef.current,
//       (newAlignments: TimelineAlignment[]) => {
//         onAlignmentChange?.(newAlignments);
//       },
//       () => {},
//       (ns) => {},
//       {
//         colors: defaultColors,
//         autoScroll,
//       },
//       (time: number) => {
//         console.log(time);
//         // in a realistic use case, this would be used to update the player
//         // and then it'll come back around and update the currentTime after the player is updated.
//         playerRef.current.currentTime = time;
//       },
//       (time: number) => {
//         playerRef.current.currentTime = time;
//         // onTimeUpdate?.(time);
//       },
//     );

//     return () => {
//       timelineRef.current?.destroy();
//       timelineRef.current = null;
//     };
//   }, []);

//   return (
//     <div ref={containerRef} className="relative h-24 w-full p-0">
//       <canvas
//         ref={bgCanvasRef}
//         id="bg-tl-canvas"
//         className="absolute left-0 top-0 h-full w-full"
//       />
//       <canvas
//         ref={canvasRef}
//         id="tl-canvas"
//         className="absolute left-0 top-0 h-full w-full"
//       />
//     </div>
//   );
// };

// // Demo implementation
// const DemoTimeline: React.FC = () => {
//   const [currentTime, setCurrentTime] = React.useState(0);
//   const [alignments, setAlignments] = React.useState<TimelineAlignment[]>([
//     { begin: 0, end: 5, text: "Segment 1" },
//     { begin: 7, end: 15, text: "Segment 2" },
//     { begin: 18, end: 25, text: "Segment 3" },
//   ]);

//   return (
//     <div className="space-y-4">
//       <div className="rounded border border-base-6">
//         <TimelineComponent
//           alignments={alignments}
//           duration={30}
//           initialTime={currentTime}
//           onTimeUpdate={setCurrentTime}
//           onAlignmentChange={setAlignments}
//         />
//       </div>
//       <div className="text-sm">Current Time: {currentTime.toFixed(2)}s</div>
//     </div>
//   );
// };

// export default DemoTimeline;
