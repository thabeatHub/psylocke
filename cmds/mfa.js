// mfa.js
//=================

var global_config = require('../config.json');
var auth_config = require(global_config.Auth.auth_config_file);
var clients_config = require(global_config.Clients.clients_config_file);

const { execSync } = require('child_process');
const { spawnSync } = require('child_process');


const fs = require('fs');
const AWS = require('aws-sdk');


function awsConfigureSetExecMFA(param, data){
  //console.log('Setting: ' + param + ' to ' + data);
  const child = spawnSync('aws', 
          ['configure', 'set', param, data, '--profile', auth_config.User.MFAProfileName], 
          { 
            encoding: 'utf8',
            timeout: 0,
            maxBuffer: 200*1024, //increase here
            killSignal: 'SIGTERM',
            cwd: null,
            env: null 
          });
        if(child.error) console.log('error', child.error);
        if(child.stdout) console.log('stdout ', child.stdout);
        if(child.stderr) console.log('stderr ', child.stderr);
}

function getSessionTokenForMFA(mfatoken){
  var credentials = new AWS.SharedIniFileCredentials({
    profile: auth_config.User.MainAccountProfile
  });
  AWS.config.credentials = credentials;
  console.log(credentials);
  var sts = new AWS.STS();
  sts.getSessionToken( {
    DurationSeconds: 3600, 
    SerialNumber: auth_config.User.MFASerial, 
    TokenCode: mfatoken
   }, function (err, data) {
    if (err){
      console.log(err, err.stack); // an error occurred
      return process.exit(1);
    }else{    
        // successful response
        //console.log(data);
        console.log(data.Credentials.AccessKeyId);
        console.log(data.Credentials.SecretAccessKey);
        console.log(data.Credentials.SessionToken);
        awsConfigureSetExecMFA('aws_access_key_id', data.Credentials.AccessKeyId);
        awsConfigureSetExecMFA('aws_secret_access_key', data.Credentials.SecretAccessKey);
        awsConfigureSetExecMFA('aws_session_token', data.Credentials.SessionToken);
      }
  });
}

exports.command = ['mfa [mfatoken]'],

exports.describe = 'mfa functions',

exports.builder = function(yargs){
  return yargs
    .reset()
    .usage('Usage: $0 mfa [mfatoken]') // top-level usage string
    .positional('mfatoken', {
      describe: 'mfatoken to input',
      type: 'string'
    })
    .options({
    })
    .help('h')
    .alias('h', 'help')
    .alias('v', 'version')
    .epilog('*** Use this script on your own discretion ***')
}

exports.handler = function (argv) {
  // do something with argv.
  console.log(argv);
  if ( (Object.keys(argv).length<3) ){
    //show help on empty command
    console.log("Test MFA!")    
   
  }
  if (argv.mfatoken){
    console.log("Attempting to get session with mfatoken: " + argv.mfatoken);
    getSessionTokenForMFA(argv.mfatoken);
  }
}

