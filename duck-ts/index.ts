#!/usr/bin/env node
import {Layer} from "./tools/layer";
import {Command} from "commander";
import {SiteWeb} from "./usecases/DeployerUnSiteStatiqueSurUnBucketS3";

const process = require('process');

const command = new Command();

async function initLayer(siteWeb: SiteWeb) {
    const layer: Layer = new Layer("dev", siteWeb)
    await layer.init()
    await layer.installPlugins()
    await layer.setConfig([{
        key: "aws:region",
        value: "eu-west-3"
    }])
    return layer;
}

const deploieSiteWeb = async () => {
    const siteWeb = new SiteWeb([{name: "aws", version: "v6.66.2"}]);
    await siteWeb.run()
    const layer = await initLayer(siteWeb);
    await layer.refresh();
    const upRes = await layer.up();
    console.log(`update summary: \n${JSON.stringify(upRes.summary.resourceChanges, null, 4)}`);
    console.log(`website url: ${upRes.outputs.websiteUrl.value}`);
}

const detruit = async () => {
    const siteWeb = new SiteWeb([{name: "aws", version: "v6.66.2"}]);
    await siteWeb.run()
    const layer = await initLayer(siteWeb);
    await layer.refresh();
    await layer.down();
}

const rafraichit = async () => {
    const siteWeb = new SiteWeb([{name: "aws", version: "v6.66.2"}]);
    await siteWeb.run()
    const layer = await initLayer(siteWeb);
    await layer.refresh();
}

const plan = async () => {
    const siteWeb = new SiteWeb([{name: "aws", version: "v6.66.2"}]);
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
    .description("Déploie le cas d'usage ciblé (siteWeb)")
    .action((cible: string) => {
        switch (cible) {
            case "siteWeb":
                deploieSiteWeb();
                break;
            default:
                console.error(`Cible inconnue : ${cible}`);
                console.error("Les cibles valides sont : siteWeb");
                process.exit(1);
        }
    })

command
    .command("detruit")
    .description("Exécute la fonction de destruction")
    .action(detruit);

command
    .command("rafraichit")
    .description("Exécute la fonction de rafraîchissement")
    .action(rafraichit);

command
    .command("plan")
    .description("Affiche un plan Pulumi")
    .action(plan);

command.parse(process.argv);