define( function() {
    
    var controller =  {
    
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
        
        hideGamePadMessage : function(){},
        showGamePadMessage : function(){},
        
        currentlyPressedKeys : {},
        
        onTick : function(elapsed) {
            var gamepad = navigator.getGamepads()[0];
    
            var cind = document.getElementById("cind");
            if (gamepad !== undefined && gamepad !== null) {
                this.hideGamePadMessage();
                
                //if (xbox)
                var stickLx = -gamepad.axes[0];
                var stickLy = gamepad.axes[1];
                var stickRx = -gamepad.axes[2];
                var stickRy = -gamepad.axes[3];
                
                var dPadU = (gamepad.buttons[12].pressed || gamepad.buttons[12].value !== 0);
                var dPadD = (gamepad.buttons[13].pressed || gamepad.buttons[13].value !== 0);
                var dPadL = (gamepad.buttons[14].pressed || gamepad.buttons[14].value !== 0);
                var dPadR = (gamepad.buttons[15].pressed || gamepad.buttons[15].value !== 0);
                //TODO
                //normalize stick vector
                //zero out noise readings
                //
                
                //else
                /////////////////////////
                
                for (var todo of this.stickL) {todo(elapsed,stickLx,stickLy);}
                for (var todo of this.stickR) {todo(elapsed,stickRx,stickRy);}
                for (var todo of this.stickLR) {todo(elapsed,stickLx,stickLy,stickRx,stickRy);}
                for (var todo of this.dPad) {todo(elapsed,dPadU,dPadD,dPadL,dPadR);}
                
	            //test script
	            /*for (var i=0; i<gamepad.buttons.length; i++) {
	                if (gamepad.buttons[i].pressed || gamepad.buttons[i].value !== 0) {
	                    console.log('['+i+'] pressed='+gamepad.buttons[i].pressed+'  value='+gamepad.buttons[i].value);
	                }
	            }*/
	

            } else {
                this.showGamePadMessage();
            }
            
            for (var key=0; key<256; key++) {
                //console.log(this.keyboard[key]);
                for ( var todo of this.keyboard[key]) {todo(elapsed,this.currentlyPressedKeys[key]);}
            }
        }
    };    
    
    for (var i=0; i<256; i++) {controller.keyboard[i]=[];}
    
    handleKeyDown = function (event) {
        controller.currentlyPressedKeys[event.keyCode] = true;
    }

    handleKeyUp = function (event) {
      controller.currentlyPressedKeys[event.keyCode] = false;
    }
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    
    
    return controller
});
