define([
	'dojo/_base/declare',
	'dojo/query',
	'dijit/registry',
	'gridx/core/_Module',
	'gridx/support/QuickFilter',
	'gridx/modules/Bar',
	'idx/form/TextBox',
	'idx/widget/Menu'
], function(declare, query, registry, _Module, QuickFilter){

/*=====
	return declare(_Module, {
		// summary:
		//		Directly show gridx/support/QuickFilter in gridx/modules/Bar at the top/right position.
		// description:
		//		This module is only for convenience. For other positions or more configurations, please use gridx/modules/Bar directly.
		//		This module depends on "bar" and "filter" modules.
	});
=====*/

	return declare(_Module, {
		name: 'quickFilter',

		required: ['bar', 'filter'],

		preload: function(){
			this.grid.bar.defs.push({
				bar: 'top',
				row: 0,
				col: 3,
				pluginClass: QuickFilter,
				className: 'gridxBarQuickFilter',
				textBoxClass: 'idx/form/TextBox',
				menuClass: 'idx/widget/Menu'
			});
		},

		// for backward compatibility
		apply: function(){
			query('.gridxQuickFilter', this.grid.headerNode).forEach(function(node){
				registry.byNode(node)._filter();
			});
		},

		// for backward compatibility
		clear: function(){
			query('.gridxQuickFilter', this.grid.headerNode).forEach(function(node){
				registry.byNode(node)._clear();
			});
		}
	});
});
