//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
//==============================================================================
//
// Starter code (c) 2012 matsuda
//
//  Luke Olney's Planetary Surface viewer
//  Feb 2014

/*
 * Contains initialize and draw functions
 * 
 */

// WebGL context
var gl;
var canvas;

// Matrix Uniforms
var u_ViewMatrix;
var u_ProjMatrix;
var u_ModelMatrix;

// Transformation matrices
var viewMatrix;
var projMatrix;
var modelMatrix;

// Vertex arrays
var gndStart;
var sphStart;
var gimbalStart;
var cylVerts;
var axisVerts;
var pedVerts;

var gndVerts;
var sphVerts;
var gimbalVerts;
var cylStart;
var axisStart;
var pedStart;

var floatsPerVertex = 6;

// Quaternions for object rotation
var qNewG = new Quaternion(0,0,0,1); // most-recent mouse drag's rotation
var qTotG = new Quaternion(0,0,0,1);	// 'current' orientation (made from qNew)
var quatMatrix = new Matrix4();

var qNew1 = new Quaternion(0,0,0,1); // Joint 1
var qTot1 = new Quaternion(0,0,0,1);	

var qNew2 = new Quaternion(0,0,0,1); // Joint 2
var qTot2 = new Quaternion(0,0,0,1);

var qNew3 = new Quaternion(0,0,0,1); // Joint 3
var qTot3 = new Quaternion(0,0,0,1);	

// View rotation
var qNewView = new Quaternion(0,0,0,1);
var qTotView = new Quaternion(0,0,0,1);
var qTotUp = new Quaternion(0,0,0,1);
var quatMatrixView = new Matrix4();

// Viewing globals

// Starting heading/up
var h = new Vector3([1,0,0]);
var u = new Vector3([0,1,0]);

var control = 0;
var heading;
var up;
var position;
var yawMatP;
var pitchMatP;
var rollMatP;

var isMouseDown = false;
var x;
var y;
var mxNew;
var myNew;


var g_EyeX = 0.0, g_EyeY = 0, g_EyeZ = 0; // Global vars for Eye position

// Animation:
var startTime;
var now;
var g_last;

var sunX;
var sunY;
var sunZ;

// Planetary parameters
var tilt = 23.4;
var numDays = 365;  
var latitude = 0;
var wLatitude = 0;
var longitude = 0;
var x_s = 60;
var pRadius = 200;
var lockToSun = true;

var matrixStack = []; // An array of matrices; for implementing scene graph
// Push function for view matrix array 
function pushMatrix( m)
{      
    var m2 = new Matrix4( m);       
    matrixStack.push( m2); 
}

// Pop function for view matrix array
function popMatrix()
{
    return matrixStack.pop();
}

function main() {
//==============================================================================
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  modelMatrix = new Matrix4();
  startTime = Date.now();
  g_last = startTime;
    
  // Initialize heading, (lookat) position as vectors
  heading = new Vector3([0,0,1]);
  up = new Vector3([0,1,0]);
  position = new Vector3(heading.elements);
    
  
  canvas.width = window.innerWidth - 25;
  canvas.height = window.innerHeight;
  
    // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex coordinates and color (the blue triangle is in the front)
  var n = initVertexBuffers(gl, 0, 0);
  if (n < 0) {
    console.log('Failed to specify the vertex infromation');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.2, 0.2, 0.2, 1.0);

  // Get the storage locations of u_ViewMatrix and u_ProjMatrix variables
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  if (!u_ViewMatrix || !u_ProjMatrix) { 
    console.log('Failed to get u_ViewMatrix or u_ProjMatrix');
    return;
  }

  // Create the matrix to specify the view matrix
  viewMatrix = new Matrix4();
  // Register the event handler to be called on key press
 document.onkeydown = function(ev){ keydown(ev, canvas, gl); };
 canvas.onmousedown = function(ev){ click(ev, canvas); };
 canvas.onmousemove = function(ev){ if(isMouseDown == true) mouseMove(ev, canvas); };
 canvas.onmouseup   = function() { isMouseDown = false; };
        
 // Projection matrix was here
  projMatrix = new Matrix4();

	gl.depthFunc(gl.LESS);			 // WebGL default setting: (default)
	gl.enable(gl.DEPTH_TEST);
        
  tick();
}

function initVertexBuffers(gl, XStart, YStart) {
//==============================================================================
   makeGroundGrid(XStart, YStart);
   makeSphere(1,.1,.1);
   makeGimbal();
   makeCylinder();
   makeAxis();
   makePedestal();
    
  	// How much space to store all the shapes in one array?
	// (no 'var' means this is a global variable)
	mySiz = gndVerts.length + sphVerts.length + gimbalVerts.length
        + cylVerts.length + axisVerts.length + pedVerts.length;

	// How many vertices total?
	var nn = mySiz / floatsPerVertex;
	console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);

	// Copy all shapes into one big Float32 array:
  var verticesColors = new Float32Array(mySiz);
	// Copy them:  remember where to start for each shape:
        
        // Easy way to put many arrays representing many objects in a single array,
        // To be loaded into the buffer
	for(j=0, i=0; j< gndVerts.length; i++, j++) {
		verticesColors[i] = gndVerts[j];
		}
                sphStart = i;
                for(j=0; j< sphVerts.length; i++,j++) {
                    verticesColors[i] = sphVerts[j];
		}
                    gimbalStart = i;
                    for(j=0; j< gimbalVerts.length; i++,j++) {
                        verticesColors[i] = gimbalVerts[j];
                    }
                        cylStart = i;
                        for(j=0; j< cylVerts.length; i++,j++) {
                            verticesColors[i] = cylVerts[j];
                        }
                            axisStart = i;
                            for(j=0; j< axisVerts.length; i++,j++) {
                                verticesColors[i] = axisVerts[j];
                            }
                                pedStart = i;
                                for(j=0; j< pedVerts.length; i++,j++) {
                                     verticesColors[i] = pedVerts[j];
                                 }

  
  // Create a buffer object
  var vertexColorbuffer = gl.createBuffer();  
  if (!vertexColorbuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write vertex information to buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  // Assign the buffer object to a_Position and enable the assignment
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);
  // Assign the buffer object to a_Color and enable the assignment
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);
  
  // Get storage location of u_ModelMatrix
      u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
      if (!u_ModelMatrix) { 
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
      }

}


function draw(canvas, gl) {
//==============================================================================
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var aspect = canvas.width/canvas.height;
  var fov = 100;
  var nearP = .1;
  var farP = 1000;
  
  lookAt();
                          
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  
  projMatrix.setPerspective(fov, aspect, nearP, farP);
  
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);



	gl.viewport(0										, 				// Viewport lower-left corner
						0, 		// location(in pixels)
  						canvas.width, 				// viewport width, height.
  						canvas.height);
  drawScene(gl);
  
  
}

function drawScene(gl)
{   
  modelMatrix.setIdentity();
  //Sky box 
  /*modelMatrix.translate(0, 0, 0);
  modelMatrix.scale(100,100,100);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, sphStart/floatsPerVertex, sphVerts.length/floatsPerVertex);*/
  
  //Sun
  modelMatrix.setRotate((90-latitude), 1, 0, 0);
  modelMatrix.translate(sunX, sunY, sunZ);
  modelMatrix.scale(10,10,10);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, sphStart/floatsPerVertex, sphVerts.length/floatsPerVertex);


  // Rotate to make a new set of 'world' drawing axes: 
  // old one had "+y points upwards", but
  modelMatrix.setIdentity();
  modelMatrix.translate(-longitude, -latitude, 0);
  viewMatrix.rotate(-90.0, 1,0,0);	// new one has "+z points upwards",
  																		// made by rotating -90 deg on +x-axis.
  																		// Move those new drawing axes to the 
  																		// bottom of the trees:
  viewMatrix.translate(0.0, 0.0, -0.6);	 

  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  gl.drawArrays(gl.TRIANGLES,							// use this drawing primitive, and
  							gndStart/floatsPerVertex,	// start at this vertex number, and
  							gndVerts.length/floatsPerVertex);
}

