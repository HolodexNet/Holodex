// WebGL Waveform Renderer class
// [Previous WaveformRenderer class implementation remains exactly the same]
export class WaveformRenderer {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  data: [number, number][];
  startTime: number;
  endTime: number;
  program: WebGLProgram;
  positionLocation: number;
  resolutionLocation: WebGLUniformLocation | null;
  timeRangeLocation: WebGLUniformLocation | null;
  positionBuffer: WebGLBuffer | null;
  /**
   * Constructor for the WebGL Waveform Renderer class
   * @param {HTMLCanvasElement} canvas The canvas element to render to
   */
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl") as WebGLRenderingContext;
    if (!this.gl) throw new Error("WebGL not supported");

    const gl = this.gl;
    // Create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) throw new Error("Vertex Shader Error");
    gl.shaderSource(vertexShader, this.vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShader) throw new Error("Fragment Shader Error");
    gl.shaderSource(fragmentShader, this.fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Create program
    const program = gl.createProgram();
    if (!program) throw new Error("WebGL not supported");
    this.program = program;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Get locations
    this.positionLocation = gl.getAttribLocation(program, "a_position");
    this.resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    this.timeRangeLocation = gl.getUniformLocation(program, "u_timeRange");

    this.positionBuffer = gl.createBuffer();

    this.data = [] as [number, number][];
    this.startTime = 0;
    this.endTime = 1;
  }

  // Vertex shader program
  vertexShaderSource = `
    attribute vec2 a_position;
    uniform vec2 u_resolution;
    uniform vec2 u_timeRange;
    
    void main() {
      // Convert time to normalized device coordinates
      float x = (a_position.x - u_timeRange.x) / (u_timeRange.y - u_timeRange.x);
      x = x * 2.0 - 1.0;
      
      // Convert amplitude to normalized device coordinates
      float y = a_position.y / -30.0; // Assuming max RMS is around -30
      
      gl_Position = vec4(x, y, 0, 1);
    }
  `;

  // Fragment shader program
  fragmentShaderSource = `
    precision mediump float;
    
    void main() {
      gl_FragColor = vec4(0.1, 0.6, 0.9, 1);
    }
  `;

  initBuffers() {
    const gl = this.gl;
    this.positionBuffer = gl.createBuffer();
  }

  setData(waveformData: [number, number][]) {
    this.data = waveformData;
    this.startTime = waveformData[0][0];
    this.endTime = waveformData[waveformData.length - 1][0];
    this.updateBuffers();
  }

  updateBuffers() {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    const positions = new Float32Array(this.data.flat());
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  }

  renderRange(start: number, end: number) {
    const gl = this.gl;

    // Clear and set viewport
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Use shader program
    gl.useProgram(this.program);

    // Set up attributes
    gl.enableVertexAttribArray(this.positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Set uniforms
    gl.uniform2f(this.resolutionLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform2f(this.timeRangeLocation, start, end);

    // Draw
    gl.drawArrays(gl.LINE_STRIP, 0, this.data.length);
  }

  resize() {
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;

    if (
      this.canvas.width !== displayWidth ||
      this.canvas.height !== displayHeight
    ) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
    }
  }
}
