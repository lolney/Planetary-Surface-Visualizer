/* 
 * Contains callbacks for buttons, sliders, etc.
 */

/*
* Loops through currently pressed keys
*/
function keydown() {
//------------------------------------------------------
// camera.rotateAxis uses quaternion rotation

    var c = globals.camera;
    var a = globals.animation;
    
    var north = vec2.clone([0, -1]);
    var west = vec2.clone([1, 0]);
    var headV2 = vec2.clone([c.heading.elements[0], c.heading.elements[2]]);
    vec2.normalize(headV2, headV2);

    var s = .05;

    // Loop though all keys that are currently considered active
    // Allows multiple keys to be selected at once
    var dLat = 0;
    var dLng = 0;
    for(i in globals.keyCodes){
        if(i > 5)
            break;
        keycode = globals.keyCodes[i];
        switch(keycode){
            case 87: // W
                dLat += s * vec2.dot(north, headV2);
                dLng += s * vec2.dot(west, headV2);
                break;
            case 83: // S 
                dLat -= s * vec2.dot(north, headV2);
                dLng -= s * vec2.dot(west, headV2);
                break;
            case 65: // A 
                dLat += s * vec2.dot(west, headV2);
                dLng -= s * vec2.dot(north, headV2);
                break;
            case 68:// D
                dLat -= s * vec2.dot(west, headV2);  
                dLng += s * vec2.dot(north, headV2);
                break;
            
            case 39: // Right arrow (adjust yaw)
              camera.rotateAxis(0, 1, 0, -1, globals.quaternions['view']);
              break;
            case 37: // Left arrow (adjust yaw)
              camera.rotateAxis(0, 1, 0, 1, globals.quaternions['view']);
              break;
                
            case 82: // R: reset
                g_EyeX = 0;
                g_EyeY = 0;
                g_EyeZ = -1;
                
                break;
                
            case 69: // E: adjust pitch
                camera.rotateAxis(1, 0, 0, 1, globals.quaternions['view']);
                break;
            case 81: // Q: adjust pitch
                camera.rotateAxis(1, 0, 0, -1, globals.quaternions['view']);
                break;    
            case 90: // Z:  adjust roll
                camera.rotateAxis(0, 0, 1, 1, globals.quaternions['view']);
                break;
            case  88: // X:  adjust roll
                camera.rotateAxis(0, 0, 1, -1, globals.quaternions['view']);
                break;
            
            case 112: // F1: help
                showConsole();
                break;
            default:
                console.log(keycode); 
        }  
    }
    if(dLat || dLng){
        var velocity = {lat: dLat, lng: dLng};
        sphere.calcNewPoint(velocity);

        globals.animation.raw_latitude += dLat;
        globals.animation.raw_longitude += dLng;
    }

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

    if(!x.value.match(/^\d+(\.\d+)?$/)) return;

    if(idSwitch === 0)
    {    
        x.value = Math.pow(24, y.value);
    } else
    {
        y.value = Math.log(x.value)/Math.log(24);
    }

    temp = Number(x.value);
    console.log(temp);

    switch(slider)
    {
        case "speedS":
            globals.animation.x_s = temp;
            break;
    } 
    
}

/**
* Gets values from the textboxes, sliders 
* And keep them synchronized
* For sliders with 1:1 correspondance between range and slider value 

 * @param {type} slider
 * @param {type} textBox
 * @param {type} idSwitch
 * @returns {undefined} 
 */ 
function getValue2(slider, textBox, idSwitch)
{

    var x = document.getElementById(textBox);
    var y = document.getElementById(slider);

    if(!x.value.match(/^\d+(\.\d+)?$/)) return;

    if(idSwitch === 0)
    {    
        x.value = y.value;
    } else
    {
        y.value = x.value;
    }

    temp = Number(y.value);
    
    switch(slider)
    {
        case "tiltS":
                globals.currentPlanet.tilt = temp;
            break;
        case "radiusS":
                globals.currentPlanet.radius = temp;
                break;
        case "yearS":
                globals.currentPlanet.numDays = temp;
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

/**
 * Callback for latitude textbox 
 * @param {Object} elem     The textbox element    
 */
function changeLatitude(elem){
    if(elem.value.match(/^\d+(\.\d+)?$/)){
        globals.animation.latitude = Number(elem.value);
        globals.animation.raw_latitude = Number(elem.value);
    }
}

/**
 * Registers the initial position of the mouse     
 */
function click(ev, canvas) {
    // Set new coordinates of mouse click
    i = globals.interaction;

    i.MouseDown = true;
    
    i.x = ev.clientX; // x coordinate of a mouse pointer
    i.y = ev.clientY; // y coordinate of a mouse pointer
     
    i.x = i.x/canvas.width;
    i.y = i.y/canvas.width;
    
}

/**
 * Rotates the camera according to mouse movement    
 */
function mouseMove(ev, canvas)
{
    // Show change in x, y
    i = globals.interaction;
    i.mxNew = ev.clientX;
    i.myNew = ev.clientY;
      
    i.mxNew = i.mxNew/canvas.width;
    i.myNew = i.myNew/canvas.width;
    
    var xdrag = i.mxNew-i.x + .00001;
    
    q = globals.quaternions['view'];
    camera.rotateAxis(0, 1, 0, xdrag * 10, q);
}

/**
 * Callback for 'Lock to Sun' toggle
 * Sets the view quaternion appropriately if toggled off
 */
function toggleLock()
{
    if(globals.camera.lockToSun) {
        // Start off from current view
        
        // Find vector orthogonal to h and in plane containing h, heading
        var heading = globals.camera.heading;
        var h = globals.camera.h;
        var axis = heading.crossProduct(h);
        axis.normalize();
        // Use that vector as rotation axis 
        var a = axis.elements;
        
        // Find angle between heading and h
        var angle = Math.acos(heading.dot(h)/(h.length()*heading.length()));
        angle = angle * 180 / Math.PI;
        globals.quaternions['view'].total.setFromAxisAngle(a[0],a[1],a[2], -angle);
        if(angle > 90 && angle < 270){
            camera.rotateAxis(1, 0, 0, 180, globals.quaternions['view']);
        }
        globals.camera.lockToSun = false;
    }
    else globals.camera.lockToSun = true;
}

/**
 * Callback for planet select
 * Changes the current planet to the one selected
 * @param {Object} sel     The select object
 */
function planetChooser(sel)
{
    var  value = sel.options[sel.selectedIndex].value;
    var pane = document.getElementById("pane");

    switch(value){
        case "Earth":
            globals.currentPlanet = {
                tilt : 23.4,
                numDays : 365,
                radius : 200
            }    
            pane.style.display = "none";
            break;
        case "Uranus":
            globals.currentPlanet = {
                tilt : 97.4,
                numDays : 84.323 * 365,
                radius : 200
            }            
            pane.style.display = "none";
            break;
        case "B612":
            globals.currentPlanet = {
                tilt : 0,
                numDays : 100,
                radius : 10
            }            
            pane.style.display = "none";
            break;
        case "Custom":            
            pane.style.display = "inline";
            break;
    }
    
    synchUI("tilt", globals.currentPlanet.tilt);
    synchUI("radius", globals.currentPlanet.radius);
    synchUI("year", globals.currentPlanet.numDays);
    
}

/**
 * Keep the UI text and range elements synchronized with the global value 
 * @param {String} name    UI element to synch      
 * @param {Number} vel     Global value      
 */
function  synchUI(name, value){
    var elem = document.getElementById(name + "S");
    var elem2 = document.getElementById(name + "R");
    elem2.value = elem.value = value;       
}


