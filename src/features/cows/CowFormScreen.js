import { useEffect, useState } from 'react';
import { ScrollView, Alert, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { addCow, updateCow, fetchCowById, uploadCowImage } from './cowSlice';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { spacing, colors } from '../../theme';

export default function CowFormScreen({ navigation, route }) {
  const editId = route.params?.id;
  const dispatch = useDispatch();
  const selected = useSelector((s) => s.cows.selected);
  const [form, setForm] = useState({
    name: '', breed: '', gender: 'female', birthDate: '', fatherName: '', motherName: '',
  });
  const [imageUri, setImageUri] = useState(null);
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
        birthDate: selected.birthDate || '',
        fatherName: selected.fatherName || '',
        motherName: selected.motherName || '',
      });
    }
  }, [editId, selected]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const submit = async () => {
    try {
      let cow;
      if (editId) cow = await dispatch(updateCow({ id: editId, ...form })).unwrap();
      else cow = await dispatch(addCow(form)).unwrap();
      if (imageUri && cow?.id) await dispatch(uploadCowImage({ id: cow.id, uri: imageUri })).unwrap();
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  return (
    <Screen title={editId ? 'Edit Cow' : 'Add Cow'} subtitle="Cattle record">
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : <Text style={styles.pickText}>Tap to add photo</Text>}
        </TouchableOpacity>
        <Input value={form.name} onChangeText={(v) => set('name', v)} placeholder="Name *" />
        <Input value={form.breed} onChangeText={(v) => set('breed', v)} placeholder="Breed *" />
        <Input value={form.gender} onChangeText={(v) => set('gender', v)} placeholder="Gender (female/male)" />
        <Input value={form.birthDate} onChangeText={(v) => set('birthDate', v)} placeholder="Birth date (YYYY-MM-DD) *" />
        <Input value={form.fatherName} onChangeText={(v) => set('fatherName', v)} placeholder="Father name" />
        <Input value={form.motherName} onChangeText={(v) => set('motherName', v)} placeholder="Mother name" />
        <Button title={editId ? 'Save Changes' : 'Add Cow'} onPress={submit} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  imagePicker: { height: 120, backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  preview: { width: '100%', height: '100%', borderRadius: 8 },
  pickText: { color: colors.textMuted },
});
