# Axios Loader

[![ISC License](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)

Axios wrapper for easy loader management.

## Features

- **Factory Pattern Configuration** - Create pre-configured Axios instances
- **Loader Management** - Automatically show/hide custom loaders
- **Page Interaction Control** - Disable UI interactions during requests

## Installation

```bash
npm install ...
```

## Example Usage
```js
import { AxiosLoader } from '...';

let axiosLoaderDefault = new AxiosLoader(
	// Axios config
	{
		baseURL: 'https://test.com',
	},
	// Loader config
	{
		loaderShowAfterMs: 300, 
		loaderMessage: 'Loading ...'
	})
.setLoaderCallbacks
(
	// showLoaderCallback
    (requestID, loaderMessage) => console.log(`Showing loader ${requestID} with message: ${loaderMessage}`),
	// hideLoaderCallback
    (requestID) => console.log(`Hiding loader ${requestID}`)
)
.setResponseErrorCallback((error) =>
{
	console.log(error);
});

export const axiosDefault = axiosLoaderDefault.getAxiosInstance();	// --> Use in your app
// export default axiosLoaderDefault.getAxiosInstance();			   --> Use in your app
```

### Loader config can be overriden at any time
```js
import {axiosDefault} from '../lib/axios/default';

axiosDefault.post('/some-route', {data: 'foo'}, {loaderMessage: 'Different loader message...', disablePageInteraction: false, loaderShow: false});
.then( async (response) =>
{
	...
});
```

## Config

| Option                   | Type    | Default           | Description                                                                   |
|--------------------------|---------|-------------------|-------------------------------------------------------------------------------|
| `loaderShow`             | boolean | `false`           | Whether to show the loader. Is automatically enabled after setting callbacks via `setLoaderCallbacks`. |
| `loaderShowAfterMs`      | number  | `200`             | Delay in milliseconds before the loader appears.                            |
| `loaderMessage`          | string  | `Please wait ...` | Message displayed in the loader.                                             |
| `disablePageInteraction` | boolean | `true`            | Whether to prevent user page interaction during each request.                |

## Callbacks
- `showLoaderCallback(requestID: number, message: string)`: Implement this callback to show your loader.
- `hideLoaderCallback(requestID: number)`: Implement this callback to hide your loader.
- `responseErrorCallback(error: AxiosError)`: Implement this callback to handle Axios errors.

## Methods
- `setLoaderCallbacks(showLoaderCallback, hideLoaderCallback)`: see Callbacks section 
- `setResponseErrorCallback(responseErrorCallback)`: see Callbacks section