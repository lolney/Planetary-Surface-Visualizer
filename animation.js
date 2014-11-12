/* 
 * Contains dynamic elements of the program
 */
var lastLat = 0;
var lastLong = 0;
var tick = function() {
    
    // Use to periodically extend ground plane
    if(Math.abs(latitude - lastLat) > 40 || Math.abs(longitude - lastLong) > 40){
        if(Math.abs(latitude - lastLat) > 40) lastLat = latitude;
        if(Math.abs(longitude - lastLong) > 40) lastLong = longitude;
        initVertexBuffers(gl, longitude, latitude);
    }
    animate();
    
    // Apply the accumulated rotation to the up, heading vectors
    
    
    
    if(lockToSun == true)
    {
        heading = new Vector3([sunX, sunY, sunZ]);
        
        /*
        var axis = heading.crossProduct(h);
        axis.normalize();
        // Use that vector as rotation axis 
        var a = axis.elements;
        
        // Find angle between heading and h
        var angle = Math.acos(heading.dot(h)/(h.length()*heading.length()));
        qTotView.setFromAxisAngle(a[0],a[1],a[2], - angle * 180 / Math.PI);
        quatMatrix.setFromQuat(qTotView.x, qTotView.y, qTotView.z, qTotView.w);
        
        
        
        heading = quatMatrix.multiplyVector3(h); */
        
        modelMatrix.setRotate((90-wLatitude), 1, 0, 0);
        heading = modelMatrix.multiplyVector3(heading);
        
        up = new Vector3(u.elements);
    }
    else{
        quatMatrix.setFromQuat(qTotView.x, qTotView.y, qTotView.z, qTotView.w);	// Quaternion-->Matrix
        heading = quatMatrix.multiplyVector3(h);
        up = quatMatrix.multiplyVector3(u);
    }
    
    // Get the center position from eye position, heading
    heading.normalize();
    position.elements[0] = g_EyeX + heading.elements[0];
    position.elements[1] = g_EyeY + heading.elements[1];
    position.elements[2] = g_EyeZ + heading.elements[2];
    
          var u_Radius = gl.getUniformLocation(gl.program, 'u_Radius');
          if (!u_Radius) { 
              console.log('Failed to get u_Radius');
              return;
        }
        gl.uniform1f(u_Radius, pRadius);
    

    draw(canvas, gl);  
    requestAnimationFrame(tick, canvas);   // Request that the browser ?calls tick
       
  };
  
  var seconds = 0;
function animate()
{
  now = Date.now();
  var lastElapsed = now - g_last;
  var totalElapsed = now - startTime;
  g_last = now;
  

  
  // Day Zero: Northern Hemisphere Vernal Equinox
  // Start Point: Midnight on the Vernal Equinox
  
  // Latitude considerations applied by rotation transformation
  // Based on 90 degree latiude
  
  var speed = 60*24*(60/x_s); // 1 day = x seconds
  seconds += lastElapsed*speed/1000.0;
  var day = seconds/(24*60*60);
  var theta = 2*Math.PI*day;    // day cycle
  
  var radius = 100; // radius of celestial sphere (ie, sky box)
  var tiltR = tilt*Math.PI/180; // tilt converted to radians
  var phi = Math.PI/2.0 + tiltR*Math.sin(theta/numDays);  // Tilt over year cycle
  
  sunX = radius*Math.sin(phi)*Math.cos(theta-(Math.PI/2.0));
  sunZ = -1*radius*Math.sin(phi)*Math.sin(theta-(Math.PI/2.0));
  sunY = -radius*Math.cos(phi);
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
    
    string = "Latitude: " + wLatitude.toFixed(2);
    document.getElementById("p2").innerHTML = string;
    
    phi -= Math.PI/2;   
    latitudeR = wLatitude*Math.PI/180;
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
