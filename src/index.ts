import axios, {AxiosError, AxiosInstance, AxiosResponse, CreateAxiosDefaults, InternalAxiosRequestConfig} from 'axios';
import { pageInteractionDisable, pageInteractionEnable } from './util';


type ShowLoaderCallback = (requestID : number, message : string) => void;
type HideLoaderCallback = (requestID : number) => void;
type ErrorCallback = (error : AxiosError) => void;

interface LoaderConfigUser
{
	loaderShowAfterMs : number;
	loaderMessage : string;
	disablePageInteraction : boolean;
    loaderNeverHide : boolean;
}
interface LoaderConfig extends LoaderConfigUser
{
	loaderShow : boolean;
}

declare module "axios" 
{
	export interface AxiosDefaults 
	{
		loaderShowAfterMs : number;
		loaderMessage : string;
		loaderShow : boolean;
		disablePageInteraction : boolean;
        loaderNeverHide : boolean;
	}
	export interface InternalAxiosRequestConfig
	{
		requestID : number;
		loaderShowAfterMs : number;
		loaderMessage : string;
		loaderShow : boolean;
		disablePageInteraction : boolean;
        loaderNeverHide : boolean;
	}
}


export class AxiosLoader 
{
	static #requestCounter : number = 0;
	
	#axiosInstance : AxiosInstance;
	#responseReceivedForRequests : Array<number> = [];
	
	#showLoaderCallback : ShowLoaderCallback|null = null;
	#hideLoaderCallback : HideLoaderCallback|null = null;
	#responseErrorCallback : ErrorCallback|null = null;

	constructor(axiosConfig? : CreateAxiosDefaults, loaderConfigUser? : LoaderConfigUser)
	{
		let loaderConfig : LoaderConfig = 
		{
			loaderShow: false,
			disablePageInteraction: loaderConfigUser?.disablePageInteraction ?? true,
			loaderShowAfterMs: loaderConfigUser?.loaderShowAfterMs ?? 200,
			loaderMessage: loaderConfigUser?.loaderMessage ?? 'Please wait ...',
            loaderNeverHide: loaderConfigUser?.loaderNeverHide ?? false,
		};
		this.#axiosInstance = axios.create({...axiosConfig, ...loaderConfig});

		this.#axiosInstance.interceptors.request.use(this.#prepareRequest, this.#handleRequestError);
		this.#axiosInstance.interceptors.response.use(this.#handleResponse, this.#handleResponseError);
	}

	setLoaderCallbacks(showLoaderCallback : ShowLoaderCallback, hideLoaderCallback : HideLoaderCallback) : this
	{
		this.#showLoaderCallback = showLoaderCallback;
		this.#hideLoaderCallback = hideLoaderCallback;
		this.#axiosInstance.defaults.loaderShow = true;

		return this;
	}

	setResponseErrorCallback(responseErrorCallback : ErrorCallback) : this
	{
		this.#responseErrorCallback = responseErrorCallback;
		return this;
	}

	getAxiosInstance() : AxiosInstance
	{
		return this.#axiosInstance;
	}


	#prepareRequest = (config : InternalAxiosRequestConfig) : InternalAxiosRequestConfig => 
	{
		let requestID = ++AxiosLoader.#requestCounter;
		config.requestID = requestID;
		
		if (config.disablePageInteraction) {pageInteractionDisable();}    
		
		if (config.loaderShow)
		{												
			var intervalTakesLong = setInterval( () =>
			{	
				if (this.#responseReceivedForRequests.includes(requestID)) // Response was already received 
				{
					clearInterval(intervalTakesLong); 
					return;
				}

				this.#showLoaderCallback?.(requestID, config.loaderMessage);

				clearInterval(intervalTakesLong);
			}, 
			config.loaderShowAfterMs);
		}
		
		return config;
	}


	#handleResponse = (response : AxiosResponse) : AxiosResponse =>
	{
		this.#axiosRespEnd (response);

		return response;
	}

	#axiosRespEnd = (resp : AxiosResponse) : void =>
	{
		let requestID = resp.config.requestID;

		this.#responseReceivedForRequests.push(Number(requestID));
		
		if (resp.config.disablePageInteraction) {pageInteractionEnable();}
		
		if (resp.config.loaderShow)
		{	
			if (!resp.config.loaderNeverHide) {this.#hideLoaderCallback?.(requestID);}
		}
	}

	#handleRequestError = (error : AxiosError) : Promise<AxiosError> =>
	{
		return Promise.reject(error);
	}

	#handleResponseError = (error : AxiosError) : Promise<unknown> => 
	{
		if (error.response)  
		{
			this.#axiosRespEnd(error.response);
			this.#responseErrorCallback?.(error);
		}
		else if (error)
		{
			console.error('error:', error);
		}

		return Promise.reject();
	}
}