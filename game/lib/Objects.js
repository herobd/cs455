    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain
    //This has a realy confusing exampel I'm basing my inheritance off of
    
    var Origin = {getDrawMatrix: function() {return new Mat4();}};
    
    function GenericObject(img,obj,scale,positionMatrix,owner) {
        this.init(scale,positionMatrix,owner);
        this.initTexture(img);
        this.initOBJ(obj);
    }
    GenericObject.prototype.init = function(scale,positionMatrix,owner) {
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
        this.parts = [];
    };
    GenericObject.prototype.getDrawMatrix = function() {
        	 
        	 return this.owner.getDrawMatrix().multiply(this.position).multiply(this.rotation).multiply(this.scaleM);
    };
    GenericObject.prototype.move = function(vec) {
        	 this.position = this.position.translate(vec);
        	 this.location = vec;
    };
    GenericObject.prototype.getParts = function() {
        	 return this.parts;
    };
    GenericObject.prototype.animate = function() {
        	 //no animation
    };
    
    GenericObject.prototype.setUpOBJ = function (toFill, file, textureScale) {
        textureScale = typeof textureScale !== 'undefined' ? textureScale : 1;
		
        var lines = file.split('\n');
        var countVertices;
        var vertices = [];
        var textureCoords = [];
        var faces = [];
        
        //parse obj file
        for (var line of lines) {
        	var tokens = line.split(' ');
        	if (tokens[0] === 'v') {
        	    vertices.push([parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])]);
        	    //console.log("vertex: " + vertices[vertices.length-1][0] + "," + vertices[vertices.length-1][1] + "," + vertices[vertices.length-1][2]);
        	    countVertices++;
        	} else if (tokens[0] === 'vt') {
        	    textureCoords.push([textureScale*parseFloat(tokens[1]), textureScale*parseFloat(tokens[2])]);
        	    //console.log("textureCord: " + textureCoords[textureCoords.length-1][0] + "," + textureCoords[textureCoords.length-1][1]);
        	} else if (tokens[0] === 'f') {
        	    tokens.shift();
        	    //console.log(tokens);
        	    var face=[];
        	    
        	    for (var vertex of tokens) {
        	        face.push(vertex);
        	        //console.log("vertex: ".concat(vertex));
        	    }
        	    faces.push(face);
        	    //console.log("face: " + faces[faces.length-1][0]);
        	}
        }
        
        //Next we recreate the vertexes for each one in each triangle we draw.
        
        var verticesFlat=[];
        var textureCordsFlat=[];
        var vertexIndices=[];
        var count=0;
        
        for (face of faces) {
            
            var keyVert=null;
            var keyTextureCord=null;
            var prevVert=null;
            var prevTextureCord=null;
            
            //For each polygon, we assume the points are in a clockwise/counterclockwise order
            //Thus we draw triangles, all sharing the first vertex listed in the obj file
            for (vertex of face) {
                var pieces = vertex.split('/');
                if (keyVert==null) {//first vertex, all triangles share this
                    keyVert = vertices[parseInt(pieces[0])-1];
                    
                    keyTextureCord = textureCoords[parseInt(pieces[1])-1];
                } else if (prevVert==null) {//set up the "previous" for our first triangle
                    prevVert = vertices[parseInt(pieces[0])-1];
                    
                    prevTextureCord = textureCoords[parseInt(pieces[1])-1];
                } else {
                    var thisVert = vertices[parseInt(pieces[0])-1];
                    
                    var thisTextureCord = textureCoords[parseInt(pieces[1])-1];
                    
                    //var logger="";
                    //logger = logger.concat("face: (");
                    
                    for (n of keyVert) {
                        verticesFlat.push(n);
                        //logger = logger.concat(n + ",");
                    }
                    vertexIndices.push(count++);
                    //logger = logger.concat(")(");
                    for (n of prevVert) {
                        verticesFlat.push(n);
                        //logger = logger.concat(n + ",");
                    }
                    vertexIndices.push(count++);
                    //logger = logger.concat(")(");
                    for (n of thisVert) {
                        verticesFlat.push(n);
                        //logger = logger.concat(n + ",");
                    }
                    vertexIndices.push(count++);
                    //logger = logger.concat(")  [");
                    
                    for (n of keyTextureCord) {
                        textureCordsFlat.push(n);
                        //logger = logger.concat(n + ",");
                    }
                    //logger = logger.concat("][");
                    for (n of prevTextureCord) {
                        textureCordsFlat.push(n);
                        //logger = logger.concat(n + ",");
                    }
                    //logger = logger.concat("][");
                    for (n of thisTextureCord) {
                        textureCordsFlat.push(n);
                        //logger = logger.concat(n + ",");
                    }
                    //logger = logger.concat("] ... " + verticesFlat.length + "\n");
                    //console.log(logger);
                    
                    //This is similar to stripping, but for each polygon
                    prevVert=thisVert;
                    prevTextureCord=thisTextureCord;
                    
                }
                
                
            }
        }
        //console.log(count);
        if (count <100)
        {
        console.log(count);
        console.log(verticesFlat);
        console.log(textureCordsFlat);
        console.log(vertexIndices);
        }
        
        myGL.initBuffer(toFill,verticesFlat,textureCordsFlat,vertexIndices,count);
    };
    
    var loadedTextures = {};
    var loadedOBJs = {};
    GenericObject.prototype.initTexture = function (imgName) {
        
        if (imgName === null) {
            this.texture = null;
            return;
        }
        
        //Get the texture
        if (!loadedTextures.hasOwnProperty(imgName)) {
	      loadedTextures[imgName] = {};
	      loadedTextures[imgName].image = new Image();
	      loadedTextures[imgName].imgName = imgName;
	      loadedTextures[imgName].image.onload = function () {
	          myGL.handleLoadedTexture(loadedTextures[imgName])
	      }
	      
	      loadedTextures[imgName].image.src = imgName;
        }
     
        this.texture = loadedTextures[imgName];

              
    }
    
    GenericObject.prototype.initOBJ = function (objName,textureScale) {
        if (objName === null) {
            this.obj = null;
            return;
        }
        textureScale = typeof textureScale !== 'undefined' ? textureScale : 1;
        var refOBJName = objName + textureScale;
        //Get the OBJ file
        if (!loadedOBJs.hasOwnProperty(refOBJName)) {
              loadedOBJs[refOBJName]={};
              loadedOBJs[refOBJName].vertexPositionBuffer=null;
              loadedOBJs[refOBJName].vertexTextureCordBuffer=null;
              loadedOBJs[refOBJName].vertexIndexBuffer=null;
        
          var myself = this;
	      var xhr = new XMLHttpRequest();
	      xhr.open("GET", "/"+objName, true);
	      xhr.onload = function (e) {
	        if (xhr.readyState === 4) {
	          if (xhr.status === 200) {
	            //console.log(xhr.responseText);
	            var objFile=xhr.responseText;
	            myself.setUpOBJ(loadedOBJs[refOBJName],objFile,textureScale);
	          } else {
	            console.error(xhr.statusText);
	          }
	        }
	      };
	      xhr.onerror = function (e) {
	        console.error(xhr.statusText);
	      };
	      xhr.send(null);
        }
        this.obj=loadedOBJs[refOBJName]
              
    }


//////////////////////////////////
    
    function WheelObject(wheelImg,wheelObj,scale,positionMatrix,owner) {
        GenericObject.call(this,wheelImg,wheelObj,scale,positionMatrix,owner);
        this.steerRotation = new Mat4();
        this.spinRotation = new Mat4();
        
        
    }
    WheelObject.prototype = Object.create(GenericObject.prototype);
    WheelObject.prototype.constructor = WheelObject;
    WheelObject.prototype.setSteerRotation = function(angle) {
            this.steerRotation = (new Mat4()).rotateYAxis(angle);
    };
        
    WheelObject.prototype.getDrawMatrix = function() {
    	return this.owner.getDrawMatrix().multiply(this.position).multiply(this.steerRotation).multiply(this.spinRotation).multiply(this.rotation).multiply(this.scaleM);
    };
    
////////////////////////////////
    
    function CarObject(chasisImg,chasisObj,wheelImg,wheelObj,scale,positionMatrix,owner) {
        GenericObject.call(this,null,null,scale,positionMatrix,owner);
        var centerOffset = -0.4;
        this.chasis = new GenericObject(chasisImg,chasisObj,1,[0,0,centerOffset],this);
        this.FRWheel = new WheelObject(wheelImg,wheelObj,0.25,[0.37,0.15,centerOffset-0.535],this);
        this.FLWheel = new WheelObject(wheelImg,wheelObj,0.25,[-0.37,0.15,centerOffset-0.535],this);
        this.FLWheel.rotation = (new Mat4()).rotateYAxis(180);
        
        this.BRWheel = new WheelObject(wheelImg,wheelObj,0.25,[0.37,0.15,centerOffset+0.48],this);
        this.BLWheel = new WheelObject(wheelImg,wheelObj,0.25,[-0.37,0.15,centerOffset+0.48],this);
        this.BLWheel.rotation = (new Mat4()).rotateYAxis(180);
        
        this.parts = [this.chasis,this.FRWheel,this.FLWheel,this.BRWheel,this.BLWheel];
        this.turning = 0;
        this.turnSpeed=6.0;
        this.turned=0.0;
        
        this.driving = 0;
        this.rotateConstant = 0.075;
        this.spinConstant = 3;
        this.driveSpeed=0.1;
        this.movement = new Mat4();
    }
    CarObject.prototype = Object.create(GenericObject.prototype);
    
    CarObject.prototype.constructor = CarObject;
    CarObject.prototype.steerWheels = function(angle) {
            this.FRWheel.setSteerRotation(angle);
            this.FLWheel.setSteeRotation(angle);
    };
    CarObject.prototype.getDrawMatrix = function() {
        	 
        	 return this.owner.getDrawMatrix().multiply(this.position).multiply(this.rotation).multiply(this.scaleM);
    };
    CarObject.prototype.animate = function(elapsed) {
            if ((this.turning<0 && this.turned > -55) || (this.turning==0 && this.turned>0)) {
        	    this.FRWheel.steerRotation = this.FRWheel.steerRotation.rotateYAxis(-this.turnSpeed * (elapsed/16.0));
        	    this.FLWheel.steerRotation = this.FLWheel.steerRotation.rotateYAxis(-this.turnSpeed * (elapsed/16.0));
        	    this.turned += -this.turnSpeed;
        	}
    	    else if ((this.turning>0 && this.turned < 55) || (this.turning==0 && this.turned<0)) {
        	    this.FRWheel.steerRotation = this.FRWheel.steerRotation.rotateYAxis(this.turnSpeed * (elapsed/16.0));
        	    this.FLWheel.steerRotation = this.FLWheel.steerRotation.rotateYAxis(this.turnSpeed * (elapsed/16.0));
        	    this.turned += this.turnSpeed;
        	}
        	
        	//Allow easy alignment for striaght
        	if (Math.abs(this.turned)<30 && this.turning==0) {
        	    this.turned=0;
        	    this.FRWheel.steerRotation = new Mat4();
        	    this.FLWheel.steerRotation = new Mat4();
        	}
        	
        	this.turning=0;
        	
        	
        	if (this.driving != 0) {
        	    this.rotation = this.rotation.rotateYAxis(this.rotateConstant * this.turned * (elapsed/16.0));
        	    var transPoint  = (this.rotation).multiply((new Mat4()).translate([0,0,this.driving*-this.driveSpeed * (elapsed/16.0)]))
        	    this.position = this.position.translate([transPoint.get(0,3), transPoint.get(1,3), transPoint.get(2,3)]);
        	    //console.log(this.position);
        	    //this.movement = this.movement.multiply((new Mat4()).translate([0,0,-this.driveSpeed]));//this.rotation
        	    
        	    this.FRWheel.spinRotation = this.FRWheel.spinRotation.rotateXAxis(this.driving*-this.turnSpeed * this.spinConstant * (elapsed/16.0));
        	    this.FLWheel.spinRotation = this.FRWheel.spinRotation.rotateXAxis(this.driving*-this.turnSpeed * this.spinConstant * (elapsed/16.0));
        	    this.BRWheel.spinRotation = this.FRWheel.spinRotation.rotateXAxis(this.driving*-this.turnSpeed * this.spinConstant * (elapsed/16.0));
        	    this.BLWheel.spinRotation = this.FRWheel.spinRotation.rotateXAxis(this.driving*-this.turnSpeed * this.spinConstant * (elapsed/16.0));
        	}
        	this.driving=0;
    };
    CarObject.prototype.turnLeft = function() {
    	 this.turning=1;
    };
    CarObject.prototype.turnRight = function() {
    	 this.turning=-1;
    };
    CarObject.prototype.driveForwards = function() {
    	 this.driving=1;
    };
    CarObject.prototype.driveBackwards = function() {
    	 this.driving=-1;
    };
//////////////////////////////////

function SolidObject(img,obj,radius,scale,positionMatrix,owner) {
    GenericObject.call(this,img,obj,scale,positionMatrix,owner);
    this.boundingRadius = radius;
}
SolidObject.prototype = Object.create(GenericObject.prototype);
SolidObject.prototype.constructor = SolidObject;
SolidObject.prototype.collisionCheck = function(otherSolidObject,myMoveVec)
{
    var futurePos = this.position.translate(myMoveVec);
    var curDist = Math.sqrt( Math.pow(this.position.get(0,3)-otherSolidObject.position.get(0,3),2) + 
                      // Math.pow(this.position.get(1,3)-otherSolidObject.position.get(1,3),2) + 
                       Math.pow(this.position.get(2,3)-otherSolidObject.position.get(2,3),2) ) ;
    var futDist = Math.sqrt( Math.pow(futurePos.get(0,3)-otherSolidObject.position.get(0,3),2) + 
                      // Math.pow(futurePos.get(1,3)-otherSolidObject.position.get(1,3),2) + 
                       Math.pow(futurePos.get(2,3)-otherSolidObject.position.get(2,3),2) ) ;
    //console.log(dist);
    if (futDist-(this.boundingRadius+otherSolidObject.boundingRadius) <= 0 && futDist<curDist) {
        return (new Vec([otherSolidObject.position.get(0,3)-this.position.get(0,3),
                       0,
                       otherSolidObject.position.get(2,3)-this.position.get(2,3)])).normalize();
    }
    else
        return null;
}

//////////////////////////////////
    
    function TreeObject(barkImg,trunkObj,scale,positionMatrix,owner) {
        SolidObject.call(this,null,null,0.7,scale,positionMatrix,owner);
        this.trunk = new TrunkObject(barkImg,trunkObj,15,0.3,[0.2,0,0],this);
        this.parts = [this.trunk];
        
    }
    TreeObject.prototype = Object.create(SolidObject.prototype);
    TreeObject.prototype.constructor = TreeObject;
    
    
    function TrunkObject(barkImg,trunkObj,textureScale,scale,positionMatrix,owner) {
        this.init(scale,positionMatrix,owner);
        this.initTexture(barkImg);
        this.initOBJ(trunkObj,textureScale);
    }
    TrunkObject.prototype = Object.create(GenericObject.prototype);
    TrunkObject.prototype.constructor = TrunkObject;
    
    
    
    ////////////////////////////////
    function FloorObject(img,obj,scale,positionMatrix,owner) {
        this.init(scale,positionMatrix,owner);
        this.initTexture(img);
        var tex_width = 
        this.initOBJ(obj,scale/2);
    }
    FloorObject.prototype = Object.create(GenericObject.prototype);
    FloorObject.prototype.constructor = FloorObject;
        
