# Argo CD - Azure DevOps Extension

A little extension to be able to fit into the Azure DevOps Pipelines.

## Features

Enables a service connection of type Argo CD to be setup.
Sync - To be able to use the sheduling feature of Releases in ADS.

## How its made

### Create folder structure

```
|--- README.md    
|--- images                        
    |--- extension-icon.png  
|--- buildAndReleaseTask            // where your task scripts are placed
|--- vss-extension.json             // extension's manifest
```

### Install needed tooling

TFX-CLI: `npm i -g tfx-cli`
TypeScript Compiler: `npm install -g typescript`

### How to run stuff

Make sure you are in the correct folder (task) and compile typescript files using `tsc`.
To run the task, we can use node like this: `node index.js`, make sure that any variables are set beforehand ($env:INPUT_SOMEVARIABLE "SomeValue")

tfx extension create --manifest-globs vss-extension.json

## Argo CD Setup

`argocd proj role create default sync-role`

`argocd proj role create-token default sync-role -e 10m`

argocd proj role list default

argocd proj role get default sync-role

argocd proj role add-policy default sync-role --action sync --permission allow --object devops-jedi
argocd proj role add-policy default sync-role --action override --permission allow --object devops-jedi

<https://argocd-server-argocd.apps.scbclu01.scbeval.net/api/v1/applications/devops-jedi/sync>

{
  "dryRun": false,
  "prune": true,
  "strategy": {
    "apply": {
      "force": true
    }
  }
}

## References

<https://docs.microsoft.com/en-us/azure/devops/extend/develop/add-build-task?view=azure-devops>
<https://docs.microsoft.com/en-us/azure/devops/extend/develop/integrate-build-task?view=azure-devops>
<https://docs.microsoft.com/en-us/azure/devops/extend/develop/manifest?view=azure-devops>
<https://www.guidgen.com/>
<https://jsonpath.com/>
<https://tools.knowledgewalls.com/jsontostring>
