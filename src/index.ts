import axios, {AxiosError, AxiosInstance, AxiosResponse, CreateAxiosDefaults, InternalAxiosRequestConfig} from 'axios';
import { pageInteractionDisable, pageInteractionEnable } from './util';


type ShowLoaderCallback = (requestID : number, message : string) => void;
type HideLoaderCallback = (requestID : number) => void;
type ErrorCallback = (error : AxiosError) => void;

interface FactoryConfigUser
{
	loaderShowAfterMs : number;
	loaderMessage : string;
	disablePageInteraction : boolean;
}
interface FactoryConfig extends FactoryConfigUser
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
	}
	export interface InternalAxiosRequestConfig
	{
		requestID : number;
		loaderShowAfterMs : number;
		loaderMessage : string;
		loaderShow : boolean;
		disablePageInteraction : boolean;
	}
}


export class AxiosFactory 
{
	static #requestCounter : number = 0;
	
	#axiosInstance : AxiosInstance;
	#responseReceivedForRequests : Array<number> = [];
	
	#showLoaderCallback : ShowLoaderCallback|null = null;
	#hideLoaderCallback : HideLoaderCallback|null = null;
	#handleResponseErrorCallback : ErrorCallback|null = null;

	constructor(axiosConfig? : CreateAxiosDefaults, factoryConfigUser? : FactoryConfigUser)
	{
		let factoryConfig : FactoryConfig = 
		{
			loaderShow: false,
			disablePageInteraction: factoryConfigUser?.disablePageInteraction ?? true,
			loaderShowAfterMs: factoryConfigUser?.loaderShowAfterMs ?? 200,
			loaderMessage: factoryConfigUser?.loaderMessage ?? '',
		};
		this.#axiosInstance = axios.create({...axiosConfig, ...factoryConfig});

		this.#axiosInstance.interceptors.request.use(this.#prepareRequest, this.#handleRequestError);
		this.#axiosInstance.interceptors.response.use(this.#handleResponse, this.#handleResponseError);
		// cLog('this.#axiosInstance', this.#axiosInstance);
	}

	setLoaderCallbacks(showCallback : ShowLoaderCallback, hideCallback : HideLoaderCallback) : this
	{
		this.#showLoaderCallback = showCallback;
		this.#hideLoaderCallback = hideCallback;
		this.#axiosInstance.defaults.loaderShow = true;

		// cLog('this.#axiosInstance', this.#axiosInstance, this.setLoaderCallbacks);
		return this;
	}

	setLoaderShowAfterMs(ms : number) : this
	{
		this.#axiosInstance.defaults.loaderShowAfterMs = ms;
		return this;
	}

	setHandleResponseErrorCallback(callback : ErrorCallback) : this
	{
		this.#handleResponseErrorCallback = callback;
		return this;
	}

	setLoaderMessage(message : string) : this
	{
		this.#axiosInstance.defaults.loaderMessage = message;
		return this;
	}

	getAxiosInstance() : AxiosInstance
	{
		return this.#axiosInstance;
	}


	#prepareRequest = (config : InternalAxiosRequestConfig) : InternalAxiosRequestConfig => 
	{															//cLog('AxiosFactory.#requestCounter', AxiosFactory.#requestCounter, this.#prepareRequest);
		let requestID = ++AxiosFactory.#requestCounter;			//cLog('requestID', requestID, this.#prepareRequest);
		config.requestID = requestID;
		
		if (config.disablePageInteraction) {pageInteractionDisable();}    
		
		if (config.loaderShow)
		{												
			var intervalTakesLong = setInterval( () =>
			{	
				if (this.#responseReceivedForRequests.includes(requestID)) // Response was already received 
				{											//cLog('učena rychle -> grafika o práci systému se nezobrazí', fceTrvaDlouho);
					clearInterval(intervalTakesLong); 
					return;
				}

				this.#showLoaderCallback?.(requestID, config.loaderMessage);

				clearInterval(intervalTakesLong);
			}, 
			config.loaderShowAfterMs);
		}
		
		// cLog('END :: config', config, this.#prepareRequest);
		return config;
	}


	#handleResponse = (response : AxiosResponse) : AxiosResponse =>
	{    								//cLog('response', response, this.#handleResponse);		
		this.#axiosRespEnd (response);

		return response;
	}

	#axiosRespEnd = (response : AxiosResponse) : void =>
	{
		let requestID = response.config.requestID;

		this.#responseReceivedForRequests.push(Number(requestID));
		
		if (response.config.disablePageInteraction) {pageInteractionEnable();}
		
		if (response.config.loaderShow)
		{	
			this.#hideLoaderCallback?.(requestID);
		}
	}

	#handleRequestError = (error : AxiosError) : Promise<AxiosError> =>
	{								// cLog('error', error, this.#handleRequestError);
		return Promise.reject(error);
	}

	#handleResponseError = (error : AxiosError) : Promise<unknown> => 
	{								//cLog('error', error, this.#handleResponseError);				
		if (error.response)  
		{
			this.#axiosRespEnd (error.response);
			this.#handleResponseErrorCallback?.(error);
		}
		else if (error)
		{
			console.error('error:', error);
		}

		return Promise.reject();
	}
}