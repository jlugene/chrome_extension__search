
$(document).ready(function(){
	var o_setting = null;
	
	//只有从background.js处获得了setting，才可以初始化页面
	myLib.getSetting(function(data){
		o_setting = data;
		$('#div_item').empty().append('<h3 id="items_head_title">搜索列表</h3>');
		$('#div_item').append(
			'<div>'+
			'<button class="nav add"><img src="res/add_leave.png"><span class="btntext">添加</span></button>'+
			'<button class="nav remove"><img src="res/remove_leave.png"><span class="btntext">删除</span></button>'+
			'<button class="nav edit"><img src="res/edit_leave.png"><span class="btntext">编辑</span></button>'+
			'<button class="nav up"><img src="res/up_leave.png"><span class="btntext">上移</span></button>'+
			'<button class="nav addsub"><img src="res/addsub_leave.png"><span class="btntext">添加子项</span></button>'+
			'</div>');
		

		//图标 提升优先级
		$('.up').click(function(){
			var divitem = $('.item_txt_select').parent();
			var itemid = divitem.attr('id');
			if (divitem.prev() && (divitem.prev().hasClass('item') || divitem.prev().hasClass('subitem'))){
				var thisIndex = getIndexById(divitem.attr("id"));
				var prevIndex = getIndexById(divitem.prev().attr("id"));
				var tmp = o_setting.items[thisIndex];
				o_setting.items[thisIndex] = o_setting.items[prevIndex];
				o_setting.items[prevIndex] = tmp;
				refreshDivItem();//divitem.prev().before(divitem);
				$('.item, .subitem').filter('#'+itemid).children().first().trigger('click');
			}
		});
		//图标 删除项
		$('.remove').on('click', function(){
			if (!$('.item_txt_select').length){
				return;
			}
			var divitem =$('.item_txt_select').parent();				
			var nextid = divitem.next().attr('id');
			var index = getIndexById(divitem.attr("id"));
			o_setting.items.removeAt(index);	
			refreshDivItem();
			$('.item').filter('#'+nextid).children().first().trigger('click');
		});				
		//图标 编辑项
		$('.edit').click(function(){
			if (!$('.item_txt_select').length){
				return;
			}
			var index = getIndexById($('.item_txt_select').parent().attr("id"));
			var newItem = {};
			for (var prop in o_setting.items[index]){
				newItem[prop] = o_setting.items[index][prop];
			}
			if (!newItem.d_params){
				newItem.d_params ='';
			}
			createOrEdit(index, newItem, "编辑" + newItem.d_name);
		});
		//图标 添加新项
		$('.add').on('click', function(){
			var newitem = {
				d_id: (new Date()).getTime(),
				d_enabled: true,
				d_name: '',
				d_minimode: false,
				d_url: '',
				d_params: '',
				d_submitType: 'GET',
				d_urlencode: 'UTF-8'
			};
			createOrEdit(o_setting.items.length, newitem, "添加新搜索");
		});			
		//图标 点击可添加新子项
		$('.addsub').click(function(){
			var newitem = {
				d_id: (new Date()).getTime(),
				d_enabled: true,
				d_parentId: parseInt($('.item_txt_select').parent().attr('id')),
				d_name: '',
				d_submitType: 'GET',
				d_url: '',
				d_params: '',
				d_urlencode: 'UTF-8',
				d_filter: '',
				d_css: ''
			};
			createOrEdit(o_setting.items.length, newitem, "为" + $('.item_txt_select').text() + "添加子项");
		});	
		
		var createOrEdit = function(index, tmpItem, title){
			initDialogContent(tmpItem, title);
			var okCallback = function(){
				//根据输入框内容设thisItem的值，同时验证
				for (var prop in tmpItem){
					if ($('#' + prop).length){
						var obj = { valid:true };
						$('#' + prop).trigger('blur', obj);
						if (!obj.valid){
							return false;
						}
						tmpItem[prop] = $('#' + prop).getValue();
					}
				}
				
				o_setting.items[index] = tmpItem;			
				myLib.updateIcon(tmpItem, function(){
					if (tmpItem.d_parentId && tmpItem.d_favicon){
						var parent = getIndexById(tmpItem.d_parentId);
						o_setting.items[parent].d_favicon = tmpItem.d_favicon;
					}
					myLib.setSetting(o_setting);		
					refreshDivItem();			
					$('.item').filter('#'+tmpItem.d_id).children().first().trigger('click');
				});	
				return true;
			};
			$('#dialogContent').openDialog(okCallback);
		};

		$('#div_item').append('<div id="items"></div>');

			
		//刷新"设置页面"
		var refreshDivItem = function(){
			$('#items').empty();
			var appendItem = function(selector, item, itemtype){
				var iconTag = '<img src="' + (item.d_favicon ? item.d_favicon : 'res/empty.png') + '" '+
						'class="favicon" ' + 
						(item.d_url ? 'title="' + myLib.getHostnameOf(item.d_url) + '"' : '') + 
						'>';
				$(selector).append(
				'<div class="'+ itemtype +'" id="' + item.d_id + '">'+
						'<div class="item_text">'+
						'<input type="checkbox" title="启用/停用" class="chkbx_enable">'+
						iconTag +
						'<span>' + item.d_name + '</span>' +
						'</div>' +
				'</div>');
			};						

			for (var i = 0; i < o_setting.items.length; i++){
				if (!o_setting.items[i].d_parentId){			
					appendItem('#items', o_setting.items[i], "item");		
				}
			}
			for (var i = 0; i < o_setting.items.length; i++){
				var item =  o_setting.items[i];
				if (item.d_parentId){			
					appendItem('#'+item.d_parentId, item, "subitem");		
				}		
				$('#' + item.d_id).children().children().first().prop("checked", item.d_enabled);
			}
			
			//checkbox 是否启用该项
			$(".chkbx_enable").change(function() {
				var i = getIndexById($(this).parent().parent().attr("id"));
				o_setting.items[i].d_enabled = $(this).prop("checked");
			});

			//选中某个项
			$('.item_text').click(function(){
				$('.item_text').removeClass("item_txt_select");
				$(this).addClass("item_txt_select");
				//
				var divitem = $(this).parent();
				if (divitem.prev() && (divitem.prev().hasClass('item') || divitem.prev().hasClass('subitem'))){
					$('.up').show();
				}
				else{
					$('.up').hide();
				}
				//
				var index = getIndexById(divitem.attr("id"));
				if (o_setting.items[index].d_minimode){
					$('.addsub').show();
				}
				else
				{
					$('.addsub').hide();
				}
			});
		};	
		refreshDivItem();

		$('#div_btn').append('<div>'+
			'<button class="button" id="btn_save"><img src="res/save_leave.png">保存</button>'+
			'<button class="button" id="btn_default"><img src="res/default_leave.png">恢复默认</button>'+
		'</div>');
		
		var getIndexById = function(id){
			id = parseInt(id);
			for (var i = 0; i < o_setting.items.length; i++){
				if (o_setting.items[i].d_id == id){
					return i;
				}
			}
			return -1;
		};

		//按钮 高亮
		$('button').mouseenter(function(){
			$(this).addClass("buttonMouseEnter");
			var src = $(this).find('img').attr('src').replace("leave", "enter");
			$(this).find('img').attr('src', src);
		}).mouseleave(function(){
			$(this).removeClass("buttonMouseEnter");
			$(this).find('img').attr('src', $(this).find('img').attr('src').replace("enter", "leave"));
		});		
		//按钮 保存设置
		$('#btn_save').on('click', function(){
			myLib.setSetting(o_setting);
			window.close();
		});
		//按钮 恢复默认设置
		$('#btn_default').on('click', function(){
			myLib.setDefaultSetting(function(data){
				o_setting = data;
				refreshDivItem();
			});
		});	
		

		//////////////////////////////////  code about the dialog ///////////////////////////////////////////////
		
		var initDialogContent=function(item, title){
			//1
			$('#dialogContent').empty().append(
			'<div id="d_title"></div>'+
			'<table id="table1">'+
			
			'<tr id="tr_d_name">'+
				'<th><em class="star"></em>搜索名字</th>'+
				'<td><input type="text" id="d_name"  class="long"></input></td>'+
				'<td></td>'+
			'</tr>'+

			'<tr id="tr_d_minimode">'+
				'<th>组合搜索</th>'+
				'<td><input type="checkbox" id="d_minimode"></input></td>'+
				'<td></td>'+
			'</tr>'+
			
			'<tr id = "tr_d_submitType">'+				
				'<th><em class="star"></em>链接提交方式</th>'+
				'<td>'+
				'<select id="d_submitType" class="mid"><option value="GET">GET</option><option value="POST">POST</option></select>'+
				'</td>'+
				'<td></td>'+
			'</tr>'+
			
			'<tr id = "tr_d_url">'+
				'<th><em class="star"></em>链接URL</th>'+
				'<td><input type="text" id="d_url" class="long"></input></td> '+
				'<td></td>'+
			'</tr>'+
						
			'<tr id = "tr_d_params">'+
				'<th><em class="star"></em>参数</th>'+
				'<td><input type="text" id="d_params" class="long"></input></td> '+
				'<td></td>'+
			'</tr>'+
			
			'<tr id = "tr_d_urlencode">'+				
				'<th><em class="star"></em>URL编码</th>'+
				'<td>'+
				'<select id="d_urlencode" class="mid"><option value="UTF-8">UTF-8</option><option value="GB2312">GB2312</option></select>'+
				'</td>'+
				'<td></td>'+
			'</tr>'+
			
			'<tr id="tr_d_filter">'+
				'<th>筛选标签</th>'+
				'<td><textarea id="d_filter"></textarea></td>'+
				'<td></td>'+
			'</tr>'+

			'<tr id="tr_d_css">'+
				'<th>附加CSS</th>'+
				'<td><textarea id="d_css"></textarea></td>	'+
				'<td></td>'+
			'</tr>'+
			'</table>');
			//标题
			$('#d_title').text(title);
			
			//设置需要提示、验证等增强功能的输入框
			for (var selector in  o_setting.forms){
				$(selector).setValidate(o_setting.forms[selector]);
			}
	
			
			for (var prop in item){
				$('#' + prop).setValue(item[prop]);
			}

		
			//3
			$('#d_minimode').change(function(){
				if ($(this).prop("checked")){
					$('#tr_d_url').hide();
					$('#tr_d_submitType').hide();
					$('#tr_d_params').hide();
				}
				else{
					$('#tr_d_url').show();
					$('#tr_d_submitType').show();
					$('#tr_d_params').show();
				}
			});
			
			$('input, select,textarea').focus(function(){
				$(this).addClass('input_focus');
			}).blur(function(){
				$(this).removeClass('input_focus');
			});
			//只显示部分行
			$('tr').hide();
			for (var prop in item){
				$('#tr_' + prop).show();
			}	
			$('#d_minimode').trigger('change');

		};
		
	});
});