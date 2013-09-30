/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/_base/connect",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/_base/event",
	"dojo/_base/window",
	"dojo/mouse",
	"dijit/tree/_dndSelector"
], function(declare, connect, array, lang, event, win, mouse, _dndSelector){

	// module:
	//		oneui/checkboxtree/_dndSelector
	// summary:
	//		This is a base class for `oneui.checkboxtree.dndSource` , and isn't meant to be used directly.
	//		It's based on `dijit.tree._dndSelector`.

	return declare("idx.widget.checkboxtree._dndSelector", _dndSelector, {
		// summary:
		//		This is a base class for `oneui.checkboxtree.dndSource` , and isn't meant to be used directly.
		//		It's based on `dijit.tree._dndSelector`.
		// tags:
		//		protected
		
		constructor: function(tree, params){
			// summary:
			//		Initialization
			// tags:
			//		private

			this.selection={};
			this.anchor = null;
			this.events.push(
				connect.connect(this.tree, "_onNodeStateChange", this, "_onNodeStateChange"),
				connect.connect(this.tree.domNode, "onmousedown", this,"onMouseDown"),
				connect.connect(this.tree.domNode, "onmouseup", this,"onMouseUp"),
				connect.connect(this.tree.domNode, "onmousemove", this,"onMouseMove")
			);
		},
		//	candidateNode: oneui._TreeNode
		candidateNode: null,
		_setDifference: function(xs,ys){
			// summary:
			//		Returns a copy of xs which lacks any objects
			//		occurring in ys. Checks for membership by
			//		modifying and then reading the object, so it will
			//		not properly handle sets of numbers or strings.

			array.forEach(ys, function(y){y.__exclude__ = true;	});
			
			var ret = array.filter(xs, function(x){return !x.__exclude__;});
			
			// clean up after ourselves.
			array.forEach(ys, function(y){delete y['__exclude__']});
			return ret;
		},
		// mouse events
		onMouseDown: function(e){
			// summary:
			//		Event processor for onmousedown
			// e: Event
			//		mouse event
			// tags:
			//		protected

			// ignore click on not an item
			if(!this.current){ return; }

			if(!mouse.isLeft(e)){ return; }	// ignore right-click

			event.stop(e);

			this.candidateNode = this.current;
			
		},
		
		onMouseUp: function(){
			this.candidateNode = null;
		},
	
		_onNodeStateChange: function(/*oneui._TreeNode*/ node, /*Boolean*/ checked){
			// If selected an unchecked item, clean the selection first.
			var nodes = this.getSelectedTreeNodes();
			if(nodes.length == 1 && nodes[0].checkboxNode.checked === false){
				this.selectNone();
			}
			// Add/Remove node
			if(checked == true){
				this.addTreeNode(node, true);
			}else{
				if(this.selection[ node.id ]) {
					this.removeTreeNode( node );
				}
			}
		}
	});
});
