/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/sniff",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-style",
	"dijit/form/_FormSelectWidget",
	"dijit/_Container",
	"./_CssStateMixin",
	"./_CompositeMixin",
	"./_ValidationMixin",
	"./_InputListMixin",
	"./_CheckBoxListItem",
	"idx/widget/HoverHelpTooltip",
	"dojo/text!./templates/CheckBoxList.html"
], function(declare, lang, array, has, domAttr, domClass, domStyle, _FormSelectWidget, _Container, _CssStateMixin, _CompositeMixin, _ValidationMixin, _InputListMixin, _CheckBoxListItem, HoverHelpTooltip, template){
	var iForm = lang.getObject("idx.oneui.form", true); // for backward compatibility with IDX 1.2
	
	/**
	 * @name idx.form.CheckBoxList
	 * @class idx.form.CheckBoxList is a composit widget which consists of a group of checkboxes.
	 * CheckBoxList can be created in the same way of creating a dijit.form.Select control.
	 * The only difference is that more than one options can be marked as selected. 
	 * NOTE: The "startup" method should be called after a CheckBoxList is created in Javascript.
	 * In order to get the value of the checkboxes, you don't need to invoke the get("value") method of
	 * each checkbox anymore, but simply call get("value") method of the CheckBoxList.
	 * As a composite widget, it also provides following features:
	 * <ul>
	 * <li>Built-in label</li>
	 * <li>Built-in label positioning</li>
	 * <li>Built-in required attribute</li>
	 * <li>One UI theme support</li>
	 * </ul>
	 * @augments dijit.form._FormSelectWidget
	 * @augments dijit._Container
	 * @augments idx.form._CssStateMixin
	 * @augments idx.form._CompositeMixin
	 * @augments idx.form._ValidationMixin
	 * @augments idx.form._InputListMixin
	 * @example Programmatic:
	 *	new idx.form.CheckBoxList({
	 *	options: [
	 *			{ label: 'foo', value: 'foo', selected: true },
	 *			{ label: 'bar', value: 'bar' },
	 *		]
	 *	});
	 *	
	 *Declarative:
	 *	&lt;select jsId="cbl" data-dojo-type="oneui.form.CheckBoxList" data-dojo-props='
	 *		name="cbl", label="CheckBoxList:", value="foo"'>
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
	 *	var cbl = new idx.form.CheckBoxList({
	 *		store: readStore
	 *	});
	 */
	return iForm.CheckBoxList = declare("idx.form.CheckBoxList", [_FormSelectWidget, _Container, _CssStateMixin, _CompositeMixin, _ValidationMixin, _InputListMixin],
	/**@lends idx.form.CheckBoxList.prototype*/
	{
		
		templateString: template,
		
		instantValidate: false,
		
		baseClass: "idxCheckBoxListWrap",
		
		oneuiBaseClass: "idxCheckBoxList",
		
		multiple: true,
		
		checkBoxListItems: [],
		
		postCreate: function(){
			this.inherited(arguments);
			this._resize();
		},
		_addOptionItem: function(/* dojox.form.__SelectOption */ option){
			var item = new _CheckBoxListItem({
				_inputId: this.id + "_CheckItem" + array.indexOf(this.options, option),
				option: option,
				disabled: option.disabled || this.disabled || false,
				readOnly: option.readOnly || this.readOnly || false,
				parent: this
			});
			domClass.toggle(item.domNode, "dijitInline", !(this.groupAlignment == "vertical"));
			this.addChild(item);
			this.checkBoxListItems.push(item);
			// IE8 standard document mode has a bug that we have to re-layout the dom
			// to make it occupy the space correctly.
			if(has("ie") > 7 && !has("quirks")) this._relayout(this.domNode);
			this.onAfterAddOptionItem(item, option);
		},
		
		_setNameAttr: function(value){
			this._set("name", value);
			domAttr.set(this.valueNode, "name", value);
		},
		
		_onBlur: function(evt){
			this.mouseFocus = false;
			this.inherited(arguments);
			if(!this.instantValidate){this.validate();}
		},
		
		/**
		 * Multiple set false in CheckBoxList
		 * Single Selection
		 * @param {option} Object
		 */
		getValueFromOpts: function(/*Object*/ option){
			if ( !this.multiple && option ){
				if (option.selected)
					return [option.value];
				else 
					return [];
			}
			else 
				return this._getValueFromOpts()
		},
		
		_setDisabledAttr: function(){
			this.inherited(arguments);
			var value = this.disabled;
			array.forEach(this.options, function(option){
				if( option ){
					option.disabled = value;
				}
			});
			
			this._refreshState();
		},
		
		destroy: function(){
			this.inherited(arguments);
			for ( var index = 0; index < this.checkBoxListItems.length; index++){
				var item = this.checkBoxListItems[index];
				item.destroy();
			}
			this.checkBoxListItems.length = 0;
		},
		_errorIconWidth: 45
	});
});