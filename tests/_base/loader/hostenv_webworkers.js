define([
    "doh/main",
    "dojo/has"
], function(doh, has){
    // summary:
    //      Test the loading of Dojo in the WebWorker environment.

    has.add("webworkers", (typeof Worker === 'function'));
    if(has("webworkers")){
        // Tests will still pass when workers not available but warning issued.

        var fixtures = {
            deferred: function(){
                this.deferred = new doh.Deferred();
            }
        };

        var tearDowns = {
            killWorker: function(){
                var self = this;
                this.deferred.then(function(){
                    self.worker.terminate();
                });

            },
            killBlobWorker: function(){
                var self = this;
                this.deferred.then(function(){
                    self.worker.terminate();
                    window.URL.revokeObjectURL(self.workerBlobURL);
                });

            }
        };

        doh.register("tests._base.hostenv_webworkers", [{
            name: "Loading Dojo core inside worker",
            setUp: fixtures.deferred,
            tearDown: tearDowns.killWorker,
            timeout: 5000,
            runTest: function(){
                // summary:
                //      Test whether dojo can be loaded in the worker

                var self = this;
                var worker = new Worker("../../dojo/tests/_base/loader/hostenv_webworkers/worker1.js");

                worker.addEventListener("message", function(message) {
                    if(message.data.value){
                        self.deferred.resolve();
                    }else{
                        self.deferred.reject();
                    }
                }, false);

                return this.deferred;
            }
        }, {
            name: "Load a dojo script via require",
            setUp: fixtures.deferred,
            tearDown: tearDowns.killWorker,
            timeout: 5000,
            runTest: function(){
                // summary:
                //      Test whether require works in the worker.

                var self = this;
                var worker = new Worker("../../dojo/tests/_base/loader/hostenv_webworkers/worker2.js");

                worker.addEventListener("message", function(message) {
                    if(message.data.value){
                        self.deferred.resolve();
                    }else{
                        self.deferred.reject();
                    }
                }, false);

                return this.deferred;
            }
        }, {
            name: "Load a dojo script via require in async mode",
            setUp: fixtures.deferred,
            tearDown: tearDowns.killWorker,
            timeout: 5000,
            runTest: function(){
                // summary:
                //      Test whether require works in the worker when in async mode.

                var self = this;
                var worker = new Worker("../../dojo/tests/_base/loader/hostenv_webworkers/worker3.js");

                worker.addEventListener("message", function(message) {
                    if(message.data.value){
                        self.deferred.resolve();
                    }else{
                        self.deferred.reject();
                    }
                }, false);

                return this.deferred;
            }
        }, {
            name: "Load a dojo script via require in a subworker",
            setUp: fixtures.deferred,
            tearDown: tearDowns.killWorker,
            timeout: 5000,
            runTest: function(){
                // summary:
                //      Test whether Dojo will load in a subworker.
                // description:
                //      This is more complex as two workers are created. The first acts as a
                //      middleman between this function and the subworker.  Some browsers do not
                //      support subworkers at writing (eg. Chrome - see:
                //      https://code.google.com/p/chromium/issues/detail?id=31666 for current status).
                //      Test issues a warning if subworks not available but passes the test.

                var self = this;
                var worker = new Worker("../../dojo/tests/_base/loader/hostenv_webworkers/worker4.js");

                worker.addEventListener("message", function(message) {
                    if(message.data.value){
                        if(message.data.warn !== ""){
                            console.warn(message.data.warn);
                        }
                        self.deferred.resolve();
                    }else{
                        self.deferred.reject();
                    }
                }, false);

                return this.deferred;
            }
        }, {
            name: "Test for loading in a blob worker",
            setUp: fixtures.deferred,
            tearDown: tearDowns.killBlobWorker,
            timeout: 5000,
            runTest: function(){
                // summary:
                //      Test for loading dojo and using require in a blob worker

                has.add("blobs", (typeof Blob === 'function'));
                if(has("blobs")){
                    function getBaseAbsoluteUrl(){
                        // summary:
                        //      Blobs need absolute urls to be used within them as relative is relative
                        //      to blob://<object>.
                        // TODO:
                        //      Is there a better way of calculating the absolute url base path?

                        var baseUrl = require.rawConfig.baseUrl.split("/");
                        var absoluteUrl = location.pathname.split("/");
                        absoluteUrl.pop();
                        baseUrl.pop();

                        return location.protocol+"//"+location.host+absoluteUrl.join("/")+"/"+baseUrl.join("/")+"/";
                    }

                    var workerBlob = new Blob([
                        'var dojoConfig = {' +
                            '"baseUrl":"' + getBaseAbsoluteUrl() + '",' +
                            '"packages":[{"name":"dojo", "location":"dojo"}]' +
                        '};' +

                        'importScripts(dojoConfig.baseUrl+"dojo/dojo.js");' +

                        'try{'+
                            'require(["dojo/tests/_base/loader/hostenv_webworkers/strings"], function(strings){' +
                                'this.postMessage({"test":"require is working", "value":true});' +
                            '});' +
                        '}catch(e){' +
                            'this.postMessage({' +
                                '"test":"require is working", "value":false' +
                            '});' +
                        '}'
                    ], {type:"text/javascript"});

                    var self = this;
                    var workerBlobURL = window.URL.createObjectURL(workerBlob);
                    var worker = new Worker(workerBlobURL);

                    worker.addEventListener("message", function(message) {
                        if(message.data.value){
                            self.deferred.resolve();
                        }else{
                            self.deferred.reject();
                        }
                    }, false);

                    return this.deferred;
                }else{
                    console.warn("Platform does not support Blobs");
                }
            }
        }, {
            name: "Test making a XHR request inside a worker using dojo/request",
            setUp: fixtures.deferred,
            tearDown: tearDowns.killWorker,
            timeout: 5000,
            runTest: function(){
                // summary:
                //      Test using dojo/request in a worker
                // description:
                //      This is a more advanced test to ensure Dojo's implementation of
                //      XHR works in the webworker.  It is also a general test of loading
                //      components via require and then using them.

                var self = this;
                var worker = new Worker("../../dojo/tests/_base/loader/hostenv_webworkers/worker5.js");

                worker.addEventListener("message", function(message) {
                    if(message.data.value){
                        self.deferred.resolve();
                    }else{
                        self.deferred.reject();
                    }
                }, false);

                return this.deferred;
            }
        }/*, {
            name: "Test using dojo/on in a worker",
            setUp: fixtures.deferred,
            tearDown: tearDowns.killWorker,
            timeout: 5000,
            runTest: function(){
                // summary:
                //      Test using dojo/on in a worker.
                // description:
                //      Another advanced test to see if dojo/on works in workers where there is no DOM.
                //      Test waits for the worker to request a message and then send one. Worker uses
                //      dojo/on to listen for messages on the worker global.  It responds with a
                //      pass for the test if it receives it correctly.

                var self = this;
                var worker = new Worker("../../dojo/tests/_base/loader/hostenv_webworkers/worker6.js");

                worker.addEventListener("message", function(message) {
                    if(message.data.type === "testResult"){
                        if(message.data.value){
                            self.deferred.resolve();
                        }else{
                            self.deferred.reject();
                        }
                    }else if(message.data.type === "requestMessage"){
                        worker.postMessage({type:"gotMessage"})
                    }
                }, false);

                return this.deferred;
            }
        }*/]);
    }else{
        console.warno("Platform does not support webworkers")
    }
});