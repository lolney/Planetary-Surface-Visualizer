/* 
 * Contains all shader programs
 */


// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform float u_Radius;\n' +
  'varying vec4 v_Color;\n' +
  
  'void main() {\n' +
  '  vec4 pos;\n' +
    '  if(a_Color.b == 0.5){\n' + // Inverse stereographic projection
    '  float radius = u_Radius;\n' +
    '  float PI = 3.14159;\n' +
    '  float circ = PI*2.0*radius;\n' +
    '  float r = pow(a_Position.x*a_Position.x + a_Position.y*a_Position.y, .5);\n' +
          '  if((r/circ) > 1.0) pos = vec4(0, 0, -4.0*radius, a_Position.w);\n' +
          '  else{ float x = a_Position.x*cos(PI*r/(circ*2.0));\n' +
          '  float y = a_Position.y*cos(PI*r/(circ*2.0));\n' +
          '  float z = 2.0*radius*cos(PI*r/circ) - 2.0*radius;\n' +
          '  pos = vec4(x, y, z, a_Position.w);}}\n' +
    '  else pos = a_Position;\n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * pos;\n' + 
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';
