import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import { getErrorMessage } from '../../utils/helpers';

export const fetchFeed = createAsyncThunk('feed/fetchFeed', async ({ page = 1 } = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/posts/feed', { params: { page, limit: 10 } });
    return res.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to load feed'));
  }
});

export const createPost = createAsyncThunk('feed/createPost', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to create post'));
  }
});

export const likePost = createAsyncThunk('feed/likePost', async (postId, { rejectWithValue }) => {
  try {
    await api.post(`/posts/${postId}/like`);
    return postId;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to like post'));
  }
});

export const unlikePost = createAsyncThunk('feed/unlikePost', async (postId, { rejectWithValue }) => {
  try {
    await api.delete(`/posts/${postId}/like`);
    return postId;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to unlike post'));
  }
});

export const fetchComments = createAsyncThunk('feed/fetchComments', async (postId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/posts/${postId}/comments`);
    return { postId, comments: res.data.items };
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to load comments'));
  }
});

export const addComment = createAsyncThunk('feed/addComment', async ({ postId, content, parentId }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/posts/${postId}/comments`, { content, parentId });
    return { postId, comment: res.data };
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to add comment'));
  }
});

export const fetchStories = createAsyncThunk('feed/fetchStories', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/social/stories');
    return res.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to load stories'));
  }
});

const feedSlice = createSlice({
  name: 'feed',
  initialState: {
    items: [],
    stories: [],
    page: 1,
    totalPages: 1,
    loading: false,
    creating: false,
    error: null,
    comments: {},
  },
  reducers: {
    clearFeedError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.page === 1
          ? action.payload.items
          : [...state.items, ...action.payload.items];
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPost.pending, (state) => {
        state.creating = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.creating = false;
        state.items.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const post = state.items.find((p) => p.id === action.payload);
        if (post) {
          post.likedByMe = true;
          post.likesCount = (post.likesCount || 0) + 1;
        }
      })
      .addCase(unlikePost.fulfilled, (state, action) => {
        const post = state.items.find((p) => p.id === action.payload);
        if (post) {
          post.likedByMe = false;
          post.likesCount = Math.max(0, (post.likesCount || 1) - 1);
        }
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments[action.payload.postId] = action.payload.comments;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        if (!state.comments[postId]) state.comments[postId] = [];

        if (comment.parentId) {
          const parent = state.comments[postId].find((c) => c.id === comment.parentId);
          if (parent) {
            if (!parent.replies) parent.replies = [];
            const replyExists = parent.replies.some((r) => r.id === comment.id);
            if (!replyExists) parent.replies.push(comment);
          }
        } else {
          const exists = state.comments[postId].some((c) => c.id === comment.id);
          if (!exists) state.comments[postId].unshift(comment);
        }

        const post = state.items.find((p) => p.id === postId);
        if (post) post.commentsCount = (post.commentsCount || 0) + 1;
      })
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.stories = action.payload;
      });
  },
});

export const { clearFeedError } = feedSlice.actions;
export default feedSlice.reducer;
