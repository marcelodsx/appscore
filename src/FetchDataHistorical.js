var schedule = require('node-schedule');
var childProcess = require('child_process');
var log4js = require('log4js');
var log = log4js.getLogger("FetchDataHistorical");
var restManager = require('./RestManager');
var dateHelper = require('./DateHelper');
var eventManager = require('./EventsManager');
var dbManager	= require("./DBManager.js");
var configManager = require("./ConfigManager.js");
var sleep = require('sleep');

log4js.configure('log4js.json');

var run = function(){

	var fetchSummaryData = configManager.getConfig().fetchSummaryData;
	var fetchAuditHistory = configManager.getConfig().fetchAuditHistory;

	if (fetchSummaryData)
	{
		var summaryJob = childProcess.fork("./src/FetchSummaryWorker.js");
		restManager.getAppJson(function(apps){
			apps.forEach(function(app)  {
				
				var prevDate = dateHelper.getPreviousDateAsNumber();
				var extractDays = parseInt(configManager.getConfig().extractDays);

				for(var i=0; i<extractDays; i++)
				{
					log.info("building summary for : "+app.id+" : "+app.name+" : "+prevDate.toString());
					app.prev_date = prevDate.toString();
					var appAsString = JSON.stringify(app);
					summaryJob.send(appAsString);
					prevDate = dateHelper.getPreviousDateAsNumber(prevDate.toString());
					sleep.sleep(2);
				}
				sleep.sleep(2);
			});
			summaryJob.kill();
			log.info("processed "+apps.length+" applications");
		});
	}

	if (fetchAuditHistory)
	{
		var auditHistoryJob = childProcess.fork("./src/FetchAuditHistoryWorker.js");
		var prevDate = dateHelper.getPreviousDateAsNumber();
		var extractDays = parseInt(configManager.getConfig().extractDays);

		for(var i=1; i<extractDays; i++)
		{
			log.info("date: " + prevDate.toString());
			auditHistoryJob.send(prevDate.toString());
			prevDate = dateHelper.getPreviousDateAsNumber(prevDate.toString());
			sleep.sleep(5);
		}
		sleep.sleep(2);
		auditHistoryJob.kill();
		log.info("fetchAuditHistory complete");
	}
}

run();



