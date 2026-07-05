import { useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch } from 'react-redux';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import LoadingView from './src/components/LoadingView';
import { loadAuth } from './src/store/authStorage';
import { setAuthSession, finishBootstrap } from './src/features/auth/authSlice';
import { syncOfflineQueue } from './src/utils/offlineQueue';
import { useSelector } from 'react-redux';

function Bootstrap({ children }) {
  const dispatch = useDispatch();
  const bootstrapping = useSelector((s) => s.auth.bootstrapping);
  const token = useSelector((s) => s.auth.token);

  useEffect(() => {
    loadAuth()
      .then(({ token, user }) => {
        if (token && user) dispatch(setAuthSession({ token, user }));
        else dispatch(finishBootstrap());
      })
      .catch(() => dispatch(finishBootstrap()));
  }, [dispatch]);

  useEffect(() => {
    if (token) syncOfflineQueue().catch(() => {});
  }, [token]);

  if (bootstrapping) return <LoadingView message="Starting app…" />;
  return children;
}

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      RNStatusBar.setTranslucent(false);
      RNStatusBar.setBackgroundColor('#ffffff');
      RNStatusBar.setBarStyle('dark-content');
    }
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Bootstrap>
          <RootNavigator />
        </Bootstrap>
        <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
      </SafeAreaProvider>
    </Provider>
  );
}
