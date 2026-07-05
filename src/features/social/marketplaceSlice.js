import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import { getErrorMessage } from '../../utils/helpers';

export const fetchListings = createAsyncThunk('marketplace/fetchListings', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/social/marketplace', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to load listings'));
  }
});

export const fetchListing = createAsyncThunk('marketplace/fetchListing', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/social/marketplace/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to load listing'));
  }
});

export const createListing = createAsyncThunk('marketplace/createListing', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.post('/social/marketplace', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to create listing'));
  }
});

export const contactSeller = createAsyncThunk('marketplace/contactSeller', async ({ id, message }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/social/marketplace/${id}/contact`, { message });
    return res.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to contact seller'));
  }
});

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState: {
    items: [],
    selected: null,
    loading: false,
    detailLoading: false,
    creating: false,
    page: 1,
    totalPages: 1,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchListings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchListing.pending, (state) => {
        state.detailLoading = true;
        state.selected = null;
      })
      .addCase(fetchListing.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchListing.rejected, (state) => {
        state.detailLoading = false;
      })
      .addCase(createListing.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export default marketplaceSlice.reducer;
