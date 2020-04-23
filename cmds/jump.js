// jump.js
//=================

var global_config = require('../config.json');
var auth_config = require(global_config.Auth.auth_config_file);
var clients_config = require(global_config.Clients.clients_config_file);

const { execSync } = require('child_process');
const { spawnSync } = require('child_process');

// process.env.AWS_SDK_LOAD_CONFIG=true;
// process.env.AWS_PROFILE=auth_config.User.FederatedProfileName;

const AWS = require('aws-sdk');

process.env.AWS_SDK_LOAD_CONFIG=true;
process.env.AWS_PROFILE=auth_config.User.FederatedProfileName;
//process.env.AWS_SDK_LOAD_CONFIG=true;
//process.env.AWS_CONFIG_FILE="~/.aws/config";
AWS.config.region = GetConfigAWS("region")

function GetConfigAWS(param){
  const child = spawnSync('aws', 
          ['configure', 'get', param, '--profile', auth_config.User.FederatedProfileName], 
          { 
            encoding: 'utf8',
            timeout: 0,
            maxBuffer: 200*1024, //increase here
            killSignal: 'SIGTERM',
            cwd: null,
            env: null 
          });
        if(child.stderr) console.log('stderr ', child.stderr);
        if(child.error) return 'eu-west-1';
        if(child.stdout) return child.stdout.trim();       
}

function awsConnectToInstance(instanceid){
  const child = spawnSync('aws', 
          ['ssm', 'start-session', '--target', instanceid, '--profile', auth_config.User.FederatedProfileName], 
          { 
            encoding: 'utf8',
            timeout: 0,
            maxBuffer: 200*1024, //increase here
            killSignal: 'SIGTERM',
            cwd: null,
            env: null,
            stdio: 'inherit',
            shell: true
          });
        if(child.error) console.log('error', child.error);
        if(child.stderr) console.log('stderr ', child.stderr);
        if(child.stdout) console.log(child.stdout);       
}

function awsTunnelToInstance(instanceid, localport, destinationport){
  const child = spawnSync('aws', 
                      ['ssm', 'start-session', '--target', instanceid,'--document-name AWS-StartPortForwardingSession --parameters \'{\"portNumber\":[\"' + destinationport + '\"], \"localPortNumber\":[\"' + localport + '\"]}\'', '--profile', auth_config.User.FederatedProfileName], 
          { 
            encoding: 'utf8',
            timeout: 0,
            maxBuffer: 200*1024, //increase here
            killSignal: 'SIGTERM',
            cwd: null,
            env: null,
            stdio: 'inherit',
            shell: true
          });
        if(child.error) console.log('error', child.error);
        if(child.stderr) console.log('stderr ', child.stderr);
        if(child.stdout) console.log(child.stdout);       
}

function awsConnectToInstanceByName(someinstancetag){
  var credentials = new AWS.SharedIniFileCredentials({profile: auth_config.User.FederatedProfileName});
  AWS.config.credentials = credentials;
  var ec2 = new AWS.EC2();
  if(someinstancetag == ''){
    var params = {};
  } else {
    var params = {
      Filters: [
          {
            Name: 'tag:Name',
            Values: [
              someinstancetag,
              /* more items */
            ]
          }
      ]
    };
  }
  ec2.describeInstances(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else                // successful response
      data.Reservations.forEach((reservation, index) => {
        //console.log(reservation);
        reservation.Instances.forEach((instance, index) => {
            console.log('Id: ' + instance.InstanceId + ' --> Name: ' + instance.Tags.find(({Key}) => Key === "Name").Value);
            if (someinstancetag !== ''){ 
              const child = spawnSync('aws', 
                      ['ssm', 'start-session', '--target', instance.InstanceId, '--profile', auth_config.User.FederatedProfileName], 
                      { 
                        encoding: 'utf8',
                        timeout: 0,
                        maxBuffer: 200*1024, //increase here
                        killSignal: 'SIGTERM',
                        cwd: null,
                        env: null,
                        stdio: 'inherit',
                        shell: true
                      });
                    if(child.error) console.log('error', child.error);
                    if(child.stderr) console.log('stderr ', child.stderr);
                    if(child.stdout) console.log(child.stdout); 
            }
        });
      });
  });       
}

function awsTunnelToInstanceByName(someinstancetag, localport, destinationport){
  var credentials = new AWS.SharedIniFileCredentials({profile: auth_config.User.FederatedProfileName});
  AWS.config.credentials = credentials;
  var ec2 = new AWS.EC2();
  if(someinstancetag == ''){
    var params = {};
  } else {
    var params = {
      Filters: [
          {
            Name: 'tag:Name',
            Values: [
              someinstancetag,
              /* more items */
            ]
          }
      ]
    };
  }
  ec2.describeInstances(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else                // successful response
      data.Reservations.forEach((reservation, index) => {
        //console.log(reservation);
        reservation.Instances.forEach((instance, index) => {
            console.log('Id: ' + instance.InstanceId + ' --> Name: ' + instance.Tags.find(({Key}) => Key === "Name").Value);
            if (someinstancetag !== ''){ 
              const child = spawnSync('aws', 
                      ['ssm', 'start-session', '--target', instance.InstanceId,'--document-name AWS-StartPortForwardingSession --parameters \'{\"portNumber\":[\"' + destinationport + '\"], \"localPortNumber\":[\"' + localport + '\"]}\'', '--profile', auth_config.User.FederatedProfileName], 
                      { 
                        encoding: 'utf8',
                        timeout: 0,
                        maxBuffer: 200*1024, //increase here
                        killSignal: 'SIGTERM',
                        cwd: null,
                        env: null,
                        stdio: 'inherit',
                        shell: true
                      });
                    if(child.error) console.log('error', child.error);
                    if(child.stderr) console.log('stderr ', child.stderr);
                    if(child.stdout) console.log(child.stdout); 
            }
        });
      });
  });       
}

function awsListInstances(someinstancetag){
  var credentials = new AWS.SharedIniFileCredentials({profile: auth_config.User.FederatedProfileName});
  AWS.config.credentials = credentials;
  var ec2 = new AWS.EC2();
  if(someinstancetag == ''){
    var params = {};
  } else {
    var params = {
      Filters: [
          {
            Name: 'tag:Name',
            Values: [
              someinstancetag,
              /* more items */
            ]
          }
      ]
    };
  }
  ec2.describeInstances(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else                // successful response
      data.Reservations.forEach((reservation, index) => {
        //console.log(reservation);
        reservation.Instances.forEach((instance, index) => {
            console.log('Id: ' + instance.InstanceId + ' --> Name: ' + instance.Tags.find(({Key}) => Key === "Name").Value);
            if (someinstancetag !== ''){ 
              return instance.InstanceId;
            }
        });
      });
  });       
}


// module.exports = {
//  listRegions: function(){
//    console.log("hey there!");
//  }
// };

exports.command = 'jump [instanceid]',

exports.describe = 'ssm access to instances',

exports.builder = function(yargs){
  return yargs
    .reset()
    .usage('Usage: $0 jump [instanceid]') // top-level usage string
    .options({
      'totarget': {
        alias: 'tt',
        desc: 'jumps to specific target by name tag',
        type: 'string'
      },
      'listinstances': {
        alias: 'li',
        desc: 'lists instances by name tag',
        type: 'string'
      },
      'destinationport': {
        alias: ['dp', 'destport'],
        desc: 'port to connect to in destination instance',
        type: 'number',
        implies: ['destinationport', 'localport']
      },
      'localport': {
        alias: ['lp', 'localport'],
        desc: 'port in local machine to map to destination',
        type: 'number',
        implies: ['localport', 'destinationport']
      },
    })
    .help('h')
    .alias('h', 'help')
    .alias('v', 'version')
    .epilog('*** Use this script on your own discretion ***')
}

exports.handler = function (argv) {
  // do something with argv.
  // console.log(argv);
  if(argv.instanceid){
    if( argv.destinationport!=null || argv.localport!=null ){
      awsTunnelToInstance(argv.instanceid, argv.localport, argv.destinationport);
    }
    else{
      awsConnectToInstance(argv.instanceid);
    }
  }
  if(argv.totarget !== null ){
    if( argv.destinationport!=null || argv.localport!=null ){
      awsTunnelToInstanceByName(argv.totarget, argv.localport, argv.destinationport);
    }
    else{
      awsConnectToInstanceByName(argv.totarget);
    }
  }
  if(argv.listinstaces !== null){
    //console.log("List Instances!");
    awsListInstances(argv.listinstances);
  }
}

