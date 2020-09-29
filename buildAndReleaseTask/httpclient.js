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
exports.sleepFor = exports.sendRequest = exports.WebRequestOptions = exports.WebResponse = exports.WebRequest = void 0;
const tl = __importStar(require("azure-pipelines-task-lib/task"));
const httpClient = __importStar(require("typed-rest-client/HttpClient"));
const util = __importStar(require("util"));
const proxyUrl = tl.getVariable('agent.proxyurl');
const requestOptions = proxyUrl ? {
    proxy: {
        proxyUrl: proxyUrl,
        proxyUsername: tl.getVariable('agent.proxyusername'),
        proxyPassword: tl.getVariable('agent.proxypassword'),
        proxyBypassHosts: tl.getVariable('agent.proxybypasslist') ? JSON.parse(tl.getVariable('agent.proxybypasslist')) : null
    }
} : {};
const ignoreSslErrors = tl.getVariable('VSTS_ARM_REST_IGNORE_SSL_ERRORS');
//requestOptions.ignoreSslError = ignoreSslErrors && ignoreSslErrors.toLowerCase() == 'true';
requestOptions.ignoreSslError = true; // Hardcode this for now :/
const httpCallbackClient = new httpClient.HttpClient(tl.getVariable('AZURE_HTTP_USER_AGENT'), null, requestOptions);
class WebRequest {
}
exports.WebRequest = WebRequest;
class WebResponse {
}
exports.WebResponse = WebResponse;
class WebRequestOptions {
    constructor() {
        this.retriableErrorCodes = [];
        this.retriableStatusCodes = [];
        this.retryRequestTimedout = false;
    }
}
exports.WebRequestOptions = WebRequestOptions;
function sendRequest(request, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let i = 0;
        const retryCount = options && options.retryCount ? options.retryCount : 5;
        const retryIntervalInSeconds = options && options.retryIntervalInSeconds ? options.retryIntervalInSeconds : 2;
        const retriableErrorCodes = options && options.retriableErrorCodes ? options.retriableErrorCodes : ['ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND', 'ESOCKETTIMEDOUT', 'ECONNREFUSED', 'EHOSTUNREACH', 'EPIPE', 'EA_AGAIN'];
        const retriableStatusCodes = options && options.retriableStatusCodes ? options.retriableStatusCodes : [408, 409, 500, 502, 503, 504];
        let timeToWait = retryIntervalInSeconds;
        while (true) {
            try {
                const response = yield sendRequestInternal(request);
                if (retriableStatusCodes.indexOf(response.statusCode) != -1 && ++i < retryCount) {
                    tl.debug(util.format('Encountered a retriable status code: %s. Message: \'%s\'.', response.statusCode, response.statusMessage));
                    yield sleepFor(timeToWait);
                    timeToWait = timeToWait * retryIntervalInSeconds + retryIntervalInSeconds;
                    continue;
                }
                return response;
            }
            catch (error) {
                if (retriableErrorCodes.indexOf(error.code) != -1 && ++i < retryCount) {
                    tl.debug(util.format('Encountered a retriable error:%s. Message: %s.', error.code, error.message));
                    yield sleepFor(timeToWait);
                    timeToWait = timeToWait * retryIntervalInSeconds + retryIntervalInSeconds;
                }
                else {
                    if (error.code) {
                        console.log('##vso[task.logissue type=error;code=' + error.code + ';]');
                    }
                    throw error;
                }
            }
        }
    });
}
exports.sendRequest = sendRequest;
function sleepFor(sleepDurationInSeconds) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, sleepDurationInSeconds * 1000);
    });
}
exports.sleepFor = sleepFor;
function sendRequestInternal(request) {
    return __awaiter(this, void 0, void 0, function* () {
        tl.debug(util.format('[%s]%s', request.method, request.uri));
        const response = yield httpCallbackClient.request(request.method, request.uri, request.body, request.headers);
        return yield toWebResponse(response);
    });
}
function toWebResponse(response) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = new WebResponse();
        if (response) {
            res.statusCode = response.message.statusCode;
            res.statusMessage = response.message.statusMessage;
            res.headers = response.message.headers;
            const body = yield response.readBody();
            if (body) {
                try {
                    res.body = JSON.parse(body);
                }
                catch (error) {
                    tl.debug('Could not parse response: ' + JSON.stringify(error, null, 2));
                    tl.debug('Response: ' + JSON.stringify(res.body));
                    res.body = body;
                }
            }
        }
        return res;
    });
}
