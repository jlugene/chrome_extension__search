window.myLib = {
	getSetting: function(callback){
		chrome.runtime.sendMessage({ type: "getSetting"},  function(setting) {
			if (callback){
				callback(setting);
			}
		});
	},
	
	setSetting: function(data, callback){
		chrome.runtime.sendMessage({ type: "setSetting", value: data},  function(response) {
			if (callback){
				callback(response);
			}
		});
	},

	setDefaultSetting: function(callback){
		chrome.runtime.sendMessage({ type: "setDefaultSetting"},  function(defaultSetting) {
			if (callback){
				callback(defaultSetting);
			}
		});
	},
	
	getSelection: function(){
		if (window.getSelection) {
			return window.getSelection().toString();
		} else if (document.selection && document.selection.createRange) {
			return document.selection.createRange().text;
		}
		return '';
	},
	
	//get prefix(e.g. protocol,port, if exists) + hostname of a url
	getHostnameOf:function(url){
		var from = url.indexOf("//");
		from = (from == -1) ? 0 : from + 2;
		var to = url.indexOf('/', from);
		if (to == -1){
			var suf_i = url.indexOf("?");
			if (suf_i != -1){
				to = suf_i;
			}
		}
		if (to == -1){
			return url;
		}
		return url.substring(0, to);
	},
	
	getCurrentDirOf:function(url){
		var from = url.lastIndexOf("//");
		from = (from == -1) ? 0 : from + 2;
		var to = url.length;
		for (var i = url.length - 1; i >= from; i--){
			if (url[i] == '/' || url[i] == '?'){
				to = i;
			}
		}
		if (to == from){
			to = url.length;
		}
		return url.substring(0, to);
	},
	
	//replace relative url in string with absolute url
	rel_to_abs : function(str, url){
		var url_currentDir = myLib.getCurrentDirOf(url);
		var url_hostname = myLib.getHostnameOf(url);
		return str.replace(/((href|src)\s*=\s*)(("\/?[^"\/]+(\/[^"\/]+)*\s*")|('\/?[^'\/]+(\/[^'\/]+)*\s*'))/gi, 
			function replacer(match, p1, p2, p3, p4, p5, p6, p7, offset, string){
			if (p3[1] == '/') {
				return p1 + p3[0] + url_hostname + p3.substring(1);	//p3[0] is ' or "
			}
			else {
				return p1 + p3[0] + url_currentDir + '/' + p3.substring(1);
			}
		});		
	},
	
	updateIcon : function(item, callback){
		if (!callback){
			return;
		}
		if (item.d_favicon || !item.d_url){
			callback();
			return;
		}
		var hostname =  myLib.getHostnameOf(item.d_url);
		$.ajax({
			url: hostname + '/favicon.ico',
			timeout: 3000,
			success:function(data){
				item.d_favicon = hostname + '/favicon.ico';
				callback();
				return;
			},
			error:function(data){
				$.ajax({
					url: hostname,
					timeout: 3000,
					success:function(data){
						data = myLib.rel_to_abs(data, hostname);
						var tmpbody = $('<tmpbody></tmpbody>').append($(data));
						var element = tmpbody.find('link[rel="icon"], link[rel="shortcut icon"]');
						if (element.length > 0){
							item.d_favicon = element.attr("href");
						}
						callback();
					},			
					
					error:function(data){
						callback();
					}
				});
			}
		});
	},
	
	ajax_query : function(keyword, item, callback){
		var _url = item.d_url.replace("%%keyword%%", keyword);
		var _param = {};
		for (var prop in item){
			if (prop.indexOf('d_param_name_') != -1){
				var name = item[prop].replace("%%keyword%%", keyword);
				var value = item[prop.replace("name", "value")].replace("%%keyword%%", keyword);
				_param[name] = value;
			}
		}

		$.ajax({
			type: item.d_submitType,
			url: _url,
			data: _param,
			dataType: "html",
			timeout:5000,
			success:function(data){
				//replace relative url in data with absolute url
				data = myLib.rel_to_abs(data, _url);
				filterArr = item.d_filter.match(/<[\s]*([\w]+)(([\s]*[\w]+[\s]*=[\s]*("[^"]*")|('[^']'))*)[\s]*>/g);
				
				var html = $('<div></div>').append($(data));
					
				if (filterArr && filterArr.length){
					//head
					var head = html.find("title,meta,link");//find('head')????????????????/
					callback(head, 'head'); 
					
					//body
					var body = $('<div></div>');
					for(var i = 0; i < filterArr.length;i++){
						var filter = filterArr[i].match(/^<[\s]*([\w]+)(([\s]*[\w]+[\s]*=[\s]*("[^"]*")|('[^']'))*)[\s]*>$/);
						if (filter && filter[1]){
							var element = filter[1];
							var content = html.find(element);
							var attributes = filter[2];
							var attr_array = attributes.match(/[\w]+[\s]*=[\s]*("[^"]*")|('[^']')/g);
							if (attr_array){
								for (var j = 0; j < attr_array.length; j++){
									var selector = element + '[' + attr_array[j] + ']';
									content = content.filter(selector);
								}
							}
							body.append(content);
						}
					}
					
					body.find('script').remove();
					if (body.children().length == 0){
						body.append('没有查到' + keyword);
					}
					body.append('<style type="text/css">' + item.d_css + '</style>');
					callback(body, 'body');
				}
				else{
					//html.find('script').remove();
					html.append('<style type="text/css">' + item.d_css + '</style>');
					callback(html, 'body');
				}
			},
			
			error:function(data){
				var body = $('<div class="searcherror">出错了,没有查到' + keyword + '.</div>');
				callback(body, 'body');
			}
		});
	}
	
};

Array.prototype.removeAt = function(index){
	if (index >= 0  && index < this.length){
		for (var i = index; i < this.length; i++){
			this[i] = this[i + 1];
		}
		this.pop();
	}
};
Array.prototype.remove = function(value){
	for (var i = 0; i < this.length; i++){
		if (this[i] == value){
			this.removeAt(i);
		}
	}
};
