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
	"dijit/_base/wai",
	"dojo/currency",
	"dijit/form/CurrencyTextBox",
	"dijit/form/NumberTextBox",
	"idx/widget/HoverHelpTooltip",
	"./_CssStateMixin",
	"./TextBox",
	"./_CompositeMixin",
	"dojo/text!./templates/CurrencyTextBox.html"
], function(declare, lang, domStyle, domClass, wai, currency, CurrencyTextBox, NumberTextBox, HoverHelpTooltip, _CssStateMixin, TextBox, _CompositeMixin, template){
	var iForm = lang.getObject("idx.oneui.form", true); // for backward compatibility with IDX 1.2
	
	/**
	 * @name idx.form.CurrencyTextBox
	 * @class One UI version widget, it is a composite widget which enhanced dijit.form.CurrencyTextBox with following features:
	 * <ul>
	 * <li>Built-in label</li>
	 * <li>Built-in label positioning</li>
	 * <li>Built-in hint</li>
	 * <li>Built-in hint positioning</li>
	 * <li>Built-in required attribute</li>
	 * <li>One UI theme support</li>
	 * </ul>.
	 * @augments dijit.form.CurrencyTextBox
	 * @augments idx.form._CssStateMixin
	 * @augments idx.form._CompositeMixin
	 */
	 
	 
	return iForm.CurrencyTextBox = declare("idx.form.CurrencyTextBox", [CurrencyTextBox, _CompositeMixin, _CssStateMixin], {
		/**@lends idx.form.CurrencyTextBox.prototype*/
		
		instantValidate: false,
		
		templateString: template,
		
		baseClass: "oneuiTextBoxWrap",
		
		oneuiBaseClass: "dijitTextBox dijitCurrencyTextBox",
		
		currency: "",
		
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
		/**
		 * Show error message using a hoverHelpTooltip, hide the tooltip if message is empty.
		 * @param {string} message
		 * Error message
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
		_isEmpty: function(){
			var v = this.get("value");
			return (v !== undefined) && isNaN(v);
		},
		
		_setCurrencyAttr: function(/*String*/ currency){
			this.currencyLabel.innerHTML = currency;
			domClass.toggle(this.currencyLabel, "dijitHidden", /^\s*$/.test(currency));
			this._set("currency", currency);
			wai.setWaiState(this.focusNode, "describedby", this.id + "_unit");
		},
		
		_setConstraintsAttr: function(/*Object*/ constraints){
			NumberTextBox.prototype._setConstraintsAttr(arguments, [currency._mixInDefaults(lang.mixin(constraints, {exponent: false}))]);
		}
	});
})
