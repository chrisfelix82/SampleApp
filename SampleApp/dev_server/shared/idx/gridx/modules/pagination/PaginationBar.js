define([
	"dojo/_base/declare",
	"dojo/query",
	"dijit/registry",
	"gridx/modules/pagination/PaginationBar",
	"gridx/support/LinkPager",
	"gridx/support/LinkSizer",
	"gridx/support/GotoPageButton",
	"./GotoPagePane",
	"idx/widget/Dialog",
	"dijit/form/Button",
	"idx/form/NumberTextBox",
	"dojo/i18n!gridx/nls/PaginationBar"
], function(declare, query, registry, PaginationBar,
	LinkPager, LinkSizer, GotoPageButton, GotoPagePane,
	Dialog, Button, NumberTextBox, nls){

	return declare(PaginationBar, {
		_init: function(pos){
			var t = this,
				gotoBtnProt = GotoPageButton.prototype;
			t._add(LinkPager, 1, pos, 'stepper', {
				className: 'gridxPagerStepperTD',
				visibleSteppers: t.arg('visibleSteppers')
			});
			t._add(LinkSizer, 2, pos, 'sizeSwitch', {
				className: 'gridxPagerSizeSwitchTD',
				sizes: t.arg('sizes'),
				sizeSeparator: t.arg('sizeSeparator')
			});
			t._add(GotoPageButton, 3, pos, 'gotoButton', {
				className: 'gridxPagerGoto',
				dialogClass: Dialog,
				buttonClass: Button,
				numberTextBoxClass: NumberTextBox,
				gotoPagePane: GotoPagePane,
				dialogProps: {
					'class': 'gridxGotoPageDialog',
					executeOnEnter: false,
					buttons: [
						new Button({
							label: nls.gotoDialogOKBtn,
							onClick: function(){
								query('.gridxPagerGotoBtn', t.grid.domNode).some(function(node){
									var gotoBtn = registry.byNode(node);
									var dlg = gotoBtn._gotoDialog;
									if(dlg.open){
										dlg.content._onOK();
										return true;
									}
								});
							}
						})
					]
				}
			});
		}
	});
});
