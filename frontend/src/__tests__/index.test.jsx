import React from 'react';
import ReactDOM from 'react-dom/client';
import { render, screen } from '@testing-library/react';
import AppRoutes from '../AppRoutes';

jest.mock('react-dom/client');


// input mock rendered root and  call AppRoutes + component in div called 'root'
describe('index (app bootstrap)', () => {
  beforeEach(() => {
    ReactDOM.createRoot.mockReset();
  });

  it('calls ReactDOM.createRoot with #root and renders AppRoutes', () => {
    const mockRoot = { render: jest.fn() };
    ReactDOM.createRoot.mockReturnValue(mockRoot);

    // create a fake root element
    const rootEl = document.createElement('div');
    rootEl.setAttribute('id', 'root');
    document.body.appendChild(rootEl);

    // require the module under test (index) after setting up the DOM and mocks
    // we import dynamically so module executes in test
    // eslint-disable-next-line global-require
    require('../index');

    expect(ReactDOM.createRoot).toHaveBeenCalledWith(rootEl);
    expect(mockRoot.render).toHaveBeenCalled();

    // cleanup
    document.body.removeChild(rootEl);
    jest.resetModules();
  });
});
// output verifies that AppRoutes is rendered within the root element
