'use strict';

// Global variables that are set and used
// across the application
let verticesSize,
    vertices,
    adapter,
    context,
    colorAttachment,
    colorTextureView,
    colorTexture,
    depthTexture,
    code,
    computeCode,
    shaderDesc,
    colorState,
    shaderModule,
    pipeline,
    renderPassDesc,
    commandEncoder,
    passEncoder,
    device,
    drawingTop,
    drawingLeft,
    canvas,
    bary,
    points,
    uniformValues,
    uniformBindGroup,
    indices;

let materialCount = 16;
let atlasWidth = 4;
  
// buffers
let myVertexBuffer = null;
let myBaryBuffer = null;
let myIndexBuffer = null;
let uniformBuffer;

// Other globals with default values;
// var division1 = 3;
// var division2 = 1;
// var updateDisplay = true;
const TX = 0;
const TY = 1;
const TZ = 2;
const TW = 3;
const RX = 4;
const RY = 5;
const RZ = 6;
const RW = 7;
const ZM = 8;
var cameraDataReset = [
	-10-32, -15-32, 40-32, 0,
	-0.5, 0.3, 0, 0,
	1, 0, 0, 0
];
var cameraData = cameraDataReset;

// set up the shader var's
function setShaderInfo() {
    // set up the shader code var's
    code = document.getElementById('shader').innerText;
    shaderDesc = { code: code };
    shaderModule = device.createShaderModule(shaderDesc);
    colorState = {
        format: 'bgra8unorm'
    };

    // set up depth
    // depth shading will be needed for 3d objects in the future
    depthTexture = device.createTexture({
        size: [canvas.width, canvas.height],
        format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
}

// Create a program with the appropriate vertex and fragment shaders
async function initProgram() {

	// Check to see if WebGPU can run
	if (!navigator.gpu) {
	    console.error("WebGPU not supported on this browser.");
	    return;
	}

    // get webgpu browser software layer for graphics device
    adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        console.error("No appropriate GPUAdapter found.");
        return;
    }

    // get the instantiation of webgpu on this device
    device = await adapter.requestDevice();
    if (!device) {
        console.error("Failed to request Device.");
        return;
    }

    // configure the canvas
    context = canvas.getContext('webgpu');
    const canvasConfig = {
        device: device,
        // format is the pixel format
        format: navigator.gpu.getPreferredCanvasFormat(),
        // usage is set up for rendering to the canvas
        usage:
            GPUTextureUsage.RENDER_ATTACHMENT,
        alphaMode: 'opaque'
    };
    context.configure(canvasConfig);

}

// https://webgpufundamentals.org/webgpu/lessons/webgpu-importing-textures.html
async function loadImageBitmap(url) {
    const res = await fetch(url);
    const blob = await res.blob();
    return await createImageBitmap(blob, { colorSpaceConversion: 'none' });
}

// general call to make and bind a new object based on current
// settings..Basically a call to shape specfic calls in cgIshape.js
async function rebuildMesh() {
    // Call the functions in an appropriate order
    setShaderInfo();

    // clear your points and elements
    points = [];
    indices = [];
    bary = [];
    
    // make your shape based on type
	generateVoxelsCPU();
	doAllMeshing();

    // create and bind vertex buffer

    // set up the attribute we'll use for the vertices
    const vertexAttribDesc = {
        shaderLocation: 0, // @location(0) in vertex shader
        offset: 0,
        format: 'float32x3' // 3 floats: x,y,z
    };

    // this sets up our buffer layout
    const vertexBufferLayoutDesc = {
        attributes: [vertexAttribDesc],
        arrayStride: Float32Array.BYTES_PER_ELEMENT * 3, // sizeof(float) * 3 floats
        stepMode: 'vertex'
    };

    // buffer layout and filling
    const vertexBufferDesc = {
        size: points.length * Float32Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true
    };
    myVertexBuffer = device.createBuffer(vertexBufferDesc);
    let writeArray =
        new Float32Array(myVertexBuffer.getMappedRange());

    writeArray.set(points); // this copies the buffer
    myVertexBuffer.unmap();

    // create and bind bary buffer
	// this is being used as UVs now
    const baryAttribDesc = {
        shaderLocation: 1, // @location(1) in vertex shader
        offset: 0,
        format: 'float32x3' // 3 floats: x,y,z
    };

    // this sets up our buffer layout
    const myBaryBufferLayoutDesc = {
        attributes: [baryAttribDesc],
        arrayStride: Float32Array.BYTES_PER_ELEMENT * 3, // 3 bary's
        stepMode: 'vertex'
    };

    // buffer layout and filling
    const myBaryBufferDesc = {
        size: bary.length * Float32Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true
    };
    myBaryBuffer = device.createBuffer(myBaryBufferDesc);
    let writeBaryArray =
        new Float32Array(myBaryBuffer.getMappedRange());

    writeBaryArray.set(bary); // this copies the buffer
    myBaryBuffer.unmap();

    // setup index buffer

    // first guarantee our mapped range is a multiple of 4
    // mainly necessary becauses uint32 is only 2 and not 4 bytes
    if (indices.length % 2 != 0) {
        indices.push(indices[indices.length-1]);
    }
    const myIndexBufferDesc = {
        size: indices.length * Uint32Array.BYTES_PER_ELEMENT,  
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true
    };
    myIndexBuffer = device.createBuffer(myIndexBufferDesc);
    let writeIndexArray =
        new Uint32Array(myIndexBuffer.getMappedRange());

    writeIndexArray.set(indices); // this copies the buffer
    myIndexBuffer.unmap();

    // Set up the uniform var
    let uniformBindGroupLayout = device.createBindGroupLayout({
        entries: [
            {binding: 0, visibility: GPUShaderStage.VERTEX, buffer: {}},
            {binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {}},
            {binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: {}}
        ]
    });

    // set up the pipeline layout
    const pipelineLayoutDesc = { bindGroupLayouts: [uniformBindGroupLayout] };
    const layout = device.createPipelineLayout(pipelineLayoutDesc);

    // pipeline desc
    const pipelineDesc = {
        layout,
        vertex: {
            module: shaderModule,
            entryPoint: 'vs_main',
            buffers: [vertexBufferLayoutDesc, myBaryBufferLayoutDesc]
        },
        fragment: {
            module: shaderModule,
            entryPoint: 'fs_main',
            targets: [colorState]
        },
        depthStencil: {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus',
        },
        primitive: {
            topology: 'triangle-list', //<- MUST change to draw lines! 
            // topology: 'point-list', //<- MUST change to draw lines! 
            frontFace: 'cw', // this doesn't matter for lines
            cullMode: 'back'
        }
    };

    pipeline = device.createRenderPipeline(pipelineDesc);

    uniformValues = new Float32Array(cameraData);
    uniformBuffer = device.createBuffer({
        size: uniformValues.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
	
    // copy the values from JavaScript to the GPU
    device.queue.writeBuffer(uniformBuffer, 0, uniformValues);
	
	const url = 'atlas.png';
	const source = await loadImageBitmap(url);
	const texture = device.createTexture({
		label: url,
		format: 'rgba8unorm',
		size: [source.width, source.height],
		usage: GPUTextureUsage.TEXTURE_BINDING |
			   GPUTextureUsage.COPY_DST |
			   GPUTextureUsage.RENDER_ATTACHMENT,
	});
  
	device.queue.copyExternalImageToTexture(
		{ source, flipY: true },
		{ texture },
		{ width: source.width, height: source.height },
	);
  
	const sampler = device.createSampler();
   
    uniformBindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            {binding: 0, resource: {buffer: uniformBuffer}},
            {binding: 1, resource: sampler},
            {binding: 2, resource: texture.createView()},
        ],
    });
}

// We call draw to render to our canvas
function draw() {
    //console.log("inside draw");
    //console.log("cameraData: " + cameraData[0] + " " +cameraData[1] + " " + cameraData[2]);

    // set up color info
    colorTexture = context.getCurrentTexture();
    colorTextureView = colorTexture.createView();

    // a color attachment ia like a buffer to hold color info
    colorAttachment = {
        view: colorTextureView,
        clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1 },
        loadOp: 'clear',
        storeOp: 'store'
    };
    renderPassDesc = {
        colorAttachments: [colorAttachment],
        depthStencilAttachment: {
            view: depthTexture.createView(),

            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
        },
    };

    // convert to radians before sending to shader
    // uniformValues[0] = radians(cameraData[0]);
    // uniformValues[1] = radians(cameraData[1]);
    // uniformValues[2] = radians(cameraData[2]);

    // copy the values from JavaScript to the GPU
    device.queue.writeBuffer(uniformBuffer, 0, new Float32Array(cameraData));

    // create the render pass
    commandEncoder = device.createCommandEncoder();
    passEncoder = commandEncoder.beginRenderPass(renderPassDesc);
    passEncoder.setViewport(0, 0, canvas.width, canvas.height, 0, 1);
    passEncoder.setPipeline(pipeline);
	
    passEncoder.setBindGroup(0, uniformBindGroup);
	
    passEncoder.setVertexBuffer(0, myVertexBuffer);
    passEncoder.setVertexBuffer(1, myBaryBuffer);
    passEncoder.setIndexBuffer(myIndexBuffer, "uint32");
	
    passEncoder.drawIndexed(indices.length, 1);
    // passEncoder.drawIndexed(indices.length, 1);
	
    passEncoder.end();

    // submit the pass to the device
    device.queue.submit([commandEncoder.finish()]);
}

// Input stuff
// I took this from a browser game I made forever ago.
// WAIT, I NOW HAVE THE TOOLS TO MAKE THAT GAME TRUE 3D
var keysPressed = [];

function moveCamByAnglesAndSpeed(yaw, tilt, speed) {
	cameraData[TX] += Math.cos(yaw) * speed;
	cameraData[TZ] += Math.sin(yaw) * speed;
}

const LEFT_ARROW = 37;
const RIGHT_ARROW = 39;
const UP_ARROW = 40;
const DOWN_ARROW = 38;

const SPEED = 17;		//CONTROL

const FORWARD = 87;		//A
const BACKWARD = 83;	//S
const UP = 32;			//SPACE
const DOWN = 16;		//SHIFT
// const UP = 69;		//Q
// const DOWN = 81;		//E
const LEFT = 65;		//A
const RIGHT = 68;		//D

let keysThatPreventDefault = [
	LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, FORWARD, BACKWARD, UP, DOWN, LEFT, RIGHT, SPEED
]

function processHeldInput() {
	
	let moveSpeed = keysPressed[SPEED] ? 120/60 : 30/60;
	let turnSpeed = 3.14/60;
	
	let action = false;
	
	if (keysPressed[LEFT_ARROW]) {
		cameraData[RY] += turnSpeed;
	}
	if (keysPressed[RIGHT_ARROW]) {
		cameraData[RY] -= turnSpeed;
	}
	if (keysPressed[UP_ARROW]) {
		cameraData[RX] -= turnSpeed;
	}
	if (keysPressed[DOWN_ARROW]) {
		cameraData[RX] += turnSpeed;
	}
	
	if (keysPressed[FORWARD]) {
		moveCamByAnglesAndSpeed(cameraData[RY] - (Math.PI * 0.5), cameraData[RX], moveSpeed);
		// cameraData[TZ] += moveSpeed;
	}
	if (keysPressed[BACKWARD]) {
		moveCamByAnglesAndSpeed(cameraData[RY] + (Math.PI * 0.5), cameraData[RX], moveSpeed);
	}
	if (keysPressed[UP]) {
		cameraData[TY] -= moveSpeed;
	}
	if (keysPressed[DOWN]) {
		cameraData[TY] += moveSpeed;
	}
	if (keysPressed[LEFT]) {
		moveCamByAnglesAndSpeed(cameraData[RY], cameraData[RX], moveSpeed);
	}
	if (keysPressed[RIGHT]) {
		moveCamByAnglesAndSpeed(cameraData[RY] + Math.PI, cameraData[RX], moveSpeed);
	}
}

function handleKeyDown(evt){
	keysPressed[evt.keyCode] = true;
	if (keysThatPreventDefault.includes(evt.keyCode)) {
		evt.preventDefault();
	}
	// console.log(evt.keyCode);
}

function handleKeyUp(evt){
	keysPressed[evt.keyCode] = false;
	// return evt.keyCode;
}

document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

// And this is stripped down from the tesselation assignment
async function handleKeyPresses(event) {

	var key = event.key;

	// reset
	if (key == 'r' || key == 'R') {
		cameraData[0] = cameraDataReset[0];
		cameraData[1] = cameraDataReset[1];
		cameraData[2] = cameraDataReset[2];
	}
}

// Main loop
function step() {
	processHeldInput();
	// let t1 = performance.now();
	draw();
	// let t2 = performance.now();
	// let rate = 1000 / (t2 - t1);
	// let fps = document.getElementById("fps")
	// fps.innerHTML = "" + rate + " fps";
}

// Entry point to our application
async function init() {
    // Retrieve the canvas
    canvas = document.querySelector("canvas");

    // deal with keypress
    window.addEventListener('keydown', handleKeyPresses, false);

    // Read, compile, and link your shaders
    await initProgram();

    // Construct scene
	rebuildMesh();
	
	// Main loop
    setInterval(step, 1000/30);
}
