/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/event", // event.stop
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/keys",
	"dijit/_base/wai",
	"idx/widget/HoverHelpTooltip",
	"dijit/form/_Spinner",
	"dijit/form/NumberTextBox",
	"./_CssStateMixin",
	"./_CompositeMixin",
	"dojo/text!./templates/Spinner.html"
], function(declare, lang, event, domStyle, domClass, keys, wai, HoverHelpTooltip, _Spinner, NumberTextBox, _CssStateMixin, _CompositeMixin, template){
	var iForm = lang.getObject("idx.oneui.form", true); // for backward compatibility with IDX 1.2
	
    /**
	 * @name idx.form.NumberSpinner
	 * @class idx.form.NumberSpinner is a composite widget which enhanced dijit.form.NumberSpinner with following features:
	 * <ul>
	 * <li>Built-in label</li>
	 * <li>Built-in label positioning</li>
	 * <li>Built-in input hint</li>
	 * <li>Built-in input hint postioning</li>
	 * <li>Built-in 'required' attribute</li>
	 * <li>IBM One UI theme supporting</li>
	 * </ul>
	 * @augments dijit.form.NumberSpinner
	 * @augments idx.form._CompositeMixin
	 * @augments idx.form._CssStateMixin
	 * @example 
	 * 		new idx.form.NumberSpinner({ constraints:{ max:300, min:100 }}, "someInput");
	 */
	 
	return iForm.NumberSpinner = declare("idx.form.NumberSpinner", [_Spinner, NumberTextBox.Mixin,  _CompositeMixin, _CssStateMixin], {
		/**@lends idx.form.NumberSpinner*/
		
		// instantValidate: Boolean
		//		Fire validation when widget get input by set true, 
		//		fire validation when widget get blur by set false
		instantValidate: false,
		templateString: template,
		baseClass: "oneuiNumberSpinnerWrap",
		oneuiBaseClass: "dijitTextBox dijitSpinner",
		cssStateNodes: {
			"inputNode": "dijitInputContainer",
			"upArrowNode": "dijitUpArrowButton",
			"downArrowNode": "dijitDownArrowButton"
		},
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
		adjust: function(/*Object*/ val, /*Number*/ delta){
			// summary:
			//		Change Number val by the given amount
			// tags:
			//		protected
	
			var tc = this.constraints,
				v = isNaN(val),
				gotMax = !isNaN(tc.max),
				gotMin = !isNaN(tc.min)
			;
			if(v && delta != 0){ // blank or invalid value and they want to spin, so create defaults
				val = (delta > 0) ?
					gotMin ? tc.min : gotMax ? tc.max : 0 :
					gotMax ? this.constraints.max : gotMin ? tc.min : 0
				;
			}
			var newval = val + delta;
			if(v || isNaN(newval)){ return val; }
			if(gotMax && (newval > tc.max)){
				newval = tc.max;
			}
			if(gotMin && (newval < tc.min)){
				newval = tc.min;
			}
			return newval;
		},
		_setUnitAttr: function(){
			this.inherited(arguments);
			wai.setWaiState(this.upArrowNode, "describedby", this.id + "_unit");
			wai.setWaiState(this.downArrowNode, "describedby", this.id + "_unit");
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
		},
		_onKeyPress: function(e){
			if((e.charOrCode == keys.HOME || e.charOrCode == keys.END) && !(e.ctrlKey || e.altKey || e.metaKey)
			&& typeof this.get('value') != 'undefined' /* gibberish, so HOME and END are default editing keys*/){
				var value = this.constraints[(e.charOrCode == keys.HOME ? "min" : "max")];
				if(typeof value == "number"){
					this._setValueAttr(value, false);
				}
				// eat home or end key whether we change the value or not
				event.stop(e);
			}
		},
		_onInputContainerEnter: function(){
			domClass.toggle(this.oneuiBaseNode, "dijitSpinnerInputContainerHover", true);
		},
		
		_onInputContainerLeave: function(){
			domClass.toggle(this.oneuiBaseNode, "dijitSpinnerInputContainerHover", false);
		}
	});
});
