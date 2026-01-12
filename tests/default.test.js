import { expect, test, vi } from 'vitest';
import axios from 'axios';
import { AxiosLoader } from '../src/index';
import { pageInteractionDisable, pageInteractionEnable } from '../src/util';

test('default', () => 
{
    let axiosLoaderDefault = new AxiosLoader(
    {
        baseURL: 'https://test.com',
    }, 
    {
        loaderShowAfterMs: 400, 
        loaderMessage: 'loading ...'
    })
    .setLoaderCallbacks(() => {console.log('showLoader')}, () => {console.log('hideLoader')});
    
    let axiosInstance = axiosLoaderDefault.getAxiosInstance();
    
    expect(axiosInstance).toBeTypeOf('function');
    expect(axiosInstance.defaults.baseURL).toBe('https://test.com');
    expect(axiosInstance.defaults.loaderShowAfterMs).toBe(400);
    expect(axiosInstance.defaults.loaderMessage).toBe('loading ...');
    expect(axiosInstance.defaults.loaderShow).toBe(true);
})

test('default config', () => {
	const loader = new AxiosLoader();
	const defaults = loader.getAxiosInstance().defaults;
	expect(defaults.loaderShowAfterMs).toBe(200);
	expect(defaults.loaderMessage).toBe('Please wait ...');
	expect(defaults.disablePageInteraction).toBe(true);
	expect(defaults.loaderNeverHide).toBe(false);
	expect(defaults.loaderShow).toBe(false);
});

test('custom config', () => {
	const loader = new AxiosLoader({}, {
		loaderShowAfterMs: 500,
		loaderMessage: 'Custom message',
		disablePageInteraction: false,
		loaderNeverHide: true
	});
	const defaults = loader.getAxiosInstance().defaults;
	expect(defaults.loaderShowAfterMs).toBe(500);
	expect(defaults.loaderMessage).toBe('Custom message');
	expect(defaults.disablePageInteraction).toBe(false);
	expect(defaults.loaderNeverHide).toBe(true);
});

test('constructor with axios instance', () => {
	const axiosInstance = axios.create({ baseURL: 'http://example.com' });
	const loader = new AxiosLoader(axiosInstance);
	expect(loader.getAxiosInstance()).toBe(axiosInstance);
	expect(axiosInstance.defaults.loaderShowAfterMs).toBe(200);
	expect(axiosInstance.defaults.loaderMessage).toBe('Please wait ...');
});

test('setLoaderCallbacks enables loader', () => {
	const loader = new AxiosLoader();
	loader.setLoaderCallbacks(() => {}, () => {});
	expect(loader.getAxiosInstance().defaults.loaderShow).toBe(true);
});

test('pageInteractionDisable', () => {
	global.document = { body: { style: {} } };
	pageInteractionDisable();
	expect(document.body.style.pointerEvents).toBe('none');
});

test('pageInteractionEnable', () => {
	global.document = { body: { style: { pointerEvents: 'none' } } };
	pageInteractionEnable();
	expect(document.body.style.pointerEvents).toBe('');
});