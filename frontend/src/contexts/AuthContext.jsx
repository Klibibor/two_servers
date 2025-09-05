import React, { createContext, useContext, useEffect, useReducer } from 'react'
import tokenStore from '../utils/tokenStore'
import api from '../utils/api'


// input placeholders for AuthContext functions and variables
const AuthContext = createContext({
  user: null, // {id, username, ...} | null
  loading: false, // loading feature while fetching backend data
  token: tokenStore.getToken(), // fetch token from component for token management
  login: async () => {}, // login function
  loginSession: async () => {}, // login session function
  logout: async () => {}, // logout function
  refreshUser: async () => {}, // refresh user function - exposed for components
})

// input starting state for AuthContext placeholders
const initialState = {
  user: null,        // {id, username, ...} | null
  loading: false,    // true when fetching backend data
  token: tokenStore.getToken(), // read from memory (in-memory store)
}

// input functions for SET_LOADING, SET_TOKEN, SET_USER, RESET, state and action (sets new state)
function authReducer(state, action) { // action.payload is going to change state
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload } // true or payload value
    case 'SET_TOKEN':
      return { ...state, token: action.payload }// tokenStore/null or payload value
    case 'SET_USER':
      return { ...state, user: action.payload }// null or payload value
    case 'RESET':
      return { user: null, loading: false, token: null } // resets state
    default:
      return state
  }
}
// output state and actions for functions

// input function that will be called by components which use AuthContext
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // helper functions for cleaner code - hide dispatch implementation
  const setLoading = (loading) => dispatch({ type: 'SET_LOADING', payload: loading })
  const setUser = (user) => dispatch({ type: 'SET_USER', payload: user })
  const setToken = (token) => dispatch({ type: 'SET_TOKEN', payload: token })
  const resetAuth = () => dispatch({ type: 'RESET' })

  //----------------------------
  // input function for refreshing user data
  const refreshUser = async () => {
    const token = tokenStore.getToken()
    if (!token) { // if  there is no token
      // set user and token to null
      setUser(null)
      setToken(null)
      return
    }
    //output if no token in tokenStore set user to null and token to null
    console.warn('User is logged out')
    // after that try to get user data
    setLoading(true)
    try {
      const res = await api('/api/auth/me/') // backend user database
      if (!res.ok) {
        throw new Error('Unauthorized')
        // if backend responds with 401, throw error
      }
      const user = await res.json() // if backend sends user data
      setUser(user) // set user data
      setToken(tokenStore.getToken()) // get potentially refreshed token
    }
    // output 1. if backend sends user data set user and call for token token managment component
    // if user is not found
    catch (err) {
      tokenStore.clearToken() // clear token from memory
      resetAuth() // front end reset of user: null, loading: false, token: null
    } finally {
      setLoading(false)
    }// output 2. if backend sends no data clear user and token
  }
  useEffect(() => {
    refreshUser()
  }, [])
//---------------------------------------------------------
  // login function sets token uses refresh function
  const login = async ({ access, refresh } = {}) => {
    if (!access) {
      console.warn('login() called without access token');
      return;
    }
    tokenStore.setToken(access); // set token in memory
    setToken(access);
    
    // Store refresh token in localStorage for automatic refresh
    if (refresh) {
      localStorage.setItem('refresh_token', refresh);
    }
    
    await refreshUser(); // refresh user data only if token exists
  }
//-------------------------------------------------------  

// function that is called if user has no token
  const loginSession = async (userData) => {
    setUser(userData)
    setToken(null)
  }
// set user without token
//---------------------------------------------------------------
// logout sets user to null
  const logout = async () => {
    try {
      // Backend should read refresh token from HttpOnly cookie and revoke it.
      const res = await api('/api/logout/', { method: 'POST', credentials: 'include' })
      if (!res.ok) console.warn('Logout endpoint returned', res.status)
    } catch (err) {
      console.error('Logout failed', err)
    } finally {
      tokenStore.clearToken();                // clear access token from memory
      localStorage.removeItem('refresh_token'); // clear refresh token from localStorage
      // refresh cookie is HttpOnly and will be cleared by backend; frontend must not try to remove it
      resetAuth();
    }
  }
//-------------------------------------------------------------------------
  return (
    <AuthContext.Provider
      value={{
        user: state.user,          // IZVOR: backend `/me`
        loading: state.loading,    // IZVOR: UI tok (SET_LOADING)
        token: state.token,        // IZVOR: tokenStore (memorija)
        login,
        loginSession,
        logout,
        refreshUser,               // Exposed for components to call when needed
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
