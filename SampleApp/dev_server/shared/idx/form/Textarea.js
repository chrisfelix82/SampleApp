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
	"dojo/has",
	"dojo/_base/event",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dojo/dom-geometry",
	"dijit/form/Textarea",
	"../util",
	"./_CssStateMixin",
	"./_ValidationMixin",
	"./_CompositeMixin",
	"dojo/text!./templates/Textarea.html"
], function(declare, lang, array, has,  event, domStyle, domAttr, domGeometry, Textarea, iUtil, _CssStateMixin, _ValidationMixin, _CompositeMixin, template){
	var iForm = lang.getObject("idx.oneui.form", true); // for backward compatibility with IDX 1.2
	
    /**
	 * @name idx.form.Textarea
	 * @class idx.form.Textarea is a composite widget which enhanced dijit.form.Textarea with following features:
	 * <ul>
	 * <li>Built-in label</li>
	 * <li>Built-in label positioning</li>
	 * <li>Built-in hint</li>
	 * <li>Built-in hint positioning</li>
	 * <li>Built-in required attribute</li>
	 * <li>Built-in validation support</li>
	 * <li>One UI theme support</li>
	 * </ul>
	 * @augments dijit.form.Textarea
	 * @augments idx.form._CssStateMixin
	 * @augments idx.form._CompositeMixin
	 * @augments idx.form._ValidationMixin
	 */

	return iForm.Textarea = declare("idx.form.Textarea", [Textarea, _CompositeMixin,  _CssStateMixin, _ValidationMixin], 
	/**@lends idx.form.Textarea.prototype*/
	{
		instantValidate: false,
		templateString: template,
		baseClass: "idxTextareaWrap",
		oneuiBaseClass: "dijitTextBox dijitTextArea dijitExpandingTextArea",
		rows: 1,
		_minScrollHeight: 0,

		postCreate: function(){
			// summary:
			//     add style height setting, change to integer of rows number
			var textarea = this.textbox, 
				height = parseInt(this.srcNodeRef ? this.srcNodeRef.style.height : "0"), 
				empty = false, 
				tempValue = textarea.value, 
				tempRows = 1;
			textarea.value = ' ';
			while ( textarea.scrollHeight < height){
				textarea.value += ' \n';
				tempRows++;
			}
			textarea.value = tempValue;
			
			if ( tempRows > this.rows ){
				this._setRowsAttr( tempRows );
			}
			
			this._event = {
				"input" : "_onInput",
				"blur" 	: "_onBlur",
				"focus" : "_onFocus"
			};
			this.inherited(arguments);
			array.forEach(array.filter(this._connects, function(conn){ 
				return conn && conn[0] && conn[0][1] == "onfocus"; 
			}), this.disconnect, this);
			this._resize();
		},
		_onInput: function(){
			dijit.form.SimpleTextarea.prototype._onInput.apply(this, arguments);
			this._resizeVertical();
		},
		_resizeLater: function(){
			this.defer("_resizeVertical");
		},
		_isEmpty: function(){
			return (this.trim ? /^\s*$/ : /^$/).test(this.get("value")); // Boolean
		},
		_setValueAttr: function(){
			dijit.form.TextBox.prototype._setValueAttr.apply(this, arguments);
			this._updatePlaceHolder();
			this.validate(this.focused);
		},
		_isValidFocusNode: function(mousedownNode){
			return (this.hintPosition == "inside" && mousedownNode == this._phspan || 
				mousedownNode == this.oneuiBaseNode.parentNode) || this.inherited(arguments);
		},
		_setRowsAttr: function(/*Int*/ rows){
			domAttr.set(this.oneuiBaseNode, "rows", rows);
			this.rows = parseInt(rows);
		},
		_setColsAttr: function(/*Int*/ cols){
			domAttr.set(this.oneuiBaseNode, "cols", cols);
			this.cols = parseInt(cols);
		},
		_estimateHeight: function(){
			// summary:
			//		Approximate the height when the textarea is invisible with the number of lines in the text.
			//		Fails when someone calls setValue with a long wrapping line, but the layout fixes itself when the user clicks inside so . . .
			//		In IE, the resize event is supposed to fire when the textarea becomes visible again and that will correct the size automatically.
			//
			var textarea = this.textbox;
			textarea.rows = (textarea.value.match(/\n/g) || []).length + 1;
			textarea.rows = (textarea.rows < this.rows) ? this.rows : textarea.rows;
		},
		_resize: function(){
			this._errorIconWidth = 27;
			this.inherited(arguments);
			this._resizeVertical();
			this._resizeHorizontal();
		},
		_resizeHorizontal:function(){
			var textarea = this.textbox, self = this;
			if ( self.cols > 0 ){
				domStyle.set(this.oneuiBaseNode, "width", "");
			}
		},
		_resizeVertical: function(){
			// summary:
			//		Resizes the textarea vertically (should be called after a style/value change)
			var textarea = this.textbox, self = this;
			function textareaScrollHeight(){
				var empty = false, sh = 0;
				if ( textarea.value === ''){
					for (var index = 0; index < self.rows - 1; index++){
						textarea.value += ' \n';
					}
					empty = true;
					
					self._minScrollHeight = sh = textarea.scrollHeight;
				}
				else{
					sh = ( textarea.scrollHeight < self._minScrollHeight) ? self._minScrollHeight : textarea.scrollHeight; 
				}

				if(empty){ textarea.value = ''; }
				return sh;
			}

			if(textarea.style.overflowY == "hidden"){ textarea.scrollTop = 0; }
			if(this.busyResizing){ return; }
			this.busyResizing = true;
			

			if (textareaScrollHeight() || textarea.offsetHeight) {
				var newH = textareaScrollHeight() + Math.max(textarea.offsetHeight - textarea.clientHeight, 0);
				//newH = (newH < this._height) ? this._height : newH;
				var newHpx = newH + "px";
				if (newHpx != textarea.style.height) {
					textarea.style.height = newHpx;
				}
				if (has("textarea-needs-help-shrinking") ) {
					var origScrollHeight = textareaScrollHeight(), newScrollHeight = origScrollHeight, origMinHeight = textarea.style.minHeight, decrement = 4, // not too fast, not too slow
						thisScrollHeight, origScrollTop = textarea.scrollTop;
					textarea.style.minHeight = newHpx; // maintain current height
					textarea.style.height = "auto"; // allow scrollHeight to change
					while ( newH > 0 ) {
						textarea.style.minHeight = Math.max(newH - decrement, 4) + "px";
						thisScrollHeight = textareaScrollHeight();
						var change = newScrollHeight - thisScrollHeight;
						newH -= change;
						if (change < decrement) {
							break; // scrollHeight didn't shrink
						}
						newScrollHeight = thisScrollHeight;
						decrement <<= 1;
					}
					textarea.style.height = newH + "px";
					textarea.style.minHeight = origMinHeight;
					textarea.scrollTop = origScrollTop;
				}
				textarea.style.overflowY = textareaScrollHeight() > textarea.clientHeight ? "auto" : "hidden";
				if (textarea.style.overflowY == "hidden") {
					textarea.scrollTop = 0;
				}
			}
			else {
				// hidden content of unknown size
				this._estimateHeight(); 
			}
	
			this.busyResizing = false;
		}
	});
});
