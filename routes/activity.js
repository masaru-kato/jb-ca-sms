'use strict';
var util = require('util');

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
var util = require('util');
var http = require('https');

exports.logExecuteData = [];

function logData(req) {
  exports.logExecuteData.push({
    body: req.body,
    headers: req.headers,
    trailers: req.trailers,
    method: req.method,
    url: req.url,
    params: req.params,
    query: req.query,
    route: req.route,
    cookies: req.cookies,
    ip: req.ip,
    path: req.path,
    host: req.host,
    fresh: req.fresh,
    stale: req.stale,
    protocol: req.protocol,
    secure: req.secure,
    originalUrl: req.originalUrl
  });
  console.log("body: " + util.inspect(req.body));
  console.log("headers: " + req.headers);
  console.log("trailers: " + req.trailers);
  console.log("method: " + req.method);
  console.log("url: " + req.url);
  console.log("params: " + util.inspect(req.params));
  console.log("query: " + util.inspect(req.query));
  console.log("route: " + req.route);
  console.log("cookies: " + req.cookies);
  console.log("ip: " + req.ip);
  console.log("path: " + req.path);
  console.log("host: " + req.host);
  console.log("fresh: " + req.fresh);
  console.log("stale: " + req.stale);
  console.log("protocol: " + req.protocol);
  console.log("secure: " + req.secure);
  console.log("originalUrl: " + req.originalUrl);
}

/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function (req, res) {
  logData(req);
  return res.status(200).send('Edit');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function (req, res) {
  logData(req);
  return res.status(200).send('Save');
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function (req, res) {

  var params = "";

  JWT(req.body, process.env.jwtSecret, (err, decoded) => {

    // verification error -> unauthorized request
    if (err) {
      console.error("【ERROR】 JWT verification");
      console.error(err);
      return res.status(401).end();
    }

    if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
      // ok
      console.log(`■IN ARGS: ${JSON.stringify(decoded.inArguments)}`);
      params = decoded.inArguments[0];
    } else {
      // NG
      console.error(`【ERROR】 inArguments invalid. : ${JSON.stringify(decoded.inArguments)}`);
      return res.status(400).end();
    }
  });

  //■■■■ REST API Call to send messge START　■■■■
  var request = require('request');
  var countryCode = (params.countryCode) ? params.countryCode : '+81'; 
  var mobileNumber = params.phone;
  var message = params.message;

  var outArgs = {
    status: 'OK',
    error : "none",
    info: `countryCode:${countryCode},mobileNumber:${mobileNumber},message:${message}`,
    retmsg: "none"
  };
  
  request.post({
    headers: {
      'content-type' : 'application/x-www-form-urlencoded',
      'Accepts': 'application/json'
    },
    url:     process.env.BLOWERIO_URL + '/messages',
    form:    {
      to: countryCode + mobileNumber,
      message: message
    }
  }, function(error, response, body){
    if (!error && response.statusCode == 201)  {
      console.log('Message sent!');
    } else {
      var apiResult = JSON.parse(body);
      console.log('Error was: ' + apiResult.message);
      outArgs.status = 'Error';
      outArgs.error = apiResult.message;
      console.error(`■ERROR INFO: ${JSON.stringify(outArgs)}`);
    }
    console.log(`■OUT ARGS: ${JSON.stringify(outArgs)}`);
    return res.status(200).json(outArgs);
    })
  //■■■■ REST API Call to send messge END　■■■■  

  //outArgs = httpRequest(countryCode, mobileNumber, message, outArgs);
};

/*
function httpRequest(countryCode, mobileNumber, message, outArgs){
  var request = require('then-request');
  request('POST', 
    process.env.BLOWERIO_URL + '/messages' ,
    {
    headers: {
      'content-type' : 'application/x-www-form-urlencoded',
      'Accepts': 'application/json'
    },
    form: {
      to: countryCode + mobileNumber,
      message: message
    }
  }).done(function (response) {
    if(response.statusCode == 201){
      //success
    }else{
      var apiResult = JSON.parse(response.body);
      outArgs.status = 'Error';
      outArgs.error = apiResult.message;
    }
    console.log("API ret : "+response.statusCode);
    return outArgs;
  });
}
*/

/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function (req, res) {
  logData(req);
  return res.status(200).send('Publish');
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function (req, res) {
  logData(req);
  return res.status(200).send('Validate');
};

