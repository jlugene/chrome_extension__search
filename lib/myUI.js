
jQuery.fn.extend({

	valEx:function(value){
		if (this.is('input[type="checkbox"]')){
			return  arguments.length ? this.prop("checked", value) : this.prop('checked');
		}
		return arguments.length ? this.val(value) : this.val();	
	},

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	openDialog : function(okCallback, cancelCallback){
		if (!$('#dialog').length){
			$('body').append('<div id="dlgBackground"></div>');
			$('body').append('<div id="dialog"></div>');
			$('#dialog').append('<div id ="btn_img"></div>');
			$('#dialog').append(this);	
			$('#dialog').append('<div id ="btn"></div>');	
		}
		
		$('#btn_img').empty().append(
			'<img id="close_icon" src="res/close_leave.png" title="关闭"/>'+
			'<img id="help_icon" src="res/help_leave.png" title="帮助"/>');
		$('#btn').empty().append(
			'<button class="myUI_button" id="btn_cancel">取消</button>'+
			'<button class="myUI_button" id="btn_done">完成</button>');
			
		//右上方 关闭按钮
		$('#close_icon').click(function(){
			if (cancelCallback){
				cancelCallback();
			}
			$('#dlgBackground').hide();	
			$('#dialog').hide();	
		});
		//右上方 帮助按钮
		$('#help_icon').click(function(){
			window.open('help/help.html');
		});
		$('#help_icon, #close_icon').mouseenter(function(){
			var src = $(this).attr('src').replace("leave", "enter");
			$(this).attr('src', src);
		}).mouseleave(function(){
			var src = $(this).attr('src').replace("enter", "leave");
			$(this).attr('src', src);
		});		
		
		$('#btn_cancel').click(function(){
			if (cancelCallback){
				cancelCallback();
			}
			$('#dlgBackground').hide();	
			$('#dialog').hide();
		});
		$('#btn_done').click(function(){
			if (okCallback){
				if (!okCallback()){
					return;
				}
			}
			$('#dlgBackground').hide();	
			$('#dialog').hide();
		});
		//按钮 高亮
		$('button').mouseenter(function(){
			$(this).addClass("buttonMouseEnter");
		}).mouseleave(function(){
			$(this).removeClass("buttonMouseEnter");
		});
		var marginVertical = parseInt($('#dialog').css('margin-top')) + parseInt($('#dialog').css('margin-bottom'));
		$('#dialog').css("height", (window.innerHeight - marginVertical) + "px");
		var left = (window.innerWidth - parseInt($('#dialog').css('width')))/2;
		$('#dialog').css("left", left < 0 ? 0 : (left + "px"));
		$('#dlgBackground').show();
		$('#dialog').show();
		return this;
	},	

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	createMenu : function(){
		$('#menu').remove();
		$('body').append('<div id="menu"></div>');
		
		
		$(document).mousedown(function(event){
			var menuLeft = parseInt($('#menu').css('left'));
			var menuTop = parseInt($('#menu').css('top'));
			if (event.pageX < menuLeft || event.pageX > menuLeft + $('#menu').innerWidth()
				|| event.pageY < menuTop || event.pageY > menuTop + $('#menu').innerHeight()){
				$('#menu').slideUp(50);
			}
		});
		
		this.mousedown(function(event){
			if ($('#menu').css('display') == 'none'){
				$('#menu').css('left', $(this).offset().left); 
				$('#menu').css('top', $(this).offset().top + $(this).prop("offsetHeight"));
				$('#menu').slideDown(50); 
			}
			else{
				$('#menu').slideUp(50);
			}
			event.stopPropagation();
		});
		return this;
	},

	appendMenuItem: function(data){
		$('<div class="menuItem"></div>').append(data).appendTo('#menu').mouseenter(function(){
			$(this).addClass("menuItemSelect");
		}).mouseleave(function(){
			$(this).removeClass("menuItemSelect");
		});
		return this;
	},
	
	menuItemSelected : function(callback){
		$('.menuItem').click(function(){
			$('#menu').slideUp(50); 
			callback($(this).children());
		});
		return this;
	},
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	setValidate : function(data){
		if (this.is('textarea') || this.is('input[type="text"]') ||this.is('select')){
			if (data.tip){
				this.attr('myUI_tip', data.tip);
			}
			this.focus(function(){
				//进入输入框时，消去提示文字
				if ($(this).hasClass('myUI_tipOn')){
					$(this).removeClass('myUI_tipOn');
					$(this).valEx('');
				}
			}).blur(function(){
				if (!$(this).hasClass('myUI_tipOn') && !$(this).valEx()){
					$(this).addClass('myUI_tipOn');
					$(this).valEx($(this).attr('myUI_tip'));
				}
			})
		
			if (data.notEmpty){
				this.parent().prev().children().first().text('*');
				this.parent().next().html('<span class="myUI_errormsg">' + 
					data.notEmpty.replace(/&/g, '&amp').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') +
					'</span>');
				this.focus(function(){
					$(this).parent().next().children().hide();
				}).blur(function(event, extra){
					if ($(this).is(':visible') && !$(this).getValue()){
						$(this).parent().next().children().show();
						if (extra){
							extra.valid = false;
						}
					}
				});
			}
		}
		return this;
	},
	getValue:function(){
		if (this.hasClass('myUI_tipOn')){
			return "";
		}
		return this.valEx();
	},
	
	setValue: function(value) {
		if (!arguments.length){
			return this;
		}
		if (this.attr('myUI_tip') && !value){
			value = this.attr('myUI_tip');
			$(this).addClass('myUI_tipOn');
		}
		else{
			$(this).removeClass('myUI_tipOn');
		}
		return this.valEx(value);
	},	
});
