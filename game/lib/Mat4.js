//define(function () {
var noz=false;

    function Vec(values) {
        if (values !== undefined) {
            this[0]=values[0];
            this[1]=values[1];
            this[2]=values[2];
        } else {
            this[0]=0;
            this[1]=0;
            this[2]=0;
        }
    } 
    
    Vec.prototype.plus = function(other) {
        var toRet = new Vec(this);
        toRet[0] += other[0];
        toRet[1] += other[1];
        toRet[2] += other[2];
        return toRet;
    };
    
    Vec.prototype.minus = function(other) {
        var toRet = new Vec(this);
        toRet[0] -= other[0];
        toRet[1] -= other[1];
        toRet[2] -= other[2];
        return toRet;
    };
    
    Vec.prototype.scale = function(value) {
        var toRet = new Vec(this);
        toRet[0] *= value;
        toRet[1] *= value;
        toRet[2] *= value;
        return toRet;
    }

    Vec.prototype.cross = function(other) {
        return new Vec([this[1]*other[2] - this[2]*other[1], this[2]*other[0] - this[0]*other[2], this[0]*other[1] - this[1]*other[0]]);
    };
    Vec.prototype.dot = function(other) {
        return this[0]*other[0] + this[1]*other[1] + this[2]*other[2];
    };
    
    Vec.prototype.mag = function() {
        return Math.sqrt(this[0]*this[0] + this[1]*this[1] + this[2]*this[2]);;
    }
    
    Vec.prototype.normalize = function() {
        var mag = this.mag();
        if (mag !=0) {
            this[0] /= mag;
            this[1] /= mag;
            this[2] /= mag;
        }
        return this;
    };
    
    Vec.prototype.flat = function() {
        return [this[0], this[1], this[2]];
    };


/////////////////////////////////////


    function Mat4(copy) {
        if (copy === undefined) { 
            this.values = [ [1, 0, 0, 0],
                            [0, 1, 0, 0],
                            [0, 0, 1, 0],
                            [0, 0, 0, 1] ];
        }
        else {
            this.values = [ [copy.get(0,0), copy.get(0,1), copy.get(0,2), copy.get(0,3)],
                            [copy.get(1,0), copy.get(1,1), copy.get(1,2), copy.get(1,3)],
                            [copy.get(2,0), copy.get(2,1), copy.get(2,2), copy.get(2,3)],
                            [copy.get(3,0), copy.get(3,1), copy.get(3,2), copy.get(3,3)] ];
        }
    }
    Mat4.prototype.get = function(row,col) {
            return this.values[row][col];
        };
    Mat4.prototype.set = function(row,col,value) {
            this.values[row][col]=value;
        };
    Mat4.prototype.multiply = function(otherMat) {
        var toRet = new Mat4();
        for (var row=0; row<4; row++)
            for (var col=0; col<4; col++) {
                var val=0;
                for (var i=0; i<4; i++) {
                    val += this.get(row,i)*otherMat.get(i,col);
                }
                toRet.values[row][col]=val;
            }
        return toRet;
    };
    
    Mat4.prototype.translate = function(vec) {
            var trans = new Mat4();
            trans.values = [ [1, 0, 0, vec[0]],
                             [0, 1, 0, vec[1]],
                             [0, 0, 1, vec[2]],
                             [0, 0, 0, 1] ];
            return trans.multiply(this);
    };
    
    Mat4.prototype.scale = function(vec) {
            var sc = new Mat4();
            sc.values =    [ [vec[0], 0, 0, 0],
                             [0, vec[1], 0, 0],
                             [0, 0, vec[2], 0],
                             [0, 0, 0, 1] ];
            return sc.multiply(this);
    };
    
    Mat4.prototype.rotateXAxis = function(angle) {
            var theta = angle*Math.PI/180;
            var rot = new Mat4();
            rot.values =   [ [1,               0,                0, 0],
                             [0, Math.cos(theta), -Math.sin(theta), 0],
                             [0, Math.sin(theta),  Math.cos(theta), 0],
                             [0,               0,                0, 1] ];
            return rot.multiply(this);
    };
    Mat4.prototype.rotateYAxis = function(angle) {
            var theta = angle*Math.PI/180;
            var rot = new Mat4();
            rot.values =   [ [ Math.cos(theta), 0, Math.sin(theta), 0],
                             [ 0              , 1, 0              , 0],
                             [-Math.sin(theta), 0, Math.cos(theta), 0],
                             [0               , 0, 0              , 1] ];
            return rot.multiply(this);
    };
    Mat4.prototype.rotateZAxis = function(angle) {
            var theta = angle*Math.PI/180;
            var rot = new Mat4();
            rot.values =   [ [ Math.cos(theta),-Math.sin(theta), 0, 0],
                             [ Math.sin(theta), Math.cos(theta), 0, 0],
                             [               0,               0, 1, 0],
                             [               0,               0, 0, 1] ];
            return rot.multiply(this);
    };

    Mat4.prototype.perspective = function(fieldOfView,lookAt,lookFrom,up) {
        var N = (lookFrom).minus(lookAt);
        var d = N.mag();
        var U = (up).cross(N);
        var V = N.cross(U);
	  
	  N.normalize();
	  U.normalize();
	  V.normalize();
	  
        var M = new Mat4();
        M.values =  [ [U[0], U[1], U[2], 0],
		        [V[0], V[1], V[2], 0],
		        [N[0], N[1], N[2], 0],
		        [0,    0,    0,    1] ];
	
        //is this the right order?
        var basis_change = M.multiply((new Mat4()).translate([-lookAt[0],-lookAt[1],-lookAt[2]]));
        
        var perspective_matrix = new Mat4();
        if (noz) {
        perspective_matrix.set(2,2,0);
        perspective_matrix.set(3,2,1/d);
        } else {

        	/*var aspect = 1.0;
        	var znear = 0;
        	var zfar = 100;
        	
		var ymax = znear * Math.tan(fieldOfView * Math.PI/360);
		var ymin = -ymax;
		var xmax = ymax * aspect;
		var xmin = ymin * aspect;

		var width = xmax - xmin;
		var height = ymax - ymin;

		var depth = zfar - znear;
		var q = -(zfar + znear) / depth;
		var qn = -2 * (zfar * znear) / depth;

		var w = 2 * znear / width;
		//w = w / aspect;
		var h = 2 * znear / height;
		
		perspective_matrix.set(0,0,w);
		perspective_matrix.set(1,1,h);
		perspective_matrix.set(2,2,q);
		perspective_matrix.set(2,3,-1);
		perspective_matrix.set(3,3,0);
		perspective_matrix.set(3,2,qn);*/
		
		/*
		var znear = 0.1;
        	var zfar = 100;
		perspective_matrix.set(0,0,Math.atan(fieldOfView*Math.PI/90));
		perspective_matrix.set(1,1,Math.atan(fieldOfView*Math.PI/90));
		perspective_matrix.set(2,2,-(zfar+znear)/(zfar-znear));
		perspective_matrix.set(2,3,2*znear*zfar/(zfar-znear));
		perspective_matrix.set(3,3,0);
		perspective_matrix.set(3,2,-1);*/
		
		
		
        //perspective_matrix.set(3,2,1/d);
        }
        /*var windowSize = gl.viewportWidth;
        var s_xy = 2.0*lookAt[3]/((windowSize)*(lookAt[3]+100.0));
        var s_z = -1.0/(lookAt[3]+100.0);
        var canonScale = (new Mat4()).scale([s_xy,s_xy,s_z]);
        var prpTrans = (new Mat4()).translate([-lookFrom[0],-lookFrom[1],-lookFrom[2]]);
        perspective_matrix = perspective_matrix.multiply(canonScale.multiply(prpTrans.multiply(basis_change)));*/
        
        perspective_matrix = perspective_matrix.multiply(basis_change);
        
        //Now to window to viewport transform
        //var theta = Math.PI * (fieldOfView/2)/180;
        //var x_win = Math.tan(theta) * d;
        //perspective_matrix = perspective_matrix.scale([gl.viewportWidth/(2*x_win),gl.viewportHeight/(2*x_win),1]);
        
        
        return perspective_matrix;
    };
    
    Mat4.prototype.flat = function() {
        //return  this.values[0].concat(this.values[1]).concat(this.values[2]).concat(this.values[3]);
        var ret = [];
        for (var col=0; col<4; col++)
                for (var row=0; row<4; row++) {
                    ret.push(this.get(row,col));
                }
        return ret;
    };
    
    Mat4.prototype.posVec = function() {
        return new Vec([this.get(0,3),this.get(1,3),this.get(2,3)]);
    };
    
    Mat4.prototype.multiplyPoint = function(point) {
        var augPoint = [point[0],point[1],point[2],1];
        var toRet = [0,0,0,1];
        for (var row=0; row<4; row++)
            for (var col=0; col<4; col++) {
                var val=0;
                for (var i=0; i<4; i++) {
                    val += this.get(row,i)*augPoint[i];
                }
                toRet[row]=val;
            }
        return new Vec([toRet[0]/toRet[3], toRet[1]/toRet[3], toRet[2]/toRet[3]]);
    };
    
    Mat4.prototype.inverse = function() {
        //return  this.values[0].concat(this.values[1]).concat(this.values[2]).concat(this.values[3]);
        var ret = new Mat4();
        var m = this.flat();
        var inv = ret.flat();
        //This was lifted from MESA implementation of the GLU library.
        //http://stackoverflow.com/questions/1148309/inverting-a-4x4-matrix
        inv[0] = m[5]  * m[10] * m[15] - 
                 m[5]  * m[11] * m[14] - 
                 m[9]  * m[6]  * m[15] + 
                 m[9]  * m[7]  * m[14] +
                 m[13] * m[6]  * m[11] - 
                 m[13] * m[7]  * m[10];

        inv[4] = -m[4]  * m[10] * m[15] + 
                  m[4]  * m[11] * m[14] + 
                  m[8]  * m[6]  * m[15] - 
                  m[8]  * m[7]  * m[14] - 
                  m[12] * m[6]  * m[11] + 
                  m[12] * m[7]  * m[10];

        inv[8] = m[4]  * m[9] * m[15] - 
                 m[4]  * m[11] * m[13] - 
                 m[8]  * m[5] * m[15] + 
                 m[8]  * m[7] * m[13] + 
                 m[12] * m[5] * m[11] - 
                 m[12] * m[7] * m[9];

        inv[12] = -m[4]  * m[9] * m[14] + 
                   m[4]  * m[10] * m[13] +
                   m[8]  * m[5] * m[14] - 
                   m[8]  * m[6] * m[13] - 
                   m[12] * m[5] * m[10] + 
                   m[12] * m[6] * m[9];

        inv[1] = -m[1]  * m[10] * m[15] + 
                  m[1]  * m[11] * m[14] + 
                  m[9]  * m[2] * m[15] - 
                  m[9]  * m[3] * m[14] - 
                  m[13] * m[2] * m[11] + 
                  m[13] * m[3] * m[10];

        inv[5] = m[0]  * m[10] * m[15] - 
                 m[0]  * m[11] * m[14] - 
                 m[8]  * m[2] * m[15] + 
                 m[8]  * m[3] * m[14] + 
                 m[12] * m[2] * m[11] - 
                 m[12] * m[3] * m[10];

        inv[9] = -m[0]  * m[9] * m[15] + 
                  m[0]  * m[11] * m[13] + 
                  m[8]  * m[1] * m[15] - 
                  m[8]  * m[3] * m[13] - 
                  m[12] * m[1] * m[11] + 
                  m[12] * m[3] * m[9];

        inv[13] = m[0]  * m[9] * m[14] - 
                  m[0]  * m[10] * m[13] - 
                  m[8]  * m[1] * m[14] + 
                  m[8]  * m[2] * m[13] + 
                  m[12] * m[1] * m[10] - 
                  m[12] * m[2] * m[9];

        inv[2] = m[1]  * m[6] * m[15] - 
                 m[1]  * m[7] * m[14] - 
                 m[5]  * m[2] * m[15] + 
                 m[5]  * m[3] * m[14] + 
                 m[13] * m[2] * m[7] - 
                 m[13] * m[3] * m[6];

        inv[6] = -m[0]  * m[6] * m[15] + 
                  m[0]  * m[7] * m[14] + 
                  m[4]  * m[2] * m[15] - 
                  m[4]  * m[3] * m[14] - 
                  m[12] * m[2] * m[7] + 
                  m[12] * m[3] * m[6];

        inv[10] = m[0]  * m[5] * m[15] - 
                  m[0]  * m[7] * m[13] - 
                  m[4]  * m[1] * m[15] + 
                  m[4]  * m[3] * m[13] + 
                  m[12] * m[1] * m[7] - 
                  m[12] * m[3] * m[5];

        inv[14] = -m[0]  * m[5] * m[14] + 
                   m[0]  * m[6] * m[13] + 
                   m[4]  * m[1] * m[14] - 
                   m[4]  * m[2] * m[13] - 
                   m[12] * m[1] * m[6] + 
                   m[12] * m[2] * m[5];

        inv[3] = -m[1] * m[6] * m[11] + 
                  m[1] * m[7] * m[10] + 
                  m[5] * m[2] * m[11] - 
                  m[5] * m[3] * m[10] - 
                  m[9] * m[2] * m[7] + 
                  m[9] * m[3] * m[6];

        inv[7] = m[0] * m[6] * m[11] - 
                 m[0] * m[7] * m[10] - 
                 m[4] * m[2] * m[11] + 
                 m[4] * m[3] * m[10] + 
                 m[8] * m[2] * m[7] - 
                 m[8] * m[3] * m[6];

        inv[11] = -m[0] * m[5] * m[11] + 
                   m[0] * m[7] * m[9] + 
                   m[4] * m[1] * m[11] - 
                   m[4] * m[3] * m[9] - 
                   m[8] * m[1] * m[7] + 
                   m[8] * m[3] * m[5];

        inv[15] = m[0] * m[5] * m[10] - 
                  m[0] * m[6] * m[9] - 
                  m[4] * m[1] * m[10] + 
                  m[4] * m[2] * m[9] + 
                  m[8] * m[1] * m[6] - 
                  m[8] * m[2] * m[5];
                  
        var det = det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
        if (det === 0) {
            console.log("error, trying to invert non-invertable matrix");
            return ret;
        }
        ret.values =  [ [inv[0]/det, inv[4]/det, inv[8]/det,  inv[12]/det],
                        [inv[1]/det, inv[5]/det, inv[9]/det,  inv[13]/det],
                        [inv[2]/det, inv[6]/det, inv[10]/det, inv[14]/det],
                        [inv[3]/det, inv[7]/det, inv[11]/det, inv[15]/det] ];
        return ret;
    };
    
    Mat4.prototype.toInverseMat3x3_flat = function() {
        var det = this.get(0,0)*this.get(1,1)*this.get(2,2) +
                  this.get(0,1)*this.get(1,2)*this.get(2,0) +
                  this.get(0,2)*this.get(1,0)*this.get(2,1) -
                  this.get(2,0)*this.get(1,1)*this.get(0,2) -
                  this.get(2,1)*this.get(1,2)*this.get(0,0) -
                  this.get(2,2)*this.get(1,0)*this.get(0,1);
        var a00 = (this.get(1,1)*this.get(2,2)-this.get(2,1)*this.get(1,2))/det;
        var a01 = (this.get(0,2)*this.get(2,1)-this.get(2,2)*this.get(0,1))/det;
        var a02 = (this.get(0,1)*this.get(1,2)-this.get(1,1)*this.get(0,2))/det;
        var a10 = (this.get(1,2)*this.get(2,0)-this.get(2,2)*this.get(1,0))/det;
        var a11 = (this.get(0,0)*this.get(2,2)-this.get(2,0)*this.get(0,2))/det;
        var a12 = (this.get(0,2)*this.get(1,0)-this.get(1,2)*this.get(0,0))/det;
        var a20 = (this.get(1,0)*this.get(2,1)-this.get(2,0)*this.get(1,1))/det;
        var a21 = (this.get(0,1)*this.get(2,0)-this.get(2,1)*this.get(0,0))/det;
        var a22 = (this.get(0,0)*this.get(1,1)-this.get(1,0)*this.get(0,1))/det;
        //var ret = [a00, a10, a20, a01, a11, a21, a02, a12, a22];//transpose
        var ret = [a00, a01, a02, a10, a11, a12, a20, a21, a22];
        return ret;
    };
    
    //return Mat4;
//});
