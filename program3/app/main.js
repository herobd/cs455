//define(function(require) {

    var logger=200;
    //var Mat4 = require('Mat4');
    var gl;
    function initGL(canvas) {
        try {
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        }
 catch (e) {
        }

        if (!gl) {
            alert("Could not initialise WebGL, sorry :-(");
        }

    }

    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }

            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    var shaderProgram;
    function initShaders() {
        var fragmentShader = getShader(gl, "shader-fs");
        var vertexShader = getShader(gl, "shader-vs");
        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram);
        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
        shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
        gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    }
    
    //JS is single threaded, so I think this doesn't have a race condition
    function handleLoadedTexture(texture) {
        
        //console.log("setting up texture " + texture.imgName);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        
        //These parameters supposedly allow NPOT texture sizes (which my box image is)
        //http://stackoverflow.com/questions/3792027/webgl-and-the-power-of-two-image-size
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.texEnvf()?
        
        gl.bindTexture(gl.TEXTURE_2D, null);
    }


    
    
    //We have objects to store textures and OBJs by name, so we only load them once.
    var loadedTextures = {};
    var loadedOBJs = {};
    function initTexturedObject(imgName,objName,toFill) {
        
        if (imgName === null || objName === null) {
            toFill.obj = null;
            toFill.texture = null;
            return;
        }
        
        //Get the texture
        if (!loadedTextures.hasOwnProperty(imgName)) {
		  loadedTextures[imgName] = gl.createTexture();
		  loadedTextures[imgName].image = new Image();
		  loadedTextures[imgName].imgName = imgName;
		  loadedTextures[imgName].image.onload = function () {
		      handleLoadedTexture(loadedTextures[imgName])
		  }
		  //default, I couldn't get this to work :(
		  /*gl.bindTexture(gl.TEXTURE_2D, texture);
		  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
		  
		  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);//maybe LINEAR?
		  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		  gl.bindTexture(gl.TEXTURE_2D, null);*/
		  
		  loadedTextures[imgName].image.src = imgName;
        }
     
        toFill.texture = loadedTextures[imgName];
        
        
        //Get the OBJ file
        if (!loadedOBJs.hasOwnProperty(objName)) {
              loadedOBJs[objName]={};
              loadedOBJs[objName].vertexPositionBuffer=null;
              loadedOBJs[objName].vertexTextureCordBuffer=null;
              loadedOBJs[objName].vertexIndexBuffer=null;
        
		  var xhr = new XMLHttpRequest();
		  xhr.open("GET", "/"+objName, true);
		  xhr.onload = function (e) {
		    if (xhr.readyState === 4) {
		      if (xhr.status === 200) {
		        //console.log(xhr.responseText);
		        var objFile=xhr.responseText
		        initBuffer(loadedOBJs[objName],objFile);
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
        toFill.obj=loadedOBJs[objName]
              
    }

//debug
var pMatrix = mat4.create();
var mvMatrix = mat4.create();
    
    //Assumes my Mat4 objects
    function setMatrixUniforms(perspectiveMat,moveMat) {
        if (noz) {
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, moveMat.flat());
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, perspectiveMat.flat());
        
        } else {
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, perspectiveMat.multiply(moveMat).flat());
        //gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, (moveMat.translate([0.0,-1,0.0])).flat());
        
        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        }
    
        
        
        
    }

    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    function setMatrixUniformsOld() {
        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
        
    }
    
    
    
    
    function initBuffer(toFill, file) {
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
        	    textureCoords.push([parseFloat(tokens[1]), parseFloat(tokens[2])]);
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
        
        toFill.vertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, toFill.vertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesFlat), gl.STATIC_DRAW);
        toFill.vertexPositionBuffer.itemSize = 3;
        toFill.vertexPositionBuffer.numItems = count;//They all have the same number of references
        
        toFill.vertexTextureCordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, toFill.vertexTextureCordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCordsFlat), gl.STATIC_DRAW);
        toFill.vertexTextureCordBuffer.itemSize = 2;
        toFill.vertexTextureCordBuffer.numItems = count;
        
        toFill.vertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, toFill.vertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
        toFill.vertexIndexBuffer.itemSize = 1;
        toFill.vertexIndexBuffer.numItems = count;
        
	  //toFill is already held by what needs it
    }
    
    
    

    
    
    //New
    function drawTexturedObject(texturedObject,perspectiveMat) {
        //check if it's loaded
        for (var part of texturedObject.getParts()) {
            drawTexturedObject(part,perspectiveMat);
        }
        if (texturedObject.obj === null ||
            texturedObject.obj.vertexPositionBuffer === null ||
            shaderProgram.textureCoordAttribute === null ||
            texturedObject.obj.vertexIndexBuffer === null)
            return;
        
        
        
        //mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
        
        
        
        gl.bindBuffer(gl.ARRAY_BUFFER, texturedObject.obj.vertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, texturedObject.obj.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, texturedObject.obj.vertexTextureCordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, texturedObject.obj.vertexTextureCordBuffer.itemSize, gl.FLOAT, false, 0, 0);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texturedObject.texture);
        gl.uniform1i(shaderProgram.samplerUniform, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, texturedObject.obj.vertexIndexBuffer);
        setMatrixUniforms(perspectiveMat,texturedObject.getDrawMatrix());
        gl.drawElements(gl.TRIANGLES, texturedObject.obj.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        
        
        
    }
    
    var currentlyPressedKeys = {};
    
    function handleInput(elapsed) {
        var gamepad = navigator.getGamepads()[0];
        if (gamepad !== undefined && gamepad !== null) {
            var stick1x = -gamepad.axes[0];
            var stick1y = -gamepad.axes[1];
            var stick2x = gamepad.axes[2];
            var stick2y = gamepad.axes[3];
            //TODO
            //normalize stick vector
            //zero out noise readings
            //
            
            //Translation (walking)
            var d = camera.lookingFrom.minus(camera.lookingAt);
            var horzViewAxis = d.cross(camera.up);
		var vertViewAxis = horzViewAxis.cross(d);
		var dmag = d.mag();
            
            d[1]=0;//ignore y
            var orth = d.cross(camera.up);
            d = d.normalize();
            orth = orth.normalize();
            
            var moveVec = d.scale(stick1y).plus(orth.scale(stick1x)).scale((camera.moveSpeed * elapsed) / 1000.0);
            
            
            camera.lookingAt = camera.lookingAt.plus(moveVec);
		camera.lookingFrom = camera.lookingFrom.plus(moveVec);
		
		//rotation (aiming)
		var mHorz = 2*dmag*Math.sin(camera.rotSpeed*stick2x);
		var mVert = 2*dmag*Math.sin(camera.rotSpeed*stick2y);
		var dirHorz = horzViewAxis.normalize().scale(mHorz);
		var dirVert = vertViewAxis.normalize().scale(mVert);
		camera.lookingAt = camera.lookingAt.plus(dirHorz.plus(dirVert));
		
		/*for (var i=0; i<gamepad.buttons.length; i++) {
		    if (gamepad.buttons[i].pressed || gamepad.buttons[i].value !== 0) {
		        console.log('['+i+'] pressed='+gamepad.buttons[i].pressed+'  value='+gamepad.buttons[i].value);
		    }
		}*/
		
		if (gamepad.buttons[14].pressed || gamepad.buttons[14].value !== 0) {
		    //turn left
		}
		if (gamepad.buttons[15].pressed || gamepad.buttons[15].value !== 0) {
		    //turn right
		}
        }
        
        
        //keyboard control
        if (currentlyPressedKeys[68]) {//d
                var d = camera.lookingFrom.minus(camera.lookingAt);
                d[1]=0;//ignore y
                var orth = d.cross(camera.up);
                
                orth = orth.normalize().scale((-1*camera.moveSpeed * elapsed) / 1000.0);
                
                camera.lookingAt = camera.lookingAt.plus(orth);
		    camera.lookingFrom = camera.lookingFrom.plus(orth);
		    
		}
		
		if (currentlyPressedKeys[65]) {//a
                var d = camera.lookingFrom.minus(camera.lookingAt);
                d[1]=0;//ignore y
                var orth = d.cross(camera.up);
                orth = orth.normalize().scale((1*camera.moveSpeed * elapsed) / 1000.0);
                
                camera.lookingAt = camera.lookingAt.plus(orth);
		    camera.lookingFrom = camera.lookingFrom.plus(orth);
		    
		}
		
		if (currentlyPressedKeys[83]) {//s
                var d = camera.lookingFrom.minus(camera.lookingAt);
                d[1]=0;//ignore y
                
                d = d.normalize().scale((-1*camera.moveSpeed * elapsed) / 1000.0);
                
                camera.lookingAt = camera.lookingAt.plus(d);
		    camera.lookingFrom = camera.lookingFrom.plus(d);
		    
		}
		
		if (currentlyPressedKeys[87]) {//w
                var d = camera.lookingFrom.minus(camera.lookingAt);
                d[1]=0;//ignore y
                
                d = d.normalize().scale((1*camera.moveSpeed * elapsed) / 1000.0);
                
                camera.lookingAt = camera.lookingAt.plus(d);
		    camera.lookingFrom = camera.lookingFrom.plus(d);
		    
		}
		
		if (currentlyPressedKeys[82]) {//r
                camera.lookingAt[1] += (camera.moveSpeed * elapsed) / 1000.0;
		    camera.lookingFrom[1] += (camera.moveSpeed * elapsed) / 1000.0;
		    
		}
		
		if (currentlyPressedKeys[70]) {//f
                camera.lookingAt[1] += (-1* camera.moveSpeed * elapsed) / 1000.0;
		    camera.lookingFrom[1] += (-1* camera.moveSpeed * elapsed) / 1000.0;
		    
		}
		
		if (currentlyPressedKeys[81]) {//q
                var d = camera.lookingFrom.minus(camera.lookingAt);
		    var m = 2*d.mag()*Math.sin(camera.rotSpeed);
		    var dir = camera.up.cross(d);
		    dir.normalize();
		    dir = dir.scale(m);
		    camera.lookingAt = camera.lookingAt.plus(dir);
		}
		
		if (currentlyPressedKeys[69]) {//e
                var d = camera.lookingFrom.minus(camera.lookingAt);
		    var m = -2*d.mag()*Math.sin(camera.rotSpeed);
		    var dir = camera.up.cross(d);
		    dir.normalize();
		    dir = dir.scale(m);
		    camera.lookingAt = camera.lookingAt.plus(dir);
		}
    }
    
    var lastTime = 0;
    function animate(camera) {
        var timeNow = new Date().getTime();
        if (lastTime != 0) {
            var elapsed = timeNow - lastTime;
            handleInput(elapsed);
            
            
            
            
            /*if (logger++>200) {
                 logger=0;
                 console.log('FROM: x=' + camera.lookingFrom[0] + ', y=' + camera.lookingFrom[1] + ', z=' + camera.lookingFrom[2]);
                 console.log('AT:   x=' + camera.lookingAt[0] + ', y=' + camera.lookingAt[1] + ', z=' + camera.lookingAt[2]);
            }*/
        }

        lastTime = timeNow;
    }

    function TexturedObject(imgName, objName, location, scale) {
        initTexturedObject(imgName,objName,this);
        this.location = location;
        this.scale = scale;
    }
    
    var other_camera = {
            fieldOfView: 45,
            lookingFrom: new Vec([0,20,50]),
            lookingAt: new Vec([0,18,40]),
            up: new Vec([0,1,0]),
            moveSpeed: 5,
            rotSpeed: degToRad(0.2)
        }
    var camera;
    var texturedCrayon;
    var texturedBox;
    
    function handleKeyDown(event) {
        currentlyPressedKeys[event.keyCode] = true;

        if (String.fromCharCode(event.keyCode) == "X") {
            var tmp = camera;
            camera=other_camera;
            other_camera=tmp;
            texturedCrayon.location = other_camera.lookingFrom;
            texturedCrayon.position = (new Mat4()).translate(other_camera.lookingFrom);
            texturedBox.location = other_camera.lookingAt;
            texturedBox.position = (new Mat4()).translate(other_camera.lookingAt);
        }
    }

    function handleKeyUp(event) {
      currentlyPressedKeys[event.keyCode] = false;
    }

    
    var tick;
    function webGLStart() {
        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;
    
        var canvas = document.getElementById("it-is-a-canvas");
        initGL(canvas);
        initShaders();
        //initBuffers();
        //initTexture();
        var sceneElements = [];
        var path = window.location.pathname.substring(1);
        
        //var texturedCrayonOld= new TexturedObject('violetCrayon.png', path +'violet_crayon.obj',[0.0, 4.0, -30.0],1);
        texturedCrayon= new GenericObject('violetCrayon.png', path +'violet_crayon.obj',0.1,other_camera.lookingFrom);
        texturedBox= new GenericObject('tire.bmp', path +'color_box.obj',0.1,other_camera.lookingAt);
        var parkingLot= new GenericObject('ParkingLot.bmp', path +'ParkingLot.obj',1,[0.0, 0.0, 0.0]);
        //var car= new CarObject('car.bmp', path +'car.obj','tire.bmp', path +'tire.obj',1,[0.0, 0.0, 0.0]);
        
        var test = new GenericObject('tire.bmp', path +'tire.obj',1,[0.0, 1, -5.0]);
        var test2 = new GenericObject('tire.bmp', path +'tire.obj',1,[2.0, 1, -5.0]);
        
        
        sceneElements.push(test);
        sceneElements.push(texturedCrayon);
        sceneElements.push(texturedBox);
        sceneElements.push(parkingLot);
        //sceneElements.push(car);
        sceneElements.push(test2);
        
        gl.clearColor(0.2, 0.2, 0.2, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        
        camera = {
            fieldOfView: 45,
            lookingAt: new Vec([25,0.6,10]),
            lookingFrom: new Vec([20,0.6,7]),
            up: new Vec([0,1,0]),
            moveSpeed: 5,
            rotSpeed: degToRad(0.2)
        }
        
        tick = function() {
            requestAnimFrame(tick);
            //drawScene();
            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
            //var testmat = new Mat4().translate([2,2,0]);
            
            var perspectiveMat = (new Mat4()).perspective(camera.fieldOfView,camera.lookingAt,camera.lookingFrom,camera.up);
            if (logger++>200) {
                logger=0;
                console.log(perspectiveMat);
                //console.log(perspectiveMat.multiply(testmat));
            }
            
            //var perspectiveMat.values = [[2.4142136573791504, 0, 0, 0, ],
             //                        [0, 2.4142136573791504, 0, 0, ],
               //                      [0, 0, -1.0020020008087158, -1, ],
                 //                    [0, 0, -0.20020020008087158, 0]];
            //var perspectiveMat=new Mat4();
            //perspectiveMat.values = [[0.707, 0, -0.707, 0, ],
              //                           [0   , 1, 0    , 0, ],
                //                         [0.707, 0, 0.707 , -1.414, ],
                  //                       [0   , 0, 0    , 1]];
             //drawTexturedObjectNew(texturedCrayon,perspectiveMat);
             //drawTexturedObjectOld(texturedCrayonOld);
             
            animate(camera);
            for (ele of sceneElements) {
            	drawTexturedObject(ele,perspectiveMat);
            }
            
        }
        tick();
    }
    
    
//});
