import { initVertexBuffers } from "./draw";
import globals from "./globals";
import camera from "./camera";
import { draw } from "./draw";
import { keydown } from "./UI";

/*
 * Contains the main loop and dynamic elements of the program
 */
var exports = {
  /**
   *  Tick function that is called every frame
   */
  tick: function() {
    var p = globals.currentPlanet;
    var a = globals.animation;

    exports.animate();
    keydown();
    camera.updateCamera();

    // Use to periodically extend ground plane
    if (
      Math.abs(a.raw_latitude - a.lastLat) > 40 ||
      Math.abs(a.raw_longitude - a.lastLong) > 40
    ) {
      if (Math.abs(a.raw_latitude - a.lastLat) > 40) a.lastLat = a.raw_latitude;
      if (Math.abs(a.raw_longitude - a.lastLong) > 40)
        a.lastLong = a.raw_longitude;

      var worker = new Worker("makeGroundGrid.js");
      worker.onmessage = function(ev) {
        var data = new Float32Array(ev.data);
        globals.objects["Ground"].vertices = data;
        initVertexBuffers(globals.gl);
      };
      var mes = { latitude: a.raw_latitude, longitude: a.raw_longitude };
      worker.postMessage(JSON.stringify(mes));
    }

    // Apply appropriate planetary transformations
    var u_Radius = globals.gl.getUniformLocation(
      globals.gl.program,
      "u_Radius"
    );
    if (!u_Radius) {
      console.log("Failed to get u_Radius");
    } else globals.gl.uniform1f(u_Radius, p.radius);

    draw(globals.canvas, globals.gl);
    requestAnimationFrame(exports.tick, globals.canvas); // Request that the browser ?calls tick
  },

  /**
   * Displays fps to the console, averaged over 100 frames
   */
  fpsCounter: function() {
    if (globals.animation.fps.length == 100) {
      var avg = 0;
      for (const f of globals.animation.fps) {
        avg += f;
      }
      avg /= 100;
      console.log("Fps: " + avg);
      globals.animation.fps = [];
    }
    globals.animation.fps.push(1 / (globals.animation.lastElapsed / 1000));
  },

  /**
   * Calculate the position of the sun according to the current time of year and day
   * Latitude-idependent; latitude considerations are applied by rotation transformation
   */
  animate: function() {
    var a = globals.animation;
    var p = globals.currentPlanet;

    a.now = Date.now();
    a.lastElapsed = a.now - a.last;
    a.last = a.now;

    // Day Zero: Northern Hemisphere Vernal Equinox
    // Start Point: Midnight on the Vernal Equinox

    // Based on 0 degree latiude

    var speed = 60 * 24 * (60 / a.x_s); // 1 day = x seconds
    a.seconds += (a.lastElapsed * speed) / 1000.0;
    var day = a.seconds / (24 * 60 * 60);
    var theta = 2 * Math.PI * day; // day cycle

    var radius = 100; // radius of celestial sphere (ie, sky box)
    var tiltR = (p.tilt * Math.PI) / 180; // tilt converted to radians
    var phi = Math.PI / 2.0 + tiltR * Math.sin(theta / p.numDays); // Tilt over year cycle

    a.sun.elements[0] =
      radius * Math.sin(phi) * Math.cos(theta - Math.PI / 2.0);
    a.sun.elements[1] =
      1 * radius * Math.sin(phi) * Math.sin(theta - Math.PI / 2.0);
    a.sun.elements[2] = -radius * Math.cos(phi);

    // exports.updateInfo(a.seconds, phi);
  },

  /**
   * Prints relevant information to UI
   * @param {float} seconds  Total elapsed seconds in simulation
   * @param {float} phi      Current axial tilt
   */
  updateInfo: function(seconds, phi) {
    // TODO: proper timezone handling
    var d = new Date(2014, 2, 21, 0, 0, seconds);

    var string = d.toLocaleDateString() + " " + d.toLocaleTimeString();
    document.getElementById("p1").innerHTML = string;

    if (document.getElementById("latitude") != document.activeElement) {
      document.getElementById(
        "latitude"
      ).value = globals.animation.latitude.toFixed(2);
    }

    string = "Longitude: " + globals.animation.longitude.toFixed(2);
    document.getElementById("longitude").innerHTML = string;

    // Sun elevation calculation
    phi -= Math.PI / 2;
    var latitudeR = (globals.animation.latitude * Math.PI) / 180;
    var hourAngle = (2 * Math.PI * seconds) / (60 * 60 * 24); // hour of the day in radians
    var elevation = -Math.cos(hourAngle) * Math.cos(phi) * Math.cos(latitudeR);
    elevation += Math.sin(phi) * Math.sin(latitudeR);
    elevation = Math.asin(elevation);
    elevation = (elevation * 180) / Math.PI;
    string = "Sun Elevation: " + Math.floor(elevation);
    document.getElementById("p3").innerHTML = string;

    // Sunrise and sunset calculation
    var sunCross = Math.tan(phi) * Math.tan(latitudeR);

    var sunrise = Math.acos(sunCross);
    var sunset = Math.PI - sunrise + Math.PI;
    sunrise += Math.PI / 2;
    sunrise /= 2 * Math.PI;
    sunrise *= 60 * 60 * 24;
    sunset += Math.PI / 2;
    sunset /= 2 * Math.PI;
    sunset *= 60 * 60 * 24;

    var date = new Date(sunrise * 1000);
    if (isNaN(date.getUTCHours())) string = "Sunrise: none";
    else string = "Sunrise: " + date.toLocaleTimeString();
    document.getElementById("p4").innerHTML = string;

    date = new Date(sunset * 1000);
    if (isNaN(date.getUTCHours())) string = "Sunset: none";
    else string = "Sunset: " + date.toLocaleTimeString();
    document.getElementById("p5").innerHTML = string;
  },

  /**
   * Wraps latitude in absence of proper spherical geometry
   * @param {int} lat     Raw latitude produced by key press
   * @return {int}        Latitude confined to -90 < x < 90
   */

  wrap: function(lat) {
    if (lat <= 90 && lat >= -90) return lat;
    if (lat > 90) lat = 90 - (lat - 90);
    if (lat < -90) lat = -90 - (lat + 90);
    return exports.wrap(lat);
  }
};

export default exports;
