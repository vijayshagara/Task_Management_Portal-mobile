import { useEffect, useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addCow, updateCow, fetchCowById } from './cowSlice';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { spacing } from '../../theme';

export default function CowFormScreen({ navigation, route }) {
  const editId = route.params?.id;
  const dispatch = useDispatch();
  const selected = useSelector((s) => s.cows.selected);
  const [form, setForm] = useState({ name: '', breed: '', gender: 'female', age: '', weight: '', tagId: '', status: 'active' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (editId) dispatch(fetchCowById(editId));
  }, [dispatch, editId]);

  useEffect(() => {
    if (editId && selected?.id === editId) {
      setForm({
        name: selected.name || '',
        breed: selected.breed || '',
        gender: selected.gender || 'female',
        age: String(selected.age || ''),
        weight: String(selected.weight || ''),
        tagId: selected.tagId || '',
        status: selected.status || 'active',
      });
    }
  }, [editId, selected]);

  const submit = async () => {
    const payload = { ...form, age: Number(form.age), weight: Number(form.weight) };
    try {
      if (editId) await dispatch(updateCow({ id: editId, ...payload })).unwrap();
      else await dispatch(addCow(payload)).unwrap();
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err);
    }
  };

  return (
    <Screen title={editId ? 'Edit Cow' : 'Add Cow'} subtitle="Cattle record">
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {['name', 'breed', 'gender', 'age', 'weight', 'tagId', 'status'].map((field) => (
          <Input key={field} value={form[field]} onChangeText={(v) => set(field, v)} placeholder={field} />
        ))}
        <Button title={editId ? 'Save Changes' : 'Add Cow'} onPress={submit} />
      </ScrollView>
    </Screen>
  );
}
