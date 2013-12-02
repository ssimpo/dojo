function webworkerDojoConfig(config, global, has){
// TODO, why can we not do the following:
// exports.config = function(config, global){
	// summary:
	//		This module provides bootstrap support for WebWorkers

	var hasCache = {
		"host-browser": 0,
		"dom": 0,
		"dojo-dom-ready-api": 0,
		"dojo-sniff": 0,
		"dojo-inject-api": 1,
		"host-webworker": 1
	};

	for(var p in hasCache){
		config.hasCache[p] = hasCache[p];
	}

	global.window = global;

    if(has("config-cacheBust")){
        var fixupUrl= function(url){
            url += ""; // make sure url is a Javascript string (some paths may be a Java string)
            return url + ((/\?/.test(url) ? "&" : "?") + new Date());
        }
    }else{
        var fixupUrl= function(url){
            return url;
        }
    }

	// reset some configuration switches with webworker-appropriate values
	var webworkerConfig = {
		"loaderPatch": {
			injectUrl: function(url, callback){
				try{
					importScripts(url);
					callback();
				}catch(e){
					console.info("failed to load resource (" + url + ")");
					console.error(e);
				}
			},
			getText: function(url, async, onLoad){
				var xhr = new XMLHttpRequest();
				xhr.open('GET', fixupUrl(url), false);
				xhr.send(null);
				if(xhr.status == 200 || (!location.host && !xhr.status)){
					if(onLoad){
						onLoad(xhr.responseText, async);
					}
				}else{
					console.error("xhrFailed", xhr.status);
				}
				return xhr.responseText;
			}
		}
	}
	for(p in webworkerConfig){
		config[p] = webworkerConfig[p];
	}
}