import { expect, test, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { AxiosLoader } from '../src/index';
import { pageInteractionDisable, pageInteractionEnable } from '../src/util';

beforeEach(() => 
{
    vi.useFakeTimers();

    // Mock global document object for Node.js test environment
    global.document = {
        body: {
            style: {
                pointerEvents: ''
            }
        }
    };
});

afterEach(() => 
{
    vi.restoreAllMocks();
    delete global.document;
});

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
    .setLoaderCallbacks(() => { console.log('showLoader'); }, () => { console.log('hideLoader'); });
    
    let axiosInstance = axiosLoaderDefault.getAxiosInstance();
    
    expect(axiosInstance).toBeTypeOf('function');
    expect(axiosInstance.defaults.baseURL).toBe('https://test.com');
    expect(axiosInstance.defaults.loaderShowAfterMs).toBe(400);
    expect(axiosInstance.defaults.loaderMessage).toBe('loading ...');
    expect(axiosInstance.defaults.loaderShow).toBe(true);
});

test('default config', () => 
{
    const loader = new AxiosLoader();
    const defaults = loader.getAxiosInstance().defaults;
    expect(defaults.loaderShowAfterMs).toBe(200);
    expect(defaults.loaderMessage).toBe('Please wait ...');
    expect(defaults.disablePageInteraction).toBe(true);
    expect(defaults.loaderNeverHide).toBe(false);
    expect(defaults.loaderShow).toBe(false);
});

test('custom config', () => 
{
    const loader = new AxiosLoader({}, 
    {
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

test('constructor with axios instance', () => 
{
    const axiosInstance = axios.create({ baseURL: 'http://example.com' });
    const loader = new AxiosLoader(axiosInstance);
    expect(loader.getAxiosInstance()).toBe(axiosInstance);
    expect(axiosInstance.defaults.loaderShowAfterMs).toBe(200);
    expect(axiosInstance.defaults.loaderMessage).toBe('Please wait ...');
});

test('setLoaderCallbacks enables loader', () => 
{
    const loader = new AxiosLoader();
    loader.setLoaderCallbacks(() => {}, () => {});
    expect(loader.getAxiosInstance().defaults.loaderShow).toBe(true);
});

test('triggers showLoader and hideLoader using default instance fallback', async () => 
{
    const showCb = vi.fn();
    const hideCb = vi.fn();

    // Mock adapter simulating a slow response (300 ms) and preserving request config
    const adapter = vi.fn((config) => new Promise((resolve) => 
    {
        setTimeout(() => 
        {
            resolve({ data: 'ok', status: 200, statusText: 'OK', headers: {}, config: config });
        }, 300);
    }));

    const loader = new AxiosLoader({ adapter }, { loaderShowAfterMs: 100, loaderMessage: 'Loading test...' });
    loader.setLoaderCallbacks(showCb, hideCb);

    const instance = loader.getAxiosInstance();
    const requestPromise = instance.get('/test');

    // Advance time past loaderShowAfterMs (100 ms), but before request completion (300 ms)
    await vi.advanceTimersByTimeAsync(150);
    expect(showCb).toHaveBeenCalledWith(expect.any(Number), 'Loading test...');

    // Advance time to complete the request
    await vi.advanceTimersByTimeAsync(200);
    await requestPromise;

    expect(hideCb).toHaveBeenCalled();
});

test('does not show loader if request finishes before loaderShowAfterMs', async () => 
{
    const showCb = vi.fn();
    const hideCb = vi.fn();

    // Mock adapter simulating a fast response (50 ms) and preserving request config
    const adapter = vi.fn((config) => new Promise((resolve) => 
    {
        setTimeout(() => 
        {
            resolve({ data: 'ok', status: 200, statusText: 'OK', headers: {}, config: config });
        }, 50);
    }));

    const loader = new AxiosLoader({ adapter }, { loaderShowAfterMs: 200 });
    loader.setLoaderCallbacks(showCb, hideCb);

    const instance = loader.getAxiosInstance();
    const requestPromise = instance.get('/test');

    await vi.advanceTimersByTimeAsync(300);
    await requestPromise;

    expect(showCb).not.toHaveBeenCalled();
    expect(hideCb).toHaveBeenCalled();
});

test('pageInteractionDisable', () => 
{
    pageInteractionDisable();
    expect(document.body.style.pointerEvents).toBe('none');
});

test('pageInteractionEnable', () => 
{
    document.body.style.pointerEvents = 'none';
    pageInteractionEnable();
    expect(document.body.style.pointerEvents).toBe('');
});