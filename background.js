(function(){
	var popId = -1;
	var menuId = -1;
	
	var getDefaultSetting = function(){
		var defalt = {

			items :[
				{
					d_id: 1,
					d_enabled: true,
					d_name: "百度",
					d_url: "http://www.baidu.com/s?ie=utf-8&bs=get&f=8&rsv_bp=1&rsv_spt=3&wd=%%keyword%%&inputT=0",
					d_submitType: "GET",
					d_minimode: false
				},
				{
					d_id: 2,
					d_enabled: true,
					d_name: "Google",
					d_url: "http://www.google.com.hk/search?q=%%keyword%%",
					d_submitType: "GET",
					d_minimode: false
				},				
				{
					d_id: 3,
					d_enabled: true,
					d_name: "jQuery api",
					d_url: "http://api.jquery.com/%%keyword%%/",
					d_submitType: "GET",
					d_minimode: false
				},
				{
					d_id: 4,
					d_enabled: true,
					d_name: "汉典",
					d_url: "http://www.zdic.net/sousuo/",
					d_submitType: "POST",
					d_param_name_1: "lb_a",
					d_param_value_1: "hp",
					d_param_name_2: "lb_b",
					d_param_value_2: "mh",
					d_param_name_3: "lb_c",
					d_param_value_3: "mh",
					d_param_name_4: "tp",
					d_param_value_4: "tp1",
					d_param_name_5: "q",
					d_param_value_5: "%%keyword%%",
					d_minimode: false
				},
				{
					d_id: 5,
					d_enabled: true,
					d_name: "英语词典",
					d_minimode: true
				},
				{
					d_id: 6,
					d_enabled: true,
					d_name: "Oxford Advanced Learner's dictionary",
					d_parentId: 5,
					d_url: "http://oald8.oxfordlearnersdictionaries.com/dictionary/%%keyword%%",
					d_submitType: "GET",
					d_filter: '<div id="relatedentries">\n<div id="entryContent">',
					d_css: 'html,body{ background-image: -webkit-linear-gradient(top,white,white);}\n'+
							'#entryContent{ text-align:left; }\n'+
							'.sd-g, .id-g, .pv-g{ border-bottom-width:0;}\n'+
							'.n-g, .id-g, .pv-g{\n'+
							'margin: 0 0 20px 0;\n'+
							'text-indent: 0;\n'+
							'background-color:#F0FFFF;\n'+
							'}\n'+
							'.x-g *{ font-style:normal;}\n'+
							'.x{color:#CC6633;}\n'+
							'.x-g, .n-g .x-g{margin-left:15px;padding-bottom:0;}\n'+
							'#resulthead {\n'+
							'background-image: url(http://oald8.oxfordlearnersdictionaries.com/external/images/services/bk-results.png);\n'+
							'height: 33px;\n'+
							'color: #FFF;\n'+
							'font-size: 16px;\n'+
							'font-family: "Times New Roman",Times,serif;\n'+
							'padding-top: 8px;\n'+
							'text-align: center;\n'+
							'text-indent: 0;\n'+
							'}\n'+
							'div#relatedentries{border-width: 1;border-style: solid;}'
				},			
				{
					d_id: 7,
					d_enabled: true,
					d_name: "爱词霸",
					d_parentId: 5,
					d_url: "http://www.iciba.com/%%keyword%%",
					d_submitType: "GET",
					d_filter: '<div class="group_pos">',
					d_css: ''
				},
				{
					d_id: 8,
					d_enabled: true,
					d_name: "Merriam-Webster Online",
					d_parentId: 5,
					d_url: "http://www.merriam-webster.com/dictionary/%%keyword%%",
					d_submitType: "GET",
					d_filter: '<form id="entry" action="/dictionary/kill" method="post" class="results-pagination">\n<div id="mwEntryData">',
					d_css: ''
				}
			
			],
			
			forms: {
				'#d_type' : {
					notEmpty: "词典类型不能为空!",
					tip : "选择一种语言"
				},
				'#d_name' : {
					notEmpty: "词典名不能为空!",
					tip : "name"
				},
				'#d_url' :{
					notEmpty: "链接不能为空!",
					tip : "http://www.example.com/index.php?q=%%keyword%%"
				},
				'#d_submitType' : {
					notEmpty: "提交方式不能为空!"
				},
				'.d_param': {
					notEmpty: "参数不能为空!"
				},
				'#d_filter' : {			
				}
			},
		};
		return defalt;
	}


	var refreshMenu = function(){
		if (menuId != -1){
			chrome.contextMenus.remove(menuId);
			submenuMap = {};
		}
		menuId = chrome.contextMenus.create({
			"title": "万能搜索", 
			"contexts":['selection']
		});
		for (var i = 0; i < m_setting.items.length; i++){
			if (m_setting.items[i].d_enabled && !m_setting.items[i].d_parentId){
				var submenuId = chrome.contextMenus.create({
					"title": m_setting.items[i].d_name,
					"contexts":['selection'],
					"parentId": menuId, 
					"onclick":  function (info, tab){
						openPage(info.selectionText, info.menuItemId);
					}
				});
				submenuMap[submenuId] = i;
			}
		}
	};

	var submenuMap = {};
	var openPage= function(selectionText, submenuId){
		var i = submenuMap[submenuId];
		var item = m_setting.items[i];
		//if minimode , open in popup.html 
		if (item.d_minimode){
			if (popId == -1){
				var _src = 'popup.html#' + 'i=' + i + '&q=' + selectionText;
				chrome.windows.create({ url:_src, type:'panel', width:800  }, function(window){popId = window.id;}); 
			}
			else{
				chrome.tabs.query({ windowId: popId }, function(tabs){ 
					if (tabs.length > 0 ){
						chrome.tabs.sendMessage(tabs[0].id, { type:"openPopup", value: { keyword: selectionText, index:i} });
						chrome.windows.update(popId, { focused :true });
					}
					else{
						var _src = 'popup.html#' + 'q=' + selectionText + '&i=' + i;
						chrome.windows.create({ url:_src, type:'panel', width:800  }, function(window){popId = window.id;}); 
					}
				});
			}
		}
		//else open as a new window 
		else{
			window.open((item.d_submitType == "GET") ? 
				item.d_url.replace("%%keyword%%", selectionText) : ('entry.html#' + 'i=' + i + '&q=' + selectionText));
		}		
	};
	
	
	////////////////////////////////////////////////////////////////////start
	var m_setting = localStorage.getItem("setting");
	if (m_setting){
		m_setting = JSON.parse(m_setting);
	}
	else{
		m_setting = getDefaultSetting();
	}	
	var m_history = localStorage.getItem("history");
	if (m_history){
		m_history = JSON.parse(m_history);
	}
	else{
		m_history = {};
	}
	
	refreshMenu();
		
	//receive massage from other js
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		//from myLib.js
		if (request.type == "getSetting"){
			sendResponse(m_setting);
			return;
		}
		//from myLib.js
		if (request.type == "setSetting"){
			m_setting = request.value;
			localStorage.setItem("setting", JSON.stringify(m_setting));
			sendResponse(null);
			refreshMenu();
			return;
		}
		//from option.js->myLib.js
		if (request.type == "setDefaultSetting"){
			m_setting = getDefaultSetting();
			sendResponse(m_setting);
			refreshMenu();
			return;
		}
		//from content_scripts.js
		if (request.type == "selection" && m_setting.action != "menu"){
			openPage(request.value);
			m_history[request.value] = (new Date()).getTime();
		}
	});

	
	window.onunload=function(){
		localStorage.setItem("history", JSON.stringify(m_history));
		localStorage.setItem("setting", JSON.stringify(m_setting));
	};
})();