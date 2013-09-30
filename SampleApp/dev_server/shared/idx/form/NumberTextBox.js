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
	"dijit/form/NumberTextBox",
	"idx/widget/HoverHelpTooltip",
	"./_CssStateMixin",
	"./_CompositeMixin",
	"dojo/text!./templates/TextBox.html"
], function(declare, lang, domStyle, NumberTextBox, HoverHelpTooltip, _CssStateMixin, _CompositeMixin, template) {
	var iForm = lang.getObject("idx.oneui.form", true); // for backward compatibility with IDX 1.2
	
    /**
	 * @name idx.form.NumberTextBox
	 * @class idx.form.NumberTextBox is a composite widget which enhanced dijit.form.NumberTextBox with following features:
	 * <ul>
	 * <li>Built-in label</li>
	 * <li>Built-in label positioning</li>
	 * <li>Built-in input hint</li>
	 * <li>Built-in input hint postioning</li>
	 * <li>Built-in 'required' attribute</li>
	 * <li>IBM One UI theme supporting</li>
	 * </ul>
	 * @augments dijit.form.NumberTextBox
	 * @augments idx.form._CompositeMixin
	 * @augments idx.form._CssStateMixin
	 * @example Number range bound:
	 * Minimum/maximum:
	 * To specify a field between 0 and 120:
	 * 		{min:0,max:120}
	 * To specify a field that must be an integer:
	 * 		{fractional:false}
	 * To specify a field where 0 to 3 decimal places are allowed on input:
	 * 		{places:'0,3'}
	 */


/*=====
dojo.declare(
	"dijit.form.NumberTextBox.__Constraints",
	[dijit.form.RangeBoundTextBox.__Constraints, dojo.number.__FormatOptions, dojo.number.__ParseOptions], {
	// summary:
	//		Specifies both the rules on valid/invalid values (minimum, maximum,
	//		number of required decimal places), and also formatting options for
	//		displaying the value when the field is not focused.
	// example:
	//		Minimum/maximum:
	//		To specify a field between 0 and 120:
	//	|		{min:0,max:120}
	//		To specify a field that must be an integer:
	//	|		{fractional:false}
	//		To specify a field where 0 to 3 decimal places are allowed on input:
	//	|		{places:'0,3'}
});
=====*/

	return iForm.NumberTextBox = declare("idx.form.NumberTextBox", [NumberTextBox, _CompositeMixin, _CssStateMixin], {
		/**@lends idx.form.NumberTextBox*/
		
		// instantValidate: Boolean
		//		Fire validation when widget get input by set true, 
		//		fire validation when widget get blur by set false
		instantValidate: false,
		
		templateString: template,
		baseClass: "idxNumberTextBoxWrap",
		oneuiBaseClass: "dijitTextBox dijitNumberTextBox",
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
				this._computeRegexp(this.constraints);
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
		_isEmpty: function(){
			var v = this.get("value");
			return (v !== undefined) && isNaN(v);
		}
	});		
});
