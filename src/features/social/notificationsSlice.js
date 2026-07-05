import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import { getErrorMessage } from '../../utils/helpers';

export const fetchNotifications = createAsyncThunk('notifications/fetchNotifications', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/social/notifications');
    return res.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to load notifications'));
  }
});

export const fetchUnreadCount = createAsyncThunk('notifications/fetchUnreadCount', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/social/notifications/unread-count');
    return res.data.count;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to load notifications'));
  }
});

export const markAllRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await api.post('/social/notifications/read', {});
    return true;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to update notifications'));
  }
});

export const fetchExplore = createAsyncThunk('notifications/fetchExplore', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/social/explore');
    return res.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to load explore'));
  }
});

export const globalSearch = createAsyncThunk('notifications/globalSearch', async (query, { rejectWithValue }) => {
  try {
    const res = await api.get('/social/search', { params: { q: query } });
    return res.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Search failed'));
  }
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    explore: null,
    searchResults: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.unreadCount = 0;
        state.items = state.items.map((n) => ({ ...n, isRead: true }));
      })
      .addCase(fetchExplore.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExplore.fulfilled, (state, action) => {
        state.loading = false;
        state.explore = action.payload;
      })
      .addCase(fetchExplore.rejected, (state) => {
        state.loading = false;
      })
      .addCase(globalSearch.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      });
  },
});

export const { clearSearchResults } = notificationsSlice.actions;
export default notificationsSlice.reducer;
