define( function() {
    
    var controller =  {
        player : 0,
        stickL : [],//array of functions(elapsed,x,y)
        stickR : [],//array of functions(elapsed,x,y)
        stickLR : [],//array of functions(elapsed,xL,yL,xR,yR)
        dPad : [],//array of functions(elapsed,u,d,l,r)
        buttonN : [],//array of functions(elapsed,b)
        buttonS : [],//array of functions(elapsed,b)
        buttonE : [],//array of functions(elapsed,b)
        buttonW : [],//array of functions(elapsed,b)
        buttonS : [],//array of functions(elapsed,b)
        triggerL : [],//array of functions(elapsed,b)
        triggerR : [],//array of functions(elapsed,b)
        triggerL_top : [],//array of functions(elapsed,b)
        triggerR_top : [],//array of functions(elapsed,b)
        start : [],//array of functions(elapsed,b)
        keyboard : {},//map, where key value is key code and value is function(b)
        keyboardUp : {},//map, where key value is key code and value is function(b)
        
        hideGamePadMessage : function(){},
        showGamePadMessage : function(){},
        
        currentlyPressedKeys : {},
        currentlyReleasedKeys : {},
        
        windowWidth : 500,
        windowHeight : 500,
        mouseX : 0,
        mouseY : 0,
        handleMouseMove : function (event) {
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;
        },
        
        onTick : function(elapsed) {
			var gamePads=navigator.getGamepads();
            var gamepad = undefined;
            for (var i=0; i< gamePads.length; i++) {
				gamepad = gamePads[i];
				//console.log(gamepad)
				if (gamepad !== undefined) break;
			}
    
            var cind = document.getElementById("cind");
            
            var stickLx=0;
            var stickLy = 0;
            var stickRx = 0;
            var stickRy = 0;
            var noiseThresh = 0.07;
            
            if (gamepad !== undefined && gamepad !== null) {
                this.hideGamePadMessage(gamepad.id);
                
                
                
                var dPadU = false;
                var dPadD = false;
                var dPadL = false;
                var dPadR = false;
                
                var buttonN = false;
                var buttonS = false;
                var buttonE = false;
                var buttonW = false;

                
                
                /*for (var i=0; i<gamepad.axes.length; i++) {
	                if (gamepad.axes[i] !== 0 && Math.abs(gamepad.axes[i]) < 0.1) {
	                
	                    gamepad.axes[i]=0;
	                }
	            }*/
                if (gamepad.id.substring(0,17) === "Holtek Controller"  || gamepad.id.substring(0,4) === "Xbox" || gamepad.id.search(/Microsoft/)!=-1) {//xbox
                    stickLx = -gamepad.axes[0];
                    stickLy = gamepad.axes[1];
                    stickRx = -gamepad.axes[2];
                    stickRy = -gamepad.axes[3];
                    
                    if (stickLx !== 0 && Math.abs(stickLx) < noiseThresh) {
	                    stickLx=0;
	                }
	                if (stickLy !== 0 && Math.abs(stickLy) < noiseThresh) {
	                    stickLy=0;
	                }
	                if (stickRx !== 0 && Math.abs(stickRx) < noiseThresh) {
	                    stickRx=0;
	                }
	                if (stickRy !== 0 && Math.abs(stickRy) < noiseThresh) {
	                    stickRy=0;
	                }
                    
                    dPadU = (gamepad.buttons[12].pressed || gamepad.buttons[12].value !== 0);
                    dPadD = (gamepad.buttons[13].pressed || gamepad.buttons[13].value !== 0);
                    dPadL = (gamepad.buttons[14].pressed || gamepad.buttons[14].value !== 0);
                    dPadR = (gamepad.buttons[15].pressed || gamepad.buttons[15].value !== 0);
                    
                    buttonN = (gamepad.buttons[3].pressed || gamepad.buttons[3].value !== 0);
                    buttonS = (gamepad.buttons[0].pressed || gamepad.buttons[0].value !== 0);
                    buttonE = (gamepad.buttons[1].pressed || gamepad.buttons[1].value !== 0);
                    buttonW = (gamepad.buttons[2].pressed || gamepad.buttons[2].value !== 0);
                    
                    //TODO
                    //normalize stick vector
                    //
                    //
                
                } else if (gamepad.id.substring(0,17) == 'Gravis Eliminator') {//??
                    stickLx = -gamepad.axes[0];
                    stickLy = gamepad.axes[1];
                    stickRx = -gamepad.axes[4];
                    stickRy = -gamepad.axes[2];
                    
                    if (stickLx !== 0 && Math.abs(stickLx) < noiseThresh) {
	                    stickLx=0;
	                }
	                if (stickLy !== 0 && Math.abs(stickLy) < noiseThresh) {
	                    stickLy=0;
	                }
	                if (stickRx !== 0 && Math.abs(stickRx) < noiseThresh) {
	                    stickRx=0;
	                }
	                if (stickRy !== 0 && Math.abs(stickRy) < noiseThresh) {
	                    stickRy=0;
	                }
                    
                    dPadU = (gamepad.axes[3] < 0);
                    dPadD = (gamepad.axes[3] > 0);
                    dPadL = (gamepad.axes[5] < 0);
                    dPadR = (gamepad.axes[5] > 0);
                    
                    buttonN = (gamepad.buttons[3].pressed || gamepad.buttons[3].value !== 0);
                    buttonS = (gamepad.buttons[1].pressed || gamepad.buttons[1].value !== 0);
                    buttonE = (gamepad.buttons[2].pressed || gamepad.buttons[2].value !== 0);
                    buttonW = (gamepad.buttons[0].pressed || gamepad.buttons[0].value !== 0);
                    
                } else if (gamepad.id.substring(0,17) === "Logitech Logitech") {//PS
                    stickLx = -gamepad.axes[0];
                    stickLy = gamepad.axes[1];
                    stickRx = -gamepad.axes[2];
                    stickRy = -gamepad.axes[3];
                    
                    if (stickLx !== 0 && Math.abs(stickLx) < noiseThresh) {
	                    stickLx=0;
	                }
	                if (stickLy !== 0 && Math.abs(stickLy) < noiseThresh) {
	                    stickLy=0;
	                }
	                if (stickRx !== 0 && Math.abs(stickRx) < noiseThresh) {
	                    stickRx=0;
	                }
	                if (stickRy !== 0 && Math.abs(stickRy) < noiseThresh) {
	                    stickRy=0;
	                }
                    
                    dPadU = (gamepad.axes[5] < 0);
                    dPadD = (gamepad.axes[5] > 0);
                    dPadL = (gamepad.axes[4] < 0);
                    dPadR = (gamepad.axes[4] > 0);
                    
                    buttonN = (gamepad.buttons[3].pressed || gamepad.buttons[3].value !== 0);
                    buttonS = (gamepad.buttons[1].pressed || gamepad.buttons[1].value !== 0);
                    buttonE = (gamepad.buttons[2].pressed || gamepad.buttons[2].value !== 0);
                    buttonW = (gamepad.buttons[0].pressed || gamepad.buttons[0].value !== 0);
                    
                    //TODO
                    //normalize stick vector
                    //
                    //
                
                }
                /////////////////////////
                
                
                for (var todo of this.dPad) {todo(elapsed,dPadU,dPadD,dPadL,dPadR);}
                for (var todo of this.buttonN) {todo(elapsed,buttonN);}
                for (var todo of this.buttonS) {todo(elapsed,buttonS);}
                for (var todo of this.buttonE) {todo(elapsed,buttonE);}
                for (var todo of this.buttonW) {todo(elapsed,buttonW);}
                
	            //test script
	            /*for (var i=0; i<gamepad.axes.length; i++) {
	                if (gamepad.axes[i] !== 0) {
	                    console.log('stick['+i+'] = '+gamepad.axes[i]);
	                }
	            }
	            for (var i=0; i<gamepad.buttons.length; i++) {
	                if (gamepad.buttons[i].pressed || gamepad.buttons[i].value !== 0) {
	                    console.log('button['+i+'] pressed='+gamepad.buttons[i].pressed+'  value='+gamepad.buttons[i].value);
	                }
	            }*/
	

            } else {
                this.showGamePadMessage();
                stickRx = -(this.mouseX-this.windowWidth/2.0)/(this.windowWidth/2.0);
                stickRy = -(this.mouseY-this.windowHeight/2.0)/(this.windowHeight/2.0);
                
                if (stickLx !== 0 && Math.abs(stickLx) < noiseThresh) {
                    stickLx=0;
                }
                if (stickLy !== 0 && Math.abs(stickLy) < noiseThresh) {
                    stickLy=0;
                }
                if (stickRx !== 0 && Math.abs(stickRx) < noiseThresh) {
                    stickRx=0;
                }
                if (stickRy !== 0 && Math.abs(stickRy) < noiseThresh) {
                    stickRy=0;
                }
            }
            for (var todo of this.stickL) {todo(elapsed,stickLx,stickLy);}
            for (var todo of this.stickR) {todo(elapsed,stickRx,stickRy);}
            for (var todo of this.stickLR) {todo(elapsed,stickLx,stickLy,stickRx,stickRy);}
            
            for (var key=0; key<256; key++) {
                //console.log(this.keyboard[key]);
                for ( var todo of this.keyboard[key]) {todo(elapsed,this.currentlyPressedKeys[key]);}
                for ( var todo of this.keyboardUp[key]) {if (this.currentlyReleasedKeys[key]) todo(elapsed);
                                                         this.currentlyReleasedKeys[key] = false;}
            }
        }
    };    
    
    for (var i=0; i<256; i++) {controller.keyboard[i]=[]; controller.keyboardUp[i]=[];}
    
    handleKeyDown = function (event) {
        controller.currentlyPressedKeys[event.keyCode] = true;
    }

    handleKeyUp = function (event) {
      controller.currentlyPressedKeys[event.keyCode] = false;
      controller.currentlyReleasedKeys[event.keyCode] = true;
    }
    handleMouseMove = function (event) {
      controller.handleMouseMove(event);
    }
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    document.onmousemove = handleMouseMove;
    
    return controller
});
