// jump.js
//=================

var global_config = require('../config.json');
var auth_config = require(global_config.Auth.auth_config_file);
var clients_config = require(global_config.Clients.clients_config_file);

const { execSync } = require('child_process');
const { spawnSync } = require('child_process');

// process.env.AWS_SDK_LOAD_CONFIG=true;
// process.env.AWS_PROFILE=auth_config.User.FederatedProfileName;
// process.env.AWS_CONFIG_FILE='/Users/thabeat/.aws/config';

const AWS = require('aws-sdk');

//process.env.AWS_SDK_LOAD_CONFIG=true;
//process.env.AWS_CONFIG_FILE="~/.aws/config";
var credentials = new AWS.SharedIniFileCredentials({profile: auth_config.User.FederatedProfileName});
AWS.config.credentials = credentials;
//AWS.config.region = 


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

function awsConnectToInstanceByName(someinstancetag){
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

function awsListInstances(someinstancetag){
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
    })
    .help('h')
    .alias('h', 'help')
    .alias('v', 'version')
    .epilog('*** Use this script on your own discretion ***')
}

exports.handler = function (argv) {
  // do something with argv.
  //console.log(argv);
  if(argv.instanceid){
    awsConnectToInstance(argv.instanceid);
  }
  if(argv.totarget !== null){
    //console.log("To Target!");
    awsConnectToInstanceByName(argv.totarget);
  }
  if(argv.listinstaces !== null){
    //console.log("List Instances!");
    awsListInstances(argv.listinstances);
  }
}

