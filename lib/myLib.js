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
			if (url[i] == '/'){
				to = i;
				break;
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
		if (!item.d_url){
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
	
	//这里的keyword已经经过了转码
	ajax_query : function(keyword, item, callback){
		var _url = item.d_url.replace('%%keyword%%', keyword);
		var params = item.d_params.replace('%%keyword%%', keyword);		
		/*
		var data = {};
		if (params){
			params = params.split('&');
			for (var j = 0; j < params.length; j++){
				var name = params[j].split('=')[0];
				var value = params[j].split('=')[1];
				data[name] = value;
			}
		}
		*/
		$.ajax({
			type: item.d_submitType,
			url: _url,
			//data: data,
			data: params,
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
					for (var i = 0; i < filterArr.length;i++){
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
					html.find('script').remove();
					html.append('<style type="text/css">' + item.d_css + '</style>');
					callback(html, 'body');
				}
			},
			
			error:function(data){
				var body = $('<div class="searcherror">出错了,没有查到' + keyword + '.</div>');
				callback(body, 'body');
			}
		});
	},
	
	/*
	urlEncode : function(item, str){
		if (item.d_urlencode == "GB2312"){
			var xx=new GB2312UTF8(); 
			var Gb2312=xx.Utf8ToGb2312(str);
			return escape(Gb2312);
		}
		else{
			return encodeURI(str);
		}
	}
	 */
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


/* 
 * GB2312转UTF8 
 * 例： 
 * var xx=new GB2312UTF8(); 
 * var Utf8=xx.Gb2312ToUtf8("你aaa好aaaaa"); 
 * var Gb2312=xx.Utf8ToGb2312(Utf8); 
 * alert(Gb2312); 
 */  
function GB2312UTF8(){  
  this.Dig2Dec=function(s){  
      var retV = 0;  
      if(s.length == 4){  
          for(var i = 0; i < 4; i ++){  
              retV += eval(s.charAt(i)) * Math.pow(2, 3 - i);  
          }  
          return retV;  
      }  
      return -1;  
  }   
  this.Hex2Utf8=function(s){  
     var retS = "";  
     var tempS = "";  
     var ss = "";  
     if(s.length == 16){  
         tempS = "1110" + s.substring(0, 4);  
         tempS += "10" +  s.substring(4, 10);   
         tempS += "10" + s.substring(10,16);   
         var sss = "0123456789ABCDEF";  
         for(var i = 0; i < 3; i ++){  
            retS += "%";  
            ss = tempS.substring(i * 8, (eval(i)+1)*8);  
            retS += sss.charAt(this.Dig2Dec(ss.substring(0,4)));  
            retS += sss.charAt(this.Dig2Dec(ss.substring(4,8)));  
         }  
         return retS;  
     }  
     return "";  
  }   
  this.Dec2Dig=function(n1){  
      var s = "";  
      var n2 = 0;  
      for(var i = 0; i < 4; i++){  
         n2 = Math.pow(2,3 - i);  
         if(n1 >= n2){  
            s += '1';  
            n1 = n1 - n2;  
          }  
         else  
          s += '0';  
      }  
      return s;        
  }  
  
  this.Str2Hex=function(s){  
      var c = "";  
      var n;  
      var ss = "0123456789ABCDEF";  
      var digS = "";  
      for(var i = 0; i < s.length; i ++){  
         c = s.charAt(i);  
         n = ss.indexOf(c);  
         digS += this.Dec2Dig(eval(n));  
      }  
      return digS;  
  }  
  this.Gb2312ToUtf8=function(s1){  
    var s = escape(s1);  
    var sa = s.split("%");  
    var retV ="";  
    if(sa[0] != ""){  
      retV = sa[0];  
    }  
    for(var i = 1; i < sa.length; i ++){  
      if(sa[i].substring(0,1) == "u"){  
        retV += this.Hex2Utf8(this.Str2Hex(sa[i].substring(1,5)));  
        if(sa[i].length){  
          retV += sa[i].substring(5);  
        }  
      }  
      else{  
        retV += unescape("%" + sa[i]);  
        if(sa[i].length){  
          retV += sa[i].substring(5);  
        }  
      }  
    }  
    return retV;  
  }  
  this.Utf8ToGb2312=function(str1){  
        var substr = "";  
        var a = "";  
        var b = "";  
        var c = "";  
        var i = -1;  
        i = str1.indexOf("%");  
        if(i==-1){  
          return str1;  
        }  
        while(i!= -1){  
          if(i<3){  
                substr = substr + str1.substr(0,i-1);  
                str1 = str1.substr(i+1,str1.length-i);  
                a = str1.substr(0,2);  
                str1 = str1.substr(2,str1.length - 2);  
                if(parseInt("0x" + a) & 0x80 == 0){  
                  substr = substr + String.fromCharCode(parseInt("0x" + a));  
                }  
                else if(parseInt("0x" + a) & 0xE0 == 0xC0){ //two byte  
                        b = str1.substr(1,2);  
                        str1 = str1.substr(3,str1.length - 3);  
                        var widechar = (parseInt("0x" + a) & 0x1F) << 6;  
                        widechar = widechar | (parseInt("0x" + b) & 0x3F);  
                        substr = substr + String.fromCharCode(widechar);  
                }  
                else{  
                        b = str1.substr(1,2);  
                        str1 = str1.substr(3,str1.length - 3);  
                        c = str1.substr(1,2);  
                        str1 = str1.substr(3,str1.length - 3);  
                        var widechar = (parseInt("0x" + a) & 0x0F) << 12;  
                        widechar = widechar | ((parseInt("0x" + b) & 0x3F) << 6);  
                        widechar = widechar | (parseInt("0x" + c) & 0x3F);  
                        substr = substr + String.fromCharCode(widechar);  
                }  
              }  
              else {  
               substr = substr + str1.substring(0,i);  
               str1= str1.substring(i);  
              }  
              i = str1.indexOf("%");  
        }  
  
        return substr+str1;  
  }  
}  
