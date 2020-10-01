import * as tl from 'azure-pipelines-task-lib/task';
import { sendRequest, WebRequest, WebResponse } from './httpClient';
import * as path from 'path';

export class TaskOptions {

    // Service Connection
    serverEndpoint: string;
    serverEndpointUrl: string;
    serverEndpointAuth: tl.EndpointAuthorization;
    username: string;
    password: string;
    token: string;
    strictSSL: boolean;

    // Sync command
    isDryRun: boolean;

    constructor() {
        this.serverEndpoint = tl.getInput('ArgoCDService', true)!;
        this.serverEndpointUrl = tl.getEndpointUrl(this.serverEndpoint, false)!;
        tl.debug('Argo CD Endpoint URL=' + this.serverEndpointUrl);
        this.serverEndpointAuth = tl.getEndpointAuthorization(this.serverEndpoint, false)!;
        this.username = this.serverEndpointAuth['parameters']['username'];
        this.password = this.serverEndpointAuth['parameters']['password'];
        this.token = this.serverEndpointAuth['parameters']['apitoken'];
        this.strictSSL = ('true' !== tl.getEndpointDataParameter(this.serverEndpoint, 'acceptUntrustedCerts', true));
        tl.debug('strictSSL=' + this.strictSSL);

        this.isDryRun = tl.getBoolInput('DryRunFlag', false)!;
    }
}

export class HttpError extends Error {
    public body: string;
    public fullMessage: string;

    constructor(httpResponse: any, message: string) {
        super();
        this.fullMessage = getFullErrorMessage(httpResponse, message);
        this.message = message;
        this.body = httpResponse.body;
    }
}

export function getFullErrorMessage(httpResponse: { statusCode: any; statusMessage: any; }, message: string): string {
    const fullMessage: string = `${message}\nHttpResponse.statusCode=${httpResponse.statusCode}\nHttpResponse.statusMessage=${httpResponse.statusMessage}`;
    return fullMessage;
}

function sync(endpointUrl: string, applicationName: string, token: string, isDryRun: boolean) {
    const url = endpointUrl + `api/v1/applications/${applicationName}/sync`;
    const body = {
        'dryRun': isDryRun,
        'prune': true,
        'strategy': {
            'apply': {
                'force': true
            }
        }
    };
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const request = new WebRequest();
    request.uri = url;
    request.body = JSON.stringify(body);
    request.headers = headers;
    request.method = 'POST';

    return sendRequest(request).then((response: WebResponse) => {
        if (response.statusCode !== 200) {
            tl.debug(JSON.stringify(response));
            console.log(response);
            throw new Error('Argo CD operation failed.');
        } else {
            console.log('Argo CD operation completed successfully.');
        }
    });
}

async function run() {
    tl.setResourcePath(path.join(__dirname, 'task.json'));

    const taskOptions: TaskOptions = new TaskOptions();

    console.log('Service Endoint URL:', taskOptions.serverEndpointUrl);
    console.log('Service Endpoint Scheme:', taskOptions.serverEndpointAuth.scheme);

    let command = tl.getInput("argocdCommand", true)!.toLowerCase();
    console.log('Selected command:', command);

    const applicationName = tl.getInput('argocdApplication', true)!;
    console.log('Selected Application:', applicationName);

    console.log('Dry Run:', taskOptions.isDryRun);

    return sync(taskOptions.serverEndpointUrl, applicationName, taskOptions.token, taskOptions.isDryRun);
}

run()
    .then(() => tl.setResult(tl.TaskResult.Succeeded, ''))
    .catch((error: Error) => tl.setResult(tl.TaskResult.Failed, error.message));