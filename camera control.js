/* 
 * Contains quaternion camera control methods, lookAt function
 */

function lookAt(eye, position, up)
{
   // Calculates camera position based on (center) position, up vectors and eye position
  var viewMatrix = new Matrix4();                    
  viewMatrix.setLookAt(eye.elements[0], eye.elements[1], eye.elements[2],
                        position.elements[0], 
                        position.elements[1], 
                        position.elements[2],
                        up.elements[0], up.elements[1], up.elements[2]); 
  return viewMatrix;
                                                
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
    q = globals.quaternions[global.interaction.dragMode];
    rotateAxisHelper(q.last, q.total, xdrag, ydrag)
		
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
function rotateAxis(x, y, z, factor, q)
 {
  qTmp = new Quaternion(0, 0, 0, 1);
  q.last.setFromAxisAngle(x, y, z, factor*90/12);
  qTmp.multiply(q.total, q.last);
  qTmp.normalize();						
  q.total.copy(qTmp);
}

