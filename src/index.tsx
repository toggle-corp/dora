import React from 'react';
import ReactDOM from 'react-dom';

import Root from './Root';

import '@togglecorp/toggle-ui/build/index.css';

console.info('React version', React.version);

const rootElement = document.getElementById('dora-root');
if (rootElement) {
    ReactDOM.unstable_createRoot(rootElement).render(<Root />);
} else {
    console.error('Root element was not found');
}
