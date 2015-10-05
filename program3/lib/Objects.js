    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain
    //This has a realy confusing exampel I'm basing my inheritance off of
    
    var Origin = {getDrawMatrix: function() {return new Mat4();}};
    
    function GenericObject(img,obj,scale,positionMatrix,owner) {
        if (owner !== undefined) {
            this.owner  = owner;
        } else {
            this.owner = Origin;
        }
        
        if (positionMatrix !== undefined) {
            this.position = (new Mat4()).translate(positionMatrix);//This is relative to owner
            this.location = positionMatrix;
        } else {
            this.position = new Mat4();//This is relative to owner
            this.location = [0,0,0];
        }
        
        this.scale=scale;
        this.scaleM = (new Mat4()).scale([scale,scale,scale]);
        
        this.rotation = new Mat4();
        
        initTexturedObject(img,obj,this);
        
        
    }
    GenericObject.prototype.getDrawMatrix = function() {
        	 
        	 return this.owner.getDrawMatrix().multiply(this.position).multiply(this.rotation).multiply(this.scaleM);
    };
    GenericObject.prototype.move = function(vec) {
        	 this.position = this.position.translate(vec);
        	 this.location = vec;
    };
    GenericObject.prototype.getParts = function() {
        	 return [];
    };
    GenericObject.prototype.animate = function() {
        	 //no animation
    };
    
    function WheelObject(wheelImg,wheelObj,relPositionMatrix,owner) {
        GenericObject.call(this,wheelImg,wheelObj,relPositionMatrix,owner);
        this.steerRotation = new Mat4();
        //this.spinRotation = new Mat4();
        
        
    }
    WheelObject.prototype = Object.create(GenericObject.prototype);
    WheelObject.prototype.constructor = WheelObject;
    WheelObject.prototype.setSteerRotation = function(angle) {
            this.steerRotation = (new Mat4()).rotateYAxis(angle);
    };
        
    WheelObject.prototype.getDrawMatrix = function() {
        	return this.owner.getDrawMatrix().multiply(this.position).multiply(this.steerRotation).multiply(this.rotation).multiply(this.scaleM);
    };
    
    function CarObject(chasisImg,chasisObj,wheelImg,wheelObj,scale,positionMatrix,owner) {
        GenericObject.call(this,null,null,scale,positionMatrix,owner);
        
        this.chasis = new GenericObject(chasisImg,chasisObj,1,[0,0,0],this);
        this.FRWheel = new GenericObject(wheelImg,wheelObj,0.25,[0.37,0.15,-0.535],this);
        this.FLWheel = new GenericObject(wheelImg,wheelObj,0.25,[-0.37,0.15,-0.535],this);
        this.FLWheel.rotation = (new Mat4()).rotateYAxis(180);
        
        this.BRWheel = new GenericObject(wheelImg,wheelObj,0.25,[0.37,0.15,0.48],this);
        this.BLWheel = new GenericObject(wheelImg,wheelObj,0.25,[-0.37,0.15,0.48],this);
        this.BLWheel.rotation = (new Mat4()).rotateYAxis(180);
        
        this.parts = [this.chasis,this.FRWheel,this.FLWheel,this.BRWheel,this.BLWheel];
        this.turning = 0;
        this.turnSpeed=10.0;
        this.turned=0.0;
    }
    CarObject.prototype = Object.create(GenericObject.prototype);
    
    CarObject.prototype.constructor = CarObject;
    CarObject.prototype.steerWheels = function(angle) {
            this.FRWheel.setSteerRotation(angle);
            this.FLWheel.setSteeRotation(angle);
    };
    CarObject.prototype.getParts = function() {
        	 return this.parts;
    };
    CarObject.prototype.animate = function() {
            if (this.turning<0 && this.turned > -55) {
        	    this.FRWheel.rotation = this.FRWheel.rotation.rotateYAxis(-this.turnSpeed);
        	    this.FLWheel.rotation = this.FLWheel.rotation.rotateYAxis(-this.turnSpeed);
        	    this.turned += -this.turnSpeed;
        	}
    	    else if (this.turning>0 && this.turned < 55) {
        	    this.FRWheel.rotation = this.FRWheel.rotation.rotateYAxis(this.turnSpeed);
        	    this.FLWheel.rotation = this.FLWheel.rotation.rotateYAxis(this.turnSpeed);
        	    this.turned += this.turnSpeed;
        	}
        	
        	this.turning=0;
    };
    CarObject.prototype.turnLeft = function() {
        	 this.turning=-1;
    };
    CarObject.prototype.turnRight = function() {
        	 this.turning=1;
    };
