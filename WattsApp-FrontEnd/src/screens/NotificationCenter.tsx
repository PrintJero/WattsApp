import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchNotifications, markNotificationAsRead, deleteNotification, NotificationItem } from '../services/notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DeviceEventEmitter } from 'react-native';

const NotificationCenter: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [onlyUnread, setOnlyUnread] = useState<boolean>(false);

  const load = async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem('user');
      if (!raw) return setItems([]);
      const user = JSON.parse(raw);
      const userId = user?.id_usuario || user?.id || null;
      if (!userId) return setItems([]);
      const data = await fetchNotifications(Number(userId), onlyUnread);
      setItems(data);
    } catch (err) {
      console.log('Error loading notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [onlyUnread]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('notificationsUpdated', () => {
      load();
    });
    return () => sub.remove();
  }, []);

  const onMarkRead = async (id: number) => {
    await markNotificationAsRead(id);
    load();
  };

  const onDelete = async (id: number) => {
    // Ocultar (soft-hide): llamar al endpoint DELETE que marca hidden=1 y eliminar localmente
    try {
      await deleteNotification(id);
      setItems((prev) => prev.filter((it) => it.id_notification !== id));
    } catch (err) {
      console.log('Error hiding notification', err);
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <View style={[styles.item, !item.is_read ? styles.unread : null]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        {item.body ? <Text style={styles.body}>{item.body}</Text> : null}
        <Text style={styles.time}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
      <View style={styles.actions}>
        {!item.is_read ? (
          <TouchableOpacity onPress={() => onMarkRead(item.id_notification)} style={styles.actionBtn}>
            <Text style={styles.actionText}>Marcar leído</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={() => onDelete(item.id_notification)} style={styles.actionBtn}>
          <Text style={[styles.actionText, { color: '#ff6b6b' }]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: (insets.top || 0) + 12 }]}> 
      <Text style={styles.header}>Centro de Notificaciones</Text>
      <View style={styles.rowFilters}>
        <TouchableOpacity onPress={() => setOnlyUnread(false)} style={[styles.filterBtn, !onlyUnread ? styles.filterActive : null]}>
          <Text style={styles.filterText}>Todas</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setOnlyUnread(true)} style={[styles.filterBtn, onlyUnread ? styles.filterActive : null]}>
          <Text style={styles.filterText}>No leídas</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator color="#22c55e" style={{ marginTop: 20 }} /> : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id_notification)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={<Text style={styles.empty}>No hay notificaciones</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020817', padding: 16 },
  header: { color: '#22c55e', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  rowFilters: { flexDirection: 'row', marginBottom: 12 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 12, marginRight: 8, borderRadius: 8, backgroundColor: '#071021' },
  filterActive: { backgroundColor: '#153233' },
  filterText: { color: '#cbd5e1' },
  item: { backgroundColor: '#071021', padding: 12, borderRadius: 10, marginBottom: 10, flexDirection: 'row' },
  unread: { borderLeftWidth: 4, borderLeftColor: '#22c55e' },
  title: { color: '#e6ffed', fontWeight: '700' },
  body: { color: '#cbd5e1', marginTop: 4 },
  time: { color: '#94a3b8', marginTop: 6, fontSize: 12 },
  actions: { justifyContent: 'center', marginLeft: 8 },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  actionText: { color: '#22c55e' },
  empty: { color: '#9ca3af', textAlign: 'center', marginTop: 20 },
});

export default NotificationCenter;
