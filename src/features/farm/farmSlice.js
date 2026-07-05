import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import { getErrorMessage } from '../../utils/helpers';

const farmGet = (path, config) => api.get(`/farm${path}`, config);
const farmPost = (path, data) => api.post(`/farm${path}`, data);
const farmPut = (path, data) => api.put(`/farm${path}`, data);
const farmDelete = (path) => api.delete(`/farm${path}`);

export const fetchDiary = createAsyncThunk('farm/fetchDiary', async (_, { rejectWithValue }) => {
  try { return (await farmGet('/diary')).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const createDiary = createAsyncThunk('farm/createDiary', async (data, { rejectWithValue }) => {
  try { return (await farmPost('/diary', data)).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const fetchMilk = createAsyncThunk('farm/fetchMilk', async (_, { rejectWithValue }) => {
  try { return (await farmGet('/milk')).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const createMilk = createAsyncThunk('farm/createMilk', async (data, { rejectWithValue }) => {
  try { return (await farmPost('/milk', data)).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const fetchMilkTrends = createAsyncThunk('farm/fetchMilkTrends', async (days = 30, { rejectWithValue }) => {
  try { return (await farmGet('/milk/trends', { params: { days } })).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const fetchVaccinations = createAsyncThunk('farm/fetchVaccinations', async (_, { rejectWithValue }) => {
  try { return (await farmGet('/vaccinations')).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const createVaccination = createAsyncThunk('farm/createVaccination', async (data, { rejectWithValue }) => {
  try { return (await farmPost('/vaccinations', data)).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const fetchPregnancies = createAsyncThunk('farm/fetchPregnancies', async (_, { rejectWithValue }) => {
  try { return (await farmGet('/pregnancies')).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const createPregnancy = createAsyncThunk('farm/createPregnancy', async (data, { rejectWithValue }) => {
  try { return (await farmPost('/pregnancies', data)).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const fetchCollections = createAsyncThunk('farm/fetchCollections', async (_, { rejectWithValue }) => {
  try { return (await farmGet('/collections')).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const createCollection = createAsyncThunk('farm/createCollection', async (data, { rejectWithValue }) => {
  try { return (await farmPost('/collections', data)).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const fetchKnowledge = createAsyncThunk('farm/fetchKnowledge', async (params, { rejectWithValue }) => {
  try { return (await farmGet('/knowledge', { params })).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const fetchDevices = createAsyncThunk('farm/fetchDevices', async (_, { rejectWithValue }) => {
  try { return (await farmGet('/devices')).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const createDevice = createAsyncThunk('farm/createDevice', async (data, { rejectWithValue }) => {
  try { return (await farmPost('/devices', data)).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const fetchAnalytics = createAsyncThunk('farm/fetchAnalytics', async (_, { rejectWithValue }) => {
  try { return (await farmGet('/analytics')).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const fetchHealthInsights = createAsyncThunk('farm/fetchHealthInsights', async (_, { rejectWithValue }) => {
  try { return (await farmGet('/health-insights')).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

const farmSlice = createSlice({
  name: 'farm',
  initialState: {
    diary: [], milk: [], milkTrends: [], vaccinations: [], pregnancies: [],
    collections: [], knowledge: [], devices: [], analytics: null, healthInsights: [],
    loading: false, error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiary.fulfilled, (s, a) => { s.loading = false; s.diary = a.payload; })
      .addCase(createDiary.fulfilled, (s, a) => { s.diary.unshift(a.payload); })
      .addCase(fetchMilk.fulfilled, (s, a) => { s.loading = false; s.milk = a.payload; })
      .addCase(createMilk.fulfilled, (s, a) => { s.milk.unshift(a.payload); })
      .addCase(fetchMilkTrends.fulfilled, (s, a) => { s.milkTrends = a.payload; })
      .addCase(fetchVaccinations.fulfilled, (s, a) => { s.loading = false; s.vaccinations = a.payload; })
      .addCase(createVaccination.fulfilled, (s, a) => { s.vaccinations.push(a.payload); })
      .addCase(fetchPregnancies.fulfilled, (s, a) => { s.loading = false; s.pregnancies = a.payload; })
      .addCase(createPregnancy.fulfilled, (s, a) => { s.pregnancies.unshift(a.payload); })
      .addCase(fetchCollections.fulfilled, (s, a) => { s.collections = a.payload; })
      .addCase(fetchKnowledge.fulfilled, (s, a) => { s.loading = false; s.knowledge = a.payload; })
      .addCase(fetchDevices.fulfilled, (s, a) => { s.devices = a.payload; })
      .addCase(createDevice.fulfilled, (s, a) => { s.devices.unshift(a.payload); })
      .addCase(fetchAnalytics.fulfilled, (s, a) => { s.loading = false; s.analytics = a.payload; })
      .addCase(fetchHealthInsights.fulfilled, (s, a) => { s.healthInsights = a.payload; })
      .addMatcher((a) => a.type.startsWith('farm/') && a.type.endsWith('/pending'), (s) => { s.loading = true; })
      .addMatcher((a) => a.type.startsWith('farm/') && a.type.endsWith('/rejected'), (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export default farmSlice.reducer;
