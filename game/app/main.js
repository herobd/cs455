

//var logger=200;



var myGL = require('myGL');

///////////////////////////


//We have objects to store textures and OBJs by name, so we only load them once.




function degToRad(degrees) {
    return degrees * Math.PI / 180;
}


var controller = require('Controller');










//New
function drawTexturedObject(texturedObject,perspectiveMat) {
    //check if it's loaded
    for (var part of texturedObject.getParts()) {
        drawTexturedObject(part,perspectiveMat);
    }
    if (texturedObject.obj === null ||
        texturedObject.obj.vertexPositionBuffer === null ||
        myGL.shaderProgram.textureCoordAttribute === null ||
        texturedObject.obj.vertexIndexBuffer === null)
        return;
    
    myGL.drawTexturedObjectPart(texturedObject,perspectiveMat);
    
}

    
    

var lastTime = 0;
function animate(sceneElements) {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        controller.onTick(elapsed);
        for (ele of sceneElements) 
            ele.animate(elapsed);
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


var texturedCrayon;
var texturedBox;


var globalDepth;

var tick;
function webGLStart() {
    

    var canvas = document.getElementById("it-is-a-canvas");
    myGL.initGL(canvas);
    //initBuffers();
    //initTexture();
    
    var camera = new SolidObject(null,null,0.3,1,new Vec([0,0,0.3]));
    
    camera.fieldOfView= 45;
    camera.lookingAt= new Vec([0,1,0]);
    camera.lookingFrom= new Vec([0,1,0.3]);
    camera.up= new Vec([0,1,0]);
    camera.moveSpeed= 5;
    camera.rotSpeed= degToRad(0.7);
    
    var gameState = {
        playerLocation : function() {return this.camera.lookingFrom;},
        killed : function() {console.log("kkkiiiillllllleeeedddd!!!");}
    };
    gameState.camera = camera;
    
    gameState.sceneElements = [];
    gameState.solidObjects = [];
    gameState.collidableObjects = [];
    var path = window.location.pathname.substring(1);
    
    var ground = new FloorObject('assests/forest-floor-terrain_0040_03_S_enl.jpg',path +'assests/unitfloor.obj',10,[0,0,0]);
    var ground2 = new FloorObject('assests/forest-floor-terrain_0040_03_S_enl.jpg',path +'assests/unitfloor.obj',2,[0,0,-3]);
    gameState.sceneElements.push(ground);
    gameState.sceneElements.push(ground2);
    
    var car= new CarObject('assests/car.bmp', path +'assests/car.obj','assests/tire.bmp', path +'assests/tire.obj',1.25,[-2.58, 0.015, -7.66]);
    car.rotation = car.rotation.rotateYAxis(-120)
    gameState.sceneElements.push(car);
    
    var ghost= new GenericObject('assests/cloth_text.png', path +'assests/wraith_text.obj',.15,[-4.5, -0.01, -8.5]);
    ghost.rotation = ghost.rotation.rotateYAxis(-30);
    gameState.sceneElements.push(ghost);
    
    //var chase= new Ghost(gameState,0.01,'assests/cloth_text.png', path +'assests/wraith_text.obj',.15,[-4.5, 0.5, -8.5]);
    //gameState.solidObjects.push(chase);
    
    var grave= new Grave(gameState,true,'assests/violetCrayon.png', path +'assests/violet_crayon.obj','assests/cloth_text.png', path +'assests/wraith_text.obj',.15,[-4.5, 0.0, -8.5]);
    gameState.solidObjects.push(grave);
    var trip = new Trip(grave,'assests/violetCrayon.png',path +'assests/circle.obj',2,[3.5, 0.0, -5.5]);
    gameState.collidableObjects.push(trip);
    
    var grave2= new Grave(gameState,false,'assests/violetCrayon.png', path +'assests/violet_crayon.obj','assests/cloth_text.png', path +'assests/wraith_text.obj',.15,[3.5, 0.0, 5.5]);
    gameState.solidObjects.push(grave2);
    
    var axis1 = new GenericObject('assests/violetCrayon.png', path +'assests/violet_crayon.obj',0.2,[0,0,0]);
    axis1.rotation = axis1.rotation.rotateZAxis(90);
    var axis2 = new GenericObject('assests/violetCrayon.png', path +'assests/violet_crayon.obj',0.1,[0,0,0]);
    axis2.rotation = axis2.rotation.rotateXAxis(90);
    gameState.sceneElements.push(axis1);
    gameState.sceneElements.push(axis2);
    
    
    
    
    
    
    
    
    
    
    var tree= new TreeObject('assests/bark_sqr.png', path +'assests/trunk.obj',1,[-4.58, 0, -1.66]);
    var tree2= new TreeObject('assests/bark_sqr.png', path +'assests/trunk.obj',1,[-4.00, 0, -1.66]);
    var tree3= new TreeObject('assests/bark_sqr.png', path +'assests/trunk.obj',1,[-4.00, 0, -5.66]);
    gameState.solidObjects.push(tree);
    gameState.solidObjects.push(tree2);
    gameState.solidObjects.push(tree3);
    
    
    
    
    function movement(elapsed,stick1x,stick1y,stick2x,stick2y) {
        var d = camera.lookingFrom.minus(camera.lookingAt);
        var horzViewAxis = d.cross(camera.up);
        var vertViewAxis = horzViewAxis.cross(d);
        var dmag = d.mag();
        
        d[1]=0;//ignore y
        var orth = d.cross(camera.up);
        d = d.normalize();
        orth = orth.normalize();
        
        var moveVec = d.scale(stick1y).plus(orth.scale(stick1x)).scale((camera.moveSpeed * elapsed) / 1000.0);
        

        for (var ele of gameState.solidObjects)
        {
            var vec = camera.collisionCheck(ele,moveVec);
            if (vec != null) {
                moveVec = (vec.cross(camera.up)).scale(moveVec.dot(vec.cross(camera.up)));
            }
        }
        for (var ele of gameState.collidableObjects)
        {
            camera.collisionCheck(ele,moveVec);
        }
        
        //if (moveVec.mag() < 0.05) moveVec = new Vec();
        camera.lookingAt = camera.lookingAt.plus(moveVec);
        camera.lookingFrom = camera.lookingFrom.plus(moveVec);
        camera.position=camera.position.translate(moveVec);
        
        
        //rotation (aiming)
        var mHorz = 2*dmag*Math.sin(camera.rotSpeed*stick2x);
        var mVert = 2*dmag*Math.sin(camera.rotSpeed*stick2y);
        var dirHorz = horzViewAxis.normalize().scale(mHorz);
        var dirVert = vertViewAxis.normalize().scale(mVert);
        camera.lookingAt = camera.lookingAt.plus(dirHorz.plus(dirVert));
    }

    controller.stickLR.push(movement);
    controller.dPad.push(function(elapsed,u,d,l,r) {
        if (u) ghost.position = ghost.position.translate([0,0.01,0]);
        if (d) ghost.position = ghost.position.translate([0,-0.01,0]);
        if (l) car.turnLeft();
        if (r) car.turnRight();
    });
    controller.keyboard[68].push( function(elapsed,pressed) {//d
        if (pressed) {
            
            movement(elapsed,-1,0,0,0);
	    }
	});
	
	controller.keyboard[65].push( function(elapsed,pressed) {//a
	    if (pressed) {
            movement(elapsed,1,0,0,0);
	    }
	});
	
	controller.keyboard[83].push( function(elapsed,pressed) {//s
	    if (pressed) {
            movement(elapsed,0,1,0,0);
	    }
	});
	
	controller.keyboard[87].push( function(elapsed,pressed) {//w
	    if (pressed) {
            movement(elapsed,0,-1,0,0);
	    }
	});
	
	controller.keyboard[82].push( function(elapsed,pressed) {//r
	    if (pressed) {
            camera.lookingAt[1] += (camera.moveSpeed * elapsed) / 1000.0;
	        camera.lookingFrom[1] += (camera.moveSpeed * elapsed) / 1000.0;
	    }
	});
	
	controller.keyboard[70].push( function(elapsed,pressed) {//f
	    if (pressed) {
            camera.lookingAt[1] += (-1* camera.moveSpeed * elapsed) / 1000.0;
	        camera.lookingFrom[1] += (-1* camera.moveSpeed * elapsed) / 1000.0;
	    }
	    
	});
	
	controller.keyboard[81].push( function(elapsed,pressed) {//q
	    if (pressed) {
            movement(elapsed,0,0,1,0);
	    }
	});
	
	controller.keyboard[69].push( function(elapsed,pressed) {//e
	    if (pressed) {
            movement(elapsed,0,0,-1,0);
        }
	});
	
	controller.keyboard[49].push( function(elapsed,pressed) {//1
        if (pressed) {car.turnLeft();}
    });
    controller.keyboard[50].push( function(elapsed,pressed) {//2
        if (pressed) {car.turnRight();}
    });
    
    controller.keyboard[51].push( function(elapsed,pressed) {//3
        if (pressed) {ghost.position = ghost.position.translate([0,-0.01,0]);}
    });
    controller.keyboard[52].push( function(elapsed,pressed) {//4
        if (pressed) {ghost.position = ghost.position.translate([0,0.01,0]);}
    });
    
    controller.keyboard[53].push( function(elapsed,pressed) {//5
        if (pressed) {car.driveForwards();}
    });
    controller.keyboard[54].push( function(elapsed,pressed) {//6
        if (pressed) {car.driveBackwards();}
    });
    
    controller.keyboard[55].push( function(elapsed,pressed) {//7
        if (pressed) {grave.seen();}
    });
    controller.keyboard[56].push( function(elapsed,pressed) {//8
        if (pressed) {grave2.seen();}
    });
    controller.keyboardUp[57].push( function(elapsed) {//9
            myGL.getDepthPre();
            var perspectiveMat = (new Mat4()).perspective(camera.fieldOfView,camera.lookingAt,camera.lookingFrom,camera.up);
            for (ele of gameState.sceneElements) {
            	drawTexturedObject(ele,perspectiveMat);
            }
            animate(gameState.solidObjects);
            for (ele of gameState.solidObjects) {
            	drawTexturedObject(ele,perspectiveMat);
            }
            globalDepth = myGL.getDepthPost();
    });
    
    controller.buttonW.push( function(elapsed,pressed) {
        if (pressed) {car.driveForwards();}
    });
    controller.buttonS.push( function(elapsed,pressed) {
        if (pressed) {car.driveBackwards();}
    });
    
    controller.showGamePadMessage = function() {
        var cind = document.getElementById("cind");
        cind.innerHTML="No controller detected. Press any button.";
    }
    controller.hideGamePadMessage = function(padid) {
        var cind = document.getElementById("cind");
        cind.innerHTML="Controller connected: "+padid;
    }
        
    
    
    
    
    tick = function() {
        requestAnimFrame(tick);
        //drawScene();
        myGL.clearScene();
        myGL.setLighting();
        
        var perspectiveMat = (new Mat4()).perspective(camera.fieldOfView,camera.lookingAt,camera.lookingFrom,camera.up);
        
        animate(gameState.sceneElements);
        for (ele of gameState.sceneElements) {
        	drawTexturedObject(ele,perspectiveMat);
        }
        animate(gameState.solidObjects);
        for (ele of gameState.solidObjects) {
        	drawTexturedObject(ele,perspectiveMat);
        }
        animate(gameState.collidableObjects);
        for (ele of gameState.collidableObjects) {
        	drawTexturedObject(ele,perspectiveMat);
        }
        //globalDepth = myGL.getDepth();
    }
    tick();
}


