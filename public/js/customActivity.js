define([
    'postmonger'
], function (
    Postmonger
) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var steps = [ // initialize to the same value as what's set in config.json for consistency
        { "label": "Step 1", "key": "step1" }
    ];

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);
    connection.on('requestedSchema', onGetSchema);
    connection.on('requestedCulture', onGetCulture);

    connection.on('clickedNext', onClickedNext);
    connection.on('clickedBack', onClickedBack);
    connection.on('gotoStep', onGotoStep);

    function onRender() {
        connection.trigger('ready'); // JB will respond the first time 'ready' is called with 'initActivity'

        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        connection.trigger('requestSchema');
        connection.trigger('requestCulture');


    }

    function initialize(data) {
        console.log("initialize is called.");
        if (data) {
            payload = data;
            init();
        }
    }

    function onGetTokens(tokens) {
        // Response: tokens == { token: <legacy token>, fuel2token: <fuel api token> }
        // console.log(tokens);
    }

    function onGetEndpoints(endpoints) {
        // Response: endpoints == { restHost: <url> } i.e. "rest.s1.qa1.exacttarget.com"
        // console.log(endpoints);
    }

    function onGetSchema(payload) {
        // Response: payload == { schema: [ ... ] };
        // console.log('requestedSchema payload = ' + JSON.stringify(payload, null, 2));
    }

    function onGetCulture(culture) {
        // Response: culture == 'en-US'; culture == 'de-DE'; culture == 'fr'; etc.
        // console.log('requestedCulture culture = ' + JSON.stringify(culture, null, 2));
    }

    function onClickedNext() {
        console.log("onClickedNext is called.");
        save();
    }

    function onClickedBack() {
        connection.trigger('prevStep');
    }

    function onGotoStep(step) {
        showStep(step);
        connection.trigger('ready');
    }

    function showStep(step, stepIndex) {
    }

    // -----------------------------------
    function init() {
        // 設定画面の初期表示 ※設定値はconfig.jsonで定義しておく
        var msg = payload.arguments.execute.inArguments[0].message;
        var info = payload.arguments.execute.inArguments[0].info;
        console.log(`values are ${msg}|${info}`);

        $('#message').val(msg);
        $('#information').val(info);

    }

    // -----------------------------------
    function save() {
        // 設定画面の設定値をpayloadへ保存
        var msg = $('#message').val();
        var info = $('#information').val();

        payload.arguments.execute.inArguments[0].message = msg;
        payload.arguments.execute.inArguments[0].info = info;

        // Valication check
        if (msg == "") {
            // Journey validationでエラーになる
            $('#errmsg').show();
            payload['metaData'].isConfigured = false;
            connection.trigger('ready');
        } else {
            $('#errmsg').hide();
            payload['metaData'].isConfigured = true;

            console.log(`Saved!! Payload: ${JSON.stringify(payload)}`);
            connection.trigger('updateActivity', payload);
        }
    }
});
