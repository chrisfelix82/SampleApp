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
	"dijit/form/HorizontalSlider",
	"./_CssStateMixin",
	"./_ValidationMixin",
	"./_CompositeMixin",
	"dojo/text!./templates/HorizontalSlider.html"
], function(declare, lang, domStyle, domAttr, wai, HorizontalSlider, _CssStateMixin, _ValidationMixin, _CompositeMixin, template){
	var iForm = lang.getObject("idx.oneui.form", true); // for backward compatibility with IDX 1.2

	/**
	* @name idx.form.HorizontalSlider
	* @class A form widget that allows one to select a value with a horizontally draggable handle
	* @augments dijit.form.HorizontalSlider
	* @augments idx.form._ValidationMixin
	* @augments idx.form._CompositeMixin
	* @augments idx.form._CssStateMixin
	*/ 
	return iForm.HorizontalSlider = declare("idx.form.HorizontalSlider", [HorizontalSlider, _ValidationMixin, _CompositeMixin, _CssStateMixin], {
	/**@lends idx.form.HorizontalSlider*/ 
		// summary:
		//		A form widget that allows one to select a value with a horizontally draggable handle
	
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
		baseClass:"idxSliderWrapH",
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
			this._resize();
		},
		/** @ignore */
		startup: function(){
			this.inherited(arguments);
			var width = domStyle.get(this.domNode, "width");
			domStyle.set(this.oneuiBaseNode, "width", width + "px");
		},
		/**
		* use set("label", labelValue) to set the label of the HorizontalSlider
		*/
		_setLabelAttr: function(/*String*/ label){
			this.inherited(arguments);
			wai.setWaiState(this.focusNode, "labelledby", this.id + "_label");
			domAttr.remove(this.compLabelNode, "for");
		}
	});
});
