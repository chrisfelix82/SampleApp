/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
define(["dojo/_base/lang", "dojo/dom-class", "dojo/dom-style", "dojo/string", "idx/widget/Dialog", "dijit/Dialog", "dojo/data/ItemFileReadStore",
"idx/widget/SingleMessage", "dojox/charting/Chart", "dojox/charting/axis2d/Default", "dojox/charting/widget/SelectableLegend",
"dojox/charting/plot2d/ClusteredBars", "dojox/charting/themes/MiamiNice", "dojox/charting/action2d/Tooltip"], 
function(lang, domClass, domStyle, string, oneuiDialog, dijitDialog){
    lang.extend(oneuiDialog, {
        startup: function(){
//            dijitDialog.prototype.startup.apply(this, arguments);
//            dojo.place(this.domNode, dojo.byId("widgetsContainer"));
//            dojo.style(this.domNode, "position", "static");
//            dojo.style(this.domNode, "display", "block");
        }
    })
	var currentStore = null;
	var currentTemplates = null;
	var benchChart = null;
	var chartTooltip = null;
	var chartLegend = null;
	var theTemplate = {clazz:"",description:"",declaration:null};
	
    var benchTool = {
		isRunning: false,
		startTimer: null,
		masterResults: { clientNavigator: navigator.userAgent, dataSet: [], errors: [] },
		init: function(){
			this.masterResults.dojoVersion = dojo.version.toString();
			currentStore = oneuiWidgetStore;
			
			var _this = this;
			dijit.byId("widgetList")["onChange"] = function(value){
				_this.clearWidget("widgetSamples");
				currentStore.fetchItemByIdentity({
					identity: value,
					onItem: function(item){
						//Enable "Run Test" button
						dijit.byId("singleRunner").set("disabled", false);
						dijit.byId("compareRunner").set("disabled", false);
						//Display widget sample container
						dojo.style(dojo.byId("sampleContainer"), "display", "inline-block");
						//Populate container with samples
						currentTemplates = currentStore.getValues(item, "templates");
						var clazz = item.clazz;
						dojo.forEach(currentTemplates, function(template, idx){
							if(idx == 0){
								theTemplate.declaration = currentTemplates[0].declaration;
								theTemplate.clazz = clazz;
								theTemplate.description = currentTemplates[0].description;
							}
							clazz = dojo.map(clazz, function(value){
								return value.replace(/\./g, "/");
							})
							
							require(clazz, function(){
								var div = dojo.create("div", {
									className: "widgetSample" + ((idx == 0) ? " widgetSampleSelected" : "")
								}, "widgetSamples");
								dojo.create("h4", {
									innerHTML: template.description
								}, div);
								
								var tmpNode = dojo.create("div", {}, div);
                    			tmpNode.innerHTML = template.declaration;
                    			dojo.parser.parse(tmpNode);
								dojo.connect(div, "onclick", _this.selectWidgetSample);
							})
						})
					}
				})
			}
			
			dijit.byId("masterCheckBox")["onChange"] = function(){
				if(dijit.byId("masterCheckBox").checked){
					_this.selectAllReports();
				}else{
					_this.deselectAllReports();
				}
			}
		},
		
        createWidget: function(clazz, declaration, count, container){
            var tmpNode = dojo.create("div", {});
            tmpNode.innerHTML = string.rep(declaration, count);
            this.startTimer = new Date().getTime();
            dojo.parser.parse(tmpNode);
            dojo.place(tmpNode, container);
        },
		
		selectWidgetSample : function(){
			dojo.query(".widgetSample").forEach(function(sample, idx){
				dojo.toggleClass(sample, "widgetSampleSelected", this == sample);
				if(this == sample){
					theTemplate.declaration = currentTemplates[idx].declaration;
					theTemplate.description = currentTemplates[idx].description;
				}
			}, this);
		},
		
		clearWidget: function(container){
			var containerNode = dojo.byId(container);
			// Remove widgets from previous run
			dojo.forEach(dijit.findWidgets(containerNode), function(widget){
				widget.destroyRecursive();
			});
			containerNode.innerHTML = null;
		},
		
		generateCharting: function(){
			var oneuiSeries = [],
				dijitSeries = [],
				labels = [];
			this.masterResults.dataSet = [];
			dojo.query(".dijitCheckBox","results").forEach(function(node, idx){
				var ckbox = dijit.byNode(node);
				if(ckbox.checked){
					var data = ckbox.perfData;
					this.masterResults.dataSet.push(data);
					var label = this._getWidgetName(data.clazz);
					if(labels.indexOf(label) == -1){
						labels.push(label);
					}
					if(this._isBaseWidget(data.description)){
						dijitSeries.push({
							y: data.average,
							tooltip: data.description + ": " + data.average + "ms"
						})
					}else{
						oneuiSeries.push({
							y:data.average,
							tooltip: data.description  + ": " + data.average + "ms"
						})
					}
				};
			}, this);
			labels = dojo.map(labels, function(label, idx){
				return {
					value: ++idx,
					text: label
				};
			});
			if(benchChart){benchChart.destroy();}
			if(chartTooltip){chartTooltip.destroy();}
			if(chartLegend){chartLegend.destroy();}
			
			dijit.byId("resultTabs").selectChild(dijit.byId("benchPane"));
			
			benchChart = new dojox.charting.Chart("benchChart");
			benchChart.setTheme(dojox.charting.themes.MiamiNice).
			addPlot("default", {
				type: "ClusteredBars",
				gap: 2
			}).
			addSeries("One UI Widget", oneuiSeries).
			addSeries("Dijit Widget", dijitSeries).
			addAxis("y", {
				vertical: true, 
				includeZero: true, natural: true,
				miniorLabel: true,
				majorLabel: true,
				labels: labels
			}).
			addAxis("x", {
				includeZero: true
//				title: "average time costs for each widget",
//				titleOrientation: "away"
				
			});
			chartTooltip = new dojox.charting.action2d.Tooltip(benchChart, "default");
			benchChart.render();
			chartLegend = new dojox.charting.widget.SelectableLegend({chart: benchChart}, "legend");
		},
		_isBaseWidget: function(desc){
			return desc.indexOf("base widget") > -1;
		},
		_getWidgetName: function(modules){
			return modules.join(" / ");
		},
		deselectAllReports: function(){
			dojo.query(".dijitCheckBox","results").forEach(function(node){dijit.byNode(node).set("checked", false);});
		},
		clearAllReports: function(){
			dojo.query(".dijitCheckBox","results").forEach(function(node){
					dijit.byNode(node).destroy();
			});
			dojo.query(".idxSingleMessage","results").forEach(function(node){
				dijit.byNode(node).destroy();
			});
			this.clearWidget("widgetsContainer");
		},
		selectAllReports: function(){
			dojo.query(".dijitCheckBox","results").forEach(function(node){dijit.byNode(node).set("checked", true);});
		},
		resetRunnerLabel: function(){
			this.currentRunnerButton.set("label", this.runnerLabel).set("disabled",false);
		},
		/**
		 * Tasks
		 */
		_getSingleTestTask: function(){
			return [{
				clazz: theTemplate.clazz,
				declaration: theTemplate.declaration,
				description: theTemplate.description,
				count: dijit.byId("count").get("value"),
				method: "parse",
				container: "widgetsContainer"
			},{type: "resetRunnerLabel"}]
		},
		_getPairTestsTask: function(){
			this.deselectAllReports();
			return [{
				clazz: theTemplate.clazz,
				declaration: currentTemplates[0].declaration,
				description: currentTemplates[0].description,
				count: dijit.byId("count").get("value"),
				method: "parse",
				container: "widgetsContainer"
			},{
				clazz: theTemplate.clazz,
				declaration: currentTemplates[1].declaration,
				description: currentTemplates[1].description,
				count: dijit.byId("count").get("value"),
				method: "parse",
				container: "widgetsContainer"
			},{type: "generatingChart"},{type: "resetRunnerLabel"}]
		},
		_getAllTestsTask: function(){
			this.deselectAllReports();
			var d = new dojo.Deferred();
			var tasks = [], _this = this;
			currentStore.fetch({
				onComplete: function(items){
					dojo.forEach(items, function(item){
						if(item.templates && item.templates[1]){
							if(_this._isBaseWidget(item.templates[1].description)){
								var templates = item.templates;
								tasks.push({
									clazz: item.clazz,
									declaration: templates[0].declaration,
									description: templates[0].description,
									count: dijit.byId("count").get("value"),
									method: "parse",
									container: "widgetsContainer"
								});
								tasks.push({
									clazz: item.clazz,
									declaration: templates[1].declaration,
									description: templates[1].description,
									count: dijit.byId("count").get("value"),
									method: "parse",
									container: "widgetsContainer"
								});
							}
						}
					});
					tasks.push({type:"generatingChart"});
					tasks.push({type:"resetRunnerLabel"});
					d.callback(tasks);
				}
			});
			return d;
		},
		_timer: function(tasks, process, context){
			setTimeout(function(){
				var item = tasks.shift();
				process.call(context, item);
				if(tasks.length > 0){
					setTimeout(arguments.callee, 100);
				}
			}, 100)
		},
		_runner: function(task){
			if(task.type && task.type == "generatingChart"){
				this.generateCharting();
			}else if(task.type && task.type == "resetRunnerLabel"){
				this.resetRunnerLabel();
			}else{
				this.clearWidget(task.container);
				this.createWidget(task.clazz, task.declaration, task.count, task.container);
				var _this = this;
				setTimeout(function(){
					var average = (new Date().getTime() - _this.startTimer) / task.count,
						data = dojo.mixin({average: average}, task);
					//_this.masterResults.dataSet.push(data);
					_this._addReport(data);
				}, 0);
			}
		},
		
		_addReport: function(data){
			var title = "It took: "+data.average+"ms to "+data.method+" "+data.description+" in average.";
			var resultMessage = new idx.widget.SingleMessage({
				title: title,
				type: "information",
				showAction: false,
				style: "width: 90%"
			});
			
			var checkbox = new dijit.form.CheckBox({checked: true});
			checkbox.perfData = data;
			var resultItem = dojo.create("div", {className:"resultItem"});
			dojo.place(checkbox.domNode, resultItem);
			dojo.place(resultMessage.domNode, resultItem);
			resultMessage.onClose = function(){
				checkbox.destroyRecursive();
				resultItem.parentNode.removeChild(resultItem);
			}
			dojo.style(dojo.byId("resultActions"), "display", "block");
			dojo.style(dojo.byId("results"), "display", "block");
			dojo.place(resultItem, dojo.byId("results"), "first");
		},
		
		_runRealTest: function(tasks){
			this._timer(tasks, this._runner, this);
			
		},
		
		/**
		 * Runers
		 */
		runSingleTest : function(){
			if(this.isRunning){ return;}
			this.currentRunnerButton = dijit.byId("singleRunner");
			this.runnerLabel = this.currentRunnerButton.get("label");
			this.currentRunnerButton.set("label", "Running...").set("disabled", true);
			var task = this._getSingleTestTask();
			setTimeout(dojo.hitch(this, function(){this._runRealTest(task); }),1000);
		},
		runPairTests: function(){
			if(this.isRunning){return;}
			this.currentRunnerButton = dijit.byId("compareRunner");
			this.runnerLabel = this.currentRunnerButton.get("label");
			dijit.byId("compareRunner").set("label", "Running...").set("disabled", true);
			
			var tasks = this._getPairTestsTask();
			setTimeout(dojo.hitch(this, function(){this._runRealTest(tasks); }),1000);
		},
		runAllTests: function(){
			if(this.isRunning){return;}
			this.currentRunnerButton = dijit.byId("compareAllRunner");
			this.runnerLabel = this.currentRunnerButton.get("label");
			dijit.byId("compareAllRunner").set("label", "Running...").set("disabled", true);
			var d = this._getAllTestsTask();
			var classes = [],
				_this = this;
			currentStore.fetch({
				onComplete: function(items){
					dojo.forEach(items, function(item){
						var clazz = dojo.map(item.clazz, function(value){
							return value.replace(/\./g, "/");
						})
						classes = classes.concat(clazz);
					});
					require(classes, function(){
						d.then(function(tasks){
							_this._runRealTest(tasks);
						})
					})
				}
			});
		},
		
		showSummary: function(){
			var table = this._constructTable();
			var dialog = dijit.byId("summaryDialog")
			if(dialog){
				dialog.set("content", "<div style='height:530px;width:1050px;overflow-y:scroll;'>" + table + "</div>");
			}else{
				dialog = new oneuiDialog({
					title: "Benchmark Summary",
					instruction: "Compare oneui widgets with dijit widget",
					content: "<div style='height:530px;width:880px;overflow-y:scroll;'>" + table + "</div>",
					closeButtonLabel: "Close"
				}, "summaryDialog");
			}
			dialog.show();
		},
		
		_constructTable: function(){
			var dataSet = {}, _this = this;
			dojo.forEach(this.masterResults.dataSet,function(data){
				var widgetName = data.clazz[0];
				if(!dataSet[widgetName]){
					var o = {};
					if(_this._isBaseWidget(data.description)){
						o.compareWith = data.description;
						o.baseCost = data.average;
					}else{
						o.description = data.description;
						o.extCost = data.average;
					}
					dataSet[widgetName] = o;
				}else{
					if(_this._isBaseWidget(data.description)){
						dataSet[widgetName].compareWith = data.description;
						dataSet[widgetName].baseCost = data.average;
					}else{
						dataSet[widgetName].description = data.description;
						dataSet[widgetName].extCost = data.average;
					}
				}
			});
			var tableString = 
			"<table id='summaryTable'>" + 
				"<thead><tr>" +
                	"<th>Widget</th>" + 
					"<th>Description</th>" + 
					"<th>Compare with...</th>" + 
					"<th>Dijit Widget (ms)</th>" + 
					"<th>OneUI Widget (ms)</th>" +
					"<th>Time Cost (%)</th>"
				"</tr></thead>" +
				"<tbody>";
			for(var i in dataSet){
				var performance = ((dataSet[i].extCost - dataSet[i].baseCost)/dataSet[i].baseCost)*100;
					status = performance > 50 ? "bad" : (performance < 30 ? "good" : "");
				var item = 
					"<tr>"+
						"<td>" + i + "</td>" +
						"<td>" + dataSet[i].description + "</td>" +
						"<td>" + dataSet[i].compareWith + "</td>" +
						"<td>" + dataSet[i].baseCost + "ms</td>" +
						"<td>" + dataSet[i].extCost + "ms</td>" +
						"<td class='" + status + "'>" + (performance > 0 ? "+":"") + performance.toFixed(1) + "%</td>" +
					"</tr>";
				tableString += item;
			}
			tableString +=		 
				"</tbody></table>";
			return tableString;
		}
		
		
    }
	
	return benchTool;
})
