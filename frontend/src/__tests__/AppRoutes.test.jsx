import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from '../AppRoutes';

// input render AppRoutes inside MemoryRouter with route "/"
describe('AppRoutes', () => {
  it('renders Home at root route', () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    // find the main heading rendered by the Home route
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });
// output verifies that the Home page heading ("Home") is present in the document

// input render AppRoutes inside MemoryRouter with route "/products"
  it('renders Products page on /products', () => {
    render(
      <MemoryRouter initialEntries={["/products"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    // use heading role to avoid matching the navigation link
    expect(screen.getByRole('heading', { name: 'Products' })).toBeInTheDocument();
  });
// output verifies that the Products page heading ("Products") is present in the document

// input render AppRoutes inside MemoryRouter with route "/products-crud"
  it('renders ProductsCRUD on /products-crud without crashing', () => {
    render(
      <MemoryRouter initialEntries={["/products-crud"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    // ensure at least one heading with 'Products' exists on the page
    const headings = screen.getAllByRole('heading', { name: /Products/i });
    expect(headings.length).toBeGreaterThan(0);
  });

  // new: verify that the /users route renders the Users page
  it('renders Users page on /users', () => {
    render(
      <MemoryRouter initialEntries={["/users"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    // the Users component renders an <h2>Users</h2>
    expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument();
  });
});
// output verifies that the Home page heading ("Users") is present in the document