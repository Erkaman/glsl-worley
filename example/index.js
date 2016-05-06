/* global requestAnimationFrame */

var mat4 = require('gl-mat4');
var vec3 = require('gl-vec3');
var Geometry = require('gl-geometry');
var glShader = require('gl-shader');
var glslify = require('glslify')
var createOrbitCamera = require('orbit-camera');
var shell = require("gl-now")();
var createGui = require("pnp-gui");
var randomArray = require('random-array');
var createSphere = require('primitive-icosphere');

var sphereShader, quadGeo, sphereGeo;

var camera = createOrbitCamera([0, -2.0, 0], [0, 0, 0], [0, 1, 0]);

var mouseLeftDownPrev = false;

var bg = [0.6, 0.7, 1.0]; // clear color.

var noiseScale = {val: 5.0};
var noiseJitter = {val: 1.0};
var patternType = {val: 0};
var manhattanDistance = {val:false};
var noiseStrength = {val: 1.0};

var seed = 100;

// F1
// F2
// F2 - F1

shell.on("gl-init", function () {
    var gl = shell.gl

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK)
    
    gui = new createGui(gl);
    gui.windowSizes = [300, 380];

    var sphere = createSphere(1, { subdivisions: 2});
    sphereGeo = Geometry(gl)
        .attr('aPosition', sphere.positions).faces(sphere.cells);


    sphereShader = glShader(gl, glslify("./sphere_vert.glsl"), glslify("./sphere_frag.glsl"));


    // fix intial camera view.
    camera.rotate([0,0], [0,0] );
});


function newSeed() {
    seed = randomArray(0.0, 100.0).oned(1)[0];
}

shell.on("gl-render", function (t) {


    var gl = shell.gl
    var canvas = shell.canvas;

    gl.clearColor(bg[0], bg[1], bg[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);

    var projection = mat4.create();
    var scratchMat = mat4.create();
    var view = camera.view(scratchMat);

    mat4.perspective(projection, Math.PI / 2, canvas.width / canvas.height, 0.1, 10000.0);

    /*
    Render Sphere
     */

    sphereShader.bind();

    sphereShader.uniforms.uView = view;
    sphereShader.uniforms.uProjection = projection;
    sphereShader.uniforms.uNoiseScale = noiseScale.val;
    sphereShader.uniforms.uNoiseJitter = noiseJitter.val;
    sphereShader.uniforms.uPatternType = patternType.val;
    sphereShader.uniforms.uManhattanDistance = manhattanDistance.val;
    sphereShader.uniforms.uNoiseStrength = noiseStrength.val;




    sphereShader.uniforms.uSeed = seed;

    
    
    sphereGeo.bind(sphereShader);
    sphereGeo.draw();


    /*
    Render GUI.
     */

    var pressed = shell.wasDown("mouse-left");
    var io = {
        mouseLeftDownCur: pressed,
        mouseLeftDownPrev: mouseLeftDownPrev,

        mousePositionCur: shell.mouse,
        mousePositionPrev: shell.prevMouse
    };
    mouseLeftDownPrev = pressed;

    gui.begin(io, "Window");

    gui.textLine("Noise Settings");


    gui.sliderFloat("Scale", noiseScale, 0.1, 10.0);
    gui.sliderFloat("Jitter", noiseJitter, 0.01, 1.0);
    gui.sliderFloat("Strength", noiseStrength, 0.0, 2.0);

    gui.checkbox("Manhattan", manhattanDistance);



    gui.radioButton("F1", patternType, 0);
    gui.radioButton("F2", patternType, 1);
    gui.radioButton("F2-F1", patternType, 2);


    if(gui.button("New Seed")) {
        newSeed();
    }

    gui.end(gl, canvas.width, canvas.height);
});

shell.on("tick", function () {

    // if interacting with the GUI, do not let the mouse control the camera.
    if (gui.hasMouseFocus())
        return;

    if (shell.wasDown("mouse-left")) {
        var speed = 1.3;
        camera.rotate([(shell.mouseX / shell.width - 0.5) * speed, (shell.mouseY / shell.height - 0.5) * speed],
            [(shell.prevMouseX / shell.width - 0.5) * speed, (shell.prevMouseY / shell.height - 0.5) * speed])
    }
    if (shell.scroll[1]) {
        camera.zoom(shell.scroll[1] * 0.01);
    }
});
