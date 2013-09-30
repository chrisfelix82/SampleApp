/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/kernel", // kernel.isAsync
	"dojo/_base/array", // array.forEach array.indexOf array.map
	"dojo/_base/declare", // declare
	"dojo/_base/html", // Deferred
	"dojo/_base/connect",
	"dojo/_base/event", // event.stop
	"dojo/_base/lang", // lang.mixin lang.hitch
	"dojo/_base/window",
	"dojo/_base/json",
	"dojo/_base/sniff",
	"dojo/_base/xhr",
	"dojo/_base/NodeList",
	"dojo/_base/fx",
	"dojo/fx",
	"dojo/fx/easing", 
	"dojo/dom", // attr.set
	"dojo/dom-attr", // attr.set
	"dojo/dom-class", // domClass.add domClass.contains
	"dojo/dom-style", // domStyle.set
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/i18n", // i18n.getLocalization
	"dojo/keys",
	"dojo/topic", // topic.publish()
	"dojo/on",
	"dojo/ready",
	"dojo/cache",
	"dojo/text",
	"dojo/query",
	"dojo/touch",
	"dojo/cookie", 
	"dojo/json",
	"dojo/data/util/filter", 
	"dojo/date/locale",
	"dojo/data/ItemFileWriteStore",
	"dojo/store/Memory",
	"dojo/store/DataStore",
	
	"dijit/registry",
	"dijit/_base/wai",
	"dijit/_base/manager",	// manager.defaultDuration
	"dijit/_base/focus", // dijit.getFocus()
	"dijit/a11y",
	"dijit/focus",
	"dijit/_WidgetBase",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/_CssStateMixin",
	"dijit/form/Button",
	"dijit/MenuItem",
	"dijit/CheckedMenuItem",
	"dijit/PopupMenuItem",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/layout/_LayoutWidget",
	"dijit/layout/ContentPane",
	"dijit/layout/BorderContainer",
	"dijit/Dialog", 
	"dijit/layout/TabContainer", 
	"dijit/TitlePane", 
	
	"dojox/fx",
	"dojox/fx/flip",
	"dojox/html/_base",
	
	"idx/widget/Menu",
	"idx/widget/MenuHeading",
	"idx/widget/ModalDialog",
	
	"dojo/text!./templates/NavigationPane.html",
	"dojo/text!./templates/GridContainer.html",
	"dojo/text!./templates/FlipCardContainer.html"
	// "dojo/i18n!./nls/FlipCardContainer"
	
], function(kernel, array, declare, htmlUtil, connect, event, lang, winUtil, baseJson, has, xhrUtil, NodeList, baseFx, coreFx, easingUtil,
		dom, domAttr, domClass, domStyle, domConstruct, domGeom, i18n, keys, topic, on, ready, cache, text, query, touch, cookie, json,
		filterUtil, locale, ItemFileWriteStore, Memory, DataStore,
		registry, wai, manager, baseFocus, a11y, focus, _WidgetBase, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, 
		Button, MenuItem, CheckedMenuItem, PopupMenuItem, 
		_Contained, _Container, _LayoutWidget, ContentPane, BorderContainer, Dialog, TabContainer, TitlePane, 
		dojoxFx, flip, dojoxHtmlUtil,
		Menu, MenuHeading, ModalDialog,
		navTemplate, gridTemplate, template
	){
	
	// module:
	//		idx/layout/FlipCardContainer
	
	kernel.experimental("idx/layout/FlipCardContainer");
	
	var supports = (function() {
		var div = document.createElement('div');
		return function(prop) {
		 	vendors = 'Khtml O Moz Webkit'.split(' '), len = vendors.length;
			if ( prop in div.style)
				return true;
			if ('-ms-' + prop in div.style)
				return true;
			prop = prop.replace(/^[a-z]/, function(val) {
				return val.toUpperCase();
			});
			while (len--) {
				if (vendors[len] + prop in div.style) {
					return true;
				}
			}
			return false;
		};
	})();
	var _supportCSS3Animation = supports('transform') && supports('transition') && supports('perspective') && supports('animation');
	
	has.add("mobile_platform", has("ios") || has("android") || has("bb"));
	has.add("phone_platform", navigator.userAgent.match(/(iPhone|iPod|WindowsPhone|Android)/));
	
	var _AutoScroll = declare("idx/layout/_AutoScroll", [], {
		interval: 3,
		recursiveTimer: 10,
		marginMouse: 50,
	
		constructor: function(){
			this.resizeHandler = connect.connect(winUtil.global,"onresize", this, function(){
				this.getViewport();
			});
			ready(lang.hitch(this, "init"));
		},
	
		init: function(){
			this._html = (has("webkit"))? winUtil.body() : winUtil.body().parentNode;
			this.getViewport();
		},
	
		getViewport:function(){
			var d = winUtil.doc, dd = d.documentElement, w = window, b = winUtil.body();
			if(has("mozilla")){
				this._v = { 'w': dd.clientWidth, 'h': w.innerHeight };	// Object
			}
			else if(!has("opera") && w.innerWidth){
				this._v = { 'w': w.innerWidth, 'h': w.innerHeight };		// Object
			}
			else if(!has("opera") && dd && dd.clientWidth){
				this._v = { 'w': dd.clientWidth, 'h': dd.clientHeight };	// Object
			}
			else if(b.clientWidth){
				this._v = { 'w': b.clientWidth, 'h': b.clientHeight };	// Object
			}
		},
	
		setAutoScrollNode: function(/*Node*/node){
			this._node = node;
		},
	
		setAutoScrollMaxPage: function(){
			this._yMax = this._html.scrollHeight;
			this._xMax = this._html.scrollWidth;
		},
	
		checkAutoScroll: function(/*Event*/e){
			if(this._autoScrollActive){
				this.stopAutoScroll();
			}
			this._y = e.pageY;
			this._x = e.pageX;
			if(e.clientX < this.marginMouse){
				this._autoScrollActive = true;
				this._autoScrollLeft(e);
			}
			else if(e.clientX > this._v.w - this.marginMouse){
				this._autoScrollActive = true;
				this._autoScrollRight(e);
			}
			if(e.clientY < this.marginMouse){
				this._autoScrollActive = true;
				this._autoScrollUp(e);
				
			}
			else if(e.clientY > this._v.h - this.marginMouse){
				this._autoScrollActive = true;
				this._autoScrollDown();
			}
		},
	
		_autoScrollDown: function(){
			if(this._timer){
				clearTimeout(this._timer);
			}
			if(this._autoScrollActive && this._y + this.marginMouse < this._yMax){
				this._html.scrollTop += this.interval;
				this._node.style.top = (parseInt(this._node.style.top) + this.interval) + "px";
				this._y += this.interval;
				this._timer = setTimeout(lang.hitch(this, "_autoScrollDown"), this.recursiveTimer);
			}
		},
	
		_autoScrollUp: function(){
			if(this._timer){
				clearTimeout(this._timer);
			}
			if(this._autoScrollActive && this._y - this.marginMouse > 0){
				this._html.scrollTop -= this.interval;
				this._node.style.top = (parseInt(this._node.style.top) - this.interval) + "px";
				this._y -= this.interval;
				this._timer = setTimeout(lang.hitch(this, "_autoScrollUp"),this.recursiveTimer);
			}
		},
	
		_autoScrollRight: function(){
			if(this._timer){
				clearTimeout(this._timer);
			}
			if(this._autoScrollActive && this._x + this.marginMouse < this._xMax){
				this._html.scrollLeft += this.interval;
				this._node.style.left = (parseInt(this._node.style.left) + this.interval) + "px";
				this._x += this.interval;
				this._timer = setTimeout(lang.hitch(this, "_autoScrollRight"), this.recursiveTimer);
			}
		},
	
		_autoScrollLeft: function(/*Event*/e){
			if(this._timer){
				clearTimeout(this._timer);
			}
			if(this._autoScrollActive && this._x - this.marginMouse > 0){
				this._html.scrollLeft -= this.interval;
				this._node.style.left = (parseInt(this._node.style.left) - this.interval) + "px";
				this._x -= this.interval;
				this._timer = setTimeout(lang.hitch(this, "_autoScrollLeft"),this.recursiveTimer);
			}
		},
	
		stopAutoScroll: function(){
			if(this._timer){
				clearTimeout(this._timer);
			}
			this._autoScrollActive = false;
		},
	
		destroy: function(){
			connect.disconnect(this.resizeHandler);
		}
	});
	
	_AutoScroll.autoScroll = null;
	_AutoScroll.autoScroll = new _AutoScroll();
	
	
	
	var _Moveable = declare("idx/layout/_Moveable", [], {
		handle: null,
		skip: true,
		dragDistance: has("mobile_platform") ? 0 : 3,
		
		constructor: function(/*Object*/params, /*DOMNode*/node){
			this.node = dom.byId(node);
			
			this.d = this.node.ownerDocument;
			
			if(!params){ params = {}; }
			this.handle = params.handle ? dom.byId(params.handle) : null;
			if(!this.handle){ this.handle = this.node; }
			this.skip = params.skip;
			this.events = [
				connect.connect(this.handle, touch.press, this, "onMouseDown")
			];
			if(_AutoScroll.autoScroll){
				this.autoScroll = _AutoScroll.autoScroll;
			}
			
		},
		
		isFormElement: function(/*DOMEvent*/ e){
			var t = e.target;
			if(t.nodeType == 3 /*TEXT_NODE*/){
				t = t.parentNode;
			}
			return " a button textarea input select option ".indexOf(" " + t.tagName.toLowerCase() + " ") >= 0;	// Boolean
		},
		
		onMouseDown: function(/*DOMEvent*/e){
			if(this._isDragging){ return;}
			if(has("mobile_platform")){
				//TODO
			}else{
				var isLeftButton = (e.which || e.button) == 1;
				if(!isLeftButton){
					return;
				}
			}
			
			if(this.skip && this.isFormElement(e)){ return; }
			if(this.autoScroll){
				this.autoScroll.setAutoScrollNode(this.node);
				this.autoScroll.setAutoScrollMaxPage();
			}
			this.events.push(connect.connect(this.d, touch.release, this, "onMouseUp"));
			this.events.push(connect.connect(this.d, touch.move, this, "onFirstMove"));
			this._selectStart = connect.connect(winUtil.body(), "onselectstart", event.stop);
			this._firstX = e.touches ? e.touches[0].clientX : e.clientX;
			this._firstY = e.touches ? e.touches[0].clientY : e.clientY;
			event.stop(e);
		},
		
		onFirstMove: function(/*DOMEvent*/e){
			event.stop(e);
			var clientX = e.touches ? e.touches[0].clientX : e.clientX;
			var clientY = e.touches ? e.touches[0].clientY : e.clientY;
			var d = (this._firstX - clientX) * (this._firstX - clientX)
					+ (this._firstY - clientY) * (this._firstY - clientY);
			if(d > this.dragDistance * this.dragDistance){
				this._isDragging = true;
				connect.disconnect(this.events.pop());
				domStyle.set(this.node, "width", domGeom.getContentBox(this.node).w + "px");
				this.initOffsetDrag(e);
				this.events.push(connect.connect(this.d, touch.move, this, "onMove"));
			}
		},
		
		initOffsetDrag: function(/*DOMEvent*/e){
			this.offsetDrag = { 
				'l': (e.touches ? e.touches[0].pageX : e.pageX), 
				't': (e.touches ? e.touches[0].pageY : e.pageY) 
			};
			var s = this.node.style;
			var position = domGeom.position(this.node, true);
			this.offsetDrag.l = position.x - this.offsetDrag.l;
			this.offsetDrag.t = position.y - this.offsetDrag.t;
			var coords = {
				'x': position.x,
				'y': position.y
			};
			this.size = {
				'w': position.w,
				'h': position.h
			};
			// method to catch
			this.onDragStart(this.node, coords, this.size);
		},
		
		onMove: function(/*DOMEvent*/e){
			event.stop(e);
			// hack to avoid too many calls to onMove in IE8 causing sometimes slowness
			if(has("ie") == 8 && new Date() - this.date < 20){
				return;
			}
			if(this.autoScroll){
				this.autoScroll.checkAutoScroll(e);
			}
			var coords = {
				'x': this.offsetDrag.l + (e.touches ? e.touches[0].pageX : e.pageX),
				'y': this.offsetDrag.t + (e.touches ? e.touches[0].pageY : e.pageY)
			};
			var s = this.node.style;
			s.left = coords.x + "px";
			s.top = coords.y + "px";
			
			// method to catch
			this.onDrag(this.node, coords, this.size, {'x':e.pageX, 'y':e.pageY});
			if(has("ie") == 8){
				this.date = new Date();
			}
		},
		
		onMouseUp: function(/*DOMEvent*/e){
			if (this._isDragging){
				event.stop(e);
				this._isDragging = false;
				if(this.autoScroll){
					this.autoScroll.stopAutoScroll();
				}
				delete this.onMove;
				this.onDragEnd(this.node);
				this.node.focus();
			}
			connect.disconnect(this.events.pop());
			connect.disconnect(this.events.pop());
		},
		
		onDragStart: function(/*DOMNode*/node, /*Object*/coords, /*Object*/size){
			// tags:
			//		callback
		},
		
		onDragEnd: function(/*DOMNode*/node){
			// tags:
			//		callback
		},
		
		onDrag: function(/*DOMNode*/node, /*Object*/coords, /*Object*/size, /*Object*/mousePosition){
			// tags:
			//		callback
		},
	
		destroy: function(){
			array.forEach(this.events, connect.disconnect);
			this.events = this.node = null;
		}
	});
	
	
	var _AreaManager = declare("idx/layout/_AreaManager", [], {
		autoRefresh: true,
		areaClass: "dojoxDndArea",
		dragHandleClass: "dojoxDragHandle",
	
		constructor: function(){
			this._areaList = [];
			this.resizeHandler = connect.connect(winUtil.global,"onresize", this, function(){
				this._dropMode.updateAreas(this._areaList);
			});
			
			this._oldIndexArea = this._currentIndexArea = this._oldDropIndex = this._currentDropIndex = this._sourceIndexArea = this._sourceDropIndex = -1;
		},
	
		init: function(){
			this.registerByClass();
		},
	
		registerByNode: function(/*DOMNode*/area, /*Boolean*/notInitAreas){
			var index = this._getIndexArea(area);
			if(area && index == -1){
				var acceptType = area.getAttribute("accept");
				var accept = (acceptType) ? acceptType.split(/\s*,\s*/) : ["text"];
				var obj = {
					'node': area,
					'items': [],
					'coords': {},
					'margin': null,
					'accept': accept,
					'initItems': false
				};
				array.forEach(this._getChildren(area), function(item){
					this._setMarginArea(obj, item);
					obj.items.push(this._addMoveableItem(item));
				}, this);
				this._areaList = this._dropMode.addArea(this._areaList, obj);
				if(!notInitAreas){
					this._dropMode.updateAreas(this._areaList);
				}
				connect.publish("/dojox/mdnd/manager/register",[area]);
			}
		},
	
		registerByClass: function(){
			query('.'+this.areaClass).forEach(function(area){
				this.registerByNode(area, true);
			}, this);
			this._dropMode.updateAreas(this._areaList);
		},
	
		unregister: function(/*DOMNode*/area){
			var index = this._getIndexArea(area);
			if(index != -1){
				array.forEach(this._areaList[index].items, function(item){
					this._deleteMoveableItem(item);
				}, this);
				this._areaList.splice(index,1);
				// refresh target area
				this._dropMode.updateAreas(this._areaList);
				return true; // Boolean
			}
			return false; // Boolean
		},
	
		_addMoveableItem: function(/*DOMNode*/node){
			node.setAttribute("tabIndex", "0");
			var handle = this._searchDragHandle(node);
			var moveable = new _Moveable({ 'handle': handle, 'skip': true }, node);
			// add a css style :
			domClass.add(handle || node, "dragHandle");
			var type = node.getAttribute("dndType");
			var item = {
				'item': moveable,
				'type': type ? type.split(/\s*,\s*/) : ["text"],
				'handlers': [connect.connect(moveable, "onDragStart", this, "onDragStart")]
			}
			// connect to the uninitialize method of dijit._Widget to delete a moveable before a destruct
			if(registry && registry.byNode){
				var widget = registry.byNode(node);
				if(widget){
					item.type = widget.dndType ? widget.dndType.split(/\s*,\s*/) : ["text"];
					item.handlers.push(
						connect.connect(widget, "uninitialize", this, function(){
							this.removeDragItem(node.parentNode, moveable.node);
						})
					);
				}
			}
			return item; // Object
		},
	
		_deleteMoveableItem: function(/*Object*/ objItem){
			array.forEach(objItem.handlers, function(handler){
				connect.disconnect(handler);
			});
			var node = objItem.item.node,
				handle = this._searchDragHandle(node);
			domClass.remove(handle || node, "dragHandle");
			objItem.item.destroy();
		},
	
		_getIndexArea: function(/*DOMNode*/area){
			if(area){
				for(var i = 0; i < this._areaList.length; i++){
					if(this._areaList[i].node === area){
						return i;	// Integer
					}
				}
			}
			return -1;	// Integer
		},
	
		_searchDragHandle: function(/*DOMNode*/node){
			if(node){
				var cssArray = this.dragHandleClass.split(' '),
					length = cssArray.length,
					queryCss = "";
				array.forEach(cssArray, function(css, i){
					queryCss += "." + css;
					if(i != length - 1){
						queryCss += ", ";
					}
				});
				return query(queryCss, node)[0]; // DomNode
			}
		},
	
		addDragItem: function(/*DOMNode*/area, /*DOMNode*/node, /*Integer*/index, /*Boolean*/notCheckParent){
			var add = true;
			if(!notCheckParent){
				add = area && node && (node.parentNode === null || (node.parentNode && node.parentNode.nodeType !== 1));
			}
			if(add){
				var indexArea = this._getIndexArea(area);
				if(indexArea !== -1){
					var item = this._addMoveableItem(node),
						items = this._areaList[indexArea].items;
					if(0 <= index && index < items.length){
						var firstListChild = items.slice(0, index),
							lastListChild = items.slice(index, items.length);
						firstListChild[firstListChild.length] = item;
						this._areaList[indexArea].items = firstListChild.concat(lastListChild);
						area.insertBefore(node, items[index].item.node);
					}
					else{
						this._areaList[indexArea].items.push(item);
						area.appendChild(node);
					}
					this._setMarginArea(this._areaList[indexArea], node);
					this._areaList[indexArea].initItems = false;
					return true;	// Boolean
				}
			}
			return false;	// Boolean
		},
	
		removeDragItem: function(/*DOMNode*/area, /*DOMNode*/node){
			var index = this._getIndexArea(area);
			if(area && index !== -1){
				var items = this._areaList[index].items;
				for(var j = 0; j < items.length; j++){
					if(items[j].item.node === node){
						this._deleteMoveableItem(items[j]);
						// delete item of the array
						items.splice(j, 1);
						return area.removeChild(node); // Object
					}
				}
			}
			return null;
		},
	
		_getChildren: function(/*DOMNode*/area){
			var children = [];
			array.forEach(area.childNodes, function(child){
				// delete \n
				if(child.nodeType == 1){
					if(registry && registry.byNode){
						var widget = registry.byNode(child);
						if(widget){
							if(!widget.dragRestriction){
								children.push(child);
							}
						}
						else{
							children.push(child);
						}
					}
					else{
						children.push(child);
					}
				}
			});
			return children;	//Array
		},
	
		_setMarginArea: function(/*Object*/area,/*DOMNode*/node){
			if(area && area.margin === null && node){
				area.margin = domGeom.getMarginExtents(node);
			}
		},
	
		findCurrentIndexArea: function(/*Object*/coords, /*Object*/size){
			this._oldIndexArea = this._currentIndexArea;
			this._currentIndexArea = this._dropMode.getTargetArea(this._areaList, coords, this._currentIndexArea);
			if(this._currentIndexArea != this._oldIndexArea){
				if(this._oldIndexArea != -1){
					this.onDragExit(coords, size);
				}
				if(this._currentIndexArea != -1){
					this.onDragEnter(coords, size);
				}
			}
			return this._currentIndexArea;	//Integer
		},
	
		_isAccepted: function(/*Array*/ type, /*Array*/ accept){
			this._accept = false;
			for(var i = 0; i < accept.length; ++i){
				for(var j = 0; j < type.length;++j){
					if(type[j] == accept[i]){
						this._accept = true;
						break;
					}
				}
			}
		},
	
		onDragStart: function(/*DOMNode*/node, /*Object*/coords, /*Object*/size){
			if(this.autoRefresh){
				this._dropMode.updateAreas(this._areaList);
			}
	
			// Create the cover :
			var _html = (has("webkit")) ? winUtil.body() : winUtil.body().parentNode;
			if(!this._cover){
				this._cover = domConstruct.create('div', {
					'class': "dndCover"
				});
				this._cover2 = lang.clone(this._cover);
				domClass.add(this._cover2, "dndCover2");
			}
			var h = _html.scrollHeight+"px";
			this._cover.style.height = this._cover2.style.height = h;
			winUtil.body().appendChild(this._cover);
			winUtil.body().appendChild(this._cover2);
			
			this._dragStartHandler = connect.connect(node.ownerDocument, "ondragstart", event, "stop");
			// to know the source
			this._sourceIndexArea = this._lastValidIndexArea = this._currentIndexArea = this._getIndexArea(node.parentNode);
			// delete the dragItem into the source area
			var sourceArea = this._areaList[this._sourceIndexArea];
			var children = sourceArea.items;
			for(var i = 0; i < children.length; i++){
				if(children[i].item.node == node){
					this._dragItem = children[i];
					this._dragItem.handlers.push(connect.connect(this._dragItem.item, "onDrag", this, "onDrag"));
					this._dragItem.handlers.push(connect.connect(this._dragItem.item, "onDragEnd", this, "onDrop"));
					children.splice(i,1);
					this._currentDropIndex = this._sourceDropIndex = i;
					break;
				}
			}
			var nodeRef = null;
			if(this._sourceDropIndex !== sourceArea.items.length){
				nodeRef = sourceArea.items[this._sourceDropIndex].item.node;
			}
			// IE7 OPTIMIZATION
			if(has("ie")> 7){
				// connect these events on the cover
				this._eventsIE7 = [
					connect.connect(this._cover, touch.over, event, "stop"),
					connect.connect(this._cover, touch.out, event, "stop"),
					connect.connect(this._cover, touch.enter, event, "stop"),
					connect.connect(this._cover, touch.leave, event, "stop")
				];
			}
	
			var s = node.style;
			s.left = coords.x+"px";
			s.top = coords.y+"px";
			// attach the node to the cover
			if(s.position == "relative" || s.position == ""){
				s.position = "absolute"; // enforcing the absolute mode
			}
			this._cover.appendChild(node);
	
			this._dropIndicator.place(sourceArea.node, nodeRef, size);
			// add a style to place the _dragNode in foreground
			domClass.add(node, "dragNode");
			// A dragged node is always draggable in this source area.
			this._accept = true;
			connect.publish("/dojox/mdnd/drag/start",[node, sourceArea, this._sourceDropIndex]);
		},
	
		onDragEnter: function(/*Object*/coords, /*Object*/size){
			if(this._currentIndexArea === this._sourceIndexArea){
				this._accept = true;
			}
			else{
				this._isAccepted(this._dragItem.type, this._areaList[this._currentIndexArea].accept);
			}
		},
	
		onDragExit: function(/*Object*/coords, /*Object*/size){
			this._accept = false;
		},
	
		onDrag: function(/*DOMNode*/node, /*Object*/coords, /*Object*/size, /*Object*/mousePosition){
			var coordinates = this._dropMode.getDragPoint(coords, size, mousePosition);
			this.findCurrentIndexArea(coordinates, size);
			if(this._currentIndexArea !== -1 && this._accept){
				this.placeDropIndicator(coordinates, size);
			}
		},
	
		placeDropIndicator: function(/*Object*/coords, /*Object*/size){
			this._oldDropIndex = this._currentDropIndex;
			// calculate all children marker (see VerticalDropMode.initItems())
			var area = this._areaList[this._currentIndexArea];
			if(!area.initItems){
				this._dropMode.initItems(area);
			}
			//get the index where the drop has to be placed.
			this._currentDropIndex = this._dropMode.getDropIndex(area, coords);
			if(!(this._currentIndexArea === this._oldIndexArea && this._oldDropIndex === this._currentDropIndex)){
				this._placeDropIndicator(size);
			}
			return this._currentDropIndex;	//Integer
		},
	
		_placeDropIndicator: function(/*Object*/size){
			var oldArea = this._areaList[this._lastValidIndexArea];
			var currentArea = this._areaList[this._currentIndexArea];
			//refresh the previous area after moving out the drop indicator
			this._dropMode.refreshItems(oldArea, this._oldDropIndex, size, false);
			// place dropIndicator
			var node = null;
			if(this._currentDropIndex != -1){
				node = currentArea.items[this._currentDropIndex].item.node;
			}
			this._dropIndicator.place(currentArea.node, node);
			this._lastValidIndexArea = this._currentIndexArea;
			//refresh the current area after placing the drop indicator
			this._dropMode.refreshItems(currentArea, this._currentDropIndex, size, true);
		},
	
		onDropCancel: function(){
			if(!this._accept){
				var index = this._getIndexArea(this._dropIndicator.node.parentNode);
				if(index != -1){
					this._currentIndexArea = index;
				}
				else{
					// case if the dropIndicator is in the area which has been unregistered during the drag.
					// chose by default the first area.
					this._currentIndexArea = 0;
				}
			}
		},
	
		onDrop: function(/*DOMNode*/node){
			this.onDropCancel();
			var targetArea = this._areaList[this._currentIndexArea];
			domClass.remove(node, "dragNode");
			var style = node.style;
			style.position = "relative";
			style.left = "0";
			style.top = "0";
			style.width = "auto";
			if(targetArea.node == this._dropIndicator.node.parentNode){
				targetArea.node.insertBefore(node, this._dropIndicator.node);
			}
			else{
				// case if the dropIndicator is in the area which has been unregistered during the drag.
				targetArea.node.appendChild(node);
				this._currentDropIndex = targetArea.items.length;
			}
			// add child into the new target area.
			var indexChild = this._currentDropIndex;
			if(indexChild == -1){
				indexChild = targetArea.items.length;
			}
			var children = targetArea.items;
			var firstListArea = children.slice(0, indexChild);
			var lastListArea = children.slice(indexChild, children.length);
			firstListArea[firstListArea.length] = this._dragItem;
			targetArea.items = firstListArea.concat(lastListArea);
	
			this._setMarginArea(targetArea, node);
			array.forEach(this._areaList, function(obj){
				obj.initItems = false;
			});
			// disconnect onDrop handler
			connect.disconnect(this._dragItem.handlers.pop());
			connect.disconnect(this._dragItem.handlers.pop());
			this._resetAfterDrop();
			// remove the cover
			if(this._cover){
				winUtil.body().removeChild(this._cover);
				winUtil.body().removeChild(this._cover2);
			}
			connect.publish("/dojox/mdnd/drop",[node, targetArea, indexChild]);
		},
	
		_resetAfterDrop: function(){
			this._accept = false;
			this._dragItem = null;
			this._currentDropIndex = -1;
			this._currentIndexArea = -1;
			this._oldDropIndex = -1;
			this._sourceIndexArea = -1;
			this._sourceDropIndex = -1;
			this._dropIndicator.remove();
			if(this._dragStartHandler){
				connect.disconnect(this._dragStartHandler);
			}
			if(has("ie") > 7){
				array.forEach(this._eventsIE7, connect.disconnect);
			}
		},
	
		destroy: function(){
			while(this._areaList.length > 0){
				if(!this.unregister(this._areaList[0].node)){
					throw new Error("Error while destroying AreaManager");
				}
			}
			connect.disconnect(this.resizeHandler);
			this._dropIndicator.destroy();
			this._dropMode.destroy();
			if(_AutoScroll.autoScroll.autoScroll){
				_AutoScroll.autoScroll.destroy();
			}
			if(this.refreshListener){
				connect.unsubscribe(this.refreshListener);
			}
			// destroy the cover
			if(this._cover){
				domConstruct.destroy(this._cover);
				domConstruct.destroy(this._cover2);
				delete this._cover;
				delete this._cover2;
			}
		}
	});
	if(_Widget){
		lang.extend(_Widget, {
			dndType : "text"
		});
	}

	_AreaManager._areaManager = null;
	_AreaManager.areaManager = function(){
		if(!_AreaManager._areaManager){
			_AreaManager._areaManager = new _AreaManager();
		}
		return _AreaManager._areaManager;
	};
	
	
	var _DropIndicator = declare("idx/layout/_DropIndicator", [], {
		node : null,
		constructor: function(){
			var dropIndicator = document.createElement("div");
			var subDropIndicator = document.createElement("div");
			dropIndicator.appendChild(subDropIndicator);
			domClass.add(dropIndicator, "dropIndicator");
			this.node = dropIndicator;
		},
		
		place: function(/*Node*/area, /*Node*/nodeRef, /*Object*/size){
			if(size){
				this.node.style.height = size.h + "px";
			}
			try{
				if(nodeRef){
					area.insertBefore(this.node, nodeRef);
				}
				else{
					// empty target area or last node => appendChild
					area.appendChild(this.node);
				}
				return this.node;	// DOMNode
			}catch(e){
				return null;
			}
		},
		
		remove: function(){
			if(this.node){
				//FIX : IE6 problem
				this.node.style.height = "";
				if(this.node.parentNode){
					this.node.parentNode.removeChild(this.node);
				}
			}
		},
		 
		destroy: function(){
			if(this.node){
				if(this.node.parentNode){
					this.node.parentNode.removeChild(this.node);
				}
				domConstruct.destroy(this.node);
				delete this.node;
			}
		}
	});

	_AreaManager.areaManager()._dropIndicator = new _DropIndicator();
	
	
	
	var _OverDropMode = declare("idx/layout/_OverDropMode", [], {
		_oldXPoint: null,
		_oldYPoint: null,
		_oldBehaviour: "up",
	
		constructor: function(){
			this._dragHandler = [
				connect.connect(_AreaManager.areaManager(), "onDragEnter", function(coords, size){
					var m = _AreaManager.areaManager();
					if(m._oldIndexArea == -1){
						m._oldIndexArea = m._lastValidIndexArea;
					}
				})
			];
	
		},
	
		addArea: function(/*Array*/areas, /*Object*/object){
			var length = areas.length,
				position = domGeom.position(object.node, true);
			object.coords = {'x':position.x, 'y':position.y};
			if(length == 0){
				areas.push(object);
			}
			else{
				var x = object.coords.x;
				for(var i = 0; i < length; i++){
					if(x < areas[i].coords.x){
						for(var j = length-1; j >= i; j--)
							areas[j + 1] = areas[j];
						areas[i] = object;
						break;
					}
				}
				if(i == length){
					areas.push(object);
				}
			}
			return areas;	// Array
		},
	
		updateAreas: function(/*Array*/areaList){
			var length = areaList.length;
			for(var i = 0; i < length; i++){
				this._updateArea(areaList[i]);
			}
		},
	
		_updateArea : function(/*Object*/area){
			var position = domGeom.position(area.node, true);
			area.coords.x = position.x;
			area.coords.x2 = position.x + position.w;
			area.coords.y = position.y;
		},
	
		initItems: function(/*Object*/area){
			array.forEach(area.items, function(obj){
				//get the vertical middle of the item
				var node = obj.item.node;
				var position = domGeom.position(node, true);
				var y = position.y + position.h/2;
				obj.y = y;
			});
			area.initItems = true;
		},
	
		refreshItems: function(/*Object*/area, /*Integer*/indexItem, /*Object*/size, /*Boolean*/added){
			if(indexItem == -1){
				return;
			}
			else if(area && size && size.h){
				var height = size.h;
				if(area.margin){
					height += area.margin.t;
				}
				var length = area.items.length;
				for(var i = indexItem; i < length; i++){
					var item = area.items[i];
					if(added){
						item.y += height;
					}
					else{
						item.y -= height;
					}
				}
			}
		},
	
		getDragPoint: function(/*Object*/coords, /*Object*/size, /*Object*/mousePosition){
			return {			// Object
				'x': mousePosition.x,
				'y': mousePosition.y
				}
		},
	
	
		getTargetArea: function(/*Array*/areaList, /*Object*/ coords, /*integer*/currentIndexArea ){
			var index = 0;
			var x = coords.x;
			var y = coords.y;
			var end = areaList.length;
			var start = 0, direction = "right", compute = false;
			if(currentIndexArea == -1 || arguments.length < 3){
				compute = true;
			}
			else{
				if(this._checkInterval(areaList, currentIndexArea, x, y)){
					index = currentIndexArea;
				}
				else{
					if(this._oldXPoint < x){
						start = currentIndexArea + 1;
					}
					else{
						start = currentIndexArea - 1;
						end = 0;
						direction = "left";
					}
					compute = true;
				}
			}
			if(compute){
				if(direction === "right"){
					for(var i = start; i < end; i++){
						if(this._checkInterval(areaList, i, x, y)){
							index = i;
							break;
						}
					}
					if(i == end){
						index = -1;
					}
				}
				else{
					for(var i = start; i >= end; i--){
						if(this._checkInterval(areaList, i, x, y)){
							index = i;
							break;
						}
					}
					if(i == end-1){
						index = -1;
					}
				}
			}
			this._oldXPoint = x;
			return index; // Integer
		},
	
		_checkInterval: function(/*Array*/areaList, /*Integer*/index, /*Coord*/x, /*Coord*/y){
			var area = areaList[index];
			var node = area.node;
			var coords = area.coords;
			var startX = coords.x;
			var endX = coords.x2;
			var startY = coords.y;
			var endY = startY + node.offsetHeight;
			if(startX <= x && x <= endX && startY <= y && y <= endY){
				return true;
			}
			return false; // Boolean
		},
	
		getDropIndex: function(/*Object*/ targetArea, /*Object*/ coords){
			var length = targetArea.items.length;
			var coordinates = targetArea.coords;
			var y = coords.y;
			if(length > 0){
				for(var i = 0; i < length; i++){
					if(y < targetArea.items[i].y){
						return i;	// integer
					}
					else{
						if(i == length-1){
							return -1; // integer
						}
					}
				}
			}
			return -1;	//integer
		},
	
		destroy: function(){
			array.forEach(this._dragHandler, connect.disconnect);
		}
	});
	
	_AreaManager.areaManager()._dropMode = new _OverDropMode();
	
	
	
	var _ExpandoPane = declare("idx/layout/_ExpandoPane", [ContentPane, _TemplatedMixin, _Contained, _Container], {
		attributeMap: lang.delegate(ContentPane.prototype.attributeMap, {
			title: { node: "titleNode", type: "innerHTML" }
		}),
		templateString: navTemplate,
		easeOut: "baseFx._DefaultEasing",
		easeIn: "baseFx._DefaultEasing",
		duration: 420,
		startExpanded: true,
		previewOpacity: 0.75,
		previewOnDblClick: false,
		tabIndex: "0",
		_setTabIndexAttr: "iconNode",
		baseClass: "dijitExpandoPane",
		
		postCreate: function(){
			this.inherited(arguments);
			this._animConnects = [];
			this._isHorizontal = true;
			
			if(lang.isString(this.easeOut)){
				this.easeOut = lang.getObject(this.easeOut);
			}
			if(lang.isString(this.easeIn)){
				this.easeIn = lang.getObject(this.easeIn);
			}
		
			var thisClass = "", rtl = !this.isLeftToRight();
			if(this.region){
				switch(this.region){
					case "trailing" :
					case "right" :
						thisClass = rtl ? "Left" : "Right";
						this._needsPosition = "left";
						break;
					case "leading" :
					case "left" :
						thisClass = rtl ? "Right" : "Left";
						break;
					case "top" :
						thisClass = "Top";
						break;
					case "bottom" :
						this._needsPosition = "top";
						thisClass = "Bottom";
						break;
				}
				domClass.add(this.domNode, "dojoxExpando" + thisClass);
				domClass.add(this.iconNode, "dojoxExpandoIcon" + thisClass);
				this._isHorizontal = /top|bottom/.test(this.region);
			}
			domStyle.set(this.domNode, {
				overflow: "hidden",
				padding:0
			});
			
			this.connect(this.domNode, "ondblclick", this.previewOnDblClick ? "preview" : "toggle");
			this.iconNode.setAttribute("aria-controls", this.id);
			if(this.previewOnDblClick){
				this.connect(this.getParent(), "_layoutChildren", lang.hitch(this, function(){
					this._isonlypreview = false;
				}));
			}
		},
		
		_startupSizes: function(){
			this._container = this.getParent();
			this._titleHeight = domGeom.getMarginBox(this.titleWrapper).h;
			this._closedSize = 0;
			
			if(this.splitter){
				var myid = this.id;
				array.forEach(registry.toArray(), function(w){
					if(w && w.child && w.child.id == myid){
						this.connect(w,"_stopDrag","_afterResize");
					}
				}, this);
			}
			
			this._currentSize = domGeom.getContentBox(this.domNode);	// TODO: can compute this from passed in value to resize(), see _LayoutWidget for example
			this._showSize = this._currentSize[(this._isHorizontal ? "h" : "w")];
			if(has("phone_platform")){
				this._showSize = 200;
			}
			this._setupAnims();
	
			if(this.startExpanded){
				this._showing = true;
			}else{
				this._showing = false;
				this._hideWrapper();
				this._hideAnim.gotoPercent(99,true);
			}
			
			this.domNode.setAttribute("aria-expanded", this._showing);
			this._hasSizes = true;
		},
		
		_afterResize: function(e){
			var tmp = this._currentSize;						// the old size
			this._currentSize = domGeom.getMarginBox(this.domNode);	// the new size
			var n = this._currentSize[(this._isHorizontal ? "h" : "w")];
			if(n > this._titleHeight){
				if(!this._showing){
					this._showing = !this._showing;
					this._showEnd();
				}
				this._showSize = n;
				this._setupAnims();
			}else{
				this._showSize = tmp[(this._isHorizontal ? "h" : "w")];
				this._showing = false;
				this._hideWrapper();
				this._hideAnim.gotoPercent(89,true);
			}
		},
		
		_setupAnims: function(){
			array.forEach(this._animConnects, connect.disconnect);
			
			var _common = {
					node:this.domNode,
					duration:this.duration
				},
				isHorizontal = this._isHorizontal,
				showProps = {},
				showSize = this._showSize,
				hideSize = this._closedSize,
				hideProps = {},
				dimension = isHorizontal ? "height" : "width",
				also = this._needsPosition
			;
	
			showProps[dimension] = {
				end: showSize
			};
			hideProps[dimension] = {
				end: hideSize
			};
			
			if(also){
				showProps[also] = {
					end: function(n){
						var c = parseInt(n.style[also], 10);
						return c - showSize + hideSize; 
					}
				}
				hideProps[also] = {
					end: function(n){
						var c = parseInt(n.style[also], 10);
						return c + showSize - hideSize;
					}
				}
			}
			
			this._showAnim = baseFx.animateProperty(lang.mixin(_common,{
				easing:this.easeIn,
				properties: showProps
			}));
			this._hideAnim = baseFx.animateProperty(lang.mixin(_common,{
				easing:this.easeOut,
				properties: hideProps
			}));
	
			this._animConnects = [
				connect.connect(this._showAnim, "onEnd", this, "_showEnd"),
				connect.connect(this._hideAnim, "onEnd", this, "_hideEnd")
			];
		},
		
		preview: function(){
			if(!this._showing){
				this._isonlypreview = !this._isonlypreview;
			}
			this.toggle();
		},
	
		toggle: function(){
			if(this._showing){
				this._hideWrapper();
				this._showAnim && this._showAnim.stop();
				this._hideAnim.play();
			}else{
				this._hideAnim && this._hideAnim.stop();
				this._showAnim.play();
			}
			this._showing = !this._showing;
			this.domNode.setAttribute("aria-expanded", this._showing);
		},
		
		_hideWrapper: function(){
			//TODO
		},
		
		_showEnd: function(){
			if(!this._isonlypreview){
				setTimeout(lang.hitch(this._container, "layout"), 15);
			}else{
				this._previewShowing = true;
				this.resize();
			}
		},
		
		_hideEnd: function(){
			if(!this._isonlypreview){
				setTimeout(lang.hitch(this._container, "layout"), 25);
			}else{
				this._previewShowing = false;
				setTimeout(lang.hitch(this._container, "layout"), 25);
			}
			this._isonlypreview = false;
		},
		
		resize: function(/*Object?*/newSize){
			if(!this._hasSizes){ this._startupSizes(newSize); }
			
			//keep mini mode
			domStyle.set(this.domNode, "top", this._isMiniMode?"75%":0);
			
			var currentSize = domGeom.getMarginBox(this.domNode);
			this._contentBox = {
				w: newSize && "w" in newSize ? newSize.w : currentSize.w,
				h: (newSize && "h" in newSize ? newSize.h : currentSize.h) - this._titleHeight
			};
			domStyle.set(this.containerNode, "height", this._contentBox.h + "px");
	
			if(newSize){
				domGeom.setMarginBox(this.domNode, newSize);
			}
	
			this._layoutChildren();
			this._setupAnims();
		},
		
		_trap: function(/*Event*/ e){
			event.stop(e);
		},
		
		setPreviewMode: function(preview, mini){
			this._isonlypreview = preview || false;
			this._isMiniMode = mini || false;
			domStyle.set(this.domNode, "top", this._isMiniMode?"75%":0);
		}
		
	});
	
	var _PortletItem = declare("idx/layout/_PortletItem", [ContentPane], {
		
		postCreate: function(){
			this.inherited(arguments);
			
			this.itemMode = "main", //"main", "detail"
			this.itemStatus = "normal", //"max", "min", "normal"
			this.own(on(this.domNode, touch.release, lang.hitch(this, this.handleFlip)));
			
			//create maximum node
			if(this.maxable){
				this.maximumNode = domConstruct.create("div", {
					title: "Click to Maximum",
					className: "portletItemMaxNode"
				}, this.domNode);
				this.own(on(this.maximumNode, touch.release, lang.hitch(this, this.handleMaximum)));
			}
			if(this.minable){
				this.minimumNode = domConstruct.create("div", {
					title: "Click to Minimum",
					className: "portletItemMinNode"
				}, this.domNode);
				this.own(on(this.minimumNode, touch.release, lang.hitch(this, this.handleMinimum)));
			}
		},
		
		processFlip: function(e){
			//Stub for manually handle flip
			this.handleFlip(e);
		},
		
		handleMaximum: function(e){
			var parentGrid = this.getParent();
			if(parentGrid){
				//append CSS3 animation for max/min resize
				clearTimeout(this.clearResizeCSS3Anim);
				domClass.add(parentGrid.domNode, "css3AnimationsForResize");
				this.clearResizeCSS3Anim = setTimeout(lang.hitch(this, function(){
					domClass.remove(parentGrid.domNode, "css3AnimationsForResize");
					this.resize();
				}), 1000);
				
				if(this.itemStatus == "normal"){
					// this.itemGeom = domGeom.getMarginBox(this.domNode);
					this.itemGeom = {
						width: domStyle.get(this.domNode, "width") + "px",
						height: domStyle.get(this.domNode, "height") + "px"
					}
					
					parentGrid.disableDnd();
					domClass.add(parentGrid.domNode, "gridContainerMaximum");
					query("> .gridContainerZone", parentGrid.gridNode).forEach(lang.hitch(this, function(tdNode, index){
						if(this.column!=index){
							domClass.add(tdNode, "gridColumnDisappear");
							// domStyle.set(tdNode, "display", "none");
						}else{
							domClass.add(tdNode, "gridColumnMaximum");
						}
						query("> .portletItem", tdNode).forEach(lang.hitch(this, function(portletNode){
							var portletWidget = registry.byNode(portletNode);
							if(portletWidget != this){
								domClass.add(portletWidget.domNode, "portletItemDisappear");
								// domStyle.set(portletWidget.domNode, "display", "none");
							}
						}));
					}));
					
					var gridGeom = domGeom.position(parentGrid.domNode);
					this.resize({w: gridGeom.w-10, h: gridGeom.h-10});
					
					domClass.add(this.domNode, "portletItemMaximum");
					
					this.itemStatus = "max";
				}else if(this.itemStatus == "max"){
					query("> .gridContainerZone", parentGrid.gridNode).forEach(lang.hitch(this, function(tdNode, index){
						if(this.column!=index){
							domClass.remove(tdNode, "gridColumnDisappear");
							// domStyle.set(tdNode, "display", "");
						}else{
							domClass.remove(tdNode, "gridColumnMaximum");
						}
						query("> .portletItem", tdNode).forEach(lang.hitch(this, function(portletNode){
							var portletWidget = registry.byNode(portletNode);
							if(portletWidget != this){
								domClass.remove(portletWidget.domNode, "portletItemDisappear");
								// domStyle.set(portletWidget.domNode, "display", "");
							}
						}));
					}));
					
					domClass.remove(parentGrid.domNode, "gridContainerMaximum");
					
					domClass.remove(this.domNode, "portletItemMaximum");
					// domGeom.setMarginBox(this.domNode, this.itemGeom);
					domStyle.set(this.domNode, this.itemGeom);
					
					parentGrid.enableDnd();
					
					this.itemStatus = "normal";
				}else{
					alert("Item is not in the Original Normal Status");
				}
			}
			e && event.stop(e);
		},
		
		handleMinimum: function(e){
			var parentGrid = this.getParent();
			if(parentGrid){
				clearTimeout(this.clearResizeCSS3Anim);
				domClass.add(this.domNode, "css3AnimationsForResize");
				this.clearResizeCSS3Anim = setTimeout(lang.hitch(this, function(){
					domClass.remove(this.domNode, "css3AnimationsForResize");
					this.resize();
				}), 1000);
				
				parentGrid.disableDnd();
				if(this.itemStatus == "normal"){
					domClass.add(this.domNode, "portletItemMinimum");
					this.itemStatus = "min";
				}else if(this.itemStatus == "min"){
					domClass.remove(this.domNode, "portletItemMinimum");
					this.itemStatus = "normal";
				}else{
					alert("Item is not in the Original Normal Status");
				}
				parentGrid.enableDnd();
			}
			e && event.stop(e);
		},
		
		handleFlip: function(e){
			if(!this.flipable){return;}
			if(this.animating || 
				(e && e.target && !dom.isDescendant(e.target, this[this.itemMode+"Content"].titleBarNode))){
				return;
			}
			this.animating = true;
			if(_supportCSS3Animation){ //css3 supported
				// clearTimeout(this.clearFlipCSS3Anim);
				// domClass.add(this.domNode, "css3AnimationsFlipping");
				// this.clearFlipCSS3Anim = setTimeout(lang.hitch(this, function(){
					// domClass.remove(this.domNode, "css3AnimationsFlipping");
				// }), 1200);
				if(this.itemMode == "main"){
					domClass.add(this.domNode, "portletItemFlip");
					domClass.add(this.resizer.domNode, "contentResizerFlip");
					this.itemMode = "detail";
					this.animating = false;
				}else if(this.itemMode == "detail"){
					domClass.remove(this.domNode, "portletItemFlip");
					domClass.remove(this.resizer.domNode, "contentResizerFlip");
					this.itemMode = "main";
					this.animating = false;
				}
			}else{
				domStyle.set(this.mainContent.domNode, "display", "none");
				domStyle.set(this.detailContent.domNode, "display", "none");
				if(this.itemMode == "main"){
					var anim = flip["flip"]({ 
						node: this.domNode,
						dir: "right",
						depth: .5,
						duration: 1000
					});
					connect.connect(anim, "onEnd", this, function(){ 
						domStyle.set(this.mainContent.domNode, "display", "none");
						domStyle.set(this.detailContent.domNode, "display", "");
						
						this.itemMode = "detail";
						this.animating = false;
					});
					anim.play();
					e && event.stop(e);
				}else if(this.itemMode == "detail"){
					var anim = flip["flip"]({ 
						node: this.domNode,
						dir: "left",
						depth: .5,
						duration: 1000
					});
					connect.connect(anim, "onEnd", this, function(){ 
						domStyle.set(this.mainContent.domNode, "display", "");
						domStyle.set(this.detailContent.domNode, "display", "none");
						
						this.itemMode = "main";
						this.animating = false;
					});
					anim.play();
					e && event.stop(e);
				}
			}
			
		}
	});
	
	var _PortletSettings = declare("idx/layout/_PortletSettings", [_Container, ContentPane], {
		portletIconClass: "dojoxPortletSettingsIcon",
		portletIconHoverClass: "dojoxPortletSettingsIconHover",
	
		postCreate: function(){
			domStyle.set(this.domNode, "display", "none");
			domClass.add(this.domNode, "dojoxPortletSettingsContainer");
	
			domClass.remove(this.domNode, "dijitContentPane");
		},
	
		_setPortletAttr: function(portlet){
			this.portlet = portlet;
		},
	
		toggle: function(){
			var n = this.domNode;
			if(domStyle.get(n, "display") == "none"){
				domStyle.set(n,{
					"display": "block",
					"height": "1px",
					"width": "auto"
				});
				dojoxFx.wipeIn({
					node: n
				}).play();
			}else{
				dojoxFx.wipeOut({
					node: n,
					onEnd: lang.hitch(this, function(){
						domStyle.set(n,{"display": "none", "height": "", "width":""});
					}
				)}).play();
			}
		}
	});
	
	var _PortletDialogSettings = declare("idx/layout/_PortletDialogSettings", [_PortletSettings], {
		dimensions: null,

		constructor: function(props, node){
			this.dimensions = props.dimensions || [300, 200];
		},

		toggle: function(){
			if(!this.dialog){
				this.dialog = new ModalDialog({
					type: "information",
					text: this.title || "Settings",
					info: this.get("content") || this.domNode.innerHTML.toString(),
					parentWidget: this
				});

				winUtil.body().appendChild(this.dialog.domNode);

				// Move this widget inside the dialog
				// this.dialog.containerNode.appendChild(this.domNode);

				domStyle.set(this.dialog.domNode,{
					"width" : this.dimensions[0] + "px",
					"height" : this.dimensions[1] + "px"
				});
				// domStyle.set(this.domNode, "display", "");
			}
			if(this.dialog.open){
				this.dialog.hide();
			}else{
				this.dialog.show(this.domNode);
			}
		}
	});
	
	var _Portlet = declare("idx/layout/_Portlet", [TitlePane, _Container], {
		
		resizeChildren: true,
		closable: true,
		_parents: null,
		_size: null,
		dragRestriction : false,
		
		//contentpane for script
		adjustPaths: false,
		cleanContent: false,
		renderStyles: false,
		executeScripts: true,
		scriptHasHooks: false,
		ioMethod: xhrUtil.get,
		ioArgs: {},
		
		onExecError: function(/*Event*/ e){
		},
	
		_setContent: function(cont){
			var setter = this._contentSetter;
			if(! (setter && setter instanceof dojoxHtmlUtil._ContentSetter)) {
				setter = this._contentSetter = new dojoxHtmlUtil._ContentSetter({
					node: this.containerNode,
					_onError: lang.hitch(this, this._onError),
					onContentError: lang.hitch(this, function(e){
						// fires if a domfault occurs when we are appending this.errorMessage
						// like for instance if domNode is a UL and we try append a DIV
						var errMess = this.onContentError(e);
						try{
							this.containerNode.innerHTML = errMess;
						}catch(e){
							console.error('Fatal '+this.id+' could not change content due to '+e.message, e);
						}
					})/*,
					_onError */
				});
			};
	
			this._contentSetterParams = {
				adjustPaths: Boolean(this.adjustPaths && (this.href||this.referencePath)),
				referencePath: this.href || this.referencePath,
				renderStyles: this.renderStyles,
				executeScripts: this.executeScripts,
				scriptHasHooks: this.scriptHasHooks,
				scriptHookReplacement: "dijit.byId('"+this.id+"')"
			};
	
			this.inherited("_setContent", arguments);
		},

		buildRendering: function(){
			this.inherited(arguments);
			domStyle.set(this.domNode, "visibility", "hidden");
		},

		postCreate: function(){
			this.inherited(arguments);

			// Add the portlet classes
			domClass.add(this.domNode, "dojoxPortlet");
			domClass.remove(this.arrowNode, "dijitArrowNode");
			domClass.add(this.arrowNode, "dojoxPortletIcon dojoxArrowDown");
			domClass.add(this.titleBarNode, "dojoxPortletTitle");
			domClass.add(this.hideNode, "dojoxPortletContentOuter");

			domClass.add(this.domNode, "dojoxPortlet-" + (!this.dragRestriction ? "movable" : "nonmovable"));

			var _this = this;
			if(this.resizeChildren){

				this.subscribe("/dnd/drop", function(){_this._updateSize();});

				this.subscribe("/Portlet/sizechange", function(widget){_this.onSizeChange(widget);});
				this.connect(window, "onresize", function(){_this._updateSize();});

				var doSelectSubscribe = lang.hitch(this, function(id, lastId){
					var widget = registry.byId(id);
					if(widget.selectChild){
						var s = this.subscribe(id + "-selectChild", function(child){
							var n = _this.domNode.parentNode;

							while(n){
								if(n == child.domNode){

									// Only fire this once, as the widget is now visible
									// at least once, so child measurements should be accurate.
									_this.unsubscribe(s);
									_this._updateSize();
									break;
								}
								n = n.parentNode;
							}
						});

						var child = registry.byId(lastId);
						if(widget && child){
							_this._parents.push({parent: widget, child: child});
						}
					}
				});
				var lastId;
				this._parents = [];

				for(var p = this.domNode.parentNode; p != null; p = p.parentNode){
					var id = p.getAttribute ? p.getAttribute("widgetId") : null;
					if(id){
						doSelectSubscribe(id, lastId);
						lastId = id;
					}
				}
			}

			if(this.titleHidden){
				domStyle.set(this.titleNode, "display", "none");
				domStyle.set(this.hideNode, "background", "none");
			}
			this.connect(this.titleBarNode, touch.press, function(evt){
				if (domClass.contains(evt.target, "dojoxPortletIcon")) {
					event.stop(evt);
					return false;
				}
				return true;
			});

			this.connect(this._wipeOut, "onEnd", function(){_this._publish();});
			this.connect(this._wipeIn, "onEnd", function(){_this._publish();});

			if(this.closable){
				this.closeIcon = this._createIcon("dojoxCloseNode", "dojoxCloseNodeHover", lang.hitch(this, "onClose"));
				domStyle.set(this.closeIcon, "display", "");
			}
		},

		startup: function(){
			if(this._started){return;}

			var children = this.getChildren();
			this._placeSettingsWidgets();

			// Start up the children
			array.forEach(children, function(child){
				try{
					if(!child.started && !child._started){
						child.startup()
					}
				}
				catch(e){
					console.log(this.id + ":" + this.declaredClass, e);
				}
			});

			this.inherited(arguments);

			//this._updateSize();
			domStyle.set(this.domNode, "visibility", "visible");
			
			//portlet communication 
			this.parentContainer = this.getParent();
			this.topicHead = this.parentContainer.rootContainer.get("flipCardModelId") + "_" + this.parentContainer.gridContainer.get("gridId");
			this.topicId = this.parentContainer.get("itemName") + "_" + this.contentType;
			this.topicHandler = topic.subscribe(this.topicHead + "_" + this.topicId, lang.hitch(this, this.topicHandlerStub));
		},
		
		topicHandlerStub: function(data){
			//TODO 
			this.topicProcess(data.data);
		},
		topicProcess: function(data){
			//Stub function
		},
		
		topicPublisherStub: function(data, cardId, contentType){
			topic.publish(this.topicHead + "_" + cardId + "_" + (contentType||"main"), { data: data });
		},

		_placeSettingsWidgets: function(){

			array.forEach(this.getChildren(), lang.hitch(this, function(child){
				if(child.portletIconClass && child.toggle && !child.get("portlet")){
					this._createIcon(child.portletIconClass, child.portletIconHoverClass, lang.hitch(child, "toggle"));
					domConstruct.place(child.domNode, this.containerNode, "before");
					child.set("portlet", this);
					this._settingsWidget = child;
				}
			}));
		},

		_createIcon: function(clazz, hoverClazz, fn){

			var icon = domConstruct.create("div",{
				"class": "dojoxPortletIcon " + clazz,
				"waiRole": "presentation"
			});
			domConstruct.place(icon, this.arrowNode, "before");

			//this.connect(icon, "onclick", fn);
			this.own(on(icon, touch.release, lang.hitch(this, function(e){
				fn.call();
				e && event.stop(e);
			})));

			if(hoverClazz){
				this.connect(icon, touch.over, function(){
					domClass.add(icon, hoverClazz);
				});
				this.connect(icon, touch.out, function(){
					domClass.remove(icon, hoverClazz);
				});
			}
			return icon;
		},

		onClose: function(evt){
			domStyle.set(this.domNode, "display", "none");
		},

		onSizeChange: function(widget){
			if(widget == this){
				return;
			}
			this._updateSize();
		},

		_updateSize: function(){
			if(!this.open || !this._started || !this.resizeChildren){
				return;
			}

			if(this._timer){
				clearTimeout(this._timer);
			}
			this._timer = setTimeout(lang.hitch(this, function(){
				var size ={
					w: domStyle.get(this.domNode, "width"),
					h: domStyle.get(this.domNode, "height")
				};

				for(var i = 0; i < this._parents.length; i++){
					var p = this._parents[i];
					var sel = p.parent.selectedChildWidget
					if(sel && sel != p.child){
						return;
					}
				}

				if(this._size){
					if(this._size.w == size.w && this._size.h == size.h){
						return;
					}
				}
				this._size = size;

				var fns = ["resize", "layout"];
				this._timer = null;
				var kids = this.getChildren();

				array.forEach(kids, function(child){
					for(var i = 0; i < fns.length; i++){
						if(lang.isFunction(child[fns[i]])){
							try{
								child[fns[i]]();
							} catch(e){
								console.log(e);
							}
							break;
						}
					}
				});
				this.onUpdateSize();
			}), 100);
		},

		onUpdateSize: function(){
		},

		_publish: function(){
			topic.publish("/Portlet/sizechange",[this]);
		},

		_onTitleClick: function(evt){
			if(evt.target == this.arrowNode){
				this.inherited(arguments);
			}
		},

		addChild: function(child){
			this._size = null;
			this.inherited(arguments);

			if(this._started){
				this._placeSettingsWidgets();
				this._updateSize();
			}
			if(this._started && !child.started && !child._started){
				child.startup();
			}
		},

		destroyDescendants: function(/*Boolean*/ preserveDom){
			this.inherited(arguments);
			if(this._settingsWidget){
				this._settingsWidget.destroyRecursive(preserveDom);
			}
		},

		destroy: function(){
			if(this._timer){
				clearTimeout(this._timer);
			}
			this.inherited(arguments);
		},

		_setCss: function(){
			this.inherited(arguments);
			domStyle.set(this.arrowNode, "display", this.toggleable ? "":"none");
		}
	});
	
	
	var _ResizeHelper = dojo.declare("dojox.layout._ResizeHelper", [_Widget], {
		show: function(){
			domStyle.set(this.domNode, "display", "");
		},
		
		hide: function(){
			domStyle.set(this.domNode, "display", "none");
		},
		
		resize: function(/* Object */dim){
			domGeom.setMarginBox(this.domNode, dim);
		}
	});
	
	var _ResizeHandle = declare("idx/layout/_ResizeHandle", [_Widget, _TemplatedMixin], {
		targetId: "",
		targetContainer: null,
		resizeAxis: "xy",
		activeResize: false,
		activeResizeClass: "dojoxResizeHandleClone",
		animateSizing: true,
		animateMethod: "chain",
		animateDuration: 225,
		minHeight: 100,
		minWidth: 100,
		constrainMax: false,
		maxHeight:0,
		maxWidth:0,
		fixedAspect: false,
		intermediateChanges: false,
	
		startTopic: "/dojo/resize/start",
		endTopic:"/dojo/resize/stop",
	
		templateString: '<div dojoAttachPoint="resizeHandle" class="dojoxResizeHandle"><div></div></div>',
		
		postCreate: function(){
			this.connect(this.resizeHandle, touch.press, "_beginSizing");
			if(!this.activeResize){
				this._resizeHelper = manager.byId('dojoxGlobalResizeHelper');
				if(!this._resizeHelper){
					this._resizeHelper = new _ResizeHelper({
							id: 'dojoxGlobalResizeHelper'
					}).placeAt(winUtil.body());
					domClass.add(this._resizeHelper.domNode, this.activeResizeClass);
				}
			}else{ this.animateSizing = false; }
	
			if(!this.minSize){
				this.minSize = { w: this.minWidth, h: this.minHeight };
			}
			
			if(this.constrainMax){
				this.maxSize = { w: this.maxWidth, h: this.maxHeight }
			}
			
			this._resizeX = this._resizeY = false;
			var addClass = lang.partial(domClass.add, this.resizeHandle);
			switch(this.resizeAxis.toLowerCase()){
				case "xy" :
					this._resizeX = this._resizeY = true;
					addClass("dojoxResizeNW");
					break;
				case "x" :
					this._resizeX = true;
					addClass("dojoxResizeW");
					break;
				case "y" :
					this._resizeY = true;
					addClass("dojoxResizeN");
					break;
			}
		},
		
		_beginSizing: function(/*Event*/ e){
			if(this._isSizing){ return; }
	
			connect.publish(this.startTopic, [ this ]);
			this.targetWidget = manager.byId(this.targetId);
	
			this.targetDomNode = this.targetWidget ? this.targetWidget.domNode : dom.byId(this.targetId);
			if(this.targetContainer){ this.targetDomNode = this.targetContainer; }
			if(!this.targetDomNode){ return; }
	
			if(!this.activeResize){
				var c = domGeom.position(this.targetDomNode, true);
				this._resizeHelper.resize({l: c.x, t: c.y, w: c.w, h: c.h});
				this._resizeHelper.show();
				if(!this.isLeftToRight()){
					this._resizeHelper.startPosition = {l: c.x, t: c.y};
				}
			}
	
			this._isSizing = true;
			this.startPoint  = { x:e.clientX, y:e.clientY };
	
			var style = domStyle.getComputedStyle(this.targetDomNode), 
				borderModel = domGeom.boxModel==='border-model',
				padborder = borderModel?{w:0,h:0}:domGeom.getPadBorderExtents(this.targetDomNode, style),
				margin = domGeom.getMarginExtents(this.targetDomNode, style),
				mb;
			mb = this.startSize = { 
					w: domStyle.get(this.targetDomNode, 'width', style), 
					h: domStyle.get(this.targetDomNode, 'height', style),
					pbw: padborder.w, pbh: padborder.h,
					mw: margin.w, mh: margin.h};
			if(!this.isLeftToRight() && domStyle.get(this.targetDomNode, "position") == "absolute"){
				var p = domGeom.position(this.targetDomNode, true);
				this.startPosition = {l: p.x, t: p.y};
			}
			
			this._pconnects = [
				connect.connect(winUtil.doc, touch.move, this, "_updateSizing"),
				connect.connect(winUtil.doc, touch.release, this, "_endSizing")
			];
			
			event.stop(e);
		},
		
		_updateSizing: function(/*Event*/ e){
			if(this.activeResize){
				this._changeSizing(e);
			}else{
				var tmp = this._getNewCoords(e, 'border', this._resizeHelper.startPosition);
				if(tmp === false){ return; }
				this._resizeHelper.resize(tmp);
			}
			e.preventDefault();
		},
	
		_getNewCoords: function(/* Event */ e, /* String */ box, /* Object */startPosition){
			try{
				if(!e.clientX  || !e.clientY){ return false; }
			}catch(e){
				return false;
			}
			this._activeResizeLastEvent = e;
	
			var dx = (this.isLeftToRight()?1:-1) * (this.startPoint.x - e.clientX),
				dy = this.startPoint.y - e.clientY,
				newW = this.startSize.w - (this._resizeX ? dx : 0),
				newH = this.startSize.h - (this._resizeY ? dy : 0),
				r = this._checkConstraints(newW, newH)
			;
			
			startPosition = (startPosition || this.startPosition);
			if(startPosition && this._resizeX){
				r.l = startPosition.l + dx;
				if(r.w != newW){
					r.l += (newW - r.w);
				}
				r.t = startPosition.t;
			}
	
			switch(box){
				case 'margin':
					r.w += this.startSize.mw;
					r.h += this.startSize.mh;
				case "border":
					r.w += this.startSize.pbw;
					r.h += this.startSize.pbh;
					break;
			}
	
			return r; // Object
		},
		
		_checkConstraints: function(newW, newH){
			if(this.minSize){
				var tm = this.minSize;
				if(newW < tm.w){
					newW = tm.w;
				}
				if(newH < tm.h){
					newH = tm.h;
				}
			}
			
			if(this.constrainMax && this.maxSize){
				var ms = this.maxSize;
				if(newW > ms.w){
					newW = ms.w;
				}
				if(newH > ms.h){
					newH = ms.h;
				}
			}
			
			if(this.fixedAspect){
				var w = this.startSize.w, h = this.startSize.h,
					delta = w * newH - h * newW;
				if(delta<0){
					newW = newH * w / h;
				}else if(delta>0){
					newH = newW * h / w;
				}
			}
			
			return { w: newW, h: newH }; // Object
		},
			
		_changeSizing: function(/*Event*/ e){
			var isWidget = this.targetWidget && lang.isFunction(this.targetWidget.resize),
				tmp = this._getNewCoords(e, isWidget && 'margin');
			if(tmp === false){ return; }
	
			if(isWidget){
				this.targetWidget.resize(tmp);
			}else{
				if(this.animateSizing){
					var anim = coreFx[this.animateMethod]([
						baseFx.animateProperty({
							node: this.targetDomNode,
							properties: {
								width: { start: this.startSize.w, end: tmp.w }
							},
							duration: this.animateDuration
						}),
						baseFx.animateProperty({
							node: this.targetDomNode,
							properties: {
								height: { start: this.startSize.h, end: tmp.h }
							},
							duration: this.animateDuration
						})
					]);
					anim.play();
				}else{
					domStyle.set(this.targetDomNode,{
						width: tmp.w + "px",
						height: tmp.h + "px"
					});
				}
			}
			if(this.intermediateChanges){
				this.onResize(e);
			}
		},
	
		_endSizing: function(/*Event*/ e){
			array.forEach(this._pconnects, connect.disconnect);
			var pub = lang.partial(connect.publish, this.endTopic, [ this ]);
			if(!this.activeResize){
				this._resizeHelper.hide();
				this._changeSizing(e);
				setTimeout(pub, this.animateDuration + 15);
			}else{
				pub();
			}
			this._isSizing = false;
			this.onResize(e);
		},
		
		onResize: function(e){
			this.getParent().getParent().resize();
		}
	});
	
	
	var _GridContainerLite = declare("idx/layout/_GridContainerLite", [_LayoutWidget, _TemplatedMixin], {
		autoRefresh: true,
		templateString: gridTemplate,
		dragHandleClass: "dojoxDragHandle",
		nbZones: 1,
		doLayout: true,
		isAutoOrganized: true,
		acceptTypes: [],
		colWidths: "",

		constructor: function(/*Object*/props, /*DOMNode*/node){
			this.acceptTypes = (props || {}).acceptTypes || ["text"];
			this._disabled = true;
		},

		postCreate: function(){
			this.inherited(arguments);
			this._grid = [];

			this._createCells();

			this.subscribe("/dojox/mdnd/drop", "resizeChildAfterDrop");
			this.subscribe("/dojox/mdnd/drag/start", "resizeChildAfterDragStart");

			this._dragManager = _AreaManager.areaManager();
			this._dragManager.autoRefresh = this.autoRefresh;

			this._dragManager.dragHandleClass = this.dragHandleClass;

			if(this.doLayout){
				this._border = {
					h: has("ie") ? domGeom.getBorderExtents(this.gridContainerTable).h : 0,
					w: (has("ie") == 6) ? 1 : 0
				};
			}else{
				domStyle.set(this.domNode, "overflowY", "hidden");
				domStyle.set(this.gridContainerTable, "height", "auto");
			}
		},

		startup: function(){
			if(this._started){ return; }

			if(this.isAutoOrganized){
				this._organizeChildren();
			}
			else{
				//this._organizeChildrenManually();
			}
			array.forEach(this.getChildren(), function(child){
			  child.startup();
			});

			if(this._isShown()){
				this.enableDnd();
			}
			this.inherited(arguments);
		},

		resizeChildAfterDrop: function(/*Node*/node, /*Object*/targetArea, /*Integer*/indexChild){
			if(this._disabled){
				return false;
			}
			if(registry.getEnclosingWidget(targetArea.node) == this){
				var widget = registry.byNode(node);
				if(widget.resize && lang.isFunction(widget.resize)){
					widget.resize();
				}

				widget.set("column", parseInt(domAttr.get(node.parentNode, "columnIndex")));
				var position = 0, posNode = node;
				while(posNode.previousSibling){
					position++;
					posNode = posNode.previousSibling;
				}
				widget.set("position", position);
				posNode = node;
				while(posNode.nextSibling){
					posNode = posNode.nextSibling;
					var nextWidget = registry.byNode(posNode);
					nextWidget.set("position", position);
				}

				if(this.doLayout){
					var domNodeHeight = this._contentBox.h,
						divHeight = domGeom.getContentBox(this.gridContainerDiv).h;
					if(divHeight >= domNodeHeight){
						domStyle.set(this.gridContainerTable, "height",
								(domNodeHeight - this._border.h) + "px");
					}
				}
				return true;
			}
			return false;
		},

		resizeChildAfterDragStart: function(/*Node*/node, /*Object*/sourceArea, /*Integer*/indexChild){
			if(this._disabled){
				return false;
			}
			if(registry.getEnclosingWidget(sourceArea.node) == this){
				this._draggedNode = node;
				if(this.doLayout){
					domGeom.setMarginBox(this.gridContainerTable, {
						h: domGeom.getContentBox(this.gridContainerDiv).h - this._border.h
					});
				}
				return true;
			}
			return false;
		},

		getChildren: function(){

			var children = new NodeList();
			array.forEach(this._grid, function(dropZone){
				query("> [widgetId]", dropZone.node).map(registry.byNode).forEach(function(item){
				  children.push(item);
				});
			});
			return children;	// Array
		},

		_isShown: function(){
			if("open" in this){		// for TitlePane, etc.
				return this.open;		// Boolean
			}
			else{
				var node = this.domNode;
				return (node.style.display != 'none') && (node.style.visibility != 'hidden') && !domClass.contains(node, "dijitHidden"); // Boolean
			}
		},

		layout: function(){
			if(this.doLayout){
				var contentBox = this._contentBox;
				domGeom.setMarginBox(this.gridContainerTable, {
					h: contentBox.h - this._border.h
				});
				domGeom.setContentSize(this.domNode, {
					w: contentBox.w - this._border.w
				});
			}
			array.forEach(this.getChildren(), function(widget){
				if(widget.resize && lang.isFunction(widget.resize)){
					widget.resize();
				}
			});
		},

		onShow: function(){
			if(this._disabled){
				this.enableDnd();
			}
		},

		onHide: function(){
			if(!this._disabled){
				this.disableDnd();
			}
		},

		_createCells: function(){
			if(this.nbZones === 0){ this.nbZones = 1; }
			var accept = this.acceptTypes.join(","),
				i = 0;

			var widths = this._computeColWidth();

			while(i < this.nbZones){
				this._grid.push({
					node: domConstruct.create("div", {
						'class': "gridContainerZone",
						accept: accept,
						id: this.id + "_dz" + i,
						columnIndex: i,
						style: {
							'width': widths[i] + "%"
						}
					}, this.gridNode)
				});
				i++;
			}
		},

		_getZonesAttr: function(){
			return query(".gridContainerZone",  this.containerNode);
		},

		enableDnd: function(){
			if(this.editDisabled){return;}
			var m = this._dragManager;
			array.forEach(this._grid, function(dropZone){
				m.registerByNode(dropZone.node);
			});
			m._dropMode.updateAreas(m._areaList);
			this._disabled = false;
		},

		disableDnd: function(){
			if(this.editDisabled){return;}
			var m = this._dragManager;
			array.forEach(this._grid, function(dropZone){
				m.unregister(dropZone.node);
			});
			m._dropMode.updateAreas(m._areaList);
			this._disabled = true;
		},

		_organizeChildren: function(){
			var children = _GridContainerLite.superclass.getChildren.call(this);
			var numZones = this.nbZones,
				numPerZone = Math.floor(children.length / numZones),
				mod = children.length % numZones,
				i = 0;
			for(var z = 0; z < numZones; z++){
				for(var r = 0; r < numPerZone; r++){
					this._insertChild(children[i], z);
					i++;
				}
				if(mod > 0){
					try{
						this._insertChild(children[i], z);
						i++;
					}
					catch(e){
						console.error("Unable to insert child in GridContainer", e);
					}
					mod--;
				}
				else if(numPerZone === 0){
					break;	// Optimization
				}
			}
		},

		_organizeChildrenManually: function (){
			var children = _GridContainerLite.superclass.getChildren.call(this),
				length = children.length,
				child;
			for(var i = 0; i < length; i++){
				child = children[i];
				try{
					this._insertChild(child, child.column - 1);
				}
				catch(e){
					console.error("Unable to insert child in GridContainer", e);
				}
			}
		},

		_insertChild: function(/*Widget*/child, /*Integer*/column, /*Integer?*/p){
			var zone = this._grid[column].node,
				length = zone.childNodes.length,
				position = p;
			if(typeof p === "undefined" || p > length){
				p = length;
			}
			//position re-caculation
			var childPosArray = [];
			array.forEach(zone.childNodes, function(node){
				var cWidget = registry.byNode(node);
				childPosArray.push(cWidget.get("position"));
			});
			childPosArray.push(position);
			childPosArray.sort();
			p = array.indexOf(childPosArray, position);
			
			if(this._disabled){
				domConstruct.place(child.domNode, zone, p);
				domAttr.set(child.domNode, "tabIndex", "0");
			}
			else{
				if(!child.dragRestriction){
					this._dragManager.addDragItem(zone, child.domNode, p, true);
				}
				else{
					domConstruct.place(child.domNode, zone, p);
					domAttr.set(child.domNode, "tabIndex", "0");
				}
			}
			child.set("column", column);
			child.set("position", position);
			return child; // Widget
		},

		removeChild: function(/*Widget*/ widget){
			if(this._disabled){
				this.inherited(arguments);
			}
			else{
				this._dragManager.removeDragItem(widget.domNode.parentNode, widget.domNode);
			}
		},

		addService: function(/*Object*/child, /*Integer?*/column, /*Integer?*/p){
			kernel.deprecated("addService is deprecated.", "Please use  instead.", "Future");
			this.addChild(child, column, p);
		},

		addChild: function(/*Object*/child, /*Integer?*/column, /*Integer?*/p){
			child.domNode.id = child.id;
			_GridContainerLite.superclass.addChild.call(this, child, 0);
			if(column < 0 || column === undefined){ column = 0; }
			if(p <= 0){ p = 0; }
			try{
				return this._insertChild(child, column, p);
			}
			catch(e){
				console.error("Unable to insert child in GridContainer", e);
			}
			return null; 	// Widget
		},

		_setColWidthsAttr: function(value){
			this.colWidths = lang.isString(value) ? value.split(",") : (lang.isArray(value) ? value : [value]);

			if(this._started){
				this._updateColumnsWidth();
			}
		},

		_updateColumnsWidth: function(/*Object*/ manager){
			var length = this._grid.length;

			var widths = this._computeColWidth();

			// Set the widths of each node
			for (var i = 0; i < length; i++){
				this._grid[i].node.style.width = widths[i] + "%";
			}
		},

		_computeColWidth: function(){
			var origWidths = this.colWidths || [];
			var widths = [];
			var colWidth;
			var widthSum = 0;
			var i;

			// Calculate the widths of each column.
			for(i = 0; i < this.nbZones; i++){
				if(widths.length < origWidths.length){
					widthSum += origWidths[i] * 1;
					widths.push(origWidths[i]);
				}else{
					if(!colWidth){
						colWidth = (100 - widthSum)/(this.nbZones - i);

						if(colWidth < 0){
							colWidth = 100 / this.nbZones;
						}
					}
					widths.push(colWidth);
					widthSum += colWidth * 1;
				}
			}

			if(widthSum > 100){
				var divisor = 100 / widthSum;
				for(i = 0; i < widths.length; i++){
					widths[i] *= divisor;
				}
			}
			return widths;
		},

		_selectFocus: function(/*Event*/event){
			if(this._disabled){ return; }
			var key = event.keyCode,
				k = keys,
				zone = null,
				cFocus = baseFocus.getFocus(),
				focusNode = cFocus.node,
				m = this._dragManager,
				found,
				i,
				j,
				r,
				children,
				area,
				widget;
			if(focusNode == this.containerNode){
				area = this.gridNode.childNodes;
				switch(key){
					case k.DOWN_ARROW:
					case k.RIGHT_ARROW:
						found = false;
						for(i = 0; i < area.length; i++){
							children = area[i].childNodes;
							for(j = 0; j < children.length; j++){
								zone = children[j];
								if(zone !== null && zone.style.display != "none"){
									focus.focus(zone);
									events.stop(event);
									found = true;
									break;
								}
							}
							if(found){ break };
						}
						break;
					case k.UP_ARROW:
					case k.LEFT_ARROW:
						area = this.gridNode.childNodes;
						found = false;
						for(i = area.length-1; i >= 0 ; i--){
							children = area[i].childNodes;
							for(j = children.length; j >= 0; j--){
								zone = children[j];
								if(zone !== null && zone.style.display != "none"){
									focus.focus(zone);
									events.stop(event);
									found = true;
									break;
								}
							}
							if(found){ break };
						}
					break;
				}
			}else{
				if(focusNode && (focusNode.parentNode.parentNode == this.gridNode)){
					var child = (key == k.UP_ARROW || key == k.LEFT_ARROW) ? "lastChild" : "firstChild";
					var pos = (key == k.UP_ARROW || key == k.LEFT_ARROW) ? "previousSibling" : "nextSibling";
					switch(key){
						case k.UP_ARROW:
						case k.DOWN_ARROW:
							events.stop(event);
							found = false;
							var focusTemp = focusNode;
							while(!found){
								children = focusTemp.parentNode.childNodes;
								var num = 0;
								for(i = 0; i < children.length; i++){
									if(children[i].style.display != "none"){ num++; }
									if(num > 1){ break; }
								}
								if(num == 1){ return; }
								if(focusTemp[pos] === null){
									zone = focusTemp.parentNode[child];
								}
								else{
									zone = focusTemp[pos];
								}
								if(zone.style.display === "none"){
									focusTemp = zone;
								}
								else{
									found = true;
								}
							}
							if(event.shiftKey){
								var parent = focusNode.parentNode;
								for(i = 0; i < this.gridNode.childNodes.length; i++){
									if(parent == this.gridNode.childNodes[i]){
										break;
									}
								}
								children = this.gridNode.childNodes[i].childNodes;
								for(j = 0; j < children.length; j++){
									if(zone == children[j]){
										break;
									}
								}
								if(has("mozilla") || has("webkit")){ i--; }

								widget = registry.byNode(focusNode);
								if(!widget.dragRestriction){
									r = m.removeDragItem(parent, focusNode);
									this.addChild(widget, i, j);
									domAttr.set(focusNode, "tabIndex", "0");
									focus.focus(focusNode);
								}
								else{
									topic.publish("/dojox/layout/gridContainer/moveRestriction", this);
								}
							}
							else{
								focus.focus(zone);
							}
						break;
						case k.RIGHT_ARROW:
						case k.LEFT_ARROW:
							events.stop(event);
							if(event.shiftKey){
								var z = 0;
								if(focusNode.parentNode[pos] === null){
									if(has("ie") && key == k.LEFT_ARROW){
										z = this.gridNode.childNodes.length-1;
									}
								}
								else if(focusNode.parentNode[pos].nodeType == 3){
									z = this.gridNode.childNodes.length - 2;
								}
								else{
									for(i = 0; i < this.gridNode.childNodes.length; i++){
										if(focusNode.parentNode[pos] == this.gridNode.childNodes[i]){
											break;
										}
										z++;
									}
									if(has("mozilla") || has("webkit")){ z--; }
								}
								widget = registry.byNode(focusNode);
								var _dndType = focusNode.getAttribute("dndtype");
								if(_dndType === null){
									//check if it's a dijit object
									if(widget && widget.dndType){
										_dndType = widget.dndType.split(/\s*,\s*/);
									}
									else{
										_dndType = ["text"];
									}
								}
								else{
									_dndType = _dndType.split(/\s*,\s*/);
								}
								var accept = false;
								for(i = 0; i < this.acceptTypes.length; i++){
									for(j = 0; j < _dndType.length; j++){
										if(_dndType[j] == this.acceptTypes[i]){
											accept = true;
											break;
										}
									}
								}
								if(accept && !widget.dragRestriction){
									var parentSource = focusNode.parentNode,
										place = 0;
									if(k.LEFT_ARROW == key){
										var t = z;
										if(has("mozilla") || has("webkit")){ t = z + 1; }
										place = this.gridNode.childNodes[t].childNodes.length;
									}
									// delete of manager :
									r = m.removeDragItem(parentSource, focusNode);
									this.addChild(widget, z, place);
									domAttr.set(r, "tabIndex", "0");
									focus.focus(r);
								}
								else{
									topic.publish("/dojox/layout/gridContainer/moveRestriction", this);
								}
							}
							else{
								var node = focusNode.parentNode;
								while(zone === null){
									if(node[pos] !== null && node[pos].nodeType !== 3){
										node = node[pos];
									}
									else{
										if(pos === "previousSibling"){
											node = node.parentNode.childNodes[node.parentNode.childNodes.length-1];
										}
										else{
											node = node.parentNode.childNodes[has("ie") ? 0 : 1];
										}
									}
									zone = node[child];
									if(zone && zone.style.display == "none"){
										// check that all elements are not hidden
										children = zone.parentNode.childNodes;
										var childToSelect = null;
										if(pos == "previousSibling"){
											for(i = children.length-1; i >= 0; i--){
												if(children[i].style.display != "none"){
													childToSelect = children[i];
													break;
												}
											}
										}
										else{
											for(i = 0; i < children.length; i++){
												if(children[i].style.display != "none"){
													childToSelect = children[i];
													break;
												}
											}
										}
										if(!childToSelect){
											focusNode = zone;
											node = focusNode.parentNode;
											zone = null;
										}
										else{
											zone = childToSelect;
										}
									}
								}
								focus.focus(zone);
							}
						break;
					}
				}
			}
		},

		destroy: function(){
			var m = this._dragManager;
			array.forEach(this._grid, function(dropZone){
				m.unregister(dropZone.node);
			});
			this.inherited(arguments);
		}
	});
	
	var _GridContainer = declare("idx/layout/_GridContainer", [_GridContainerLite], {
		hasResizableColumns: true,
		liveResizeColumns : false,
		minColWidth: 20,
		minChildWidth: 150,
		mode: "right",
		isRightFixed: false,
		isLeftFixed: false,

		startup: function(){
			this.inherited(arguments);
			if(this.hasResizableColumns){
				for(var i = 0; i < this._grid.length - 1; i++){
					this._createGrip(i);
				}
				// If widget has a container parent, grips will be placed
				// by method onShow.
				if(!this.getParent()){
					ready(lang.hitch(this, "_placeGrips"));
				}
				//fixed for CSS3 display
				this.onShow();
			}
		},

		resizeChildAfterDrop : function(/*Node*/node, /*Object*/targetArea, /*Integer*/indexChild){

			if(this.inherited(arguments)){
				this._placeGrips();
			}
		},

		onShow: function(){
			this.inherited(arguments);
			this._placeGrips();
		},

		_createGrip: function(/*Integer*/ index){
			var dropZone = this._grid[index],
				grip = domConstruct.create("div", { 'class': "gridContainerGrip" }, this.domNode);
			dropZone.grip = grip;
			dropZone.gripHandler = [
				this.connect(grip, touch.over, function(e){
					var gridContainerGripShow = false;
					for(var i = 0; i < this._grid.length - 1; i++){
						if(domClass.contains(this._grid[i].grip, "gridContainerGripShow")){
							gridContainerGripShow = true;
							break;
						}
					}
					if(!gridContainerGripShow){
						domClass.replace(e.target, "gridContainerGripShow", "gridContainerGrip");
					}
				})[0],
				this.connect(grip, touch.out, function(e){
					if(!this._isResized){
						domClass.replace(e.target, "gridContainerGrip", "gridContainerGripShow");
					}
				})[0],
				this.connect(grip, touch.press, "_resizeColumnOn")[0],
				this.connect(grip, "ondblclick", "_onGripDbClick")[0]
			];
		},

		_placeGrips: function(){
			var gripWidth, height, left = 0, grip;
			//var scroll = this.domNode.style.overflowY;

			array.forEach(this._grid, function(dropZone){
				if(dropZone.grip){
					grip = dropZone.grip;
					if(!gripWidth){
						gripWidth = grip.offsetWidth / 2;
					}

					left += domGeom.getMarginBox(dropZone.node).w;

					domStyle.set(grip, "left", (left - gripWidth) + "px");
					if(!height){
						height = domGeom.getContentBox(this.gridNode).h;
					}
					if(height > 0){
						domStyle.set(grip, "height", height + "px");
					}
					//}
				}
			}, this);
		},

		_onGripDbClick: function(){
			this._updateColumnsWidth(this._dragManager);
			this.resize();
		},

		_resizeColumnOn: function(/*Event*/e){
			this._activeGrip = e.target;
			this._initX = e.pageX;
			e.preventDefault();

			winUtil.body().style.cursor = "ew-resize";

			this._isResized = true;

			var tabSize = [];
			var grid;
			var i;

			for(i = 0; i < this._grid.length; i++){
				tabSize[i] = domGeom.getContentBox(this._grid[i].node).w;
			}

			this._oldTabSize = tabSize;

			for(i = 0; i < this._grid.length; i++){
				grid = this._grid[i];
				if(this._activeGrip == grid.grip){
					this._currentColumn = grid.node;
					this._currentColumnWidth = tabSize[i];
					this._nextColumn = this._grid[i + 1].node;
					this._nextColumnWidth = tabSize[i + 1];
				}
				grid.node.style.width = tabSize[i] + "px";
			}

			// calculate the minWidh of all children for current and next column
			var calculateChildMinWidth = function(childNodes, minChild){
				var width = 0;
				var childMinWidth = 0;

				array.forEach(childNodes, function(child){
					if(child.nodeType == 1){
						var objectStyle = domStyle.getComputedStyle(child);
						var minWidth = (has("ie")) ? minChild : parseInt(objectStyle.minWidth);

						childMinWidth = minWidth +
									parseInt(objectStyle.marginLeft) +
									parseInt(objectStyle.marginRight);

						if(width < childMinWidth){
							width = childMinWidth;
						}
					}
				});
				return width;
			};
			var currentColumnMinWidth = calculateChildMinWidth(this._currentColumn.childNodes, this.minChildWidth);

			var nextColumnMinWidth = calculateChildMinWidth(this._nextColumn.childNodes, this.minChildWidth);

			var minPix = Math.round((domGeom.getMarginBox(this.gridContainerTable).w * this.minColWidth) / 100);

			this._currentMinCol = currentColumnMinWidth;
			this._nextMinCol = nextColumnMinWidth;

			if(minPix > this._currentMinCol){
				this._currentMinCol = minPix;
			}
			if(minPix > this._nextMinCol){
				this._nextMinCol = minPix;
			}
			this._connectResizeColumnMove = connect.connect(winUtil.doc, touch.move, this, "_resizeColumnMove");
			this._connectOnGripMouseUp = connect.connect(winUtil.doc, touch.release, this, "_onGripMouseUp");
		},

		_onGripMouseUp: function(){
			winUtil.body().style.cursor = "default";

			connect.disconnect(this._connectResizeColumnMove);
			connect.disconnect(this._connectOnGripMouseUp);

			this._connectOnGripMouseUp = this._connectResizeColumnMove = null;

			if(this._activeGrip){
				domClass.replace(this._activeGrip, "gridContainerGrip", "gridContainerGripShow");
			}

			this._isResized = false;
		},

		_resizeColumnMove: function(/*Event*/e){
			e.preventDefault();
			if(!this._connectResizeColumnOff){
				connect.disconnect(this._connectOnGripMouseUp);
				this._connectOnGripMouseUp = null;
				this._connectResizeColumnOff = connect.connect(winUtil.doc, touch.release, this, "_resizeColumnOff");
			}

			var d = e.pageX - this._initX;
			if(d == 0){ return; }

			if(!(this._currentColumnWidth + d < this._currentMinCol ||
					this._nextColumnWidth - d < this._nextMinCol)){

				this._currentColumnWidth += d;
				this._nextColumnWidth -= d;
				this._initX = e.pageX;
				this._activeGrip.style.left = parseInt(this._activeGrip.style.left) + d + "px";

				if(this.liveResizeColumns){
					this._currentColumn.style["width"] = this._currentColumnWidth + "px";
					this._nextColumn.style["width"] = this._nextColumnWidth + "px";
					this.resize();
				}
			}
		},

		_resizeColumnOff: function(/*Event*/e){
			winUtil.body().style.cursor = "default";

			connect.disconnect(this._connectResizeColumnMove);
			connect.disconnect(this._connectResizeColumnOff);

			this._connectResizeColumnOff = this._connectResizeColumnMove = null;

			if(!this.liveResizeColumns){
				this._currentColumn.style["width"] = this._currentColumnWidth + "px";
				this._nextColumn.style["width"] = this._nextColumnWidth + "px";
				//this.resize();
			}

			var tabSize = [],
				testSize = [],
				tabWidth = this.gridContainerTable.clientWidth,
				node,
				update = false,
				i;

			for(i = 0; i < this._grid.length; i++){
				node = this._grid[i].node;
				if(has("ie")){
					tabSize[i] = domGeom.getMarginBox(node).w;
					testSize[i] = domGeom.getContentBox(node).w;
				}
				else{
					tabSize[i] = domGeom.getContentBox(node).w;
					testSize = tabSize;
				}
			}

			for(i = 0; i < testSize.length; i++){
				if(testSize[i] != this._oldTabSize[i]){
					update = true;
					break;
				}
			}

			if(update){
				var mul = has("ie") ? 100 : 10000;
				for(i = 0; i < this._grid.length; i++){
					this._grid[i].node.style.width = Math.round((100 * mul * tabSize[i]) / tabWidth) / mul + "%";
				}
				this.resize();
			}

			if(this._activeGrip){
				domClass.replace(this._activeGrip, "gridContainerGrip", "gridContainerGripShow");
			}

			this._isResized = false;
		},

		setColumns: function(/*Integer*/nbColumns){
			var z, j;
			if(nbColumns > 0){
				var length = this._grid.length,
					delta = length - nbColumns;
				if(delta > 0){
					var count = [], zone, start, end, nbChildren;
					// Check if right or left columns are fixed
					// Columns are not taken in account and can't be deleted
					if(this.mode == "right"){
						end = (this.isLeftFixed && length > 0) ? 1 : 0;
						start = (this.isRightFixed) ? length - 2 : length - 1
						for(z = start; z >= end; z--){
							nbChildren = 0;
							zone = this._grid[z].node;
							for(j = 0; j < zone.childNodes.length; j++){
								if(zone.childNodes[j].nodeType == 1 && !(zone.childNodes[j].id == "")){
									nbChildren++;
									break;
								}
							}
							if(nbChildren == 0){ count[count.length] = z; }
							if(count.length >= delta){
								this._deleteColumn(count);
								break;
							}
						}
						if(count.length < delta){
							connect.publish("/dojox/layout/gridContainer/noEmptyColumn", [this]);
						}
					}
					else{ // mode = "left"
						start = (this.isLeftFixed && length > 0) ? 1 : 0;
						end = (this.isRightFixed) ? length - 1 : length;
						for(z = start; z < end; z++){
							nbChildren = 0;
							zone = this._grid[z].node;
							for(j = 0; j < zone.childNodes.length; j++){
								if(zone.childNodes[j].nodeType == 1 && !(zone.childNodes[j].id == "")){
									nbChildren++;
									break;
								}
							}
							if(nbChildren == 0){ count[count.length] = z; }
							if(count.length >= delta){
								this._deleteColumn(count);
								break;
							}
						}
						if(count.length < delta){
							//Not enough empty columns
							connect.publish("/dojox/layout/gridContainer/noEmptyColumn", [this]);
						}
					}
				}
				else{
					if(delta < 0){ this._addColumn(Math.abs(delta)); }
				}
				if(this.hasResizableColumns){ this._placeGrips(); }
			}
		},

		_addColumn: function(/*Integer*/nbColumns){
			var grid = this._grid,
				dropZone,
				node,
				index,
				length,
				isRightMode = (this.mode == "right"),
				accept = this.acceptTypes.join(","),
				m = this._dragManager;

			//Add a grip to the last column
			if(this.hasResizableColumns && ((!this.isRightFixed && isRightMode)
				|| (this.isLeftFixed && !isRightMode && this.nbZones == 1) )){
				this._createGrip(grid.length - 1);
			}

			for(var i = 0; i < nbColumns; i++){
				// Fix CODEX defect #53025 :
				//		Apply acceptType attribute on each new column.
				node = domConstruct.create("div", {
					'class': "gridContainerZone dojoxDndArea" ,
					'accept': accept,
					columnIndex: i,
					'id': this.id + "_dz" + this.nbZones
				});

				length = grid.length;

				if(isRightMode){
					if(this.isRightFixed){
						index = length - 1;
						grid.splice(index, 0, {
							'node': grid[index].node.parentNode.insertBefore(node, grid[index].node)
						});
					}
					else{
						index = length;
						grid.push({ 'node': this.gridNode.appendChild(node) });
					}
				}
				else{
					if(this.isLeftFixed){
						index = (length == 1) ? 0 : 1;
						this._grid.splice(1, 0, {
							'node': this._grid[index].node.parentNode.appendChild(node, this._grid[index].node)
						});
						index = 1;
					}
					else{
						index = length - this.nbZones;
						this._grid.splice(index, 0, {
							'node': grid[index].node.parentNode.insertBefore(node, grid[index].node)
						});
					}
				}
				if(this.hasResizableColumns){
					//Add a grip to resize columns
					if((!isRightMode && this.nbZones != 1) ||
							(!isRightMode && this.nbZones == 1 && !this.isLeftFixed) ||
								(isRightMode && i < nbColumns-1) ||
									(isRightMode && i == nbColumns-1 && this.isRightFixed)){
						this._createGrip(index);
					}
				}
				// register tnbZoneshe new area into the areaManager
				m.registerByNode(grid[index].node);
				this.nbZones++;
			}
			this._updateColumnsWidth(m);
		},

		_deleteColumn: function(/*Array*/indices){
			var child, grid, index,
				nbDelZones = 0,
				length = indices.length,
				m = this._dragManager;
			for(var i = 0; i < length; i++){
				index = (this.mode == "right") ? indices[i] : indices[i] - nbDelZones;
				grid = this._grid[index];

				if(this.hasResizableColumns && grid.grip){
					array.forEach(grid.gripHandler, function(handler){
						connect.disconnect(handler);
					});
					domConstruct.destroy(this.domNode.removeChild(grid.grip));
					grid.grip = null;
				}

				m.unregister(grid.node);
				domConstruct.destroy(this.gridNode.removeChild(grid.node));
				this._grid.splice(index, 1);
				this.nbZones--;
				nbDelZones++;
			}

			// last grip
			var lastGrid = this._grid[this.nbZones-1];
			if(lastGrid.grip){
				array.forEach(lastGrid.gripHandler, connect.disconnect);
				domConstruct.destroy(this.domNode.removeChild(lastGrid.grip));
				lastGrid.grip = null;
			}

			this._updateColumnsWidth(m);
		},

		_updateColumnsWidth: function(/*Object*/ manager){
			this.inherited(arguments);
			manager._dropMode.updateAreas(manager._areaList);
		},

		destroy: function(){
			connect.unsubscribe(this._dropHandler);
			this.inherited(arguments);
		}
	});
	
	var _BorderContainer = declare("idx/layout/_BorderContainer", [BorderContainer], {
		//TODO
	});
	
	/**
	* @name idx/layout/FlipCardContainer
	* @class The FlipCardContainer provides a new grid like layout.
	*/ 
	return declare("idx/layout/FlipCardContainer", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin], {
	/**@lends idx/layout/FlipCardContainer*/ 
		templateString: template,
		
		baseClass: "idxFlipCardContainer",
		
		model: "edit", //"view", "edit"
		
		flipCardModelId: null,
		flipCardModelContent: null,
		
		// navList: [],
		// gridItemList: {},
		
		postMixInProperties: function(){
			// this._nlsResources = i18n.getLocalization("idx/layout", "FlipCardContainer");
			this.inherited(arguments);
			
			this.navListNodes = {};
			this.expandoContentPanes = {};
			this.gridContainerItemWidgets = {};
			this.currentNavigationItem = {};
			this.currentExpandoItem = {};
			this.previousItem = {};
			
			this.flipCardModelId = this.flipCardModelId || "flipCardModel_" + this.id;
			try{
				this.flipCardModelContent = this.flipCardModelContent || json.parse(this.storage("flipCardContent")) || {};
			}catch(e){
				this.flipCardModelContent = {};
			}
		},

		postCreate: function(){
			this.inherited(arguments);

			this.initNavigation();
			this.initGridItems();
			
			this.initContent();
		},
		
		initNavigation: function(){
			if(this.navList){
				array.forEach(this.navList, function(item){
					var parentNode = (item.type == "settings") ? this.navBarBottom : this.navBarTop;
					var handler = (item.type == "settings") ? this.handleNavigationSettings : this.handleNavigation;
					var itemNode = domConstruct.create("li", {
						className: "navItem"
					}, parentNode);
					var iconNode = domConstruct.create("img", {
						src: item.icon,
						title: item.title,
						className: "navItemIcon " + (item.iconClass || "")
					}, itemNode);
					this._trackMouseState(itemNode, "navItem");
					
					if(item.navDetail){
						var ecPane = new ContentPane({
							style: "display:none"
						}).placeAt(this.expandoNode.containerNode);
						domClass.add(ecPane.domNode, "expandoContentPane");
						
						var itemMenu = new Menu({}).placeAt(ecPane.containerNode);
						array.forEach(item.navDetail, function(mItem){
							if(mItem.type == "nav" || mItem.type == "settings"){
								var detailMenuItem = new MenuItem({label: mItem.title});
								itemMenu.addChild(detailMenuItem);
								this.own(on(detailMenuItem, touch.release, lang.hitch(this, handler, mItem)));
							}else if(mItem.type == "separator"){
								itemMenu.addChild(new MenuHeading({label: mItem.title}));
							}
						}, this);
						
						this.own(on(itemNode, touch.release, lang.hitch(this, this.handleNavigationExpando, item)));
						this.expandoContentPanes[item.id] = ecPane;
					}else{
						this.own(on(itemNode, touch.release, lang.hitch(this, handler, item)));
					}
					
					if(!this.initItemId){
						this.initItemId = item.id;
					}
					this.navListNodes[item.id] = itemNode;
					
					this.borderNode.startup();
				}, this);
				
				// this.navListStore = new Memory({data: this.navList});
			}
		},
		
		initGridItems: function(){
			if(_supportCSS3Animation){
				domClass.add(this.containerNode.domNode, "css3Animations");
			}
			
			//load from storage
			var loadFromStorage = !this.isObjectEmpty(this.flipCardModelContent) && !this.isObjectEmpty(this.flipCardModelContent[this.flipCardModelId]);
			for(var key in this.gridItemList){
				var item = this.gridItemList[key];
				
				if(has("phone_platform")){
					item.props.nbZones = 1;
					item.props.editDisabled = true;
				}
				if(loadFromStorage){
					item.props.isAutoOrganized = false;
				}
				var gridProps = lang.mixin({}, {
					gridId: key,
					nbZones: 3,
					minColWidth: 0,
					minChildWidth: 0,
					isAutoOrganized: true,
					hasResizableColumns: false,
					liveResizeColumns: false,
					acceptTypes: ["Portlet", "ContentPane"],
					editDisabled: (this.model == "view")
				}, item.props);
				var gridContainer = new _GridContainer(gridProps);
				domClass.add(gridContainer.domNode, "centerGridContainer");
				if(_supportCSS3Animation){
					domClass.add(gridContainer.domNode, "css3Animations");
				}
				
				var portletPosition = loadFromStorage ? this.flipCardModelContent[this.flipCardModelId][key] : {};
				array.forEach(item.items, function(gItem){
					var portletProps = lang.mixin({}, {
						itemName: gItem.name,
						toggleable: false,
						closable: false,
						dndType: "Portlet"
					}, gItem.props);
					var portletItem = new _PortletItem(portletProps); 
					domClass.add(portletItem.domNode, "portletItem");
					if(_supportCSS3Animation){
						domClass.add(portletItem.domNode, "css3Animations");
					}
					portletItem.rootContainer = this;
					portletItem.gridContainer = gridContainer;
					
					//content
					var mainProps = lang.mixin({}, {
						contentType: "main",
						toggleable: false,
						closable: false
					}, gItem.props.main_props);
					var mainContent = new _Portlet(mainProps);
					domClass.add(mainContent.domNode, "mainContent");
					var detailProps = lang.mixin({}, {
						contentType: "detail",
						toggleable: false,
						closable: false
					}, gItem.props.detail_props);
					var detailContent = new _Portlet(detailProps);
					domClass.add(detailContent.domNode, "detailContent");
					
					//portlet settings
					if(gItem.props.settings && this.model != "view"){
						var ms = gItem.props.settings.main_settings, ds = gItem.props.settings.detail_settings;
						if(ms){
							var type = ms.type || "normal";
							var settingsWidget = (type == "normal" ? _PortletSettings : _PortletDialogSettings);
							var settingsWidgetInstance = new settingsWidget({
								title: ms.title || "",
								content: ms.content || ""
							});
							mainContent.addChild(settingsWidgetInstance);
						}
						if(ds){
							var type = ds.type || "normal";
							var settingsWidget = (type == "normal" ? _PortletSettings : _PortletDialogSettings);
							var settingsWidgetInstance = new settingsWidget({
								title: ds.title || "",
								content: ds.content || ""
							});
							detailContent.addChild(settingsWidgetInstance);
						}
					}
					
					if(_supportCSS3Animation){
						domClass.add(mainContent.domNode, "css3Animations");
						domClass.add(detailContent.domNode, "css3Animations");
					}else{
						domStyle.set(detailContent.domNode, "display", "none");
					}
					
					portletItem.addChild(mainContent);
					portletItem.mainContent = mainContent;
					portletItem.addChild(detailContent);
					portletItem.detailContent = detailContent;
					
					//resizer
					if(gItem.props.itemResizable){
						var resizer = new _ResizeHandle({
							targetContainer: portletItem.containerNode,
							activeResize: true,
							resizeAxis: "xy"
						});
						domClass.add(resizer.domNode, "contentResizer");
						if(_supportCSS3Animation){
							domClass.add(resizer.domNode, "css3Animations");
						}
						portletItem.addChild(resizer);
						portletItem.resizer = resizer;
					}
					if(this.isObjectEmpty(portletPosition) || this.isObjectEmpty(portletPosition[gItem.name])){
						gridContainer.addChild(portletItem);
					}else{
						gridContainer.addChild(portletItem, portletPosition[gItem.name]["column"], portletPosition[gItem.name]["position"]);
					}
				}, this);
				this.containerNode.addChild(gridContainer);
				if(!_supportCSS3Animation){
					domStyle.set(gridContainer.domNode, "display", "none");
				}else{
					domClass.add(gridContainer.domNode, "centerGridFlipOut");
				}
				this.gridContainerItemWidgets[key] = gridContainer;
			}
		},
		
		initContent: function(){
			this.navListStore = new Memory({data: this.navList});
			var currentItem = this.navListStore.get(this.initItemId);
			this[currentItem.navDetail?"handleNavigationExpando":"handleNavigation"](currentItem);
		},
		
		handleNavigationExpando: function(item, e){
			var isSettings = (item.type == "settings");
			if(has("phone_platform")){
				this.expandoNode.setPreviewMode(true, isSettings);
			}else{
				this.expandoNode.setPreviewMode(isSettings, isSettings);
			}
			if(this.currentExpandoItem.id == item.id){
				this.expandoNode.toggle();
			}else{
				this.currentExpandoItem = item;
				if(this.expandoNode._showing){
					this.expandoNode.toggle();
				}
				for(var ecPaneId in this.expandoContentPanes){
					var ecPane = this.expandoContentPanes[ecPaneId];
					domStyle.set(ecPane.domNode, "display", "none");
				}
				if(this.expandoContentPanes[item.id]){
					domStyle.set(this.expandoContentPanes[item.id].domNode, "display", "");
					this.expandoNode.set("title", item.title || item.name);
					this.expandoNode.toggle();
				}
			}
		},
		
		handleNavigation: function(item, e){
			if(this.currentNavigationItem.id == item.id || !this.gridContainerItemWidgets[item.id]){
				return;
			}else{
				if(this.animating){return;}
				this.animating = true;
				this.currentNavigationItem = item;
				if(this.expandoNode._showing){
					this.expandoNode.toggle();
				}
				//hide all content
				for(var gItemId in this.gridContainerItemWidgets){
					var gridItemWidget = this.gridContainerItemWidgets[gItemId];
					if(!_supportCSS3Animation){
						domStyle.set(gridItemWidget.domNode, "display", "none");
					}else{
						domClass.remove(gridItemWidget.domNode, "centerGridFlipIn");
					}
				}
				if(this.gridContainerItemWidgets[item.id]){
					if(!_supportCSS3Animation){
						var anim = flip["flipCube"]({ 
							node: this.containerNode.domNode,
							dir: "right",
							depth: .5,
							duration: 1000
						});
						connect.connect(anim, "onEnd", this, function(){ 
							domStyle.set(this.gridContainerItemWidgets[item.id].domNode, "display", "");
							this.animating = false;
						});
						anim.play();
						e && event.stop(e);
					}else{
						domClass.add(this.gridContainerItemWidgets[item.id].domNode, "centerGridFlipIn");
						this.animating = false;
					}
					this.gridContainerItemWidgets[item.id].startup();
					this.borderNode.startup();
				}
			}
		},
		
		handleNavigationSettings: function(item, e){
			if(item.id == "save"){
				this.saveFlipCard();
			}else if(lang.isFunction(item.clickHandler)){
				item.clickHandler.apply(this, arguments);
			}else{
				alert(item.title + " Configuration");
			}
		},
		
		saveFlipCard: function(){
			var saveContent = this.getLayoutContent();
			this.storage("flipCardContent", saveContent);
			alert("Saved Successfully!");
		},
		
		getLayoutContent: function(){
			this.flipCardModelContent[this.flipCardModelId] = {};
			for(var gcKey in this.gridContainerItemWidgets){
				var gcItem = this.gridContainerItemWidgets[gcKey];
				this.flipCardModelContent[this.flipCardModelId][gcKey] = {};
				array.forEach(gcItem.getChildren(), lang.hitch(this, function(pItem){
					this.flipCardModelContent[this.flipCardModelId][gcKey][pItem["itemName"]] 
						= {column: pItem.get("column"), position: this.getItemPosIndex(pItem)};
				}));
			}
			return json.stringify(this.flipCardModelContent);
		},
		
		getItemPosIndex: function(item){
			var node = item.domNode, position = 0;
			while(node.previousSibling){
				position++;
				node = node.previousSibling;
			}
			item.set("position", position);
			return position;
		},
		
		storage: function(key, value){
			if(value){
				if(localStorage){
					localStorage.setItem(key, value);
				}else{
					cookie(key, value, {expires: 999 });
				}
			}else{
				if(localStorage){
					return localStorage.getItem(key);
				}else{
					return cookie(key);
				}
			}
		},
		
		isObjectEmpty: function(obj){
			if(obj){
				for(var p in obj){
					return false;
				}
				return true;
			}else{
				return true;
			}
		}
	
	});
});