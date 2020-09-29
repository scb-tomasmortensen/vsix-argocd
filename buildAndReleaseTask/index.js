"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFullErrorMessage = exports.HttpError = exports.TaskOptions = void 0;
const tl = __importStar(require("azure-pipelines-task-lib/task"));
const httpClient_1 = require("./httpClient");
const path = __importStar(require("path"));
class TaskOptions {
    constructor() {
        this.serverEndpoint = tl.getInput('ArgoCDService', true);
        this.serverEndpointUrl = tl.getEndpointUrl(this.serverEndpoint, false);
        tl.debug('Argo CD Endpoint URL=' + this.serverEndpointUrl);
        this.serverEndpointAuth = tl.getEndpointAuthorization(this.serverEndpoint, false);
        this.username = this.serverEndpointAuth['parameters']['username'];
        this.password = this.serverEndpointAuth['parameters']['password'];
        this.token = this.serverEndpointAuth['parameters']['AccessToken'];
        this.strictSSL = ('true' !== tl.getEndpointDataParameter(this.serverEndpoint, 'acceptUntrustedCerts', true));
        tl.debug('strictSSL=' + this.strictSSL);
    }
}
exports.TaskOptions = TaskOptions;
class HttpError extends Error {
    constructor(httpResponse, message) {
        super();
        this.fullMessage = getFullErrorMessage(httpResponse, message);
        this.message = message;
        this.body = httpResponse.body;
    }
}
exports.HttpError = HttpError;
function getFullErrorMessage(httpResponse, message) {
    const fullMessage = `${message}\nHttpResponse.statusCode=${httpResponse.statusCode}\nHttpResponse.statusMessage=${httpResponse.statusMessage}`;
    return fullMessage;
}
exports.getFullErrorMessage = getFullErrorMessage;
function sync(endpointUrl, applicationName, token) {
    const url = endpointUrl + `api/v1/applications/${applicationName}/sync`;
    const body = {
        'dryRun': false,
        'prune': true,
        'strategy': {
            'apply': {
                'force': true
            }
        }
    };
    const headers = {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
    };
    const request = new httpClient_1.WebRequest();
    request.uri = url;
    request.body = JSON.stringify(body);
    request.headers = headers;
    request.method = 'POST';
    return httpClient_1.sendRequest(request).then((response) => {
        if (response.statusCode !== 201) {
            tl.debug(JSON.stringify(response));
            console.log(response);
            throw new Error('WriteFailed');
        }
        else {
            console.log('WriteSucceeded');
        }
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        tl.setResourcePath(path.join(__dirname, 'task.json'));
        const taskOptions = new TaskOptions();
        console.log('Service Endoint URL:', taskOptions.serverEndpointUrl);
        let command = tl.getInput("command", true).toLowerCase();
        console.log('Selected command:', command);
        //  ************** TRY TO SEND THE SYNC-POST TO ARGO CD SERVER **************
        const applicationName = tl.getInput('application', true);
        return sync(taskOptions.serverEndpointUrl, applicationName, "token");
    });
}
run()
    .then(() => tl.setResult(tl.TaskResult.Succeeded, ''))
    .catch((error) => tl.setResult(tl.TaskResult.Failed, error.message));
