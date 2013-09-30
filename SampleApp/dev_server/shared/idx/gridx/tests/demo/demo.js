require([
	'dojo/ready',
	'dojo/_base/query',
	'dijit/registry',
	'idx/gridx/tests/support/data/ComputerData',
	'idx/gridx/tests/support/stores/Memory',
	'dijit/form/Button',
	'dijit/form/DropDownButton',
	'dijit/Menu',
	'dijit/MenuItem',
	'dijit/ToolbarSeparator',
	'gridx/Grid',
	'gridx/core/model/cache/Sync',
	'idx/gridx/tests/support/modules',
	'idx/layout/ListNavController',
	'dijit/layout/ContentPane',
	'dijit/layout/BorderContainer',
	'dijit/layout/StackContainer',
	'idx/layout/HeaderPane',
	'dojo/parser'
], function(ready, query, registry, dataSource, storeFactory,
	Button, DropDownButton, Menu, MenuItem, ToolbarSeparator){

	gridStore = storeFactory({
		dataSource: dataSource,
		size: 20
	});
	
	gridSmallStore = storeFactory({
		dataSource: dataSource,
		size: 5
	});

	gridBigStore = storeFactory({
		dataSource: dataSource,
		size: 100
	});

	structure1 = dataSource.layouts[0];

	function addToolBarButtons(grid){
		var toolBar = grid && grid.toolBar && grid.toolBar.widget;
		if(toolBar){
			toolBar.addChild(new Button({
				'class': 'idxButtonCompact',
				showLabel: false,
				label: 'Cut',
				iconClass: 'testToolbarButtonCut'
			}));
			toolBar.addChild(new Button({
				'class': 'idxButtonCompact',
				showLabel: false,
				label: 'Copy',
				iconClass: 'testToolbarButtonCopy'
			}));
			toolBar.addChild(new Button({
				'class': 'idxButtonCompact',
				showLabel: false,
				label: 'Paste',
				iconClass: 'testToolbarButtonPaste'
			}));
			toolBar.addChild(new ToolbarSeparator());

			var menu = new Menu({});
			menu.addChild(new MenuItem({
				label: "Save"
			}));
			menu.addChild(new MenuItem({
				label: "Close"
			}));

			toolBar.addChild(new DropDownButton({
				'class': 'idxButtonCompact',
				label: 'More',
				dropDown: menu
			}));
		}
	}
	ready(function(){
		query('.gridx').forEach(function(node){
			var grid = registry.byNode(node);
			addToolBarButtons(grid);
		});
	});
});
