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
export const deleteDiary = createAsyncThunk('farm/deleteDiary', async (id, { rejectWithValue }) => {
  try { await farmDelete(`/diary/${id}`); return id; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const fetchMilk = createAsyncThunk('farm/fetchMilk', async (_, { rejectWithValue }) => {
  try { return (await farmGet('/milk')).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const createMilk = createAsyncThunk('farm/createMilk', async (data, { rejectWithValue }) => {
  try { return (await farmPost('/milk', data)).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const deleteMilk = createAsyncThunk('farm/deleteMilk', async (id, { rejectWithValue }) => {
  try { await farmDelete(`/milk/${id}`); return id; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
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
export const updateVaccination = createAsyncThunk('farm/updateVaccination', async ({ id, ...data }, { rejectWithValue }) => {
  try { return (await farmPut(`/vaccinations/${id}`, data)).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const deleteVaccination = createAsyncThunk('farm/deleteVaccination', async (id, { rejectWithValue }) => {
  try { await farmDelete(`/vaccinations/${id}`); return id; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const fetchPregnancies = createAsyncThunk('farm/fetchPregnancies', async (_, { rejectWithValue }) => {
  try { return (await farmGet('/pregnancies')).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const createPregnancy = createAsyncThunk('farm/createPregnancy', async (data, { rejectWithValue }) => {
  try { return (await farmPost('/pregnancies', data)).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const recordCalving = createAsyncThunk('farm/recordCalving', async ({ id, ...data }, { rejectWithValue }) => {
  try { return (await farmPost(`/pregnancies/${id}/calving`, data)).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const createKnowledge = createAsyncThunk('farm/createKnowledge', async (data, { rejectWithValue }) => {
  try { return (await farmPost('/knowledge', data)).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const upvoteKnowledge = createAsyncThunk('farm/upvoteKnowledge', async (id, { rejectWithValue }) => {
  try { return (await farmPost(`/knowledge/${id}/upvote`)).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const fetchCollections = createAsyncThunk('farm/fetchCollections', async (_, { rejectWithValue }) => {
  try { return (await farmGet('/collections')).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const createCollection = createAsyncThunk('farm/createCollection', async (data, { rejectWithValue }) => {
  try { return (await farmPost('/collections', data)).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const deleteCollection = createAsyncThunk('farm/deleteCollection', async (id, { rejectWithValue }) => {
  try { await farmDelete(`/collections/${id}`); return id; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
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
export const revokeDevice = createAsyncThunk('farm/revokeDevice', async (id, { rejectWithValue }) => {
  try { await farmDelete(`/devices/${id}`); return id; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const bulkDeleteDiary = createAsyncThunk('farm/bulkDeleteDiary', async (ids, { rejectWithValue }) => {
  try { return (await farmPost('/diary/bulk-delete', { ids })).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const bulkDeleteMilk = createAsyncThunk('farm/bulkDeleteMilk', async (ids, { rejectWithValue }) => {
  try { return (await farmPost('/milk/bulk-delete', { ids })).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const bulkDeleteCollections = createAsyncThunk('farm/bulkDeleteCollections', async (ids, { rejectWithValue }) => {
  try { return (await farmPost('/collections/bulk-delete', { ids })).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const bulkDeleteVaccinations = createAsyncThunk('farm/bulkDeleteVaccinations', async (ids, { rejectWithValue }) => {
  try { return (await farmPost('/vaccinations/bulk-delete', { ids })).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const bulkCompleteVaccinations = createAsyncThunk(
  'farm/bulkCompleteVaccinations',
  async ({ ids, administeredDate }, { rejectWithValue }) => {
    try {
      return (await farmPost('/vaccinations/bulk-complete', { ids, administeredDate })).data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);
export const bulkRevokeDevices = createAsyncThunk('farm/bulkRevokeDevices', async (ids, { rejectWithValue }) => {
  try { return (await farmPost('/devices/bulk-revoke', { ids })).data; } catch (err) { return rejectWithValue(getErrorMessage(err)); }
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
    loading: false, loadingCount: 0, error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    const startFetch = (s) => {
      s.loadingCount += 1;
      s.loading = s.loadingCount > 0;
    };
    const endFetch = (s) => {
      s.loadingCount = Math.max(0, s.loadingCount - 1);
      s.loading = s.loadingCount > 0;
    };

    builder
      .addCase(fetchDiary.fulfilled, (s, a) => { endFetch(s); s.diary = a.payload; })
      .addCase(createDiary.fulfilled, (s, a) => { s.diary.unshift(a.payload); })
      .addCase(deleteDiary.fulfilled, (s, a) => { s.diary = s.diary.filter((d) => d.id !== a.payload); })
      .addCase(bulkDeleteDiary.fulfilled, (s, a) => {
        const idSet = new Set(a.payload.ids);
        s.diary = s.diary.filter((d) => !idSet.has(d.id));
      })
      .addCase(fetchMilk.fulfilled, (s, a) => { endFetch(s); s.milk = a.payload; })
      .addCase(createMilk.fulfilled, (s, a) => { s.milk.unshift(a.payload); })
      .addCase(deleteMilk.fulfilled, (s, a) => { s.milk = s.milk.filter((m) => m.id !== a.payload); })
      .addCase(bulkDeleteMilk.fulfilled, (s, a) => {
        const idSet = new Set(a.payload.ids);
        s.milk = s.milk.filter((m) => !idSet.has(m.id));
      })
      .addCase(fetchMilkTrends.fulfilled, (s, a) => { endFetch(s); s.milkTrends = a.payload; })
      .addCase(fetchVaccinations.fulfilled, (s, a) => { endFetch(s); s.vaccinations = a.payload; })
      .addCase(createVaccination.fulfilled, (s, a) => { s.vaccinations.push(a.payload); })
      .addCase(updateVaccination.fulfilled, (s, a) => {
        const i = s.vaccinations.findIndex((v) => v.id === a.payload.id);
        if (i !== -1) s.vaccinations[i] = a.payload;
      })
      .addCase(deleteVaccination.fulfilled, (s, a) => { s.vaccinations = s.vaccinations.filter((v) => v.id !== a.payload); })
      .addCase(bulkDeleteVaccinations.fulfilled, (s, a) => {
        const idSet = new Set(a.payload.ids);
        s.vaccinations = s.vaccinations.filter((v) => !idSet.has(v.id));
      })
      .addCase(bulkCompleteVaccinations.fulfilled, (s, a) => {
        const items = a.payload.items || [];
        items.forEach((item) => {
          const i = s.vaccinations.findIndex((v) => v.id === item.id);
          if (i !== -1) s.vaccinations[i] = item;
        });
      })
      .addCase(fetchPregnancies.fulfilled, (s, a) => { endFetch(s); s.pregnancies = a.payload; })
      .addCase(createPregnancy.fulfilled, (s, a) => { s.pregnancies.unshift(a.payload); })
      .addCase(recordCalving.fulfilled, (s, a) => {
        const i = s.pregnancies.findIndex((p) => p.id === a.payload.id);
        if (i !== -1) s.pregnancies[i] = a.payload;
      })
      .addCase(createKnowledge.fulfilled, (s, a) => { s.knowledge.unshift(a.payload); })
      .addCase(upvoteKnowledge.fulfilled, (s, a) => {
        const i = s.knowledge.findIndex((k) => k.id === a.payload.id);
        if (i !== -1) s.knowledge[i] = a.payload;
      })
      .addCase(fetchCollections.fulfilled, (s, a) => { endFetch(s); s.collections = a.payload; })
      .addCase(createCollection.fulfilled, (s, a) => { s.collections.unshift(a.payload); })
      .addCase(deleteCollection.fulfilled, (s, a) => { s.collections = s.collections.filter((c) => c.id !== a.payload); })
      .addCase(bulkDeleteCollections.fulfilled, (s, a) => {
        const idSet = new Set(a.payload.ids);
        s.collections = s.collections.filter((c) => !idSet.has(c.id));
      })
      .addCase(fetchKnowledge.fulfilled, (s, a) => { endFetch(s); s.knowledge = a.payload; })
      .addCase(fetchDevices.fulfilled, (s, a) => { endFetch(s); s.devices = a.payload; })
      .addCase(createDevice.fulfilled, (s, a) => { s.devices.unshift(a.payload); })
      .addCase(revokeDevice.fulfilled, (s, a) => {
        const i = s.devices.findIndex((d) => d.id === a.payload);
        if (i !== -1) s.devices[i] = { ...s.devices[i], isActive: false };
      })
      .addCase(bulkRevokeDevices.fulfilled, (s, a) => {
        const idSet = new Set(a.payload.ids);
        s.devices.forEach((d, i) => {
          if (idSet.has(d.id)) s.devices[i] = { ...d, isActive: false };
        });
      })
      .addCase(fetchAnalytics.fulfilled, (s, a) => { endFetch(s); s.analytics = a.payload; })
      .addCase(fetchHealthInsights.fulfilled, (s, a) => { endFetch(s); s.healthInsights = a.payload; })
      .addMatcher((a) => /^farm\/fetch\w+\/pending$/.test(a.type), startFetch)
      .addMatcher((a) => /^farm\/fetch\w+\/rejected$/.test(a.type), (s, a) => { endFetch(s); s.error = a.payload; });
  },
});

export default farmSlice.reducer;
