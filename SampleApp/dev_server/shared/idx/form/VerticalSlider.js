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
	"dojo/dom-attr",
	"dijit/_base/wai",
	"dijit/form/VerticalSlider",
	"./_CssStateMixin",
	"./_ValidationMixin",
	"./_CompositeMixin",
	"dojo/text!./templates/VerticalSlider.html"
], function(declare, lang, domStyle, domAttr, wai, VerticalSlider, _CssStateMixin, _ValidationMixin, _CompositeMixin, template){
	var iForm = lang.getObject("idx.oneui.form", true); // for backward compatibility with IDX 1.2

	/**
	* @name idx.form.VerticalSlider
	* @class A form widget that allows one to select a value with a vertically draggable handle
	* @augments dijit.form.VerticalSlider
	* @augments idx.form._ValidationMixin
	* @augments idx.form._CompositeMixin
	* @augments idx.form._CssStateMixin
	*/ 
	return iForm.VerticalSlider = declare("idx.form.VerticalSlider", [VerticalSlider, _ValidationMixin, _CompositeMixin, _CssStateMixin], {
	/**@lends idx.form.VerticalSlider*/ 
		// summary:
		//		A form widget that allows one to select a value with a vertically draggable handle
	
		templateString: template,
		/**
		* Fire validation when widget get input by set true, 
		* fire validation when widget get blur by set false
		* @type Boolean
		*/
		// instantValidate: Boolean
		//		Fire validation when widget get input by set true, 
		//		fire validation when widget get blur by set false
		instantValidate: true,
		/**
		* base class of dijit widget
		*/
		oneuiBaseClass: "dijitSlider",
		/**
		* base class of this oneui widget
		*/
		baseClass:"idxSliderWrapV",
		cssStateNodes: {
			incrementButton: "dijitSliderIncrementButton",
			decrementButton: "dijitSliderDecrementButton",
			focusNode: "dijitSliderThumb"
		},
		/** @ignore */
		postCreate: function(){
			this._event = {
				"input" : "_setValueAttr",
				"blur" 	: "_onBlur",
				"focus" : "_onFocus"
			}
			this.inherited(arguments);
			var height = domStyle.get(this.domNode, "height");
			domStyle.set(this.oneuiBaseNode, "height", height + "px");
			domStyle.set(this.leftDecoration, "height", Math.max(height - 50, 1) + "px");
			domStyle.set(this.rightDecoration, "height", Math.max(height - 50, 1) + "px");

			this._resize();
		},
		/**
		* use set("label", labelValue) to set the label of the VerticalSlider
		*/
		_setLabelAttr: function(/*String*/ label){
			this.inherited(arguments);
			wai.setWaiState(this.focusNode, "labelledby", this.id + "_label");
			domAttr.remove(this.compLabelNode, "for");
		},
		_setFieldWidthAttr: null
	});
});
