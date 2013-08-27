$(document).ready(function(){
	myLib.getSetting(function(data){		
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
			var item_index = parseInt(item_index);
			var item = data.items[item_index];
			var urlencode = item.d_urlencode ? item.d_urlencode : "UTF-8" ;
			
			var submitType = item.d_submitType;
			var url = item.d_url.replace('%%keyword%%', keyword);
			var params = item.d_params.replace('%%keyword%%', keyword);
			var form = $('<form action="' + url + '" method="' + submitType + '" accept-charset="' + urlencode + '"></form>');
			if (params){
				var arr = params.split('&');
				for (var j = 0; j < arr.length; j++){
					form.append('<input type="hidden" name="'+ arr[j].split('=')[0] +'" value="'+ arr[j].split('=')[1] +'">');
				}
			}
			//form.append('<input type="submit">');
			$('body').append(form);//创建表单  
			$('body').find('form').submit();//提交表单
		
			
		}
	});
});