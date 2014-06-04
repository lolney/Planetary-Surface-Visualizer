/* 
 * Contains quaternion camera control methods, lookAt function
 */

function lookAt()
{
   // Calculates camera position based on (center) position, up vectors and eye position                     
  viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ,
                        position.elements[0], 
                        position.elements[1], 
                        position.elements[2],
                        up.elements[0], up.elements[1], up.elements[2]); 
                                                
}


function resetPitch()
{
    // Reset rotations of camera, objects
    pitch = 0;
    roll = 0;
    yaw = 0;
    
    // Reset joint quaternions
    qNewView = new Quaternion(0,0,0,1);
    qTotView = new Quaternion(0,0,0,1);
    
    // Reset joint quaternions
    qNewG = new Quaternion(0,0,0,1); // most-recent mouse drag's rotation
    qTotG = new Quaternion(0,0,0,1);	// 'current' orientation (made from qNew)

    qNew1 = new Quaternion(0,0,0,1); // most-recent mouse drag's rotation
    qTot1 = new Quaternion(0,0,0,1);	// 'current' orientation (made from qNew)

    qNew2 = new Quaternion(0,0,0,1); // most-recent mouse drag's rotation
    qTot2 = new Quaternion(0,0,0,1);	// 'current' orientation (made from qNew)

    qNew3 = new Quaternion(0,0,0,1); // most-recent mouse drag's rotation
    qTot3 = new Quaternion(0,0,0,1);	// 'current' orientation (made from qNew)

    
}

function dragQuat(xdrag, ydrag) {
//==============================================================================
// Called when user drags mouse by 'xdrag,ydrag' as measured in CVV coords.
// We find a rotation axis perpendicular to the drag direction, and convert the 
// drag distance to an angular rotation amount, and use both to set the value of 
// the quaternion qNew.  We then combine this new rotation with the current 
// rotation stored in quaternion 'qTot' by quaternion multiply.  Note the 
// 'draw()' function converts this current 'qTot' quaternion to a rotation 
// matrix for drawing. 
	var res = 5;
	
        console.log('xdrag,ydrag=',xdrag.toFixed(5),ydrag.toFixed(5));
        switch(control)
        {
            case 0:
                rotateAxisHelper(qNewG, qTotG, xdrag, ydrag)
                break;
            case 1:
                rotateAxisHelper(qNew1, qTot1, xdrag, ydrag);
                break;
            case 2:
                rotateAxisHelper(qNew2, qTot2, xdrag, ydrag);
                break;
            case 3:
                rotateAxisHelper(qNew3, qTot3, xdrag, ydrag);
                break;
        }
	
	 
	//--------------------------
	// IMPORTANT! Why qNew*qTot instead of qTot*qNew? (Try it!)
	// ANSWER: Because 'duality' governs ALL transformations, not just matrices. 
	// If we multiplied in (qTot*qNew) order, we would rotate the drawing axes
	// first by qTot, and then by qNew--we would apply mouse-dragging rotations
	// to already-rotated drawing axes.  Instead, we wish to apply the mouse-drag
	// rotations FIRST, before we apply rotations from all the previous dragging.
	//------------------------
	// IMPORTANT!  Both qTot and qNew are unit-length quaternions, but we store 
	// them with finite precision. While the product of two (EXACTLY) unit-length
	// quaternions will always be another unit-length quaternion, the qTmp length
	// may drift away from 1.0 if we repeat this quaternion multiply many times.
	// A non-unit-length quaternion won't work with our quaternion-to-matrix fcn.
	// Matrix4.prototype.setFromQuat().
	
};

function rotateAxisHelper(qNew, qTot, xdrag, ydrag)
{
    var qTmp = new Quaternion(0,0,0,1);
    var dist = Math.sqrt(xdrag*xdrag + ydrag*ydrag);
        
    qNew.setFromAxisAngle(ydrag + 0.0001, -xdrag + 0.0001, 0.0, dist*150.0);

    qTmp.multiply(qNew,qTot);			// apply new rotation to current rotation.
    qTmp.normalize();						// normalize to ensure we stay at length==1.0.
    qTot.copy(qTmp);
}

// Rotation function for the view matrix
function rotateAxis(x, y, z, factor)
 {
  qTmp = new Quaternion(0, 0, 0, 1);
  qNewView.setFromAxisAngle(x, y, z, factor*90/12);
  qTmp.multiply(qTotView, qNewView);
  qTmp.normalize();						
  qTotView.copy(qTmp);
}

