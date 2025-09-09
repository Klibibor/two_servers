import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductsCRUD from '../components/ProductsCRUD';

// input Mock of api responses from backend
jest.mock('../utils/api', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// input Mock AuthContext, imagined user is admin with JWT group
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    token: 'mock-token',
    user: { id: 1, username: 'admin', is_superuser: true, groups: ['JWT'] }
  }),
}));

// input mock backend data for products, groups, and jwtUser
describe('ProductsCRUD', () => {
  const products = [
    { id: 1, name: 'Product A', description: 'Description A', price: 100, group_name: 'Group1' },
    { id: 2, name: 'Product B', description: 'Description B', price: 200, group_name: 'Group2' },
  ];

  const groups = [
    { id: 10, name: 'Group1' },
    { id: 11, name: 'Group2' },
  ];

  const jwtUser = { id: 1, username: 'admin', is_superuser: false, groups: ['JWT'] };

  // clear localStorage and reset apiFetch mock before each test
  beforeEach(() => {
    localStorage.clear();
    const apiFetch = require('../utils/api').default;
    apiFetch.mockReset();
  });

  // input mock apiFetch responses for products, groups, and user
  it('renders products list on mount', async () => {
    const apiFetch = require('../utils/api').default;
    
    apiFetch.mockReset();
    apiFetch.mockImplementation((url) => { // promise for imitating backend response
      if (url.includes('/api/products/')) {
        return Promise.resolve({ ok: true, json: async () => products }); // return mock products above
      }
      if (url.includes('/api/groups/')) {
        return Promise.resolve({ ok: true, json: async () => groups });// return mock groups above
      }
      if (url.includes('/api/auth/me/')) {
        return Promise.resolve({ ok: true, json: async () => ({}) });// return empty user details
      }
      return Promise.reject(new Error('Unexpected apiFetch ' + url));// rejectif unexpected url is called
    });

    render(<ProductsCRUD />);
    // output rendered product list

    // input rendered product page that will be tested
    const itemA = await screen.findByText(/Product A/);
    expect(itemA).toBeInTheDocument();
    expect(screen.getByText(/Description A/)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();

    expect(await screen.findByText(/Product B/)).toBeInTheDocument();
  });
  // output should be page with mocked products from above

  // input mock apiFetch responses for products, groups, and user
  it('allows editing price and saves updated price', async () => {
    const apiFetch = require('../utils/api').default;
    
    // Reset mock before setting implementation
    apiFetch.mockReset();
    
    // First three fetches for mount
    apiFetch.mockImplementation((url, options) => {
      if (url.includes('/api/products/') && (!options || options.method === undefined)) {// method is GET
        return Promise.resolve({ ok: true, json: async () => products }); // return mock products above
      }
      if (url.includes('/api/groups/')) {
        return Promise.resolve({ ok: true, json: async () => groups }); // return mock groups above
      }
      if (url.includes('/api/auth/me/')) {
        return Promise.resolve({ ok: true, json: async () => jwtUser }); // return mock user jwtUser
      }
      if (url.includes('/api/products/1/') && options && options.method === 'PATCH') {// PATCH method
        // simulate server returning updated product
        return Promise.resolve({ ok: true, json: async () => ({ id: 1, name: 'Product A', description: 'Description A', price: 150, group_name: 'Group1' }) });
      }
      return Promise.reject(new Error('Unexpected apiFetch ' + url));
    });

  render(<ProductsCRUD />);
  // output rendered product list

  // input rendered product page and DOM elements
  const productANode = await screen.findByText(/Product A/);
  const li = productANode.closest('li');
  expect(li).toBeTruthy();
  // output should be <li> element containing product A

  const { getByRole: getByRoleWithin } = require('@testing-library/dom');
  const within = require('@testing-library/dom').within;
  const editBtn = within(li).getByRole('button', { name: /Edit price/i });
  await userEvent.click(editBtn);
  // output should be <button> element containing Edit price

  const priceInput = within(li).getByRole('spinbutton');
  await userEvent.clear(priceInput);
  await userEvent.type(priceInput, '150');
  // output should be <input> element that allows price editing

  const saveButton = within(li).getByRole('button', { name: /Save/i });
  await userEvent.click(saveButton);
  // output should be <button> element containing Save

  // wait for updated price to appear inside the same list item
  await waitFor(() => expect(within(li).getByText(/150/)).toBeInTheDocument());
  // output should be <span> element containing updated price
  });


  // input mock backend response for products, groups, and user
  it('allows adding a new product (with image) when user has permission', async () => {
    // Setup localStorage token so component will include authHeader
    const tokenStore = require('../utils/tokenStore').default;
    tokenStore.setToken('fake-token');
    // output mocks JWT token in localStorage

    const newProduct = { id: 3, name: 'Product C', description: 'Description C', price: 300, group_name: 'Group1' };
    // output new product details

    // Use a mutable products array so subsequent GETs reflect the POST
    let productsState = [...products];
    let postExecuted = false;
    
    const apiFetch = require('../utils/api').default;
    apiFetch.mockReset();
    
    // input mock backend response for products, groups, and user
    apiFetch.mockImplementation((url, options) => {
      if (url.includes('/api/products/') && (!options || options.method === undefined)) {
        // Only return the added product in subsequent GET calls if POST was executed
        return Promise.resolve({ ok: true, json: async () => postExecuted ? productsState : products });
      }
      if (url.includes('/api/groups/')) {
        return Promise.resolve({ ok: true, json: async () => groups });
      }
      if (url.includes('/api/auth/me/')) {
        return Promise.resolve({ ok: true, json: async () => jwtUser });
      }
      if (url.includes('/api/products/') && options && options.method === 'POST') {
        return (async () => {
          const created = newProduct;
          // Only add to the state if not already added
          if (!postExecuted) {
            productsState.push(created);
            postExecuted = true;
          }
          return { ok: true, json: async () => created };
        })();
      }
      return Promise.reject(new Error('Unexpected apiFetch ' + url));
    });

    render(<ProductsCRUD />);
    // output rendered product list

    // wait for form to appear (Add product heading)
    expect(await screen.findByRole('heading', { name: /Add Product/i })).toBeInTheDocument();

    // wait for groups to be loaded in select
    await waitFor(() => expect(screen.getByRole('option', { name: 'Group1' })).toBeInTheDocument());

    // input new product details + image
    await userEvent.type(screen.getByPlaceholderText('Name'), 'Product C');
    await userEvent.selectOptions(screen.getByRole('combobox'), '10');
    await userEvent.type(screen.getByPlaceholderText('Description'), 'Description C');
    await userEvent.type(screen.getByPlaceholderText('Price'), '300');

    const file = new File(['dummy'], 'photo.png', { type: 'image/png' });
    const fileEl = document.querySelector('input[type="file"]');
    if (fileEl) await userEvent.upload(fileEl, file);

    await userEvent.click(screen.getByRole('button', { name: /Add/i }));
    // output should be <button> element containing Add

    // wait until the new product is present in the products list
    await waitFor(() => expect(screen.getByText(/Product C/)).toBeInTheDocument());
    // output should be <li> element containing product C
  });
});
