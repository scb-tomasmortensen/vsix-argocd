
# Argo CD Extension for Azure Pipelines

This extension allows you to setup a service connection against your Argo CD server and execute synchronization calls from your CI/CD pipelines inside Azure DevOps. For example, instead of having automatic sync in Argo CD, you now have the option to Defer the task of synchronization to a specific time.

### Highlights ###

> Possibility to create service connection to Argo CD.
>
> Schedule deployment by deferred execution of sync command in your release pipelines.
>
> Includes DRY RUN option for testing.


## Release notes ##

* v0.1.0
    
    Service Connection and sync-command.

## Verified on the following platforms ##

Azure DevOps Server 2019

Argo CD version 1.6.1+ (running in Openshift using Argo CD - version 0.0.13 operator)

## Learn more ##

The <a href="https://github.com/scb-tomasmortensen/vsix-argocd" target="_blank">source</a> for this extension is on GitHub. Take, fork, and extend.

Let's discuss <a href="https://github.com/scb-tomasmortensen/vsix-argocd/issues" target="_blank">Issues and Improvements</a>