import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import { getErrorMessage } from '../../utils/helpers';

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return (await api.get('/tasks')).data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchDeveloperTasks = createAsyncThunk('tasks/fetchMine', async (_, { rejectWithValue }) => {
  try {
    return (await api.get('/tasks/developer')).data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const addTask = createAsyncThunk('tasks/add', async (data, { rejectWithValue }) => {
  try {
    return (await api.post('/tasks', data)).data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, ...data }, { rejectWithValue }) => {
  try {
    return (await api.put(`/tasks/${id}`, data)).data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/tasks/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDeveloperTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDeveloperTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDeveloperTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      });
  },
});

export default taskSlice.reducer;
