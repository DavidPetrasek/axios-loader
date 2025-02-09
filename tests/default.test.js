import { expect, test } from 'vitest';
import { AxiosFactory } from '../src/index';




test('default', () => 
{
	let axiosFactoryDefault = new AxiosFactory(
	{
		baseURL: 'https://test.com',
	}, 
	{
		loaderShowAfterMs: 400, 
		loaderMessage: 'loading ...'
	})
	.setLoaderCallbacks(() => {console.log('showLoader')}, () => {console.log('hideLoader')})
	.setHandleResponseErrorCallback((error) =>
	{
		console.log(error);
	});
	
	let axiosInstance = axiosFactoryDefault.getAxiosInstance();
	console.log(axiosInstance);
	//expect(axiosInstance).toBeTypeOf('object');
})