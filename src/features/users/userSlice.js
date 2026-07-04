import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import { getErrorMessage } from '../../utils/helpers';

export const fetchUsers = createAsyncThunk('users/fetch', async (_, { rejectWithValue }) => {
  try {
    return (await api.get('/users')).data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchDevelopers = createAsyncThunk('users/fetchDevelopers', async (_, { rejectWithValue }) => {
  try {
    return (await api.get('/users/developers')).data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const addUser = createAsyncThunk('users/add', async (data, { rejectWithValue }) => {
  try {
    return (await api.post('/users', data)).data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateUser = createAsyncThunk('users/update', async ({ id, ...data }, { rejectWithValue }) => {
  try {
    return (await api.put(`/users/${id}`, data)).data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const deleteUser = createAsyncThunk('users/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/users/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const userSlice = createSlice({
  name: 'users',
  initialState: { items: [], developers: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDevelopers.fulfilled, (state, action) => {
        state.developers = action.payload;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.items.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter((u) => u.id !== action.payload);
      });
  },
});

export default userSlice.reducer;
