/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/dom-style",
	"dojo/keys",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./templates/_CheckBoxTreeNode.html",
	"dijit/Tree"
], function(declare, array, domStyle, keys, _WidgetsInTemplateMixin, template){
	
	// module:
	//		oneui/_CheckBoxTreeNode
	// summary:
	//		Single node within a CheckBoxTree. This class is used internally
	//		by CheckBoxTree and should not be accessed directly.
	
	return declare("idx.widget._CheckBoxTreeNode", [dijit._TreeNode, _WidgetsInTemplateMixin], {
		// summary:
		//		Single node within a CheckBoxTree. This class is used internally
		//		by CheckBoxTree and should not be accessed directly.
		// tags:
		//		private
		
		templateString: template,
		
		
		// lastState: Boolean|String
		//		Last check state of the item
		lastState: false,
		
		// For hover effect for tree node, and focus effect for label
		cssStateNodes: {
			labelNode: "dijitTreeLabel"
		},
		
		postCreate: function(){
			domStyle.set(this.checkboxNode.iconNode, {
				"display": "none"
			});
			this.set("lastState", false);
			this.connect(this.labelNode, "onkeypress", "_labelKeyPressHandler");
			this.checkboxNode._handleOnChange = dojo.hitch(this.checkboxNode, function(newValue, priorityChange){
				if(this._lastValueReported == undefined && (priorityChange === null || !this._onChangeActive)){
					this._resetValue = this._lastValueReported = newValue;
				}
				this._pendingOnChange = this._pendingOnChange
					|| (typeof newValue != typeof this._lastValueReported)
					|| (this.compare(newValue, this._lastValueReported) != 0);
				if((this.intermediateChanges || priorityChange || priorityChange === undefined) && this._pendingOnChange){
					this._lastValueReported = newValue;
					this._pendingOnChange = false;
					this.onChange(newValue);
				}
			});
			this.connect(this.checkboxNode, "onClick", function(){
				var checked = this.checkboxNode.get("checked");
				this.updateState(checked);
				this.tree.focusNode(this);
			});
			this.connect(this.checkboxNode, "onChange", function(){
				this._onNodeStateChange(this.checkboxNode.get("checked"));
				this.tree._itemStatus[this.tree.model.getIdentity(this.item)] = this.checkboxNode.get("checked");
			});
			// add Label Content for TriCheckBox
			this.checkboxNode.compLabelNode.innerHTML = this.labelNode.innerHTML;
		},
		
		updateState: function(/*Boolean|String*/ value){
			// Update the check state for the current node, parent nodes and
			// children nodes.
			if(value == undefined){
				value = this.checkboxNode.get("checked");
			}
			this.checkboxNode.set("checked", value);
			this.set("lastState", value);
			this.updateChildren();
			this.updateParent();
			if(value === true){
				this.setSelected(true);
			}else{
				this.setSelected(false);
			}
		},
		
		updateChildren: function(){
			// summmary:
			//		Deal with children
			var children = this.getChildren();
			if(children && children.length > 0){
				if(this.checkboxNode.checked == true){
					//Select all children
					array.forEach(children, function(child, idx){
						child.checkboxNode.set("checked", true);
						child.updateChildren();
					});
				}else if(this.checkboxNode.checked == false){
					//Deselect all children
					array.forEach(children, function(child, idx){
						child.checkboxNode.set("checked", false);
						child.updateChildren();
					});
				}else{
					// Resume all children state
					array.forEach(children, function(child, idx){
						child.checkboxNode.set("checked", child.get("lastState"));
						child.updateChildren();
					});
				}
			}else{
				var self = this;
				// Update the item status in this.tree._itemStatus map
				function updateChildrenStatus(item){
					self.tree.model.getChildren(item, function(items){
						// Loop the items
						for(var i = 0; i < items.length; i++){
							self.tree._itemStatus[self.tree.model.getIdentity(items[i])] = self.checkboxNode.checked;
							updateChildrenStatus(items[i]);
						}
					});
				}
				updateChildrenStatus(self.item);
			}
		},
		
		updateParent: function(){
			// summary:
			//		Deal with parent node
			var parentNodes = this.tree.getNodesByItem(this.getParent() ? this.getParent().item : null);
			if(parentNodes && parentNodes[0]){
				var parentNode = parentNodes[0];
				parentNode.update();
				parentNode.updateParent();
			}else{
				return;
			}
		},
		
		update: function(){
			// summary:
			//		Update the state of the node according to its' children's states
			var siblings = this.getChildren();
			var checked = 0;
			var mixed = 0;
			for(var i = 0; i < siblings.length; i++){
				var isChecked = siblings[i].checkboxNode.get("checked");
				siblings[i].set("lastState", isChecked);
				switch(isChecked){
					case true: checked++;
						break;
					case "mixed": mixed++;
						break;
				}
			}
			if(checked > 0 && checked == siblings.length){
				this.checkboxNode.set("states", [false, true]);
				this.checkboxNode.set("checked", true);
			}else if(checked == 0 && mixed == 0){
				this.checkboxNode.set("states", [false, true]);
				this.checkboxNode.set("checked", false);
			}else{
				this.checkboxNode.set("states", [false, "mixed", true]);
				this.checkboxNode.set("checked", "mixed");
			}
			this.set("lastState", this.checkboxNode.get("checked"));
		},
		
		_onNodeStateChange: function(/*Boolean*/ checked){
			this.tree._onNodeStateChange(this, checked);
		},
		
		setSelected: function(/*Boolean*/ selected){
			// summary:
			//		A Tree has a (single) currently selected node.
			//		Mark that this node is/isn't that currently selected node.
			// description:
			//		In particular, setting a node as selected involves setting tabIndex
			//		so that when user tabs to the tree, focus will go to that node (only).
			this.labelNode.setAttribute("aria-selected", selected);
		},
		
		_labelKeyPressHandler: function(/*Event*/ evt){
			// summary:
			//		Handler key press on the label node.
			var dk = keys;
			if(evt.charCode == dk.SPACE || evt.keyCode == dk.ENTER || evt.charOrCode === " "){
				this.checkboxNode.click();
				var checked = this.checkboxNode.get("checked");
				this.updateState(checked);
			}
		}
	});
});