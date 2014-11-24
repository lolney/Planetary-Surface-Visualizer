/* 
 * Contains quaternion camera control methods, lookAt function
 */

/**
 * Calculates the view matrix for the given paramaters
 * @param {Vector3} eye           Eye vector: center of projection
 * @param {Vector3} position      Where to 'look at'; ie, eye + heading
 * @param {Vector3} up            Up vector
 * @return {Matrix4}              The view matrix
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

/**
 * Quaternion-based mouse rotation
 * @param {Number} xdrag      Distance draged (X)
 * @param {Number} ydrag      Distance draged (Y)
 * @param {Object} q          quaternion
 */
function dragQuat(xdrag, ydrag, q) {
// We find a rotation axis perpendicular to the drag direction, and convert the 
// drag distance to an angular rotation amount, and use both to set the value of 
// the quaternion qNew.  We then combine this new rotation with the current 
// rotation stored in quaternion 'qTot' by quaternion multiply.
    
    var qTmp = new Quaternion(0,0,0,1);
    var dist = Math.sqrt(xdrag*xdrag + ydrag*ydrag);
        
    q.last.setFromAxisAngle(ydrag + 0.0001, -xdrag + 0.0001, 0.0, dist*150.0);

    qTmp.multiply(q.last,q.total);      // apply new rotation to current rotation.
    qTmp.normalize();           // normalize to ensure we stay at length==1.0.
    q.total.copy(qTmp);
		
};


/**
 * Apply a rotation specified by factor to the quaternion around the given axis
 * @param {Number} x      
 * @param {Number} y      
 * @param {Number} z
 * @param {Number} factor 
 * @param {Object} q          quaternion 
 */
function rotateAxis(x, y, z, factor, q)
 {
  qTmp = new Quaternion(0, 0, 0, 1);
  q.last.setFromAxisAngle(x, y, z, factor);
  qTmp.multiply(q.total, q.last);
  qTmp.normalize();						
  q.total.copy(qTmp);
}

