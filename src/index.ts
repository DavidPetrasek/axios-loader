import axios from 'axios';


export class AxiosFactory 
{
	static requestCounter = 0;
	
	#axiosInstance;
	#responseReceivedForRequests = [];
	
	#disablePageInteractionCallback;
	#enablePageInteractionCallback;
	#showLoaderCallback;
	#hideLoaderCallback;
	#handleResponseErrorCallback;

	constructor(axiosConfig)
	{
		let factorySpecificDefaultConfig = 
		{
			loaderShow: false,
			loaderShowAfterMs: 200,
			loaderMessage: '',
			disablePageInteraction: false,
		};
		this.#axiosInstance = axios.create({...axiosConfig, ...factorySpecificDefaultConfig});
	
		this.#axiosInstance.interceptors.request.use(this.#prepareRequest, this.#handleRequestError);
		this.#axiosInstance.interceptors.response.use(this.#handleResponse, this.#handleResponseError);
		// cLog('this.#axiosInstance', this.#axiosInstance);
	}


	setPageInteractionCallbacks(disableCallback, enableCallback)
	{
		this.#disablePageInteractionCallback = disableCallback;
		this.#enablePageInteractionCallback = enableCallback;
		this.#axiosInstance.defaults.disablePageInteraction = true;

		// cLog('this.#axiosInstance', this.#axiosInstance, this.setPageInteractionCallbacks);
		return this;
	}

	setLoaderCallbacks(showCallback, hideCallback)
	{
		this.#showLoaderCallback = showCallback;
		this.#hideLoaderCallback = hideCallback;
		this.#axiosInstance.defaults.loaderShow = true;

		// cLog('this.#axiosInstance', this.#axiosInstance, this.setLoaderCallbacks);
		return this;
	}

	setLoaderShowAfterMs(ms) 
	{
		this.#axiosInstance.defaults.loaderShowAfterMs = ms;
		return this;
	}

	setHandleResponseErrorCallback(callback)
	{
		this.#handleResponseErrorCallback = callback;
		return this;
	}

	setLoaderMessage(message)
	{
		this.#axiosInstance.defaults.loaderMessage = message;
		return this;
	}

	getAxiosInstance()
	{
		return this.#axiosInstance;
	}


	#prepareRequest = (config) => 
	{															//cLog('AxiosFactory.requestCounter', AxiosFactory.requestCounter, this.#prepareRequest);
		let requestID = ++AxiosFactory.requestCounter;			//cLog('requestID', requestID, this.#prepareRequest);
		config.requestID = requestID;
		
		if (config.disablePageInteraction)
		{								
			this.#disablePageInteractionCallback(requestID, config.loaderShowAfterMs);	
		}    
		
		if (config.loaderShow)
		{												
			var intervalTakesLong = setInterval( () =>
			{	
				if (this.#responseReceivedForRequests.includes(requestID)) // Response was already received 
				{											//cLog('učena rychle -> grafika o práci systému se nezobrazí', fceTrvaDlouho);
					clearInterval(intervalTakesLong); 
					return;
				}

				this.#showLoaderCallback (requestID, config.loaderMessage);

				clearInterval(intervalTakesLong);
			}, 
			config.loaderShowAfterMs);
		}
		
		// cLog('END :: config', config, this.#prepareRequest);
		return config;
	}


	#handleResponse = (response) =>
	{    								//cLog('response', response, this.#handleResponse);		
		this.#axiosRespEnd (response);

		return response;
	}

	#axiosRespEnd = (response) =>
	{
		let requestID = response.config.requestID;

		this.#responseReceivedForRequests.push(Number(requestID));
		
		if (response.config.disablePageInteraction)
		{
			this.#enablePageInteractionCallback(requestID);
		}
		
		if (response.config.loaderShow)
		{	
			this.#hideLoaderCallback(requestID);
		}
	}

	#handleRequestError = (error) =>
	{								// cLog('error', error, this.#handleRequestError);
		return Promise.reject(error);
	}

	#handleResponseError = (error) => 
	{								//cLog('error', error, this.#handleResponseError);				
		if (error.response)  
		{
			this.#axiosRespEnd (error.response);
			this.#handleResponseErrorCallback(error);
		}
		else if (error)
		{
			console.error('error:', error);
		}

		return Promise.reject();
	}
}