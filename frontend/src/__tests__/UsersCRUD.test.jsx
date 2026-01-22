import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UsersCRUD from '../components/UsersCRUD';

// input Mock of api responses from backend
jest.mock('../utils/api', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// input Mock AuthContext with admin user
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    token: 'mock-token',
    user: { id: 1, username: 'admin', is_superuser: true }
  }),
}));

// input mock backend data for users
describe('UsersCRUD', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and displays users', async () => {
    const fakeUsers = [{ id: 1, username: 'alice', email: 'a@example.com' }];
    
    const apiFetch = require('../utils/api').default;
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeUsers,
    });

    render(<UsersCRUD />);

    expect(await screen.findByText(/alice/)).toBeInTheDocument();
    expect(screen.getByText(/a@example.com/)).toBeInTheDocument();
  });
  //output should be page with mocked users from above

  // input adding a new user
  it('adds a new user when form is submitted', async () => {
    const existingUsers = [{ id: 1, username: 'alice', email: 'a@example.com' }];
    const newUser = { id: 2, username: 'bob', email: 'b@example.com' };
    
    const apiFetch = require('../utils/api').default;
    
    // Mock initial fetch
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => existingUsers,
    });
    
    // Mock POST request
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => newUser,
    });
    
    // Mock refresh fetch
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [...existingUsers, newUser],
    });

    render(<UsersCRUD />);

    // Wait for initial users to load
    await screen.findByText(/alice/);

    // Fill form
    await userEvent.type(screen.getByPlaceholderText('Username'), 'bob');
    await userEvent.type(screen.getByPlaceholderText('Email'), 'b@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'secret123');
    
    // Submit form
    await userEvent.click(screen.getByRole('button', { name: /Add/i }));

    // Verify API was called correctly
    expect(apiFetch).toHaveBeenCalledWith('/api/users/', {
      method: 'POST',
      headers: { Authorization: 'Bearer mock-token' },
      body: JSON.stringify({
        username: 'bob',
        email: 'b@example.com',
        password: 'secret123'
      }),
    });
  });
});
