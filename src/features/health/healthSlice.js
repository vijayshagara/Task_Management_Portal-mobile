import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import { getErrorMessage } from '../../utils/helpers';

export const fetchHealth = createAsyncThunk('health/fetch', async (_, { rejectWithValue }) => {
  try {
    return (await api.get('/health')).data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const addHealth = createAsyncThunk('health/add', async (data, { rejectWithValue }) => {
  try {
    return (await api.post('/health', data)).data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateHealth = createAsyncThunk('health/update', async ({ id, ...data }, { rejectWithValue }) => {
  try {
    return (await api.put(`/health/${id}`, data)).data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const deleteHealth = createAsyncThunk('health/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/health/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const healthSlice = createSlice({
  name: 'health',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHealth.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHealth.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchHealth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addHealth.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateHealth.fulfilled, (state, action) => {
        const index = state.items.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteHealth.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
      });
  },
});

export default healthSlice.reducer;
