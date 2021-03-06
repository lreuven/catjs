_cat.utils.chai = function () {

    var _chai,
        assert,
        _state = 0; // state [0/1] 0 - not evaluated / 1 - evaluated

    function _isSupported() {
        _state = 1;
        if (typeof chai !== "undefined") {
            _chai = chai;
            assert = _chai.assert;

        } else {
            _cat.core.log.info("[catjs chai utils] Chai library is not supported, skipping annotation 'assert', consider adding it to the .catproject dependencies");
        }
    }

    function _splitCapilalise(string) {
        if (!string) {
            return string;
        }

        return string.split(/(?=[A-Z])/);
    }

    function _capitalise(string) {
        if (!string) {
            return string;
        }
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function _getDisplayName(name) {
        var result = [];

        if (name) {
            name = _splitCapilalise(name);
            if (name) {
                name.forEach(function(item) {
                    result.push(_capitalise(item));
                });
            }
        }
        return result.join(" ");
    }

    return {

        /**
         * This is an assert
         * In case of compile (nodejs) use assert_call.tpl 
         * 
         * Examples:
         *   
         *   // Code String case: 
         *   _cat.core.clientmanager.delayManager({
         *       commands: [
         *           function(context, thi$, testButton) {
         *               _cat.utils.chai.assert(context);
         *           }
         *       ],
         *       context: {
         *           'code': ["assert", "ok(testButton[0],\"No valid test element button\")\n"].join("."),
         *           'fail': true,
         *           scrapName: 'assert',
         *           scrap: _ipkg.scrap,
         *           args: _args,
         *           scrapRowIdx: 0
         *       }
         *   });
         *   
         *   // Code function case:
         *   
         * @param config
         * @constructor
         */
        assert: function (config) {

            if (!_state) {
                _isSupported();
            }

            var code,
                result,
                fail,
                failure,
                scrap = config.scrap,
                scrapName = (_cat.utils.Utils.isArray(scrap.name) ?  scrap.name[0] : scrap.name),
                scrapDescription = (scrap.description ? scrap.description[0] : undefined),
                testName = (scrapName || "NA"),
                key, items=[], args=[],
                catconfig = _cat.core.getConfig(),
                reportFormats;

            if (_chai) {
                if (config) {
                    code = config.code;
                    fail = config.fail;
                }
                if (assert) {
                    var success = true;
                    var output;
                    if (code) {
                        try {
                            
                            if (_cat.utils.Utils.isFunction(code)) {
                                
                                result = code.apply(this, arguments);
                                
                            } else if (_cat.utils.Utils.isString(code)) { 
                                
                                items.push(assert);
                                    args.push("assert");
                                    for (key in config.args) {
                                    if (config.args.hasOwnProperty(key)) {
                                        args.push(key);
                                        items.push(config.args[key]);
                                    }
                                }
    
                                if (code.indexOf("JSPath.") !== -1) {
                                    items.push((typeof JSPath !== "undefined" ? JSPath : undefined));
                                    args.push("JSPath");
                                    result =  new Function(args, "if (JSPath) { return " + code + "} else { console.log('Missing dependency : JSPath');  }").apply(this, items);
                                } else {
                                    result =  new Function(args, "return " + code).apply(this, items);
                                }
                            }

                        } catch (e) {
                            success = false;
                            output = ["[CAT] Test failed, exception: ", e].join("");
                        }
                    }

                    if (success) {
                        output = "Test Passed";
                    }

                    if (catconfig.isReport()) {
                        reportFormats = catconfig.getReportFormats();
                    }

                    // create catjs assertion entry
                    _cat.utils.assert.create({
                        name: testName,
                        displayName:  (scrapDescription || _getDisplayName(testName)),
                        status: (success ? "success" : "failure"),
                        message: output,
                        success: success,
                        ui: catconfig.isUI(),
                        send: reportFormats
                    });

                    if (!success) {
                        console.warn((output || "[CAT] Hmmm... It's an error alright, can't find any additional information"), (fail || ""));
                    }
                }
            }
        },      

        /**
         * For the testing environment, set chai handle
         *
         * @param chai
         */
        test: function (chaiarg) {
            chai = chaiarg;
        }

    };

}();