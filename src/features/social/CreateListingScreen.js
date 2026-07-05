import { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch } from 'react-redux';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { createListing } from '../social/marketplaceSlice';
import { spacing } from '../../theme';

export default function CreateListingScreen({ navigation }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    title: '', description: '', listingType: 'cow', price: '', location: '', breed: '',
  });
  const [photos, setPhotos] = useState([]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const pickPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, quality: 0.8 });
    if (!result.canceled) setPhotos(result.assets.map((a) => a.uri));
  };

  const submit = async () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    photos.forEach((uri, i) => {
      fd.append('photos', { uri, name: `photo${i}.jpg`, type: 'image/jpeg' });
    });
    try {
      await dispatch(createListing(fd)).unwrap();
      Alert.alert('Success', 'Listing created');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  return (
    <Screen title="Sell on Marketplace" subtitle="Create a new listing">
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Input value={form.title} onChangeText={(v) => set('title', v)} placeholder="Title *" />
        <Input value={form.listingType} onChangeText={(v) => set('listingType', v)} placeholder="Type (cow/calf/equipment)" />
        <Input value={form.price} onChangeText={(v) => set('price', v)} placeholder="Price *" keyboardType="decimal-pad" />
        <Input value={form.breed} onChangeText={(v) => set('breed', v)} placeholder="Breed" />
        <Input value={form.location} onChangeText={(v) => set('location', v)} placeholder="Location" />
        <Input value={form.description} onChangeText={(v) => set('description', v)} placeholder="Description" multiline />
        <Button title={`Add Photos (${photos.length})`} onPress={pickPhotos} variant="outline" />
        <Button title="Create Listing" onPress={submit} />
      </ScrollView>
    </Screen>
  );
}
