/* 
 * Contains quaternion camera control methods, lookAt function
 */

var camera = {
  
  /**
   * Calculates the view matrix for the given paramaters
   * @param {Vector3} eye           Eye vector: center of projection
   * @param {Vector3} position      Where to 'look at'; ie, eye + heading
   * @param {Vector3} up            Up vector
   * @return {Matrix4}              The view matrix
   */
  lookAt : function(eye, position, up)
  {
     // Calculates camera position based on (center) position, up vectors and eye position
    var viewMatrix = new Matrix4();                    
    viewMatrix.setLookAt(eye.elements[0], eye.elements[1], eye.elements[2],
                          position.elements[0], 
                          position.elements[1], 
                          position.elements[2],
                          up.elements[0], up.elements[1], up.elements[2]); 
    return viewMatrix;
                                                  
  }, 

  /**
   * Called every frame: Updates position vectors based on appropriate camera settings
   */
  updateCamera : function(){
    // Apply camera transformations
    m = new Matrix4();
    if(globals.camera.lockToSun)
    {        
        m.setRotate(a.latitude, 1, 0, 0);
        globals.camera.heading = m.multiplyVector3(globals.animation.sun);
        
        //globals.camera.up = new Vector3(globals.camera.u.elements);
    }
    else{
        q = globals.quaternions['view'].total;
        m.setFromQuat(q.x, q.y, q.z, q.w);  // Quaternion-->Matrix
        globals.camera.heading = m.multiplyVector3(globals.camera.h);
        //globals.camera.up = m.multiplyVector3(globals.camera.u);
    } 
    
    // Get the center position from eye position, heading
    h = globals.camera.heading;
    po = globals.camera.position.elements;
    e = globals.camera.eye.elements;
    h.normalize();
    po[0] = e[0] + h.elements[0];
    po[1] = e[1] + h.elements[1];
    po[2] = e[2] + h.elements[2];
  },

  /**
   * Quaternion-based mouse rotation
   * @param {Number} xdrag      Distance draged (X)
   * @param {Number} ydrag      Distance draged (Y)
   * @param {Object} q          quaternion
   */
  dragQuat : function(xdrag, ydrag, q) {
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
  		
  },


  /**
   * Apply a rotation specified by factor to the quaternion around the given axis
   * @param {Number} x      
   * @param {Number} y      
   * @param {Number} z
   * @param {Number} factor 
   * @param {Object} q          quaternion 
   */
  rotateAxis : function(x, y, z, factor, q)
   {
    qTmp = new Quaternion(0, 0, 0, 1);
    q.last.setFromAxisAngle(x, y, z, factor);
    qTmp.multiply(q.last, q.total);
    qTmp.normalize();						
    q.total.copy(qTmp);
  },

  rotateAxisMatrix : function(axis, target, scale){
    a = axis.elements;
    R = new Matrix4();
    R.setRotate(scale,a[0],a[1],a[2]);
    return R.multiplyVector3(target);
  }
}

