import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import { saveAuth, clearAuth as clearStoredAuth } from '../../store/authStorage';

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', payload);
    await saveAuth(res.data.token, res.data.user);
    return { user: res.data.user, token: res.data.token };
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    await api.post('/auth/register', payload);
    const loginRes = await api.post('/auth/login', {
      email: payload.email,
      password: payload.password,
    });
    await saveAuth(loginRes.data.token, loginRes.data.user);
    return { user: loginRes.data.user, token: loginRes.data.token };
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Registration failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    loading: false,
    bootstrapping: true,
    error: null,
  },
  reducers: {
    setAuthSession: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.bootstrapping = false;
    },
    finishBootstrap: (state) => {
      state.bootstrapping = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      clearStoredAuth();
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError, setAuthSession, finishBootstrap } = authSlice.actions;
export default authSlice.reducer;
