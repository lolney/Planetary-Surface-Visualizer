import { Vector3, Quaternion, Matrix4 } from "../lib/cuon-matrix-quat";

// WebGL context
class Globals {
  constructor() {
    this.uniforms = {};
    this.matrices = {};

    this.objects = {};
    this.keyCodes = [];

    this.quaternions = {
      view: {
        total: new Quaternion(0, 0, 0, 1),
        last: new Quaternion(0, 0, 0, 1)
      }
    };

    this.params = {
      floatsPerVertex: 6
    };

    this.currentPlanet = {
      // Planetary parameters
      tilt: 23.4,
      numDays: 365,
      radius: 200
    };

    this.animation = {
      // Animation:
      x_s: 30,
      raw_latitude: 0,
      raw_longitude: 0,
      latitude: 0,
      longitude: 0,
      startTime: 0,
      world_heading: new Vector3([0, 1, 0]),
      now: 0,
      last: 0,
      sun: new Vector3([0, 1, 0]),
      lastLat: 0,
      lastLong: 0,
      fps: [],
      seconds: 0
    };

    this.camera = {
      lockToSun: false,
      heading: new Vector3([0, 0, 1]),
      up: new Vector3([0, 1, 0]),
      position: new Vector3([0, 0, 1]),
      h: new Vector3([1, 0, 0]),
      u: new Vector3([0, 1, 0]),
      eye: new Vector3([0, 0, 0])
    };

    this.interaction = {
      dragMode: 0,
      MouseDown: false,
      x: 0,
      y: 0,
      mxNew: 0,
      myNew: 0
    };

    this.matrixStack = {
      elems: [],
      pushMatrix: function(m) {
        var m2 = new Matrix4(m);
        this.elems.push(m2);
      },
      popMatrix: function() {
        return this.elems.pop();
      }
    };
  }
}

var globals = new Globals();

export default globals;
