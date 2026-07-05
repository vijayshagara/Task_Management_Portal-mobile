import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import { getErrorMessage } from '../../utils/helpers';

export const fetchMyProfile = createAsyncThunk('profile/fetchMyProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/profile/me');
    return res.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to load profile'));
  }
});

export const fetchProfile = createAsyncThunk('profile/fetchProfile', async (userId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/profile/${userId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to load profile'));
  }
});

export const updateProfile = createAsyncThunk('profile/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/profile/me', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to update profile'));
  }
});

export const followUser = createAsyncThunk('profile/followUser', async (userId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/follow/${userId}`);
    return { userId, ...res.data };
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to follow user'));
  }
});

export const unfollowUser = createAsyncThunk('profile/unfollowUser', async (userId, { rejectWithValue }) => {
  try {
    await api.delete(`/follow/${userId}`);
    return userId;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to unfollow user'));
  }
});

export const fetchUserPosts = createAsyncThunk('profile/fetchUserPosts', async (userId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/posts/user/${userId}`);
    return res.data.items;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to load posts'));
  }
});

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    myProfile: null,
    viewedProfile: null,
    userPosts: [],
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {
    clearViewedProfile: (state) => {
      state.viewedProfile = null;
      state.userPosts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.myProfile = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.viewedProfile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.myProfile = action.payload;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.userPosts = action.payload;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        if (state.viewedProfile?.id === action.payload.userId) {
          state.viewedProfile.isFollowing = action.payload.status === 'following';
        }
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        if (state.viewedProfile?.id === action.payload) {
          state.viewedProfile.isFollowing = false;
        }
      });
  },
});

export const { clearViewedProfile } = profileSlice.actions;
export default profileSlice.reducer;
