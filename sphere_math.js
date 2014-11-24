/* 
Contains methods for calculating movement along the surface of a sphere 
*/

/**
 * @param {Number} rad      Radians
 * @return {Number}         Degrees
 */
function rad2deg(rad){
    return rad * 180 / Math.PI;
}

/**
 * @param {Number} deg      Degrees
 * @return {Number}         Radians
 */
function deg2rad(deg){
    return deg * Math.PI / 180;
}

/**
 * Spherical -> Cartesian coords
 * @param {Number} lng      Longitude (in degrees)
 * @param {Number} lat      Latitude (in degrees; standard geographical notation)
 * @param {Number} r        Radius
 * @return {Vector3}        The converted vector     
 */
function toCartesian(lng, lat, r){

    lat = deg2rad(-lat + 90); // 0 at the north pole
    lng = deg2rad(lng);
    r = globals.currentPlanet.radius;

    coords =  new Vector3();

    coords.elements[0] = r * Math.sin(lat) * Math.cos(lng);
    coords.elements[1] = r * Math.sin(lat) * Math.sin(lng);
    coords.elements[2] = r * Math.cos(lat);

    return coords;
}

/**
 * Cartesian -> Spherical coords
 * @param {Vector3} vec     The Cartesian vector
 * @return {Object}         Dictionary containing lat (degrees latitude; geographical notation),
 *                          lng (degrees longitude),
 *                          r (radius)
 */
function toSpherical(vec){
    e = vec.elements;

    r = Math.sqrt(vec.dot(vec));
    lat = Math.acos(e[2] / r);
    lng = Math.atan2(e[1], e[0]);

    coords = {
        r : r,
        lat: 90 - rad2deg(lat),
        lng: rad2deg(lng)
    }

    return coords;
}

/**
 * Finds tanget vectors to the sphere at the given longitude and latituide
 * The tanget vector u,v represents the current heading in the lng, lat directions
 * @param {Number} lng          Longitude (in degrees)
 * @param {Number} lat          Latitude (in degrees; 0 at equator)
 * @returns {Object}            Dictionary containing the u, v vectors
 */
function tangentSphere(lng, lat){
    lat = deg2rad(-lat + 90); // 0 at the north pole
    lng = deg2rad(lng);

    r = globals.currentPlanet.radius;
    u = new Vector3([-r*Math.sin(lng)*Math.sin(lat), r*Math.sin(lat)*Math.cos(lng), 0]);
    v = new Vector3([   -r*Math.cos(lat)*Math.cos(lng),
                        r*Math.sin(lng)*Math.cos(lat),
                        r*Math.sin(lat)]);

    return {u: u.normalize(), v: v.normalize()};

}

/**
 * Projects the given point onto the sphere representing the current planet
 * @param {Vector3} point       
 * @returns {Object}            Dictionary containing the latitude and longitude
 */
function projSphere(point){
    l = point.length();
    p =  point.scale(globals.currentPlanet.radius).scale(1/l);
    
    return toSpherical(p);
}

/**
 * From the given tangent velocity, find the next point along the sphere
 * The method used is to find the velocity tangent to the sphere in R3,
 * Travel along that vector for time t, then project that point back onto the sphere
 * @param {Vector3} vel     2D velocity in terms of x, z       
 */
function calcNewPoint(vel){
    // TODO: Heading reflects position

    position = toCartesian(globals.animation.longitude, globals.animation.latitude, globals.currentPlanet.radius);
    tangents = tangentSphere(globals.animation.longitude, globals.animation.latitude);

    // To find direction of travel, scale tangent vectors by velocity and add, 
    world_heading = tangents.v.scale(vel.lat).plus(tangents.u.scale(vel.lng));
    // Project p + world_heading onto sphere to find new point
    p_new = position.add(world_heading);

    coords = projSphere(p_new);

    globals.animation.latitude = coords.lat;
    globals.animation.longitude = coords.lng;
}



