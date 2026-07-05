import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import { getErrorMessage } from '../../utils/helpers';

export const fetchCows = createAsyncThunk('cows/fetch', async (_, { rejectWithValue }) => {
  try {
    return (await api.get('/cows')).data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchCowById = createAsyncThunk('cows/fetchOne', async (id, { rejectWithValue }) => {
  try {
    return (await api.get(`/cows/${id}`)).data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const addCow = createAsyncThunk('cows/add', async (cow, { rejectWithValue }) => {
  try {
    return (await api.post('/cows', cow)).data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateCow = createAsyncThunk('cows/update', async ({ id, ...cow }, { rejectWithValue }) => {
  try {
    return (await api.put(`/cows/${id}`, cow)).data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const deleteCow = createAsyncThunk('cows/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/cows/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const uploadCowImage = createAsyncThunk('cows/uploadImage', async ({ id, uri }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'cow.jpg';
    formData.append('image', { uri, name: filename, type: 'image/jpeg' });
    const res = await api.post(`/cows/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const cowSlice = createSlice({
  name: 'cows',
  initialState: {
    items: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCowError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCows.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCows.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCows.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCowById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(addCow.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateCow.fulfilled, (state, action) => {
        const index = state.items.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        state.selected = action.payload;
      })
      .addCase(uploadCowImage.fulfilled, (state, action) => {
        const index = state.items.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        state.selected = action.payload;
      })
      .addCase(deleteCow.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      });
  },
});

export const { clearCowError } = cowSlice.actions;
export default cowSlice.reducer;
