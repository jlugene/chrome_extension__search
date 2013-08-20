$(document).ready(function(){
	var keyword;
	var item_index;
	var arr	= $.trim(window.location.hash).substring(1).split('&');
	if (arr){
		for (var i = 0; i < arr.length; i ++){
			if (arr[i].substring(0, 2) == "i=")
				item_index = arr[i].substring(2);	
			if (arr[i].substring(0, 2) == "q=")
				keyword = arr[i].substring(2);
		}
	}
	if (keyword && item_index){
		myLib.getSetting(function(data){		
			var i = parseInt(item_index);
			var items = data.items;
			if (!items[i].d_parentId){
				var form = $('<form action="' + items[i].d_url + '" method="post"></form>');
				for (var prop in items[i]){
					if (prop.indexOf('d_param_name_') != -1){
						var name = items[i][prop].replace("%%keyword%%", keyword);
						var value = items[i][prop.replace("name", "value")].replace("%%keyword%%", keyword);
						
						form.append('<input type="hidden" name="'+name+'" value="'+value+'">');
					}
				}
				$('body').append(form);//创建表单  
				$('body').find('form').submit();//提交表单 
			}
			else{
				myLib.ajax_query(keyword, items[i], function(html, slct){
					$(slct).empty().append(html);
				});
			}
		});
	}

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