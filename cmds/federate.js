// federate.js
//=================

var global_config = require('../config.json');
var auth_config = require(global_config.Auth.auth_config_file);
var clients_config = require(global_config.Clients.clients_config_file);

const { execSync } = require('child_process');
const { spawnSync } = require('child_process');

const fs = require('fs');
const AWS = require('aws-sdk');
const yargs = require('yargs');
const inquirer = require('inquirer');
const { choices } = require('yargs');
inquirer.registerPrompt('search-list', require('inquirer-search-list'));
//const { options } = require('yargs');

function awsConfigureSetExec(param, data){
  //console.log('Setting: ' + param + ' to ' + data);
  const child = spawnSync('aws', 
          ['configure', 'set', param, data, '--profile', auth_config.User.FederatedProfileName], 
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

function listClients(print = false){
  var options = []
  for(client in clients_config.Clients){
      if (print) console.log(client+' -> '+clients_config.Clients[client].AccountID);  
      options.push( { name: client, value: clients_config.Clients[client].AccountID });
      //options.push(client);
  }
  return options;
}

function federateToAccount(account_alias, callback){
  var credentials = new AWS.SharedIniFileCredentials({
    profile: auth_config.User.MFAProfileName
  });
  AWS.config.credentials = credentials;
  // console.log(credentials);
  var sts = new AWS.STS();
  sts.assumeRole( {
    DurationSeconds: 3600, 
    ExternalId: auth_config.User.ExternalID,
    RoleArn: "arn:aws:iam::"+clients_config.Clients[account_alias].AccountID+":role/"+'role_nome' in clients_config.Clients[account_alias] ? clients_config.Clients[account_alias].AccountRole : auth_config.User.FederationRole, 
    RoleSessionName: "AUTO-FEDERATED-"+auth_config.User.ExternalID
   }, function (err, data) {
    if (err){
      console.log('Error in federateToAccount!')
      console.log(err, err.stack); // an error occurred
      return process.exit(1);
    }else{    
        // successful response
        console.log(data.Credentials.AccessKeyId);
        console.log(data.Credentials.SecretAccessKey);
        console.log(data.Credentials.SessionToken);
        awsConfigureSetExec('aws_access_key_id', data.Credentials.AccessKeyId);
        awsConfigureSetExec('aws_secret_access_key', data.Credentials.SecretAccessKey);
        awsConfigureSetExec('aws_session_token', data.Credentials.SessionToken);
      }
  });
}

function federateToAccountID(account_id, callback){
  //console.log(account_id);
  var credentials = new AWS.SharedIniFileCredentials({
    profile: auth_config.User.MFAProfileName
  });
  var account_alias;
  AWS.config.credentials = credentials;
  //console.log(credentials);
  Object.keys(clients_config.Clients).forEach(element => {
    //console.log(clients_config.Clients[element].AccountID+ " is equal to " + account_id )
    account_alias = clients_config.Clients[element].AccountID === account_id ? element : account_alias;
    //console.log(account_alias);
  });
  console.log(account_alias);
  console.log("Attempting federation with AccountID");
  var sts = new AWS.STS();
  RoleName = 'role_name' in clients_config.Clients[account_alias] ? clients_config.Clients[account_alias].role_name : auth_config.User.FederationRole;
  console.log("Using " + RoleName + " to federate.");
  sts.assumeRole( {
    DurationSeconds: 3600, 
    ExternalId: auth_config.User.ExternalID,
    RoleArn: "arn:aws:iam::" + account_id + ":role/" + RoleName,
    RoleSessionName: "AUTO-FEDERATED-"+auth_config.User.ExternalID
   }, function (err, data) {
    if (err){
      console.log(err, err.stack); // an error occurred
      return process.exit(1);
    }else{     
        // successful response
        console.log(data.Credentials.AccessKeyId);
        console.log(data.Credentials.SecretAccessKey);
        console.log(data.Credentials.SessionToken);
        awsConfigureSetExec('aws_access_key_id', data.Credentials.AccessKeyId);
        awsConfigureSetExec('aws_secret_access_key', data.Credentials.SecretAccessKey);
        awsConfigureSetExec('aws_session_token', data.Credentials.SessionToken);
      }
  });
}

function executeCommand(command){
  arrayedCommand = command.split(" ");
  const child = spawnSync( arrayedCommand[0], //the actual command 
        arrayedCommand.slice(1, arrayedCommand.length), //the params
        { 
            encoding: 'utf8',
            timeout: 0,
            maxBuffer: 200*1024, //increase here
            killSignal: 'SIGTERM',
            cwd: null,
            env: null 
          });
      if(child.error) console.log('error', child.error);
      if(child.stdout) console.log(child.stdout);
      if(child.stderr) console.log('stderr ', child.stderr);
}

function federateAndExecute(account_alias, command){
  var credentials = new AWS.SharedIniFileCredentials({
    profile: auth_config.User.MFAProfileName
  });
  AWS.config.credentials = credentials;
  // console.log(credentials);
  var sts = new AWS.STS();
  sts.assumeRole( {
    DurationSeconds: 3600, 
    ExternalId: auth_config.User.ExternalID,
    RoleArn: "arn:aws:iam::"+clients_config.Clients[account_alias].AccountID+":role/"+auth_config.User.FederationRole, 
    RoleSessionName: "AUTO-FEDERATED-"+auth_config.User.ExternalID
   }, function (err, data) {
    if (err){
      console.log(err, err.stack); // an error occurred
      return process.exit(1);
    }else{    
        // successful response
        //console.log(data.Credentials.AccessKeyId);
        //console.log(data.Credentials.SecretAccessKey);
        //console.log(data.Credentials.SessionToken);
        awsConfigureSetExec('aws_access_key_id', data.Credentials.AccessKeyId);
        awsConfigureSetExec('aws_secret_access_key', data.Credentials.SecretAccessKey);
        awsConfigureSetExec('aws_session_token', data.Credentials.SessionToken);
        executeCommand(command);
      }
  });
}

exports.command = ['$0', 'federate'],

exports.describe = 'default command: federation functions',

exports.builder = function(yargs){
  return yargs
    .usage('Usage: $0 \nScript Description\n **** This script is not finished nor production ready ****')
    .options({
      'list': {
        alias: 'l',
        desc: 'List all available Clients',
        type: 'boolean'
      },
      'select': {
        alias: 's',
        desc: 'Menu Select Client',
        type: 'boolean'
      },
      'account': {
        alias: ['a', 'accountalias'],
        desc: 'Receives account alias. Federate on an account by [account alias].',
        type: 'string',
        choices: Object.keys(clients_config.Clients)
      },
      'accountid': {
        alias: ['A', 'accountID'],
        desc: 'Receives account ID. Federate on an account by [account ID].',
        type: 'string'
      },
      'command': {
        alias: ['c'],
        desc: 'Executes Command',
        type: 'string'
      },
      'full': {
        alias: ['f', 'all', 'loop'],
        desc: 'Executes Command on every client',
        type: 'string'
      },
      'test': {
        alias: 'z',
        desc: 'flag for test purposes',
        type: 'boolean'
      }
    })
    .showHelpOnFail(true).recommendCommands().strict()
    .help('h')
    .alias('h', 'help')
    .alias('v', 'version')
    .epilog('*** Use this script on your own discretion ***')
}

exports.handler = function (argv) {
  // do something with argv
  //console.log(argv);
  //console.log(Object.keys(argv).length);
  if ( (Object.keys(argv).length<3) ) { //show help on empty command
    yargs.showHelp();
    //console.log(Object.keys(argv).length)
  }
  if(argv.list){
    listClients(true);
    return process.exit(0);
  };
  if(argv.select){
    var choices = listClients(false); 
    inquirer
      .prompt([
        {
          type: 'search-list',
          loop: false,
          name: 'id',
          message: 'Select an Account:',
          choices
        }
      ])
        .then( (answer) => {
          //console.log(JSON.stringify(answer, null, '  '));
          //console.log(answer.id);
          console.log('Getting Credentials for:', answer.id);
          federateToAccountID(answer.id);
        })
        .catch(() => {
          console.error;
          //return process.exit(0);
        });
  };
  if(argv.account){
    //console.log(argv.accountalias);
    federateToAccount(argv.accountalias);
  };
  if(argv.accountid){
    //console.log(argv.accountid);
    federateToAccountID(argv.accountid);
  };
  if(argv.command){
    //console.log(argv.command);
    executeCommand(argv.command);
  };
  if(argv.full){ //full
    //console.log(argv.loop);
    Object.values(clients_config.Clients).forEach( (client, index) => {
      console.log(client.Alias);
      federateAndExecute(client.Alias, argv.full);
    });
  };
  if(argv.test){
    //console.log(clients_config.Clients);
    //console.log(Object.values(clients_config.Clients));
    Object.values(clients_config.Clients).forEach( (client, index) => {
      //console.log(index);
      console.log(client);
    });
  };
}