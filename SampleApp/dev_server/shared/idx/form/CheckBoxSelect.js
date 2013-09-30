/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/has",
	"dojo/_base/kernel",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/event",
	"dojo/_base/window",
	"dojo/query",
	"dojo/keys",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/dom-geometry",
	"dojo/i18n",
	"dijit/form/_FormSelectWidget",
	"dijit/form/_FormValueWidget",
	"dijit/_HasDropDown",
	"dijit/MenuSeparator",
	"../util",
	"./_CssStateMixin",
	"./_CheckBoxSelectMenu",
	"./_CheckBoxSelectMenuItem",
	"./_CompositeMixin",
	"./_ValidationMixin",	
	"./_FormSelectWidgetA11yMixin",
	"dojo/has!dojo-bidi?../bidi/form/CheckBoxSelect",
	"dojo/text!./templates/CheckBoxSelect.html",
	"dojo/i18n!./nls/CheckBoxSelect",
	"dojox/html/ellipsis"
], function(declare, has, kernel, lang, array, event, win, query, keys, domConstruct, domAttr, domClass, domStyle, domGeom,
			i18n, _FormSelectWidget, _FormValueWidget, _HasDropDown, MenuSeparator, iUtil, _CssStateMixin, _CheckBoxSelectMenu,
			_CheckBoxSelectMenuItem, _CompositeMixin, _ValidationMixin,_FormSelectWidgetA11yMixin, bidiExtension, template, checkBoxSelectNls){
	var baseClassName = has("dojo-bidi")? "idx.form.CheckBoxSelect_" : "idx.form.CheckBoxSelect";
	var iForm = lang.getObject("idx.oneui.form", true); // for backward compatibility with IDX 1.2
	
	/**
	 * @name idx.form.CheckBoxSelect
	 * @class idx.form.CheckBoxSelect is a composite widget which looks like a drop down version multi select control.
	 * CheckBoxSelect can be created in the same way of creating a dijit.form.Select control.
	 * The only difference is that more than one options can be marked as selected. 
	 * As a composite widget, it also provides following features:
	 * <ul>
	 * <li>Built-in label</li>
	 * <li>Built-in label positioning</li>
	 * <li>Built-in required attribute</li>
	 * <li>One UI theme support</li>
	 * </ul>
	 * @augments dijit._HasDropDown
	 * @augments idx.form._CssStateMixin
	 * @augments idx.form._CompositeMixin
	 * @augments idx.form._ValidationMixin
	 * @example Programmatic:
	 *	new idx.form.CheckBoxSelect({
	 *	options: [
	 *			{ label: 'foo', value: 'foo', selected: true },
	 *			{ label: 'bar', value: 'bar' },
	 *		]
	 *	});
	 *	
	 *Declarative:
	 *	&lt;select jsId="cbs" data-dojo-type="oneui.form.CheckBoxSelect" data-dojo-props='
	 *		name="cbs", label="CheckBoxSelect:", value="foo"'>
	 *		&lt;option value="foo">foo</option>
	 *		&lt;option value="bar">bar</option>
	 *	&lt;/select>
	 *	
	 *Store Based:
	 *	var data = {
	 *		identifier: "value",
	 *		label: "label",
	 *		items: [
	 *			{value: "AL", label: "Alabama"},
	 *			{value: "AK", label: "Alaska"}
	 *		]
	 *	};
	 *	var readStore = new dojo.data.ItemFileReadStore({data: data});
	 *	var cbs = new idx.form.CheckBoxSelect({
	 *		store: readStore
	 *	});
	 */
	iForm.CheckBoxSelect = declare(baseClassName, [_FormSelectWidget, _HasDropDown, _CssStateMixin, _CompositeMixin, _ValidationMixin,_FormSelectWidgetA11yMixin],
	/**@lends idx.form.CheckBoxSelect.prototype*/
	{
		// summary:
		//		A multi select control with check boxes.
		
		baseClass: "idxCheckBoxSelectWrap",
		
		oneuiBaseClass: "idxCheckBoxSelect dijitSelect",
		
		multiple: true,
		
		maxHeight: -1,//To show the dropdown according the window height
		
		instantValidate: true,
		
		/**
		 * Separator for the select button label.
		 * @type String
		 * @default ", "
		 */
		labelSeparator: ", ",
		
		cssStateNodes: {
			"titleNode": "dijitDownArrowButton"
		},
		
		templateString: template,
		
		// attributeMap: Object
		//		Add in our style to be applied to the focus node
		attributeMap: lang.mixin(lang.clone(_FormSelectWidget.prototype.attributeMap),{style:"tableNode"}),
	
		// required: Boolean
		//		Can be true or false, default is false.
		required: false,
	
		// state: String
		//		Shows current state (ie, validation result) of input (Normal, Warning, or Error)
		state: "",
	
		// message: String
		//		Currently displayed error/prompt message
		message: "",
	
		//	tooltipPosition: String[]
		//		See description of dijit.Tooltip.defaultPosition for details on this parameter.
		tooltipPosition: [],
	
		// emptyLabel: string
		//		What to display in an "empty" dropdown
		emptyLabel: "&nbsp;",
	
		// _isLoaded: Boolean
		//		Whether or not we have been loaded
		_isLoaded: false,
	
		// _childrenLoaded: Boolean
		//		Whether or not our children have been loaded
		_childrenLoaded: false,
		
		postMixInProperties: function(){
			this._nlsResources = checkBoxSelectNls;
			this.missingMessage || (this.missingMessage = this._nlsResources.missingMessage);
			this.inherited(arguments);
		},
		
		_fillContent: function(){
			// summary:
			//		Overwrite dijit.form._FormSelectWidget._fillContent to fix a typo 
			var opts = this.options;
			if(!opts){
				opts = this.options = this.srcNodeRef ? query("> *",
							this.srcNodeRef).map(function(node){
								if(node.getAttribute("type") === "separator"){
									return { value: "", label: "", selected: false, disabled: false };
								}
								return {
									value: (node.getAttribute("data-" + kernel._scopeName + "-value") || node.getAttribute("value")),
											label: String(node.innerHTML),
									// FIXME: disabled and selected are not valid on complex markup children (which is why we're
									// looking for data-dojo-value above.  perhaps we should data-dojo-props="" this whole thing?)
									// decide before 1.6
									selected: node.getAttribute("selected") || false,
									disabled: node.getAttribute("disabled") || false
								};
							}, this) : [];
			}
			if(!this.value){
				this._set("value", this._getValueFromOpts());
			}else if(this.multiple && typeof this.value == "string"){
				this._set("value", this.value.split(","));
			}
			
			// Create the dropDown widget
			this.dropDown = new _CheckBoxSelectMenu({id: this.id + "_menu"});
		},
		
		_getValueFromOpts: function(){
			// summary:
			//		Returns the value of the widget by reading the options for
			//		the selected flag
			var opts = this.getOptions() || [];
			// Set value to be the sum of all selected
			return array.map(array.filter(opts, function(i){
				return i.selected && i.selected !== "false";
			}), function(i){
				return i.value;
			}) || [];
		},
		
		postCreate: function(){
			// summary:
			//		stop mousemove from selecting text on IE to be consistent with other browsers
			
			this._event = {
				"input" : "onChange",
				"blur" 	: "_onBlur",
				"focus" : "_onFocus"
			};
			
			this.inherited(arguments);
			this.connect(this.domNode, "onmousemove", event.stop);
			this._resize();
		},

		startup: function(){
			// summary:
			// 		functions about sizing when widget completly created
			//		sizing calculations should not called in postCreate 
			
			this.inherited(arguments);
			this._resize();			
		},
		resize: function(){
			if (iUtil.isPercentage(this._styleWidth)) {
				domStyle.set(this.containerNode, "width","");
			}
			this.inherited(arguments);
		},
		_resize: function(){
			if (this._deferResize()) return;			
			domStyle.set(this.containerNode, "width","");
			this.inherited(arguments);
			
			if(this.oneuiBaseNode.style.width){
				var styleSettingWidth = this.oneuiBaseNode.style.width,
					contentBoxWidth = domGeom.getContentBox(this.oneuiBaseNode).w;
				if ( styleSettingWidth.indexOf("px") || dojo.isNumber(styleSettingWidth) ){
					styleSettingWidth = parseInt(styleSettingWidth);
					contentBoxWidth = ( styleSettingWidth < contentBoxWidth || contentBoxWidth <= 0 )? styleSettingWidth : contentBoxWidth;
				}
					
				domStyle.set(this.containerNode, "width", contentBoxWidth - 40 + "px");
			}
			
		},
		
		setStore: function(store, selectedValue, fetchArgs){
			// summary:
			//		If there is any items selected in the store, the value
			//		of the widget will be set to the values of these items.
			this.inherited(arguments);
			var setSelectedItems = function(items){
				var value = array.map(items, function(item){ return item.value[0]; });
				if(value.length){
					this.set("value", value);
				}
			};
			this.store.fetch({query:{selected: true}, onComplete: setSelectedItems, scope: this});
		},
		
		_getMenuItemForOption: function(/*dijit.form.__SelectOption*/ option){
			// summary:
			//		For the given option, return the menu item that should be
			//		used to display it.  This can be overridden as needed
			if(!option.value && !option.label){
				// We are a separator (no label set for it)
				return new MenuSeparator();
			}else{
				// Just a regular menu option
				var click = lang.hitch(this, "_updateValue");
				var item = new _CheckBoxSelectMenuItem({
					parent: this,
					option: option,
					label: option.label || this.emptyLabel,
					onClick: click,
					checked: option.selected || false,
					readOnly: this.readOnly || false,
					disabled: this.disabled || false
				});
				return item;
			}
		},
		
		_addOptionItem: function(/*dijit.form.__SelectOption*/ option){
			// summary:
			//		For the given option, add an option to our dropdown.
			//		If the option doesn't have a value, then a separator is added
			//		in that place.
			if(this.dropDown){
				this.dropDown.addChild(this._getMenuItemForOption(option));
			}
		},
		
		_getChildren: function(){
			if(!this.dropDown){
				return [];
			}
			return this.dropDown.getChildren();
		},
		
		_loadChildren: function(/*Boolean*/ loadMenuItems){
			// summary:
			//		Resets the menu and the length attribute of the button - and
			//		ensures that the label is appropriately set.
			//	loadMenuItems: Boolean
			//		actually loads the child menu items - we only do this when we are
			//		populating for showing the dropdown.
			
			if(loadMenuItems === true){
				// this.inherited destroys this.dropDown's child widgets (MenuItems).
				// Avoid this.dropDown (Menu widget) having a pointer to a destroyed widget (which will cause
				// issues later in _setSelected). (see #10296)
				if(this.dropDown){
					delete this.dropDown.focusedChild;
				}
				if(this.options.length){
					this.inherited(arguments);
				}else{
					// Drop down menu is blank but add one blank entry just so something appears on the screen
					// to let users know that they are no choices (mimicing native select behavior)
					array.forEach(this._getChildren(), function(child){ child.destroyRecursive(); });
				}
			}else{
				this._updateSelection();
			}
			
			this._isLoaded = false;
			this._childrenLoaded = true;
			
			if(!this._loadingStore){
				// Don't call this if we are loading - since we will handle it later
				this._setValueAttr(this.value);
			}
		},
		
		_updateValue: function(){
			this.set("value", this._getValueFromOpts());
		},
		
		/**
		 * Event triggered when the widget value changes.
		 */
		onChange: function(newValue){
			// summary:
			//		Hook function
		},
		
		/**
		 * Reset the value of the widget.
		 */
		reset: function(){
			// summary:
			//		Overridden so that the state will be cleared.
			this.inherited(arguments);
			this._set("state", "");
			this._set("message", "");
		},
		
		_setDisplay: function(/*String*/ newDisplay){
			// summary:
			//		sets the display for the given value (or values)
			var length = 0;
			var label;
			if(lang.isArray(newDisplay)){
				length = newDisplay.length;
			}else{
				length = newDisplay ? 1 : 0;
			}
			label = length ? newDisplay.join(this.labelSeparator) : (this.placeHolder || "");
			
			// NOTE(bcaceres): I rewrote this section to avoid using "innerHTML" so that we
			// would not need to escape elements of the label to avoid issues with attributes
			// in the span tag or in the child text
			var spanAttrs = {"role": "option"};
			if(this.fieldWidth){
				spanAttrs["title"] = label ;
			}
			
			var span = domConstruct.create("span", spanAttrs, this.containerNode, "only");
			domClass.add(span, "dijitReset");
			domClass.add(span, "dijitInline");
			if (this.fieldWidth) domClass.add(span, "dojoxEllipsis");
			domClass.add(span, this.baseClass + "Label");
						  
			var labelTextNode = win.doc.createTextNode(label);
			domConstruct.place(labelTextNode, span, "first");	
		},
		
		_setValueAttr: function(/*anything*/ newValue, /*Boolean?*/ priorityChange){
			// summary:
			//		set the value of the widget.
			//		If a string is passed, then we set our value from looking it up.
			if(!this._onChangeActive){ priorityChange = null; }
			if(this._loadingStore){
				// Our store is loading - so save our value, and we'll set it when
				// we're done
				this._pendingValue = newValue;
				return;
			}
			var opts = this.getOptions() || [];
			if(!lang.isArray(newValue)){
				newValue = [newValue];
			}
			array.forEach(newValue, function(i, idx){
				if(!lang.isObject(i)){
					i = i + "";
				}
				if(typeof i === "string"){
					newValue[idx] = array.filter(opts, function(node){
						return node.value === i;
					})[0] || {value: "", label: ""};
				}
			}, this);

			// Make sure some sane default is set
			newValue = array.filter(newValue, function(i){ return i && i.value; });
			if(!this.multiple && (!newValue[0] || !newValue[0].value) && opts.length){
				newValue[0] = opts[0];
			}
			array.forEach(opts, function(i){
				i.selected = array.some(newValue, function(v){ return v.value === i.value; });
			});
			var	val = array.map(newValue, function(i){ return i.value; }),
				disp = array.map(newValue, function(i){ return i.label; });
			
			this._setDisplay(this.multiple ? disp : disp[0]);
			if(typeof val == "undefined"){ return; } // not fully initialized yet or a failed value lookup
			_FormValueWidget.prototype._setValueAttr.apply(this, arguments);
			this._updateSelection();
		},
		
		_setPlaceHolderAttr: null,
		
		isLoaded: function(){
			return this._isLoaded;
		},
		
		loadDropDown: function(/*Function*/ loadCallback){
			// summary:
			//		populates the menu
			this._loadChildren(true);
			this._isLoaded = true;
			loadCallback();
		},
		
		/**
		 * Close the drop down menu.
		 */
		closeDropDown: function(){
			// overriding _HasDropDown.closeDropDown()
			this.inherited(arguments);
			
			if(this.dropDown && this.dropDown.menuTableNode){
				// Erase possible width: 100% setting from _SelectMenu.resize().
				// Leaving it would interfere with the next openDropDown() call, which
				// queries the natural size of the drop down.
				this.dropDown.menuTableNode.style.width = "";
			}
		},
		
		/**
		 * Invert the selection. Using the parameter onChange to indicate whether
		 * onChange event should be fired.
		 * @param {Boolean} onChange
		 */
		invertSelection: function(onChange){
			// summary: Invert the selection
			// onChange: Boolean
			//		If null, onChange is not fired.
			array.forEach(this.options, function(i){
				i.selected = !i.selected;
			});
			this._updateSelection();
			this._updateValue();
		},
		
		_updateSelection: function(){
			this.inherited(arguments);
			this._handleOnChange(this.value);
			array.forEach(this._getChildren(), function(item){ 
				item._updateBox(); 
			});
		},
		
		_setDisabledAttr: function(value){
			// summary:
			//		Disable (or enable) all the children as well
			this.inherited(arguments);
			array.forEach(this._getChildren(), function(node){
				if(node && node.set){
					node.set("disabled", value);
				}
			});
		},
		
		_setReadOnlyAttr: function(value){
			// summary:
			//		Sets read only (or unsets) all the children as well
			this.inherited(arguments);
			array.forEach(this._getChildren(), function(node){
				if(node && node.set){
					node.set("readOnly", value);
				}
			});
		},
		
		_isEmpty: function(){
			// summary:
			// 		Checks for whitespace. Should be overridden.
			return !array.some(this.getOptions(), function(opt){
				return opt.selected && opt.value != null && opt.value.toString().length != 0;
			});
		},
		
		_setLabelAttr: function(/*String*/ label){
			this.inherited(arguments);
			this.focusNode.setAttribute("aria-labelledby", this.id + "_label");
		},
		
		_onDropDownMouseDown: function(/*Event*/ e){
			// summary:
			//		Overwrite dijit._HasDropDown._onDropDownMouseDown
			//		Open the drop down menu when readOnly is true.
	
			if(this.disabled){ return; }
	
			event.stop(e);
	
			this._docHandler = this.connect(win.doc, "onmouseup", "_onDropDownMouseUp");
	
			this.toggleDropDown();
		},
		
		/**
		 * Toggle the drop down menu.
		 */
		toggleDropDown: function(){
			// summary:
			//		Overwrite dijit._HasDropDown.toggleDropDown
			//		Open the drop down menu when readOnly is true.
	
			if(this.disabled){ return; }
			if(!this._opened){
				// If we aren't loaded, load it first so there isn't a flicker
				if(!this.isLoaded()){
					this.loadDropDown(lang.hitch(this, "openDropDown"));
					return;
				}else{
					this.openDropDown();
				}
			}else{
				this.closeDropDown();
			}
		},
		
		_onKey: function(/*Event*/ e){
			// summary:
			//		Overwrite dijit._HasDropDown._onKey
			//		Open the drop down menu when readOnly is true.
	
			if(this.disabled){ return; }
	
			var d = this.dropDown, target = e.target;
			if(d && this._opened && d.handleKey){
				if(d.handleKey(e) === false){
					/* false return code means that the drop down handled the key */
					event.stop(e);
					return;
				}
			}
			if(d && this._opened && e.keyCode == keys.ESCAPE){
				this.closeDropDown();
				event.stop(e);
			}else if(!this._opened &&
					(e.keyCode == keys.DOWN_ARROW ||
						( (e.keyCode == keys.ENTER || e.keyCode == " ") &&
						  //ignore enter and space if the event is for a text input
						  ((target.tagName || "").toLowerCase() !== 'input' ||
						     (target.type && target.type.toLowerCase() !== 'text'))))){
				// Toggle the drop down, but wait until keyup so that the drop down doesn't
				// get a stray keyup event, or in the case of key-repeat (because user held
				// down key for too long), stray keydown events
				this._toggleOnKeyUp = true;
				event.stop(e);
			}
		},
		
		_setDisabledAttr: function(){
			this.inherited(arguments);
			this._refreshState();
		},
		
		uninitialize: function(preserveDom){
			if(this.dropDown && !this.dropDown._destroyed){
				this.dropDown.destroyRecursive(preserveDom);
				delete this.dropDown;
			}
			this.inherited(arguments);
		}
	});
	return has("dojo-bidi")? declare("idx.form.CheckBoxSelect",[iForm.CheckBoxSelect,bidiExtension]) : iForm.CheckBoxSelect;
});