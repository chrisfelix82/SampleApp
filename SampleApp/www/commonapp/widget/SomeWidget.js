define(["dojo/_base/declare",
        "dojo/_base/lang",
        "module",
        "commonapp/widget/BaseWidget",
        "dojo/text!./templates/SomeWidget.html",
        "dojo/i18n!./nls/SomeWidget",
        //Template only
        "dojox/mobile/Button"],function(declare,lang,module,BaseWidget,template,nls){
	
	var MODULE = module.id;
	return declare([BaseWidget],{
		
		templateString : template,
		text : nls,
		
		constructor : function(args){
			var F = MODULE + ":constructor:";
			console.debug(F,"Created widget");
			lang.mixin(this,args);
			lang.mixin(this.nls,this.text);
			console.warn(this.nls.commonText);
		},
		
		postCreate : function(){
			var F = MODULE + ":postCreate:";
			console.debug(F,"Do some post create stuff");
		}
	});
});