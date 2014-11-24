/* Webworker program to quickly update ground grid as we move around */

function makeGroundGrid(XStart, YStart)
{
    // Makes a grid of circles (uses gl.TRIANGLES)
    floatsPerVertex = 6;
    var iColr = new Float32Array([.1, .2, .6]); // Interior color
    var oColr = new Float32Array([.5, .2, .6]); // Exterior color
    var circleTriangles = 24;
    var XNum = 100;
    var YNum = 100;
    gndVerts = new Float32Array(floatsPerVertex*circleTriangles*3*XNum*YNum);
    
    var j=0; 
    // Go along x axis,
    for(var XOffset = -XNum + XStart; XOffset < XNum + XStart; XOffset+=2, j)
    {
        // Go along y axis,
        for(var YOffset = -YNum + YStart; YOffset < YNum + YStart; YOffset+=2, j += floatsPerVertex*3)
        {
            // Draw an individual circle
            for(var i=0; i < circleTriangles; j+= floatsPerVertex*3, i++)
            {
                gndVerts[j  ] = 0 + XOffset;  // x
                gndVerts[j+1] = 0 + YOffset;                // y
                gndVerts[j+2] = 0.0;

                gndVerts[j+3] = iColr[0];     // red
                gndVerts[j+4] = iColr[1];     // grn
                gndVerts[j+5] = iColr[2];
                
                gndVerts[j+6] = Math.cos(i*2*Math.PI/circleTriangles) + XOffset;  // x
                gndVerts[j+7] = Math.sin(i*2*Math.PI/circleTriangles) + YOffset;                // y
                gndVerts[j+8] = 0.0;

                gndVerts[j+9] = oColr[0];     // red
                gndVerts[j+10] = oColr[1] + Math.sin(XOffset/25);     // grn
                gndVerts[j+11] = oColr[2];
                
                gndVerts[j+12] = Math.cos((i+1)*2*Math.PI/circleTriangles) + XOffset; // x
                gndVerts[j+13] = Math.sin((i+1)*2*Math.PI/circleTriangles) + YOffset;               // y
                gndVerts[j+14] = 0.0;

                gndVerts[j+15] = oColr[0];      // red
                gndVerts[j+16] = oColr[1] + Math.sin(XOffset/25);     // grn
                gndVerts[j+17] = oColr[2];
            }
        }
    }
    
    return gndVerts;
    
}

/**
 * Called on creation of the web worker; posts data to the main program
 * @param {Event} ev    The recieved event, expected to contain the startX and Y coordinates for the ground grid 
 */
onmessage = function(ev){
  data = JSON.parse(ev.data);
  buffer = makeGroundGrid(data.longitude, data.latitude);
  postMessage(buffer.buffer, [buffer.buffer]);
}