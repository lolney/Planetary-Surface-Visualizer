/*
 * Contains methods for initializing vertex/color buffers for geometric objects
 */

/**
 * Single-polygon triangular plane
 * @return {Float32Array}  The completed plane
 */ 
 function dumbGrid(){
 	var gndVerts = new Float32Array([
    -1.0,  1.0,  0.0,  1,  1, .5,
    1.0,  0.0,  0.0,  0,  1, .5,
    -1.0,  -1.0,  0.0,  1,  1, .5,
  ]);

    return gndVerts;
 }

/**
 * Creates a grid of circles
 * @param {int} XStart     X offset - used to specify starting location in world to generate grid
 * @param {int} YStart     Y offset
 * @param {int} XNum       (optional) Number of circles to create (in x direction)
 * @param {int} YNum       (optional) Number of circles to create (in y direction)
 * @return {Float32Array}  The completed grid
 */ 
function makeGroundGrid(XStart, YStart, XNum, YNum)
{
    floatsPerVertex = globals.params.floatsPerVertex;
    var iColr = new Float32Array([.1, .2, .6]); // Interior color
    var oColr = new Float32Array([.5, .2, .6]); // Exterior color
    var circleTriangles = 24;
    XNum = XNum || 100;
    YNum = YNum || 100;
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
                gndVerts[j  ] = 0 + XOffset;	// x
                gndVerts[j+1] = 0 + YOffset;								// y
                gndVerts[j+2] = 0.0;

                gndVerts[j+3] = iColr[0];			// red
                gndVerts[j+4] = iColr[1];			// grn
                gndVerts[j+5] = iColr[2];
                
                gndVerts[j+6] = Math.cos(i*2*Math.PI/circleTriangles) + XOffset;	// x
                gndVerts[j+7] = Math.sin(i*2*Math.PI/circleTriangles) + YOffset;								// y
                gndVerts[j+8] = 0.0;

                gndVerts[j+9] = oColr[0];			// red
                gndVerts[j+10] = oColr[1] + Math.sin(XOffset/25);			// grn
                gndVerts[j+11] = oColr[2];
                
                gndVerts[j+12] = Math.cos((i+1)*2*Math.PI/circleTriangles) + XOffset;	// x
                gndVerts[j+13] = Math.sin((i+1)*2*Math.PI/circleTriangles) + YOffset;								// y
                gndVerts[j+14] = 0.0;

                gndVerts[j+15] = oColr[0];			// red
                gndVerts[j+16] = oColr[1] + Math.sin(XOffset/25);			// grn
                gndVerts[j+17] = oColr[2];
            }
        }
    }
    
    return gndVerts;
    
}


function makeSphere(r, g, b) {
//==============================================================================
// Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
// equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
// and connect them as a 'stepped spiral' design (see makeCylinder) to build the
// sphere from one triangle strip.
  var slices = 13;		// # of slices of the sphere along the z axis. >=3 req'd
											// (choose odd # or prime# to avoid accidental symmetry)
  var sliceVerts	= 27;	// # of vertices around the top edge of the slice
											// (same number of vertices on bottom of slice, too)
  var topColr = new Float32Array([r, g, b]);	
  var equColr = new Float32Array([r, g, b]);	
  var botColr = new Float32Array([r, g, b]);	
  var sliceAngle = Math.PI/slices;	// lattitude angle spanned by one slice.

	// Create a (global) array to hold this sphere's vertices:
  var sphVerts = new Float32Array(  ((slices * 2 * sliceVerts) -2) * globals.params.floatsPerVertex);
										// # of vertices * # of elements needed to store them. 
										// each slice requires 2*sliceVerts vertices except 1st and
										// last ones, which require only 2*sliceVerts-1.
										
	// Create dome-shaped top slice of sphere at z=+1
	// s counts slices; v counts vertices; 
	// j counts array elements (vertices * elements per vertex)
	var cos0 = 0.0;					// sines,cosines of slice's top, bottom edge.
	var sin0 = 0.0;
	var cos1 = 0.0;
	var sin1 = 0.0;	
	var j = 0;							// initialize our array index
	var isLast = 0;
	var isFirst = 1;
	for(s=0; s<slices; s++) {	// for each slice of the sphere,
		// find sines & cosines for top and bottom of this slice
		if(s==0) {
			isFirst = 1;	// skip 1st vertex of 1st slice.
			cos0 = 1.0; 	// initialize: start at north pole.
			sin0 = 0.0;
		}
		else {					// otherwise, new top edge == old bottom edge
			isFirst = 0;	
			cos0 = cos1;
			sin0 = sin1;
		}								// & compute sine,cosine for new bottom edge.
		cos1 = Math.cos((s+1)*sliceAngle);
		sin1 = Math.sin((s+1)*sliceAngle);
		// go around the entire slice, generating TRIANGLE_STRIP verts
		// (Note we don't initialize j; grows with each new attrib,vertex, and slice)
		if(s==slices-1) isLast=1;	// skip last vertex of last slice.
		for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=globals.params.floatsPerVertex) {	
			if(v%2==0)
			{				// put even# vertices at the the slice's top edge
							// (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
							// and thus we can simplify cos(2*PI(v/2*sliceVerts))  
				sphVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts); 	
				sphVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);	
				sphVerts[j+2] = cos0;		
			}
			else { 	// put odd# vertices around the slice's lower edge;
							// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
							// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
				sphVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);		// x
				sphVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);		// y
				sphVerts[j+2] = cos1;																				// z
			}
			if(s==0) {	// finally, set some interesting colors for vertices:
				sphVerts[j+3]=topColr[0]; 
				sphVerts[j+4]=topColr[1]; 
				sphVerts[j+5]=topColr[2];	
				}
			else if(s==slices-1) {
				sphVerts[j+3]=botColr[0]; 
				sphVerts[j+4]=botColr[1]; 
				sphVerts[j+5]=botColr[2];	
			}
			else {
					sphVerts[j+3]=.5+ r*(Math.abs(Math.sin(j))/2); 
					sphVerts[j+4]=.5+ g*(Math.abs(Math.cos(j))/2); 
					sphVerts[j+5]=.5+ b*(Math.abs(Math.tan(j))/2);					
			}
		}
	}
	return sphVerts;
}

function makeGimbal()
{
    // A 3-d ring created from two parallel two-dimensional rings,
    // Joined together with another two two-dimensional rings
    var i, v;
    var ringverts = 32;
    var outerRadius = 1;
    var innerRadius = .9;
    var width = .1;
    var gimbalVerts = new Float32Array((ringverts * 4) * globals.params.floatsPerVertex);
    
    // Upper ring
    for(i = 0, v = 1; v < ringverts + 1; v++, i+=globals.params.floatsPerVertex)
    {
        if(v % 2 != 0){
            gimbalVerts[i] = Math.cos(2*Math.PI*v/ringverts);
            gimbalVerts[i+1] = Math.sin(2*Math.PI*v/ringverts);
            gimbalVerts[i+2] = 0;
            gimbalVerts[i+3] = .3;
            gimbalVerts[i+4] = .6;
            gimbalVerts[i+5] = .9;
        }
        else
        {
            gimbalVerts[i] = innerRadius*Math.cos(2*Math.PI*(v-1)/ringverts);
            gimbalVerts[i+1] = innerRadius*Math.sin(2*Math.PI*(v-1)/ringverts);
            gimbalVerts[i+2] = 0;
            gimbalVerts[i+3] = .3;
            gimbalVerts[i+4] = .6;
            gimbalVerts[i+5] = .9;
        }
    }
    
    
    // Lower ring
    for(v = 1; v < ringverts + 1; v++, i+=globals.params.floatsPerVertex)
    {
        if(v % 2 != 0){
            gimbalVerts[i] = Math.cos(2*Math.PI*v/ringverts);
            gimbalVerts[i+1] = Math.sin(2*Math.PI*v/ringverts);
            gimbalVerts[i+2] = width;
            gimbalVerts[i+3] = .3;
            gimbalVerts[i+4] = .6;
            gimbalVerts[i+5] = .9;
        }
        else
        {
            gimbalVerts[i] = innerRadius*Math.cos(2*Math.PI*(v-1)/ringverts);
            gimbalVerts[i+1] = innerRadius*Math.sin(2*Math.PI*(v-1)/ringverts);
            gimbalVerts[i+2] = width;
            gimbalVerts[i+3] = .3;
            gimbalVerts[i+4] = .6;
            gimbalVerts[i+5] = .9;
        }
    }
    
    // Connecting ring (outer)
    for(v = 1; v < ringverts + 1; v++, i+=globals.params.floatsPerVertex)
    {
        if(v % 2 != 0){
            gimbalVerts[i] = Math.cos(2*Math.PI*v/ringverts);
            gimbalVerts[i+1] = Math.sin(2*Math.PI*v/ringverts);
            gimbalVerts[i+2] = width;
            gimbalVerts[i+3] = .2;
            gimbalVerts[i+4] = .1;
            gimbalVerts[i+5] = .7;
        }
        else
        {
            gimbalVerts[i] = Math.cos(2*Math.PI*(v-1)/ringverts);
            gimbalVerts[i+1] = Math.sin(2*Math.PI*(v-1)/ringverts);
            gimbalVerts[i+2] = 0;
            gimbalVerts[i+3] = .1;
            gimbalVerts[i+4] = .7;
            gimbalVerts[i+5] = .2;
        }
    }
        
    
    // Connecting ring (inner)
    for(v = 1; v < ringverts + 1; v++, i+=globals.params.floatsPerVertex)
    {
        if(v % 2 != 0){
            gimbalVerts[i] = innerRadius*Math.cos(2*Math.PI*v/ringverts);
            gimbalVerts[i+1] = innerRadius*Math.sin(2*Math.PI*v/ringverts);
            gimbalVerts[i+2] = width;
            gimbalVerts[i+3] = .9;
            gimbalVerts[i+4] = .2;
            gimbalVerts[i+5] = .5;
        }
        else
        {
            gimbalVerts[i] = innerRadius*Math.cos(2*Math.PI*(v-1)/ringverts);
            gimbalVerts[i+1] = innerRadius*Math.sin(2*Math.PI*(v-1)/ringverts);
            gimbalVerts[i+2] = 0;
            gimbalVerts[i+3] = .9;
            gimbalVerts[i+4] = .2;
            gimbalVerts[i+5] = .5;
        }
    }

    return gimbalVerts;
    
    
}

function makeCylinder() {
//==============================================================================
// Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
// 'stepped spiral' design described in notes.
// Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
//
 var ctrColr = new Float32Array([0.2, 0.2, 0.2]);	// dark gray
 var topColr = new Float32Array([0.4, 0.7, 0.4]);	// light green
 var botColr = new Float32Array([0.5, 0.5, 1.0]);	// light blue
 var capVerts = 16;	// # of vertices around the topmost 'cap' of the shape
 var botRadius = 1;		// radius of bottom of cylinder (top always 1.0)
 
 // Create a (global) array to hold this cylinder's vertices;
 var cylVerts = new Float32Array(  ((capVerts*6) -2) * globals.params.floatsPerVertex);
										// # of vertices * # of elements needed to store them. 

	// Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
	// v counts vertices: j counts array elements (vertices * elements per vertex)
	for(v=1,j=0; v<2*capVerts; v++,j+=globals.params.floatsPerVertex) {	
		// skip the first vertex--not needed.
		if(v%2==0)
		{				// put even# vertices at center of cylinder's top cap:
			cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
			cylVerts[j+1] = 0.0;	
			cylVerts[j+2] = 1.0; 
			cylVerts[j+3]=ctrColr[0]; 
			cylVerts[j+4]=ctrColr[1]; 
			cylVerts[j+5]=ctrColr[2];
		}
		else { 	// put odd# vertices around the top cap's outer edge;
						// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
						// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
			cylVerts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);			// x
			cylVerts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);			// y
			//	(Why not 2*PI? because 0 < =v < 2*capVerts, so we
			//	 can simplify cos(2*PI * (v-1)/(2*capVerts))
			cylVerts[j+2] = 1.0;	// z
			// r,g,b = topColr[]
			cylVerts[j+3]=topColr[0]; 
			cylVerts[j+4]=topColr[1]; 
			cylVerts[j+5]=topColr[2];			
		}
	}
	// Create the cylinder side walls, made of 2*capVerts vertices.
	// v counts vertices within the wall; j continues to count array elements
	for(v=0; v< 2*capVerts; v++, j+=globals.params.floatsPerVertex) {
		if(v%2==0)	// position all even# vertices along top cap:
		{		
				cylVerts[j  ] = Math.cos(Math.PI*(v)/capVerts);		// x
				cylVerts[j+1] = Math.sin(Math.PI*(v)/capVerts);		// y
				cylVerts[j+2] = 1.0;	// z
				// r,g,b = topColr[]
				cylVerts[j+3]=topColr[0]; 
				cylVerts[j+4]=topColr[1]; 
				cylVerts[j+5]=topColr[2];			
		}
		else		// position all odd# vertices along the bottom cap:
		{
				cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
				cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
				cylVerts[j+2] = -1.0;	// z
				// r,g,b = topColr[]
				cylVerts[j+3]=botColr[0]; 
				cylVerts[j+4]=botColr[1]; 
				cylVerts[j+5]=botColr[2];			
		}
	}
	// Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
	// v counts the vertices in the cap; j continues to count array elements
	for(v=0; v < (2*capVerts -1); v++, j+= globals.params.floatsPerVertex) {
		if(v%2==0) {	// position even #'d vertices around bot cap's outer edge
			cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);		// x
			cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);		// y
			cylVerts[j+2] =-1.0;	// z
			// r,g,b = topColr[]
			cylVerts[j+3]=botColr[0]; 
			cylVerts[j+4]=botColr[1]; 
			cylVerts[j+5]=botColr[2];		
		}
		else {				// position odd#'d vertices at center of the bottom cap:
			cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
			cylVerts[j+1] = 0.0;	
			cylVerts[j+2] =-1.0; 
			cylVerts[j+3]=botColr[0]; 
			cylVerts[j+4]=botColr[1]; 
			cylVerts[j+5]=botColr[2];
		}
	}

	return cylVerts;
}

function makePedestal() {
//==============================================================================
// Adapted from cylinder; a pedastal that tapers in the center 
//
 var ctrColr = new Float32Array([0.2, 0.2, 0.2]);	// dark gray
 var topColr = new Float32Array([0.4, 0.7, 0.4]);	// light green
 var botColr = new Float32Array([0.5, 0.5, 1.0]);	// light blue
 var capVerts = 16;	// # of vertices around the topmost 'cap' of the shape
 var botRadius = 2;		
 var topRadius = .5;
 var steps = 6;
 
 // Create a (global) array to hold this cylinder's vertices;
 var pedVerts = new Float32Array(  ((capVerts*4*steps*2) -2) * globals.params.floatsPerVertex);
										// # of vertices * # of elements needed to store them. 

	// Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
	// v counts vertices: j counts array elements (vertices * elements per vertex)
	for(v=1,j=0; v<2*capVerts; v++,j+=globals.params.floatsPerVertex) {	
		// skip the first vertex--not needed.
		if(v%2==0)
		{				// put even# vertices at center of cylinder's top cap:
			pedVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
			pedVerts[j+1] = 0.0;	
			pedVerts[j+2] = 1.0; 
			pedVerts[j+3]=ctrColr[0]; 
			pedVerts[j+4]=ctrColr[1]; 
			pedVerts[j+5]=ctrColr[2];
		}
		else { 	// put odd# vertices around the top cap's outer edge;
						// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
						// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
			pedVerts[j  ] = topRadius*Math.cos(Math.PI*(v-1)/capVerts);			// x
			pedVerts[j+1] = topRadius*Math.sin(Math.PI*(v-1)/capVerts);			// y
			//	(Why not 2*PI? because 0 < =v < 2*capVerts, so we
			//	 can simplify cos(2*PI * (v-1)/(2*capVerts))
			pedVerts[j+2] = 1.0;	// z
			// r,g,b = topColr[]
			pedVerts[j+3]=topColr[0]; 
			pedVerts[j+4]=topColr[1]; 
			pedVerts[j+5]=topColr[2];			
		}
	}
	// Create the cylinder side walls, made of 2*capVerts vertices.
	// v counts vertices within the wall; j continues to count array elements
        // Bottom end
        var radius = topRadius;
        for(var i=steps; i>0; i--)
        {
             
            for(v=0; v< 2*capVerts; v++, j+=globals.params.floatsPerVertex) {
		if(v%2 != 0)	// position all odd# vertices along the top cap:
		{		
                                radius = topRadius + Math.pow(((steps - i)/steps), 3)*(botRadius-topRadius);
                                
				pedVerts[j  ] = radius * Math.cos(Math.PI*(v-1)/capVerts);		// x
				pedVerts[j+1] = radius * Math.sin(Math.PI*(v-1)/capVerts);		// y
				pedVerts[j+2] = -1 + i*2/steps;	// z
				// r,g,b = topColr[]
				pedVerts[j+3]=Math.sin(v); 
				pedVerts[j+4]=Math.sin(v); 
				pedVerts[j+5]=Math.sin(v);			
		}
		else		// position all even# vertices along bottom cap:
		{
                                // Larger radius
				radius = topRadius + Math.pow(((steps - i + 1)/steps), 3)*(botRadius-topRadius);
                                
                                pedVerts[j  ] = radius*Math.cos(Math.PI*(v)/capVerts);		// x
				pedVerts[j+1] = radius*Math.sin(Math.PI*(v)/capVerts);		// y
				pedVerts[j+2] = -1 + (i-1)*2/steps;	// z
				// r,g,b = topColr[]
				pedVerts[j+3]=botColr[0]; 
				pedVerts[j+4]=botColr[1]; 
				pedVerts[j+5]=botColr[2];
		}
            }
        }
	
        
        
	// Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
	// v counts the vertices in the cap; j continues to count array elements
	for(v=0; v < (2*capVerts -1); v++, j+= globals.params.floatsPerVertex) {
		if(v%2==0) {	// position even #'d vertices around bot cap's outer edge
			pedVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);		// x
			pedVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);		// y
			pedVerts[j+2] = -1.0;	// z
			// r,g,b = topColr[]
			pedVerts[j+3]=botColr[0]; 
			pedVerts[j+4]=botColr[1]; 
			pedVerts[j+5]=botColr[2];		
		}
		else {				// position odd#'d vertices at center of the bottom cap:
			pedVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
			pedVerts[j+1] = 0.0;	
			pedVerts[j+2] = -1.0; 
			pedVerts[j+3]=botColr[0]; 
			pedVerts[j+4]=botColr[1]; 
			pedVerts[j+5]=botColr[2];
		}
	}

	return pedVerts;
}

function makeAxis()
{
    // To be drawn as lines representing the drawing axes 
    var axisVerts = new Float32Array([
    0.0,  0.0,  0.0,  1,  1, 1,
    1.0,  0.0,  0.0,  0,  1, 1,
    
    0.0,  0.0,  0.0,  1,  1, 1,
    0.0,  1.0,  0.0,  1,  0, 1,
    
    0.0,  0.0,  0.0,  1,  1, 1,
    0.0,  0.0,  1.0,  1,  1, 0
  ]);

    return axisVerts;
}

function pushPoint(array){
    var a = new Array();
    if(a.length > 10*globals.params.floatsPerVertex) {
        for(var i=0; i< globals.params.floatsPerVertex; i++)
            a.pop();
    }
    a.unshift(a[0],a[1],a[2],.6,.6,.6);
        
}