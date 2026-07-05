import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import { getErrorMessage } from '../../utils/helpers';

export const fetchConversations = createAsyncThunk('messages/fetchConversations', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/social/messages');
    return res.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to load messages'));
  }
});

export const startConversation = createAsyncThunk('messages/startConversation', async (otherUserId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/social/messages/start/${otherUserId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to start conversation'));
  }
});

export const fetchMessages = createAsyncThunk('messages/fetchMessages', async (conversationId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/social/messages/${conversationId}`);
    return { conversationId, messages: res.data.items };
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to load conversation'));
  }
});

export const sendMessage = createAsyncThunk('messages/sendMessage', async ({ conversationId, content }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/social/messages/${conversationId}`, { content });
    return { conversationId, message: res.data };
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Failed to send message'));
  }
});

function upsertConversation(state, conversation) {
  const index = state.conversations.findIndex((c) => c.id === conversation.id);
  if (index >= 0) {
    state.conversations[index] = { ...state.conversations[index], ...conversation };
  } else {
    state.conversations.unshift(conversation);
  }
  state.conversations.sort((a, b) => {
    const aTime = a.lastMessageAt || a.updatedAt;
    const bTime = b.lastMessageAt || b.updatedAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });
}

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    conversations: [],
    activeMessages: [],
    activeConversationId: null,
    loading: false,
    messagesLoading: false,
    starting: false,
    sending: false,
    error: null,
  },
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },
    clearActiveChat: (state) => {
      state.activeMessages = [];
      state.activeConversationId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(startConversation.pending, (state) => {
        state.starting = true;
      })
      .addCase(startConversation.fulfilled, (state, action) => {
        state.starting = false;
        upsertConversation(state, action.payload);
        state.activeConversationId = action.payload.id;
      })
      .addCase(startConversation.rejected, (state, action) => {
        state.starting = false;
        state.error = action.payload;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.activeMessages = action.payload.messages;
        state.activeConversationId = action.payload.conversationId;
      })
      .addCase(fetchMessages.rejected, (state) => {
        state.messagesLoading = false;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversationId, message } = action.payload;
        state.activeMessages.push(message);
        const conv = state.conversations.find((c) => c.id === conversationId);
        if (conv) {
          conv.lastMessage = message;
          conv.lastMessageAt = message.createdAt;
          state.conversations.sort((a, b) => {
            const aTime = a.lastMessageAt || a.updatedAt;
            const bTime = b.lastMessageAt || b.updatedAt;
            return new Date(bTime).getTime() - new Date(aTime).getTime();
          });
        }
      });
  },
});

export const { setActiveConversation, clearActiveChat } = messagesSlice.actions;
export default messagesSlice.reducer;
