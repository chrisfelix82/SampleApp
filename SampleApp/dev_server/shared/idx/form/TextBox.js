/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/string",
	"dojo/dom-style",
	"dojo/fx",
	"dijit/form/TextBox",
	"dijit/form/ValidationTextBox",
	"idx/widget/HoverHelpTooltip",
	"./_CssStateMixin",
	"./_CompositeMixin",
	"dojo/text!./templates/TextBox.html"
], function(declare, lang, string, domStyle, fx, TextBox, ValidationTextBox, HoverHelpTooltip, _CssStateMixin, _CompositeMixin, template){
	var iForm = lang.getObject("idx.oneui.form", true); // for backward compatibility with IDX 1.2
	
    /**
	 * @name idx.form.TextBox
	 * @class One UI version.
	 */
	 
	return iForm.TextBox = declare("idx.form.TextBox", [ValidationTextBox, _CompositeMixin, _CssStateMixin], {
		/**@lends idx.form.TextBox*/
		
		// summary:
		//		Base class for textbox widgets with the ability to validate content of various types and provide user feedback.
		// tags:
		//		protected

		// instantValidate: Boolean
		//		Fire validation when widget get input by set true, 
		//		fire validation when widget get blur by set false
		instantValidate: false,
		
		
		templateString: template,
		baseClass: "idxTextBoxWrap",
		oneuiBaseClass: "dijitTextBox dijitValidationTextBox",
		/**
		 * Deprecated, use "help" instead
		 */
		hoverHelpMessage: "",

		postCreate: function() {
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
		},
		/**
		 * deprecated, 
		 * @param {string | number} width 
		 * Unit of "pt","em","px" will be normalized to "px", and "px" by default for numeral value.
		 */
		_setHoverHelpMessageAttr: function(message){
			this.set("help", message);
		}
	});
});
