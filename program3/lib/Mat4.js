//define(function () {
var noz=true;

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
    
    Vec.prototype.mag = function() {
        return Math.sqrt(this[0]*this[0] + this[1]*this[1] + this[2]*this[2]);;
    }
    
    Vec.prototype.normalize = function() {
        var mag = this.mag();
        this[0] /= mag;
        this[1] /= mag;
        this[2] /= mag;
        return this;
    };

    function Mat4() {
        this.values = [ [1, 0, 0, 0],
                        [0, 1, 0, 0],
                        [0, 0, 1, 0],
                        [0, 0, 0, 1] ];
    
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
        
        //console.log(d + ' ' + x_win);
        //.translate([x_win,x_win,0])
        //window to viewport
        //perspective_matrix = perspective_matrix.scale([gl.viewportWidth/(2*x_win),gl.viewportHeight/(2*x_win),1]);
        
        //hack
        //perspective_matrix.set(2,2,-1);
        //perspective_matrix.set(2,3,-0.2);
        //perspective_matrix.set(3,2,-1);
        //perspective_matrix.set(0,0,1);
        
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
    
    //return Mat4;
//});
