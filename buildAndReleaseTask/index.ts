import * as tl from 'azure-pipelines-task-lib/task';
import { sendRequest, WebRequest, WebResponse } from './httpClient';
import * as path from 'path';

export class TaskOptions {
    serverEndpoint: string;
    serverEndpointUrl: string;

    serverEndpointAuth: tl.EndpointAuthorization;
    username: string;
    password: string;

    strictSSL: boolean;

    constructor() {
        this.serverEndpoint = tl.getInput('ArgoCDService', true)!;
        this.serverEndpointUrl = tl.getEndpointUrl(this.serverEndpoint, false)!;
        tl.debug('Argo CD Endpoint URL=' + this.serverEndpointUrl);
        this.serverEndpointAuth = tl.getEndpointAuthorization(this.serverEndpoint, false)!;
        this.username = this.serverEndpointAuth['parameters']['username'];
        this.password = this.serverEndpointAuth['parameters']['password'];

        this.strictSSL = ('true' !== tl.getEndpointDataParameter(this.serverEndpoint, 'acceptUntrustedCerts', true));
        tl.debug('strictSSL=' + this.strictSSL);
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

async function run() {
    try {

        tl.setResourcePath(path.join(__dirname, 'task.json'));

        const taskOptions: TaskOptions = new TaskOptions();

        console.log('Service Endoint URL:', taskOptions.serverEndpointUrl);

        let command = tl.getInput("command", true)!.toLowerCase();
        console.log('Selected command:', command);

        const inputString: string | undefined = tl.getInput('samplestring', true);
        if (inputString == 'bad') {
            tl.setResult(tl.TaskResult.Failed, 'Bad input was given');
            return;
        }
        console.log('Hello', inputString);
    }
    catch (err) {
        let message: string;
        if (err instanceof HttpError) {
            message = err.message;
            console.error(err.fullMessage);
            console.error(err.body);
        } else if (err instanceof Error) {
            message = err.message;
            console.error(err);
        } else {
            message = err;
            console.error(err);
        }
        tl.setResult(tl.TaskResult.Failed, message);
    }
}

run();