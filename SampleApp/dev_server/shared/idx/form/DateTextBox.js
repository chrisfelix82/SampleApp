/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"dijit/Calendar",
	"idx/widget/HoverHelpTooltip",
	"./_CssStateMixin",
	"./_DateTimeTextBox",
	"./_CompositeMixin",
	"dojo/text!./templates/DropDownBox.html"
], function(declare, lang, domStyle, domClass, domConstruct, domAttr, Calendar, HoverHelpTooltip, 
			_CssStateMixin, _DateTimeTextBox, _CompositeMixin, template){
	var oneuiForm = lang.getObject("idx.oneui.form", true); // for backward compatibility with IDX 1.2
	var iForm = lang.getObject("idx.form", true);
	
	// module:
	//		idx/form/DateTextBox
	// summary:
	//		A validating, serializable, range-bound date text box with a drop down calendar

	/**
	* @name idx.form.DateTextBox
	* @class A validating, serializable, range-bound date text box with a drop down calendar
	* @augments idx.form._DateTimeTextBox
	* @augments idx.form._CompositeMixin
	* @augments idx.form._CssStateMixin
	*/ 
	return iForm.DatePicker = oneuiForm.DateTextBox = declare("idx.form.DateTextBox", [_DateTimeTextBox, _CompositeMixin, _CssStateMixin], {
	/**@lends idx.form.DateTextBox*/ 
		// summary:
		//		A validating, serializable, range-bound date text box with a drop down calendar
		//
		//		Example:
		// |	new dijit.form.DateTextBox({value: new Date(2009, 0, 20)})
		//
		//		Example:
		// |	<input dojotype='dijit.form.DateTextBox' value='2009-01-20'>

		// instantValidate: Boolean
		//		Fire validation when widget get input by set true, 
		//		fire validation when widget get blur by set false
		instantValidate: false,
		/**
		* base class of this oneui widget
		*/
		baseClass: "idxDateTextBoxWrap",
		/**
		* base class of dijit widget
		*/
		oneuiBaseClass: "dijitTextBox dijitComboBox dijitDateTextBox",
		popupClass: "dijit.Calendar",
		_selector: "date",
		templateString: template,
		
		// value: Date
		//		The value of this widget as a JavaScript Date object, with only year/month/day specified.
		//		If specified in markup, use the format specified in `dojo.date.stamp.fromISOString`.
		//		set("value", ...) accepts either a Date object or a string.
		value: new Date(""),// value.toString()="NaN"
		
		showPickerIcon: false,
		
		/** @ignore */
		postCreate: function(){
			this.inherited(arguments);
			if(this.instantValidate){
				this.connect(this, "_onFocus", function(){
					if (this._hasBeenBlurred && (!this._refocusing)) {
						this.validate(true);
					}
				});
				this.connect(this, "_onInput", function(){
					this.validate(true);
				});
			}else{
				this.connect(this, "_onFocus", function(){
					if (this.message && this._hasBeenBlurred && (!this._refocusing)) {
						this.displayMessage(this.message);
					}
				})
			}
			
			//domAttr.set(this.oneuiBaseNode, "title", this.iconTitle || this._nlsResources.idxDateIconTitle || "Click to open date picker");
			
			if(this.showPickerIcon){
				var iconNode = domConstruct.create("div", {
					title: this.iconTitle || this._nlsResources.idxDateIconTitle || "Click to open date picker",
					//tabIndex: 0,
					className: "dijitInline idxPickerIconLink"
				}, this.oneuiBaseNode);
				
				var iconImage = domConstruct.create("img", {
					alt: this.iconAlt || this._nlsResources.idxDateIconTitle || "Click to open date picker",
					className: "idxPickerIcon idxCalendarIcon",
					src: this._blankGif
				}, iconNode);
				
				domStyle.set(this.oneuiBaseNode, "position", "relative");
			}
			this._resize();
		},
		/**
		 * Provides a method to return focus to the widget without triggering
		 * revalidation.  This is typically called when the validation tooltip
		 * is closed.
		 */
		refocus: function() {
			this._refocusing = true;
			this.focus();
			this._refocusing = false;
		},
		/**
		* Overridable method to display validation errors/hints
		*/
		displayMessage: function(/*String*/ message, /*Boolean*/ force){
			if(message){
				if(!this.messageTooltip){
					this.messageTooltip = new HoverHelpTooltip({
						connectId: [this.iconNode],
						label: message,
						position: this.tooltipPosition,
						forceFocus: false
					});
				}else{
					this.messageTooltip.set("label", message);
				}
				if(this.focused || force){
					var node = domStyle.get(this.iconNode, "visibility") == "hidden" ? this.oneuiBaseNode : this.iconNode;
					this.messageTooltip.open(node);
				}
			}else{
				this.messageTooltip && this.messageTooltip.close();
			}
		}
	});
});
