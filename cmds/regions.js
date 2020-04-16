// regions.js
//=================

var global_config = require('../config.json');
var auth_config = require(global_config.Auth.auth_config_file);
var clients_config = require(global_config.Clients.clients_config_file);

const { execSync } = require('child_process');
const { spawnSync } = require('child_process');


function awsConfigureGetExec(param){
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
        if(child.error) console.log('error', child.error);
        if(child.stderr) console.log('stderr ', child.stderr);
        if(child.stdout) console.log(child.stdout);
        
}

function awsConfigureSetExec(param, data){
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

exports.command = 'regions',

exports.describe = 'description of regions',

exports.builder = function(yargs){
  return yargs
    .reset()
    .usage('Usage: $0 regions --[listregions|showworkingregion|setregion] [region]') // top-level usage string
    .positional('region', {
      describe: 'region to configure',
      default: 'eu-west-1'
    })
    .options({
      'listregions': {
        alias: 'lr',
        desc: 'list available regions',
        type: 'boolean'
      },
      'showworkingregion': {
        alias: 'wr',
        desc: 'show current federation profile region',
        type: 'boolean'
      },
      'setregion': {
        alias: 'sr',
        desc: 'set federation profile region',
        type: 'string',
        choices: global_config.availableRegions
      },
    })
    .help('h')
    .alias('h', 'help')
    .alias('v', 'version')
    .epilog('*** Use this script on your own discretion ***')
}

exports.handler = function (argv) {
  // do something with argv.

  //console.log('Regions Command');
  //console.log(argv);
  //console.log(Object.keys(argv).length);
  if(argv.listregions || Object.keys(argv).length < 4){
    global_config.availableRegions.forEach(function(region){
      console.log(region);
    });
  }
  if(argv.showworkingregion){
    awsConfigureGetExec('region');
  }
  if(argv.setregion){
    awsConfigureSetExec('region', argv.setregion);
  }
}

