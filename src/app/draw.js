import { Matrix4 } from "../lib/cuon-matrix-quat";
import { getWebGLContext, initShaders } from "../lib/cuon-utils";
import animation from "./animation";
import geometry from "./geometry";
import camera from "./camera";
import globals from "./globals";
import { click, mouseMove } from "./UI";

import { VSHADER_SOURCE, FSHADER_SOURCE } from "./shaders";

/*
 * Contains initialize and draw functions
 *
 */

/**
 * Set up the Webgl context and initialize program
 */

export function main() {
  //==============================================================================
  // Retrieve <canvas> element
  globals.canvas = document.getElementById("webgl");
  globals.animation.startTime = Date.now();
  globals.animation.last = Date.now();

  globals.canvas.width = window.innerWidth - 25;
  globals.canvas.height = window.innerHeight;

  // Get the rendering context for WebGL
  globals.gl = getWebGLContext(globals.canvas);
  if (!globals.gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  // Initialize shaders
  if (!initShaders(globals.gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  // Set the vertex coordinates and color (the blue triangle is in the front)
  globals.objects = makeObjects();
  var n = initVertexBuffers(globals.gl, 0, 0);
  if (n < 0) {
    console.log("Failed to specify the vertex infromation");
    return;
  }

  // Specify the color for clearing <canvas>
  globals.gl.clearColor(0.2, 0.2, 0.2, 1.0);

  // Get the storage locations of u_ViewMatrix and u_ProjMatrix variables
  globals.uniforms["view"] = globals.gl.getUniformLocation(
    globals.gl.program,
    "u_ViewMatrix"
  );
  globals.uniforms["proj"] = globals.gl.getUniformLocation(
    globals.gl.program,
    "u_ProjMatrix"
  );
  if (!globals.uniforms["proj"] || !globals.uniforms["view"]) {
    console.log("Failed to get u_ViewMatrix or u_ProjMatrix");
    return;
  }

  // Create the matrix to specify the view matrix
  globals.viewMatrix = new Matrix4();
  // Register the event handler to be called on key press
  document.onkeydown = function(ev) {
    globals.keyCodes.push(ev.keyCode);
  };
  document.onkeyup = function(ev) {
    globals.keyCodes = [];
  };
  window.onresize = function() {
    globals.canvas.width = window.innerWidth - 25;
    globals.canvas.height = window.innerHeight;
  };
  globals.canvas.onmousedown = function(ev) {
    click(ev, globals.canvas);
  };
  globals.canvas.onmousemove = function(ev) {
    if (globals.interaction.MouseDown == true) mouseMove(ev, globals.canvas);
  };
  globals.canvas.onmouseup = function() {
    globals.interaction.MouseDown = false;
  };

  globals.gl.depthFunc(globals.gl.LESS); // WebGL default setting: (default)
  globals.gl.enable(globals.gl.DEPTH_TEST);

  animation.tick();
}

/**
 * Defines and creates objects included in the scene, adding them to the global object list
 */

function makeObjects() {
  return {
    Sun: {
      vertices: geometry.makeSphere(1, 0.1, 0.1),
      transformations: function(model) {
        var a = globals.animation;
        var sun = a.sun.elements;

        model.setIdentity();
        model.setRotate(a.latitude, 1, 0, 0);
        model.translate(sun[0], sun[1], sun[2]);
        model.scale(10, 10, 10);

        return model;
      },
      primitive: globals.gl.TRIANGLE_STRIP
    },
    Ground: {
      vertices: geometry.makeGroundGrid(0, 0),
      transformations: function(model) {
        var a = globals.animation;

        model.setIdentity();
        model.rotate(-90.0, 1, 0, 0);
        model.translate(-a.raw_longitude, -a.raw_latitude, 0);

        return model;
      },
      primitive: globals.gl.TRIANGLES
    }
  };
}

/**
 * Load the scene objects into buffers
 */

export function initVertexBuffers(gl) {
  //==============================================================================
  // How much space to store all the shapes in one array?
  var size = 0;
  for (const obj of Object.values(globals.objects)) {
    console.log(obj);
    size += obj.vertices.length;
  }

  // How many vertices total?
  var nn = size / globals.params.floatsPerVertex;
  // Copy all shapes into one big Float32 array:
  var verticesColors = new Float32Array(size);
  // Copy them:  remember where to start for each shape:

  var i = 0;
  for (const obj of Object.values(globals.objects)) {
    obj.start = i;
    verticesColors.set(obj.vertices, i);
    i += obj.vertices.length;
  }

  // Create a buffer object
  var vertexColorbuffer = gl.createBuffer();
  if (!vertexColorbuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }

  // Write vertex information to buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.DYNAMIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  // Assign the buffer object to a_Position and enable the assignment
  var a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);
  // Assign the buffer object to a_Color and enable the assignment
  var a_Color = gl.getAttribLocation(gl.program, "a_Color");
  if (a_Color < 0) {
    console.log("Failed to get the storage location of a_Color");
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  // Get storage location of u_ModelMatrix
  globals.uniforms["model"] = gl.getUniformLocation(
    gl.program,
    "u_ModelMatrix"
  );
  if (!globals.uniforms["model"]) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }
}

/**
 * Contains the main draw loop: define projection/view matrices and draw objects
 */

export function draw(canvas, gl) {
  //==============================================================================

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var aspect = canvas.width / canvas.height;
  var fov = 100;
  var nearP = 0.1;
  var farP = 1000;

  var viewMatrix = camera.lookAt(
    globals.camera.eye,
    globals.camera.position,
    globals.camera.up
  );
  gl.uniformMatrix4fv(globals.uniforms["view"], false, viewMatrix.elements);

  var projMatrix = new Matrix4();
  projMatrix.setPerspective(fov, aspect, nearP, farP);
  gl.uniformMatrix4fv(globals.uniforms["proj"], false, projMatrix.elements);

  gl.viewport(
    0, // Viewport lower-left corner
    0, // location(in pixels)
    canvas.width, // viewport width, height.
    canvas.height
  );

  for (const key in globals.objects) {
    var obj = globals.objects[key];
    drawModel(obj, gl);
  }
}

/**
 * Draw method for a particular object
 */

function drawModel(obj, gl) {
  var fpv = globals.params.floatsPerVertex;
  // Apply model matrices
  var modelMatrix = obj.transformations(new Matrix4());
  // Draw children here

  gl.uniformMatrix4fv(globals.uniforms["model"], false, modelMatrix.elements);
  gl.drawArrays(obj.primitive, obj.start / fpv, obj.vertices.length / fpv);
}
