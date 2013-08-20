
$(document).ready(function(){
	myLib.getSetting(function(data){
		switch (data.action){
			case "menu":
			break;
		
			case "doubleclick":
			$(document).dblclick(function(eventObj){
				var selectionText = $.trim(myLib.getSelection());
				if (selectionText){
					chrome.runtime.sendMessage({type:"selection", value:selectionText});
				}
			});	
			break;
			
			case "select":
			var mDown = false;
			var mMove = false;
			var lastX = -1;
			var lastY = -1;
			$(document).mousedown(function(eventObj){
				mDown = true;
				lastX = eventObj.pageX;
				lastY = eventObj.pageY;
			});	
			
			$(document).mousemove(function(eventObj){ 
				if (mDown){
					mMove = true;
				}
			});	
			
			$(document).mouseup(function(eventObj){
				if (mMove){
					var deltaX = eventObj.pageX - lastX;
					var deltaY = eventObj.pageY - lastY;
					if ( deltaX > 3 || deltaX < -3 || deltaY > 3 || deltaY < -3){
						var selectionText = $.trim(myLib.getSelection());
						if (selectionText){
							chrome.runtime.sendMessage({type:"selection", value:selectionText});
						}
					}
				}
				mDown = mMove = false;
				lastX = lastY = -1;
			});	
			break;
		}
	});
});