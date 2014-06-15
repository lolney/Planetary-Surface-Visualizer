/* 
 * Contains callbacks for buttons, sliders, etc.
 */

function keydown(ev, canvas, gl) {
//------------------------------------------------------
//HTML calls this'Event handler' or 'callback function' when we press a key:

// rotateAxis uses quaternion rotation

// Moving with the arrow keys mimics moving around the planet
    
        var headV2;
        
        var north = vec2.clone([0, -1]);
        var west = vec2.clone([1, 0]);
        headV2 = vec2.clone([heading.elements[0], heading.elements[2]]);
        
        var s = .5;
        
            if (ev.keyCode == 87) { // W 
                latitude += s * vec2.dot(north, headV2);
                longitude += s * vec2.dot(west, headV2);
            } else
            if (ev.keyCode == 83) { // S 
                latitude -= s * vec2.dot(north, headV2);
                longitude -= s * vec2.dot(west, headV2);
            } else
            if (ev.keyCode == 65) { // A 
                longitude -= s * vec2.dot(north, headV2);
                latitude += s * vec2.dot(west, headV2);
            } else
            if (ev.keyCode == 68) { // D
                longitude += s * vec2.dot(north, headV2);  
                latitude -= s * vec2.dot(west, headV2);
            } else
        
        
    if(ev.keyCode == 39) { // Right arrow (adjust yaw)
      rotateAxis(0, 1, 0, -1);
      //heading = yawMatN.multiplyVector3(heading);
      //up = yawMatN.multiplyVector3(up);
      } else 
    if (ev.keyCode == 37) { // Left arrow (adjust yaw)
      rotateAxis(0, 1, 0, 1);
      //heading = yawMatP.multiplyVector3(heading);
      //up = yawMatP.multiplyVector3(up);
    } 
        
/*
    if (ev.keyCode == 87) { // W (go forward, dependent on orientation)
        g_EyeX += heading.elements[0]*.1;
        g_EyeY += heading.elements[1]*.1;
        g_EyeZ += heading.elements[2]*.1;
    } else
    if (ev.keyCode == 83) { // S (go back, dependent on orientation)
        g_EyeX -= heading.elements[0]*.1;
        g_EyeY -= heading.elements[1]*.1;
        g_EyeZ -= heading.elements[2]*.1;
    } else
    if (ev.keyCode == 65) { // A (go left)
        // Use cross product to find vector orthogonal to both
        // Up and heading vectors; this should be to the left 
        var n = heading.crossProduct(up);
        g_EyeX -= n.elements[0]*.1;
        g_EyeY -= n.elements[1]*.1;
        g_EyeZ -= n.elements[2]*.1;        
    } else
    if (ev.keyCode == 68) { // D (go right)
        
        var n = heading.crossProduct(up);
        g_EyeX += n.elements[0]*.1;
        g_EyeY += n.elements[1]*.1;
        g_EyeZ += n.elements[2]*.1;        
    }

*/
    else if(ev.keyCode == 82){ // R: reset
        g_EyeX = 0;
        g_EyeY = 0;
        g_EyeZ = -1;
        
        resetPitch();
        
    }
    
    else if(ev.keyCode == 32){ // Space: change camera
        if(camera === "ortho") camera = "persp";
        else camera = "ortho";
    }
    
    else if(ev.keyCode == 69){ // E: adjust pitch
        rotateAxis(1, 0, 0, 1);
        //heading = pitchMatP.multiplyVector3(heading);
        //up = pitchMatP.multiplyVector3(up);
    } else if(ev.keyCode == 81){ // Q: adjust pitch
        rotateAxis(1, 0, 0, -1);
        //heading = pitchMatN.multiplyVector3(heading);
        //up = pitchMatN.multiplyVector3(up);
    }
    
    else if(ev.keyCode == 90){ // Z:  adjust roll
        rotateAxis(0, 0, 1, 1);
        //up = rollMatN.multiplyVector3(up);
        //heading = rollMatN.multiplyVector3(heading);
    } else if(ev.keyCode == 88){ // X:  adjust roll
        rotateAxis(0, 0, 1, -1);
        //up = rollMatP.multiplyVector3(up);
        //heading = rollMatP.multiplyVector3(heading);
    }
    
    else if(ev.keyCode == 112){ // F1: help
        showConsole();
    }
    else { console.log(ev.keyCode); return; } // Prevent the unnecessary drawing
    
    wLatitude = wrap(latitude);
    //draw(canvas, gl);    
}

/**
* Gets values from the textboxes, sliders 
* And keep them synchronized
* Special callback for time: log scale

 * @param {type} slider
 * @param {type} textBox
 * @param {type} idSwitch
 * @returns {undefined} 
 */ 
function getValue(slider, textBox, idSwitch)
{
    var x = document.getElementById(textBox);
    var y = document.getElementById(slider);
    if(idSwitch === 0)
    {    
        x.value = Math.pow(24, y.value);
    } else
    {
        y.value = Math.log(x.value)/Math.log(24);
    }
    
    // to fix an odd bug in which the number didn't seem to be formatted properly:
    var temp = Math.pow(x.value, 1); 
    
    switch(slider)
    {
        case "speedS":
            x_s = temp;
            break;
    }
    
}

function getValue2(slider, textBox, idSwitch)
{
    var x = document.getElementById(textBox);
    var y = document.getElementById(slider);
    if(idSwitch === 0)
    {    
        x.value = y.value;
    } else
    {
        y.value = x.value;
    }
    
    // to fix an odd bug in which the number didn't seem to be formatted properly:
    var temp = Math.pow(y.value, 1); 
    
    switch(slider)
    {
        case "tiltS":
                tilt = temp;
                console.log("Caled");
            break;
        case "radiusS":
                pRadius = temp;
                break;
        case "yearS":
                numDays = temp;
            break;
    }
    
}



// Change what gets rotated by the mouse
function behaviorChange(sel){

    var  value = sel.options[sel.selectedIndex].value;
    
    if(value === "0") control = 0;
    if(value === "1") control = 1;
    if(value === "2") control = 2;
    if(value === "3") control = 3;
       
}


function click(ev, canvas) {
    // Set new coordinates of mouse click
      
    isMouseDown = true;
    
    x = ev.clientX; // x coordinate of a mouse pointer
    y = ev.clientY; // y coordinate of a mouse pointer
     
    x = x/canvas.width;
    y = y/canvas.width;
    
}
  
function mouseMove(ev, canvas)
{
    // Show change in x, y
    mxNew = ev.clientX;
    myNew = ev.clientY;
      
    mxNew = mxNew/canvas.width;
    myNew = myNew/canvas.width;
    
    var xdrag = mxNew-x + .00001;
    var ydrag = y-myNew + .00001;
    var dist = Math.sqrt(xdrag*xdrag + ydrag*ydrag);
    
    if(Math.abs(xdrag) > Math.abs(5 * ydrag))
        rotateAxis(0, xdrag, 0, dist);
    else if(Math.abs(ydrag) > Math.abs(5 * xdrag))
        rotateAxis(0, 0, -ydrag, dist);
    else{
        ydrag = ydrag / Math.abs(ydrag);
        xdrag = xdrag / Math.abs(xdrag);
       // rotateAxis(0, 1*xdrag, 1*ydrag, -dist);
    }
       
    
   // dragQuat(mxNew-x, y-myNew);
}

function toggleLock()
{
    if(lockToSun) {
        // Start off from current view
        
        // Find vector orthogonal to h and in plane containing h, heading
        var axis = heading.crossProduct(h);
        axis.normalize();
        // Use that vector as rotation axis 
        var a = axis.elements;
        
        // Find angle between heading and h
        var angle = Math.acos(heading.dot(h)/(h.length()*heading.length()));
        qTotView.setFromAxisAngle(a[0],a[1],a[2], - angle * 180 / Math.PI);
        quatMatrix.setFromQuat(qTotView.x, qTotView.y, qTotView.z, qTotView.w);
        
        lockToSun = false;
    }
    else lockToSun = true;
}

function planetChooser(sel)
{
    var  value = sel.options[sel.selectedIndex].value;
    var pane = document.getElementById("pane");

    switch(value){
        case "Earth":
            tilt = 23.4;
            numDays = 365;
            
            pane.style.display = "none";
            break;
        case "Uranus":
            tilt = 97.77;
            numDays = 84.323 * 365;
            
            pane.style.display = "none";
            break;
        case "B612":
            tilt = 0;
            numDays = 100;
            pRadius = 10;
            
            pane.style.display = "none";
            break;
        case "Custom":            
            pane.style.display = "inline";
            break;
    }
    
    synchUI("tilt", tilt);
    synchUI("radius", pRadius);
    synchUI("year", numDays);
    
}

function  synchUI(name, value){
    var elem = document.getElementById(name + "S");
    var elem2 = document.getElementById(name + "R");
    elem2.value = elem.value = value;       
}


