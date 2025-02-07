import {loaderShow, loaderHide} from '../util.js';
import {pageInteractionDisable, pageInteractionEnable} from '@dpsys/js-utils/ajax/util.js';
import { cLog, flashMessage } from '@dpsys/js-utils/misc.js';
import { AxiosFactory } from './factory.js';


let axiosFactoryDefault = new AxiosFactory({
	baseURL: APP.baseUrl,   
	xsrfCookieName: 'AXIOS-COOKIE-XSRF-TOKEN',
	xsrfHeaderName: 'AXIOS-XSRF-TOKEN',
})
// .setPageInteractionCallbacks(pageInteractionDisable, pageInteractionEnable)
.setLoaderCallbacks(loaderShow, loaderHide)
.setHandleResponseErrorCallback((error) =>
{
	// cLog('ResponseErrorCallback: ', error.response);
	flashMessage('Něco se pokazilo. Obraťte se prosím na podporu.', 5000, 'error');
});
		
let axiosDefault = axiosFactoryDefault.getAxiosInstance();
export default axiosDefault;