#!/usr/bin/env node
import {IProgram, Layer} from "./tools/layer";
import {Command} from "commander";
import {SiteStatiqueWebSurS3} from "./usecases/DeployerUnSiteStatiqueSurUnBucketS3";
import {ContainerSurEcsFargate} from "./usecases/DeployerUnContainerSurEcsFargate";

const process = require('process');

const command = new Command();

async function initLayer(program: IProgram) {
    const layer: Layer = new Layer("dev", program)
    await layer.init()
    await layer.installPlugins()
    await layer.setConfig([{
        key: "aws:region",
        value: "eu-west-3"
    }])
    return layer;
}

const deploieSiteWeb = async () => {
    const siteWeb = new SiteStatiqueWebSurS3([{name: "aws", version: "v6.66.2"}]);
    await siteWeb.run()
    const layer = await initLayer(siteWeb);
    await layer.refresh();
    const upRes = await layer.up();
    console.log(`update summary: \n${JSON.stringify(upRes.summary.resourceChanges, null, 4)}`);
    console.log(`website url: ${upRes.outputs.websiteUrl.value}`);
}

const deploieEcs = async () => {
    const serviceFargate = new ContainerSurEcsFargate([{name: "aws", version: "v6.66.2"}]);
    await serviceFargate.run()
    const layer = await initLayer(serviceFargate);
    await layer.refresh();
    const upRes = await layer.up();
    console.log(`update summary: \n${JSON.stringify(upRes.summary.resourceChanges, null, 4)}`);
    console.log(`website url: ${upRes.outputs.url.value}`);
}

const detruitS3 = async () => {
    const siteWeb = new SiteStatiqueWebSurS3([{name: "aws", version: "v6.66.2"}]);
    await siteWeb.run()
    const layer = await initLayer(siteWeb);
    await layer.refresh();
    await layer.down();
}

const detruitEcs = async () => {
    const siteWeb = new ContainerSurEcsFargate([{name: "aws", version: "v6.66.2"}]);
    await siteWeb.run()
    const layer = await initLayer(siteWeb);
    await layer.refresh();
    await layer.down();
}

const rafraichit = async () => {
    const siteWeb = new SiteStatiqueWebSurS3([{name: "aws", version: "v6.66.2"}]);
    await siteWeb.run()
    const layer = await initLayer(siteWeb);
    await layer.refresh();
}

const plan = async () => {
    const siteWeb = new SiteStatiqueWebSurS3([{name: "aws", version: "v6.66.2"}]);
    await siteWeb.run()
    const layer = await initLayer(siteWeb);
    await layer.preview();
}

command
    .name("duck")
    .description("CLI Duck pour exécuter des fonctions de provisionnement d'infra")
    .version("1.0.0");

command
    .command("deploie <cible>")
    .description("Déploie le cas d'usage ciblé (siteS3, ecs)")
    .action((cible: string) => {
        switch (cible) {
            case "siteS3":
                deploieSiteWeb();
                break;
            case "ecs":
                deploieEcs();
                break;
            default:
                console.error(`Cible inconnue : ${cible}`);
                console.error("Les cibles valides sont : siteWeb");
                process.exit(1);
        }
    })

command
    .command("detruit <cible>")
    .description("Détruit l'infra ciblée (siteS3, ecs)")
    .action((cible: string) => {
        switch (cible) {
            case "siteS3":
                detruitS3();
                break;
            case "ecs":
                detruitEcs();
                break;
            default:
                console.error(`Cible inconnue : ${cible}`);
                console.error("Les cibles valides sont : siteWeb");
                process.exit(1);
        }
    })

command
    .command("rafraichit")
    .description("Exécute la fonction de rafraîchissement")
    .action(rafraichit);

command
    .command("plan")
    .description("Affiche un plan Pulumi")
    .action(plan);

command.parse(process.argv);