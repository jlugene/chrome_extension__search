$(document).ready(function(){
	
	myLib.getSetting(function(data){	

		var params = window.location.hash.substring(1).split('&');
		var item_index = parseInt(params[0].split('=')[1]);
		var keyword = params[1].split('=')[1];
		var item = data.items[item_index];alert(keyword);
		myLib.ajax_query(keyword, item, function(html, slct){
			$(slct).empty().append(html);
		});
		var time = 500;
		var size = {
			type: "entrysize",
			value:{
				index: item_index,
				width: 0,
				height: 0
			}
		};
					
		setInterval(function(){
			if (document.body.scrollWidth != size.value.width || document.body.scrollHeight != size.value.height){
				size.value.width = document.body.scrollWidth;
				size.value.height = document.body.scrollHeight;
				chrome.runtime.sendMessage(size);
			}
		}, time);

	});
	


});