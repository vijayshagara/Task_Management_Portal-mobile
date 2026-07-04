import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import { getErrorMessage } from '../../utils/helpers';

export const fetchHeatCycles = createAsyncThunk('heat/fetch', async (_, { rejectWithValue }) => {
  try {
    return (await api.get('/heat-cycles')).data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const addHeatCycle = createAsyncThunk('heat/add', async (data, { rejectWithValue }) => {
  try {
    return (await api.post('/heat-cycles', data)).data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateHeatCycle = createAsyncThunk('heat/update', async ({ id, ...data }, { rejectWithValue }) => {
  try {
    return (await api.put(`/heat-cycles/${id}`, data)).data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const deleteHeatCycle = createAsyncThunk('heat/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/heat-cycles/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const confirmHeatCycle = createAsyncThunk('heat/confirm', async (id, { rejectWithValue }) => {
  try {
    await api.post(`/heat-cycles/${id}/confirm`);
    return id;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const heatSlice = createSlice({
  name: 'heatCycles',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHeatCycles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHeatCycles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchHeatCycles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addHeatCycle.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateHeatCycle.fulfilled, (state, action) => {
        const index = state.items.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteHeatCycle.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      })
      .addCase(confirmHeatCycle.fulfilled, (state, action) => {
        const cycle = state.items.find((c) => c.id === action.payload);
        if (cycle) {
          cycle.status = 'confirmed';
          cycle.confirmedAt = new Date().toISOString();
        }
      });
  },
});

export default heatSlice.reducer;
