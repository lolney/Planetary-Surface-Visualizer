/* 
 * Contains dynamic elements of the program
 */
var lastLat = 0;
var lastLong = 0;
var tick = function() {

    var p = globals.currentPlanet;
    var a = globals.animation;
    
    // Use to periodically extend ground plane
    if(Math.abs(a.raw_latitude - lastLat) > 40 || Math.abs(a.raw_longitude - lastLong) > 40){
        if(Math.abs(a.raw_latitude - lastLat) > 40) lastLat = a.raw_latitude;
        if(Math.abs(a.raw_longitude - lastLong) > 40) lastLong = a.raw_longitude;
        globals.objects['Ground'].vertices = makeGroundGrid(a.raw_longitude, a.raw_latitude);
        initVertexBuffers(globals.gl);
    }
    animate();
    
    // Apply the accumulated rotation to the up, heading vectors
    m = new Matrix4();
    if(globals.camera.lockToSun)
    {        
        m.setRotate(a.latitude, 1, 0, 0);
        globals.camera.heading = m.multiplyVector3(globals.animation.sun);
        
        globals.camera.up = new Vector3(globals.camera.u.elements);
    }
    else{
        q = globals.quaternions['view'].total;
        m.setFromQuat(q.x, q.y, q.z, q.w);	// Quaternion-->Matrix
        globals.camera.heading = m.multiplyVector3(globals.camera.h);
        globals.camera.up = m.multiplyVector3(globals.camera.u);
    }
    
    // Get the center position from eye position, heading
    h = globals.camera.heading;
    p = globals.camera.position.elements;
    e = globals.camera.eye.elements;
    h.normalize();
    p[0] = e[0] + h.elements[0];
    p[1] = e[1] + h.elements[1];
    p[2] = e[2] + h.elements[2];
    
    var u_Radius = globals.gl.getUniformLocation(globals.gl.program, 'u_Radius');
    if (!u_Radius) { 
        console.log('Failed to get u_Radius');
        return;
    }
    globals.gl.uniform1f(u_Radius, p.radius);
    

    draw(globals.canvas, globals.gl);  
    requestAnimationFrame(tick, globals.canvas);   // Request that the browser ?calls tick
       
  };
  
var seconds = 0;
var fps = [];
function animate()
{
  a = globals.animation;
  p = globals.currentPlanet;

  a.now = Date.now();
  var lastElapsed = a.now - a.last;
  var totalElapsed = a.now - a.startTime;
  a.last = a.now;
  
  if(fps.length == 50){
    avg = 0;
    for(f in fps){
      avg += fps[f];
    }
    avg /= 50;
    console.log("Fps: " + avg);
    fps = [];
  }
  fps.push(1/(lastElapsed/1000));
  
  // Day Zero: Northern Hemisphere Vernal Equinox
  // Start Point: Midnight on the Vernal Equinox
  
  // Latitude considerations applied by rotation transformation
  // Based on 0 degree latiude if z
  
  var speed = 60*24*(60/a.x_s); // 1 day = x seconds
  seconds += lastElapsed*speed/1000.0;
  var day = seconds/(24*60*60);
  var theta = 2*Math.PI*day;    // day cycle
  
  var radius = 100; // radius of celestial sphere (ie, sky box)
  var tiltR = p.tilt*Math.PI/180; // tilt converted to radians
  var phi = Math.PI/2.0 + tiltR*Math.sin(theta/p.numDays);  // Tilt over year cycle
  
  a.sun.elements[0] = radius*Math.sin(phi)*Math.cos(theta-(Math.PI/2.0));
  a.sun.elements[1] = 1*radius*Math.sin(phi)*Math.sin(theta-(Math.PI/2.0));
  a.sun.elements[2] = -radius*Math.cos(phi);  
  //sunY = 0;
    
  updateInfo(seconds, phi);
      
}

/**
 * Prints relevant information to UI
 * @param {float} seconds  Total elapsed seconds in simulation
 * @param {float} phi      Current axial tilt
 */
function updateInfo(seconds, phi)
{
    // TODO: proper timezone handling
    var d = new Date(2014, 2, 21, 0, 0, seconds);
    
    var string = "Day: " + d.toLocaleDateString() + " " + d.toLocaleTimeString();
    document.getElementById("p1").innerHTML = string; 
    
    string = "Latitude: " + a.latitude.toFixed(2);
    document.getElementById("p2").innerHTML = string;
    
    phi -= Math.PI/2;   
    var latitudeR = a.latitude*Math.PI/180;
    hourAngle = 2*Math.PI*seconds/(60*60*24); // hour of the day in radians
    var elevation = -Math.cos(hourAngle)*Math.cos(phi)*Math.cos(latitudeR);
    elevation += Math.sin(phi)*Math.sin(latitudeR);
    elevation = Math.asin(elevation);
    elevation = elevation * 180 / Math.PI;
    string = "Sun Elevation: " + Math.floor(elevation);
    document.getElementById("p3").innerHTML = string;
    
    
    // Sunrise and sunset calculation
   var sunCross = Math.tan(phi)*Math.tan(latitudeR); 
   
   var sunrise = Math.acos(sunCross);
   var sunset = (Math.PI - sunrise) + Math.PI;
   sunrise += Math.PI/2;
   sunrise /= 2*Math.PI;
   sunrise *= 60*60*24;
   sunset += Math.PI/2;
   sunset /= 2*Math.PI;
   sunset *= 60*60*24;
   
   var hours;
   var minutes;
   
   var date = new Date(sunrise * 1000);
   if(isNaN(date.getUTCHours())) string = "Sunrise: none";
   else string = "Sunrise: " + date.toLocaleTimeString();
   document.getElementById("p4").innerHTML = string;
   
   date = new Date(sunset * 1000);
   if(isNaN(date.getUTCHours())) string = "Sunset: none";
   else string = "Sunset: " + date.toLocaleTimeString();
   document.getElementById("p5").innerHTML = string;
          
}

/**
 * Wraps latitude in absence of proper spherical geometry
 * @param {int} lat     Raw latitude produced by key press
 * @return {int}        Latitude confined to -90 < x < 90
 */ 
function wrap(lat){
    if(lat < 90 && lat > -90) return lat;
    if(lat > 90) lat = 90 - (lat - 90);
    if(lat < -90) lat = -90 - (lat + 90);
    return wrap(lat);
}
