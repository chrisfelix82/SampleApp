define([
	"dojo/_base/declare",
	"gridx/support/GotoPagePane",
	"dojo/text!../../templates/GotoPagePane.html"
], function(declare, GotoPagePane, goToTemplate){

	return declare(GotoPagePane, {
		templateString: goToTemplate,

		postCreate: function(){
			var t = this;
			setTimeout(function(){
				t.okBtn = t.dialog.buttons[0];
				t._updateStatus();
			}, 10);
		}
	});
});
