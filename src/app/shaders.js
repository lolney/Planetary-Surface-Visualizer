/*
 * Contains all shader programs
 */

/** Vertex shader program
 * Applies an inverse sterographic projection to the ground plane to make it appear curved
 * This is determined by testing the blue channel for the color expected for the ground plane;
 * this is not an ideal solution but prevents having to create additional shader programs for now
 */
export var VSHADER_SOURCE =
  "attribute vec4 a_Position;\n" +
  "attribute vec4 a_Color;\n" +
  "uniform mat4 u_ViewMatrix;\n" +
  "uniform mat4 u_ProjMatrix;\n" +
  "uniform mat4 u_ModelMatrix;\n" +
  "uniform float u_Radius;\n" +
  "varying vec4 v_Color;\n" +
  "void main() {\n" +
  "  vec4 start_position = u_ModelMatrix * a_Position;\n" +
  "  vec4 pos;\n" +
  "  if (a_Color.b == 0.6){\n" + // Inverse stereographic projection
  "  float radius = u_Radius;\n" +
  "  float PI = 3.14159;\n" +
  "  float circ = PI*2.0*radius;\n" +
  "  float r = pow(start_position.x*start_position.x + start_position.z*start_position.z, .5);\n" +
  "  if((r/circ) > 1.0) pos = vec4(0, -4.0*radius, 0, start_position.w);\n" +
  "  else { \n" +
  "  float x = start_position.x*cos(PI*r/(circ*2.0));\n" +
  "  float y = 2.0*radius*cos(PI*r/circ) - 2.0*radius;\n" +
  "  float z = start_position.z*cos(PI*r/(circ*2.0));\n" +
  "  pos = vec4(x, y - 1.5, z, start_position.w);\n" +
  "  }\n" +
  "  }\n" +
  "  else pos = start_position;\n" +
  "  gl_Position = u_ProjMatrix * u_ViewMatrix * pos;\n" +
  "  v_Color = a_Color;\n" +
  "}\n";

// Fragment shader program
export var FSHADER_SOURCE =
  "#ifdef GL_ES\n" +
  "precision mediump float;\n" +
  "#endif\n" +
  "varying vec4 v_Color;\n" +
  "void main() {\n" +
  "  gl_FragColor = v_Color;\n" +
  "}\n";
