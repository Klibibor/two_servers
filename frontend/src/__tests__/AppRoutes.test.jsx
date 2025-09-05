import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from '../AppRoutes';

// Mock apiFetch
jest.mock('../utils/api', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock AuthContext 
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'testuser', groups: ['JWT'] },
    token: 'mock-token',
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// input render AppRoutes inside MemoryRouter with route "/"
describe('AppRoutes', () => {
  beforeEach(() => {
    const apiFetch = require('../utils/api').default;
    apiFetch.mockReset();
    // Default mock - returns empty arrays for most endpoints
    apiFetch.mockImplementation((url) => {
      if (url.includes('/api/groups/')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      if (url.includes('/api/products/')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      if (url.includes('/api/auth/me/')) {
        return Promise.resolve({ ok: true, json: async () => ({}) });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });
  });

  it('renders Home at root route', async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    // find the main heading rendered by the Home route
    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });
// output verifies that the Home page heading ("Home") is present in the document

// input render AppRoutes inside MemoryRouter with route "/products"  
  it('renders Products page on /products', async () => {
    render(
      <MemoryRouter initialEntries={["/products"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    // use heading role to avoid matching the navigation link
    expect(await screen.findByRole('heading', { name: 'Products' })).toBeInTheDocument();
  });
// output verifies that the Products page heading ("Products") is present in the document

// input render AppRoutes inside MemoryRouter with route "/products-crud"
  it('renders ProductsCRUD on /products-crud without crashing', async () => {
    render(
      <MemoryRouter initialEntries={["/products-crud"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    // ensure at least one heading with 'Products' exists on the page
    const headings = await screen.findAllByRole('heading', { name: /Products/i });
    expect(headings.length).toBeGreaterThan(0);
  });

  // new: verify that the /users route renders the Users page
  it('renders Users page on /users', async () => {
    render(
      <MemoryRouter initialEntries={["/users"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    // the Users component renders an <h2>Users</h2>
    expect(await screen.findByRole('heading', { name: 'Users' })).toBeInTheDocument();
  });
});
// output verifies that the Home page heading ("Users") is present in the document