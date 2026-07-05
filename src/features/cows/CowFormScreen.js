import { useEffect, useState } from 'react';
import { ScrollView, Alert, Image, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { addCow, updateCow, fetchCowById, uploadCowImage } from './cowSlice';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import DateInput from '../../components/DateInput';
import Button from '../../components/Button';
import LoadingView from '../../components/LoadingView';
import { getCowImageUrl } from '../../utils/helpers';
import { spacing, colors } from '../../theme';

export default function CowFormScreen({ navigation, route }) {
  const editId = route.params?.id;
  const dispatch = useDispatch();
  const selected = useSelector((s) => s.cows.selected);
  const detailLoading = useSelector((s) => s.cows.detailLoading);
  const [submitting, setSubmitting] = useState(false);
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
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      let cow;
      if (editId) cow = await dispatch(updateCow({ id: editId, ...form })).unwrap();
      else cow = await dispatch(addCow(form)).unwrap();
      if (imageUri && cow?.id) await dispatch(uploadCowImage({ id: cow.id, uri: imageUri })).unwrap();
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const existingImageUrl = editId && selected?.id === editId && selected?.image
    ? getCowImageUrl(selected)
    : null;
  const previewUri = imageUri || existingImageUrl;

  if (editId && (detailLoading || !selected || selected.id !== editId)) {
    return <LoadingView message="Loading cow…" />;
  }

  return (
    <Screen title={editId ? 'Edit Cow' : 'Add Cow'} subtitle="Cattle record">
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <TouchableOpacity
          onPress={pickImage}
          style={styles.imagePicker}
          disabled={submitting}
        >
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
          ) : (
            <View style={styles.pickWrap}>
              <Text style={styles.pickEmoji}>🐄</Text>
              <Text style={styles.pickText}>Tap to add photo</Text>
            </View>
          )}
        </TouchableOpacity>
        <Input value={form.name} onChangeText={(v) => set('name', v)} placeholder="Name *" editable={!submitting} />
        <Input value={form.breed} onChangeText={(v) => set('breed', v)} placeholder="Breed *" editable={!submitting} />
        <Input value={form.gender} onChangeText={(v) => set('gender', v)} placeholder="Gender (female/male)" editable={!submitting} />
        <DateInput
          value={form.birthDate}
          onChange={(v) => set('birthDate', v)}
          placeholder="Birth date *"
          maximumDate={new Date()}
        />
        <Input value={form.fatherName} onChangeText={(v) => set('fatherName', v)} placeholder="Father name" editable={!submitting} />
        <Input value={form.motherName} onChangeText={(v) => set('motherName', v)} placeholder="Mother name" editable={!submitting} />
        <Button
          title={editId ? 'Save Changes' : 'Add Cow'}
          onPress={submit}
          loading={submitting}
          disabled={submitting}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  imagePicker: {
    height: 160,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%' },
  pickWrap: { alignItems: 'center' },
  pickEmoji: { fontSize: 40, marginBottom: spacing.sm },
  pickText: { color: colors.textMuted },
});
