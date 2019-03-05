import globals from "./globals";
import { Vector3 } from "../lib/cuon-matrix-quat";

/* 
Contains methods for calculating movement along the surface of a sphere 
*/
var exports = {
  /**
   * @param {Number} rad      Radians
   * @return {Number}         Degrees
   */
  rad2deg: function(rad) {
    return (rad * 180) / Math.PI;
  },

  /**
   * @param {Number} deg      Degrees
   * @return {Number}         Radians
   */
  deg2rad: function(deg) {
    return (deg * Math.PI) / 180;
  },

  /**
   * Spherical -> Cartesian coords
   * @param {Number} lng      Longitude (in degrees)
   * @param {Number} lat      Latitude (in degrees; standard geographical notation)
   * @param {Number} r        Radius
   * @return {Vector3}        The converted vector
   */
  toCartesian: function(lng, lat, r) {
    lat = this.deg2rad(-lat + 90); // 0 at the north pole
    lng = this.deg2rad(lng);
    r = globals.currentPlanet.radius;

    var coords = new Vector3();

    coords.elements[0] = r * Math.sin(lat) * Math.cos(lng);
    coords.elements[1] = r * Math.sin(lat) * Math.sin(lng);
    coords.elements[2] = r * Math.cos(lat);

    return coords;
  },

  /**
   * Cartesian -> Spherical coords
   * @param {Vector3} vec     The Cartesian vector
   * @return {Object}         Dictionary containing lat (degrees latitude; geographical notation),
   *                          lng (degrees longitude),
   *                          r (radius)
   */
  toSpherical: function(vec) {
    var e = vec.elements;

    var r = Math.sqrt(vec.dot(vec));
    var lat = Math.acos(e[2] / r);
    var lng = Math.atan2(e[1], e[0]);

    var coords = {
      r: r,
      lat: 90 - this.rad2deg(lat),
      lng: this.rad2deg(lng)
    };

    return coords;
  },

  /**
   * Finds tanget vectors to the sphere at the given longitude and latituide
   * The tanget vector u,v represents the current heading in the lng, lat directions
   * @param {Number} lng          Longitude (in degrees)
   * @param {Number} lat          Latitude (in degrees; 0 at equator)
   * @returns {Object}            Dictionary containing the u, v vectors
   */
  tangentSphere: function(lng, lat) {
    lat = this.deg2rad(-lat + 90); // 0 at the north pole
    lng = this.deg2rad(lng);

    var r = globals.currentPlanet.radius;
    var u = new Vector3([
      -r * Math.sin(lng) * Math.sin(lat),
      r * Math.sin(lat) * Math.cos(lng),
      0
    ]);
    var v = new Vector3([
      r * Math.cos(lat) * Math.cos(lng),
      r * Math.sin(lng) * Math.cos(lat),
      -r * Math.sin(lat)
    ]);

    return {
      u: u.scale(1 / Math.abs(u.length())),
      v: v.scale(1 / Math.abs(v.length()))
    };
  },

  /**
   * Projects the given point onto the sphere representing the current planet
   * @param {Vector3} point
   * @returns {Object}            Dictionary containing the latitude and longitude
   */
  projSphere: function(point) {
    var l = point.length();
    var p = point.scale(globals.currentPlanet.radius).scale(1 / l);

    return exports.toSpherical(p);
  },

  /**
   * From the given tangent velocity, find the next point along the sphere
   * The method used is to find the velocity tangent to the sphere in R3,
   * Travel along that vector for time t, then project that point back onto the sphere
   * @param {Vector3} vel     2D velocity in terms of x, z
   */
  calcNewPoint: function(vel) {
    // TODO: fix singularities at certain points; heading doesn't have proper sign
    // Project heading onto tangent vectors, add, normalize
    var a = globals.animation;
    var tangents = exports.tangentSphere(a.longitude, a.latitude);

    var v = tangents.v.dot(a.world_heading);
    var u = tangents.u.dot(a.world_heading);
    a.world_heading = tangents.v.scale(v).plus(tangents.u.scale(u));
    a.world_heading = a.world_heading.scale(
      1 / Math.abs(a.world_heading.length())
    );

    var position = exports.toCartesian(
      a.longitude,
      a.latitude,
      globals.currentPlanet.radius
    );
    var tangent = position.crossProduct(a.world_heading);
    tangent = tangent.scale(1 / Math.abs(tangent.length()));

    var adjusted_heading = a.world_heading
      .scale(vel.lat)
      .plus(tangent.scale(vel.lng));

    // To find direction of travel, scale tangent vectors by velocity and add,
    //world_heading = tangents.v.scale(vel.lat).plus(tangents.u.scale(vel.lng));
    // Project p + world_heading onto sphere to find new point
    var p_new = position.plus(adjusted_heading);

    var coords = exports.projSphere(p_new);

    a.latitude = coords.lat;
    a.longitude = coords.lng;
  }
};

export default exports;
