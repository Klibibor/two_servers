import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductsCRUD from '../components/ProductsCRUD';

// Mock apiFetch instead of global fetch
jest.mock('../utils/api', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock tokenStore
jest.mock('../utils/tokenStore', () => ({
  __esModule: true,
  default: {
    getToken: jest.fn(() => 'mock-token'),
    setToken: jest.fn(),
  },
}));

// input fake backend data for products, groups, and JWT
describe('ProductsCRUD', () => {
  const products = [
    { id: 1, naziv: 'Product A', opis: 'Description A', cena: 100, grupa_naziv: 'Group1' },
    { id: 2, naziv: 'Product B', opis: 'Description B', cena: 200, grupa_naziv: 'Group2' },
  ];

  const groups = [
    { id: 10, naziv: 'Group1' },
    { id: 11, navn: 'Group2' },
  ];

  const jwtUser = { id: 1, username: 'admin', is_superuser: false, groups: ['JWT'] };

  // input localStorage mock data
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  // input mock apiFetch responses for products, groups, and user
  it('renders products list on mount', async () => {
    const apiFetch = require('../utils/api').default;
    
    apiFetch.mockImplementation((url) => {
      if (url.includes('/api/products/')) {
        return Promise.resolve({ ok: true, json: async () => products });
      }
      if (url.includes('/api/groups/')) {
        return Promise.resolve({ ok: true, json: async () => groups });
      }
      if (url.includes('/api/auth/me/')) {
        return Promise.resolve({ ok: true, json: async () => ({}) });
      }
      return Promise.reject(new Error('Unexpected apiFetch ' + url));
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
  // output information if data is shown on product page

  // input mock apiFetch responses for products, groups, and user
  it('allows editing price and saves updated price', async () => {
    const apiFetch = require('../utils/api').default;
    
    // First three fetches for mount
    apiFetch.mockImplementation((url, options) => {
      if (url.includes('/api/products/') && (!options || options.method === undefined)) {
        return Promise.resolve({ ok: true, json: async () => products });
      }
      if (url.includes('/api/groups/')) {
        return Promise.resolve({ ok: true, json: async () => groups });
      }
      if (url.includes('/api/auth/me/')) {
        return Promise.resolve({ ok: true, json: async () => jwtUser });
      }
      if (url.includes('/api/products/1/') && options && options.method === 'PATCH') {
        // simulate server returning updated product
        return Promise.resolve({ ok: true, json: async () => ({ id: 1, naziv: 'Prod A', opis: 'Desc A', cena: 150, grupa_naziv: 'G1' }) });
      }
      return Promise.reject(new Error('Unexpected apiFetch ' + url));
    });

  render(<ProductsCRUD />);
  // output rendered product list

  // input rendered product page and DOM elements
  const productANode = await screen.findByText(/Prod A/);
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

  fetchMock.mockRestore();
  });


  // input mock backend response for products, groups, and user
  it('allows adding a new product (with image) when user has permission', async () => {
    // Setup localStorage token so component will include authHeader
  const tokenStore = require('../utils/tokenStore').default;
  tokenStore.setToken('fake-token');
    // output mocks JWT token in localStorage

    const newProduct = { id: 3, naziv: 'Prod C', opis: 'Desc C', cena: 300, grupa_naziv: 'G1' };
    // output new product details

  // Use a mutable products array so subsequent GETs reflect the POST
  const productsState = [...products];
  // input mock backend response for products, groups, and user
  const mockFetch = jest.spyOn(global, 'fetch').mockImplementation((url, options) => {
      if (url.includes('/api/products/') && (!options || options.method === undefined)) {
        return Promise.resolve({ ok: true, json: async () => productsState });
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
          productsState.push(created);
          return { ok: true, json: async () => created };
        })();
      }
      return Promise.reject(new Error('Unexpected fetch ' + url));
    });

    render(<ProductsCRUD />);
    // output rendered product list

    // wait for form to appear (Add product heading)
    expect(await screen.findByRole('heading', { name: /Add product/i })).toBeInTheDocument();

    // input new product details + image
    await userEvent.type(screen.getByPlaceholderText('Name'), 'Prod C');
    await userEvent.selectOptions(screen.getByRole('combobox'), '10');
    await userEvent.type(screen.getByPlaceholderText('Description'), 'Desc C');
    await userEvent.type(screen.getByPlaceholderText('Price'), '300');

    const file = new File(['dummy'], 'photo.png', { type: 'image/png' });
    const fileEl = document.querySelector('input[type="file"]');
    if (fileEl) await userEvent.upload(fileEl, file);

    await userEvent.click(screen.getByRole('button', { name: /Add/i }));
    // output should be <button> element containing Add

    // wait until the new product is present in the products list
    await waitFor(() => expect(screen.getByText(/Prod C/)).toBeInTheDocument());
    // output should be <li> element containing product C

    mockFetch.mockRestore();
  });
});
