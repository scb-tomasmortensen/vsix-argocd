# Argo CD - Azure DevOps Extension

A little extension to be able to fit into the Azure DevOps Pipelines.

## Features

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

## References

<https://docs.microsoft.com/en-us/azure/devops/extend/develop/add-build-task?view=azure-devops>
<https://docs.microsoft.com/en-us/azure/devops/extend/develop/integrate-build-task?view=azure-devops>
<https://docs.microsoft.com/en-us/azure/devops/extend/develop/manifest?view=azure-devops>
<https://www.guidgen.com/>
