#!/usr/bin/env node

//Own Config
var global_config = require('./config.json');
var auth_config = require(global_config.Auth.auth_config_file);
var clients_config = require(global_config.Clients.clients_config_file);

//Custom Libraries
// const selectRegion = require('./extensions/select-region');
process.env.AWS_SDK_LOAD_CONFIG=1;
//process.env.AWS_PROFILE=auth_config.User.MFAProfileName;
process.env.AWS_CONFIG_FILE=global_config.UserConfig.aws_cli_config_file;


//External Libraries
const fs = require('fs');
const AWS = require('aws-sdk');
const yargs = require('yargs');
const argv = require('yargs')
	.commandDir('./cmds')
    .argv;

const { execSync } = require('child_process');
const { spawnSync } = require('child_process');
// stderr is sent to stderr of parent process
// you can set options.stdio if you want it to go elsewhere

// var credentials = new AWS.SharedIniFileCredentials({profile: auth_config.User.MFAProfileName});
// AWS.config.credentials = credentials;

//console.log(argv);
//console.log(JSON.stringify(auth_config, null , ' '));