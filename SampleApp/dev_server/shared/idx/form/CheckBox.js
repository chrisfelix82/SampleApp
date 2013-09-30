/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/has",
	"dojo/_base/lang",
	"dijit/form/CheckBox",
	"./_CssStateMixin",
	"./_CompositeMixin",
	"./_ValidationMixin",
	"dojo/has!dojo-bidi?../bidi/form/CheckBox",
	"dojo/text!./templates/CheckBox.html"
], function(declare, has, lang, CheckBox, _CssStateMixin, _CompositeMixin, _ValidationMixin, bidiExtension, template){
	var iForm = lang.getObject("idx.oneui.form", true);
	
	/**
	 * @name idx.form.CheckBox
	 * @class idx.form.CheckBox is implemented according to IBM One UI(tm) <b><a href="http://dleadp.torolab.ibm.com/uxd/uxd_oneui.jsp?site=ibmoneui&top=x1&left=y6&vsub=*&hsub=*&openpanes=0100110000">Check Boxes Standard</a></b>.
	 * It is a composite widget which enhanced dijit.form.CheckBox with following features:
	 * <ul>
	 * <li>Built-in label</li>
	 * <li>Built-in required attribute</li>
	 * <li>One UI theme support</li>
	 * </ul>
	 * @augments dijit.form.CheckBox
	 * @augments idx.form._CssStateMixin
	 * @augments idx.form._CompositeMixin
	 * @augments idx.form._ValidationMixin
	 */
	var baseClassName = has("dojo-bidi")? "idx.form.CheckBox_" : "idx.form.CheckBox";
	iForm.CheckBox = declare(baseClassName, [CheckBox, _CssStateMixin, _CompositeMixin, _ValidationMixin],
	/**@lends idx.form.CheckBox.prototype*/
	{
		// summary:
		// 		One UI version CheckBox
		
		instantValidate: true,
		
		baseClass: "idxCheckBoxWrap",
		
		oneuiBaseClass: "dijitCheckBox",
		
		labelAlignment: "horizontal",
		
		templateString: template,
		
		postCreate: function(){
			this._event = {
				"input" : "onChange",
				"blur" 	: "_onBlur",
				"focus" : "_onFocus"
			}
			this.inherited(arguments);
		},
		
		_isEmpty: function(){
			return !this.get("checked");
		},
		_onBlur: function(evt){
			this.mouseFocus = false;
			this.inherited(arguments);
		},
		
		_setDisabledAttr: function(){
			this.inherited(arguments);
			this._refreshState();
		},
		
		_setLabelAlignmentAttr: null,
		_setFieldWidthAttr: null,
		_setLabelWidthAttr: null,
		_resize: function(){return false;}
	});
	return has("dojo-bidi")? declare("idx.form.CheckBox",[iForm.CheckBox,bidiExtension]) : iForm.CheckBox;
});