$(document).ready(function(){
	var select_index;
	var lastWord = "";
	var menuCreated = false;
	var setting;
	
	//make sure item_index is a number
	var queryWord = function(_keyword, item_index){
		if (!_keyword || item_index < 0){
			return;
		}
		$('.div_result_content').remove();
		var item = setting.items[item_index];
		if (item.d_minimode){
			var id = item.d_id;
			for (var i = 0; i < setting.items.length; i++){
				if (setting.items[i].d_enabled && setting.items[i].d_parentId == id){
					var subitem = setting.items[i];
					var img = (subitem.d_favicon ? ('<img src="' + subitem.d_favicon + '">') : "");
					var _src = 'entry.html#' + 'i=' + i + '&q=' + _keyword;
					$('body').append(
					'<div class="div_result_content">'+
						'<div class="div_result_no">'+ img + '<span class="itemname">' + subitem.d_name + '</span></div>'+
						'<iframe id="' + i + '" src=' + _src + '></iframe>'+
					'</div>');
				}
			}
		}
		else{
			window.open((item.d_submitType == "GET") ? 
				item.d_url.replace("%%keyword%%", _keyword) : ('entry.html#' + 'i=' + i + '&q=' + _keyword));
		}
		$("#searchtext").focus();
		
	};


	
	myLib.getSetting(function(data){
		$('.div_result_content').remove();
		setting = data;
		//获取参数
		var arr	= $.trim(window.location.hash).substring(1).split('&');
		var bckgrnd_index = -1;
		var keyword = "";
		if (arr){
			for (var i = 0; i < arr.length; i ++){
				if (arr[i].substring(0, 2) == "i=")
					bckgrnd_index = arr[i].substring(2);
				if (arr[i].substring(0, 2) == "q=")
					keyword = arr[i].substring(2);		
			}
		}			
		bckgrnd_index = parseInt(bckgrnd_index);
		
		$("#searchtext").val(keyword);

		if (!data.items.length){
			return;
		}
		//创建和设置菜单
		$('#searchtext').before('<img id="searchtype" class="menuItemImg">');
		$('#searchtext').before('<img id="img_down" src="res/down.gif">');
		$('#searchtype').createMenu();
		for (var i = 0; i < data.items.length; i++){
			if (data.items[i].d_enabled && !data.items[i].d_parentId){
				var item = data.items[i];
				var img = '<img src ="'+ (item.d_favicon ? item.d_favicon : 'res/empty.png' ) + '" class="menuItemImg">';
				$('#searchtype').appendMenuItem(img + '<span class="menuItemText" id="menuitem_' + i + '">' + item.d_name + '</span>');
			}
		}
		var changeSelect = function(id){
			select_index = id;
			$('#searchtype').attr('src', (data.items[id].d_favicon ? data.items[id].d_favicon : 'res/empty.png' ));
			$('#searchtype').attr('title', data.items[id].d_name);
			queryWord($.trim($("#searchtext").val()), select_index);			
		};
		$('#searchtype').menuItemSelected(function(selection){
			var id = parseInt(selection.eq(1).attr('id').substring(9)); //span
			changeSelect(id);
		});
		
		//查询
		if (bckgrnd_index >= 0 && bckgrnd_index < data.items.length){
			changeSelect(bckgrnd_index);			
		}
		else{
			changeSelect(0);
		}
		
	});	
	
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		//from entry.html
		if (request.type == "entrysize"){
			var id = request.value.index;
			if (request.value.height != $("#" + id).height()){
				var tmp = $("#" + id).parent().height() - $("#" + id).height();
				$("#" + id).height(request.value.height);
				$("#" + id).parent().height(request.value.height + tmp);	
			}
			if (request.value.width != $("#" + id).width()){
				var tmp = $("#" + id).parent().width() - $("#" + id).width();
				$("#" + id).width(request.value.width);
				$("#" + id).parent().width(request.value.width + tmp);	
			}
			
			if (window.innerWidth < request.value.width){
				window.innerWidth = 20 + request.value.width;
			}
			return;
		}
		//from background.js
		if (request.type == "openPopup"){
			if (request.value.keyword != lastWord){
				bckgrnd_index = request.value.index;
				//此处是background.js发出查询命令，而popup.html又没有关闭，则刷新页面
				$("#searchtext").val(request.value.keyword);
				queryWord(request.value.keyword, parseInt(bckgrnd_index));
				lastWord = request.value.keyword;
				return;
			}
		}
	});
 

	$('#btn_search').click(function(){
		queryWord($.trim($("#searchtext").val()), select_index);		 //点击本页的“查询”按钮而刷新
	});

	$('#btn_setting').click(function(){
		window.open("options.html");
	});
	
	$('.btn_img').mouseenter(function(){
		$(this).addClass("btn_img_enter");
		var src = $(this).attr('src').replace("leave", "enter");
		$(this).attr('src', src);
	}).mouseleave(function(){
		$(this).removeClass("btn_img_enter");
		var src = $(this).attr('src').replace("enter", "leave");
		$(this).attr('src', src);
	});	
	
	$("#searchtext").keydown(function(event){
		if (event.which == 13) {
    		$('#btn_search').trigger("click");
		}
	}).focus(function(){
		$(this).addClass('searchtext_focus');
	}).blur(function(){
		$(this).removeClass('searchtext_focus');

	});
	
});

