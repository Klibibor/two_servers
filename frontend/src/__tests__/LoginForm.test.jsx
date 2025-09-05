import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// provide a mock for useNavigate so tests can assert navigation without touching window.location
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const rrd = jest.requireActual('react-router-dom');
  return {
    ...rrd,
    useNavigate: () => mockNavigate,
  };
});
// mock useAuth to provide a login function that stores token in tokenStore
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: async ({ access }) => {
      const tokenStore = require('../utils/tokenStore').default;
      if (access) tokenStore.setToken(access);
      // refresh token is now handled via HttpOnly cookie, not localStorage
    },
  }),
}));

import LoginForm from '../components/LoginForm';

describe('LoginForm', () => {
  beforeEach(() => {
    // ensure clean localStorage
    localStorage.clear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // input mock backend response for login call from LoginForm
  it('sets token on successful login and redirects', async () => {
    // Mock fetch to return success response with credentials: 'include'
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access: 'test-token' }),
    });

    // Mock getCookie for CSRF token
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'csrftoken=mock-csrf-token',
    });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Username'), 'alice');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /Login/i }));

  // token is stored in-memory via tokenStore
  const tokenStore = require('../utils/tokenStore').default;
  await waitFor(() => expect(tokenStore.getToken()).toBe('test-token'));
  expect(mockNavigate).toHaveBeenCalledWith('/');
  });
  // output verifies that the JWT token is stored in localStorage and the user is redirected to the home page

  // input mock backend response for login call from LoginForm
  it('shows error on failed login', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Bad credentials' }),
    });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Username'), 'bob');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /Login/i }));

    expect(await screen.findByText(/Bad credentials|Login error./i)).toBeInTheDocument();
  });
});
// output verifies that the error message is displayed when login fails
