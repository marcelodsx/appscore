var log4js = require('log4js');
var log = log4js.getLogger("SccoreManager");
var config = require("../config.json");

/** 
 * Based on the health rules figure out what score the app belongs too.
 */
exports.getAppScore = function(appHealthRules){
	var rec = this.getAppScoreRecord(appHealthRules);
	if(rec){
		return rec.score;
	}
	return 0;
	
}

/**
 * Cycle through the config to get the first score.
 */
exports.getAppScoreRecord = function(appHealthRules){
	var names = appHealthRules.join(",").toString();
	var appScoreRec;
		
	for (var i = 0; i < config.scores.length; ++i) {
        var scoreRec = config.scores[i];
        var result = names.match(scoreRec.hr_match);
		if(result && result.length > 0){
			appScoreRec = scoreRec;
			break;
		}
    }
		
	return appScoreRec;
}
