#!/usr/bin/env node

import { Command, Option } from "commander";
import process = require('process');

import { deployContainer, destroyContainer } from "./duck/container";
import { deployAwsContainer, destroyAwsContainer } from "./duck/aws";
import { deployScwContainer, destroyScwContainer } from "./duck/scw";

const command = new Command();

/// Usage example:
//
// duck deploy container --project=duck --cloud=scw --env=dev --image="hashicorp/http-echo" --port=5678
// duck deploy container --project=duck --cloud=aws --env=dev --image="hashicorp/http-echo" --port=5678
//
// duck deploy container --project=id -e dev --image=ttl.sh --version=1.20
//
// cat service.yaml << EOF
// containers:
//   monapp:
//     version: 1.1.1
//     image: url
//     variables:
//       - VAR1=VAL1
// service:
//   postgresql:
//     type: postgresql
//     version: 1.16
// EOF
// duck deploy container --config=service.yaml
//
// duck migrate s3 -from=s3://... -to=s3://...

/////
// duck
//
const duck = command
  .name("duck")
  .description("CLI Duck pour exécuter des fonctions de provisionnement d'infra")
  .version("1.0.0");

/////
// Options 
//
const projectOpt = new Option("--project <project>", "Name of the project")
  .makeOptionMandatory()

const envOpt = new Option("--env <environment>", "Environment to deploy to, available")
  .choices(["dev"])
  .makeOptionMandatory()

const cloudOpt = new Option("--cloud <cloud>", "Cloud to use")
  .choices(["scw", "aws"])
  .makeOptionMandatory()

const imageOpt = new Option("--image <container image>", "Image to deploy")
  .makeOptionMandatory()

const portOpt = new Option("--port <port>", "service port")
  .makeOptionMandatory()


////
// duck [deploy|destroy]
//

const deploy = duck.command("deploy")
const destroy = duck.command("destroy")

////
// duck [deploy|destroy] container
//

// duck deploy container --project=duck --cloud=scw --env=dev --image="hashicorp/http-echo" --port=5678
deploy.command("container")
  .addOption(projectOpt)
  .addOption(envOpt)
  .addOption(cloudOpt)
  .addOption(imageOpt)
  .addOption(portOpt)
  .action(deployContainer)

// duck destroy container --project=duck --cloud=scw --env=dev --image="hashicorp/http-echo" --port=5678
destroy.command("container")
  .addOption(projectOpt)
  .addOption(cloudOpt)
  .addOption(envOpt)
  .action(destroyContainer)

/////
// duck [deploy|destroy] aws
//
const deployAws = deploy.command("aws")
const destroyAws = destroy.command("aws")

// duck deploy aws container --project=duck --env=dev --image="hashicorp/http-echo" --port=5678
deployAws.command("container")
  .addOption(projectOpt)
  .addOption(envOpt)
  .addOption(imageOpt)
  .addOption(portOpt)
  .action(deployAwsContainer)

// duck destroy aws container --project=duck --env=dev --image="hashicorp/http-echo" --port=5678
destroyAws.command("container")
  .addOption(projectOpt)
  .addOption(envOpt)
  .addOption(imageOpt)
  .addOption(portOpt)
  .action(destroyAwsContainer)

////
// duck [deploy|destroy] scw
//
const deployScw = deploy.command("scw")
const destroyScw = destroy.command("scw")

// duck deploy scw container --project=duck --env=dev --image="hashicorp/http-echo" --port=5678
deployScw.command("container")
  .addOption(projectOpt)
  .addOption(envOpt)
  .addOption(imageOpt)
  .addOption(portOpt)
  .action(deployScwContainer)

// duck destroy scw container --project=duck --env=dev --image="hashicorp/http-echo" --port=5678
destroyScw.command("container")
  .addOption(projectOpt)
  .addOption(envOpt)
  .addOption(imageOpt)
  .addOption(portOpt)
  .action(destroyScwContainer)

command.parse(process.argv);
