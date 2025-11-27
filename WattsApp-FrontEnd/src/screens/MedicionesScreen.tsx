import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  InteractionManager,
  StatusBar,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { updateDispositivo, deleteDispositivo, getDispositivoById, Dispositivo, fetchMedicionesByDispositivo } from "../services/api";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<RootStackParamList, "Mediciones">;

const MedicionesScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id_dispositivo, nombre_dispositivo } = route.params;
  const insets = useSafeAreaInsets();
  const verticalPad = Math.max(insets.top || 0, insets.bottom || 0, 20);
  const [dispositivo, setDispositivo] = useState<Dispositivo | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [mediciones, setMediciones] = useState<any[]>([]);
  const [consumoWh, setConsumoWh] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Campos del formulario de edición
  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");

  // Cargar datos del dispositivo al montar la pantalla
  useEffect(() => {
    const cargarDispositivo = async () => {
      setLoadingData(true);
      try {
        const data = await getDispositivoById(id_dispositivo);
        if (data) {
          setDispositivo(data);
          // Cargar los valores en los campos del formulario
          setNombre(data.nombre_dispositivo);
          setNumeroSerie(data.numero_serie);
          setUbicacion(data.ubicacion || "");
          setDescripcion(data.descripcion || "");
        }
      } catch (err) {
        console.log("Error al cargar dispositivo:", err);
      } finally {
        setLoadingData(false);
      }
    };

    cargarDispositivo();
  }, [id_dispositivo]);

  // Polling de mediciones (cada X segundos)
  useEffect(() => {
    let mounted = true;
    let timer: any = null;

    const cargarMediciones = async () => {
      try {
        const data = await fetchMedicionesByDispositivo(id_dispositivo);
        if (!mounted) return;
        setMediciones(data);
      } catch (err) {
        console.log('Error al cargar mediciones:', err);
      }
    };

    // Cargar inmediatamente y luego cada 3 segundos
    cargarMediciones();
    timer = setInterval(cargarMediciones, 3000);

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [id_dispositivo]);

  // Calcular consumo estimado (Wh) cuando cambian las mediciones
  useEffect(() => {
    if (!mediciones || mediciones.length === 0) {
      setConsumoWh(null);
      return;
    }

    // Ordenar por fecha mayor -> menor (si fecha_hora disponible)
    const items = mediciones
      .slice()
      .map((m) => ({ ...m, t: m.fecha_hora ? new Date(m.fecha_hora).getTime() : null }))
      .sort((a, b) => (b.t || 0) - (a.t || 0));

    // Si no hay timestamps, aproximamos consumo con promedio y tiempo entre lecturas
    let totalWh = 0;
    for (let i = 0; i < items.length - 1; i++) {
      const a = items[i];
      const b = items[i + 1];
      const pa = Number(a.potencia) || 0;
      const pb = Number(b.potencia) || 0;
      const ta = a.t || null;
      const tb = b.t || null;
      if (ta && tb && ta > tb) {
        const dtSec = (ta - tb) / 1000;
        // área trapezoidal: potencia promedio * tiempo
        const avgP = (pa + pb) / 2;
        totalWh += (avgP * dtSec) / 3600; // W * s -> Wh
      }
    }

    // Si sólo hay una lectura o faltan timestamps, aproximar con promedio e intervalo de sondeo
    if (items.length === 1 || totalWh === 0) {
      const avgP = items.reduce((s, x) => s + (Number(x.potencia) || 0), 0) / items.length;
      const approxSec = Math.max(3, (items.length - 1) * 3); // ventana aproximada
      totalWh = (avgP * approxSec) / 3600;
    }

    setConsumoWh(Math.round(totalWh * 100) / 100);
  }, [mediciones]);

  // Comprueba si las mediciones más recientes están dentro de un umbral
  useEffect(() => {
    const check = () => {
      if (!mediciones || mediciones.length === 0) {
        setIsConnected(false);
        return;
      }
      const latest = mediciones[0];
      const t = latest && (latest.fecha_hora || latest.fecha_medicion) ? new Date(latest.fecha_hora || latest.fecha_medicion).getTime() : null;
      if (t) {
        const diff = Date.now() - t;
        // Si la última lectura tiene menos de 15 segundos, consideramos conectado
        setIsConnected(diff <= 15000);
      } else {
        // Si no hay timestamps pero hay lecturas, asumimos conectado
        setIsConnected(true);
      }
    };

    check();
    const iv = setInterval(check, 3000);
    return () => clearInterval(iv);
  }, [mediciones]);

  const handleEditarDispositivo = async () => {
    if (!nombre.trim()) {
      setError("El nombre del dispositivo es requerido");
      return;
    }

    if (!numeroSerie.trim()) {
      setError("El número de serie es requerido");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateDispositivo(
        id_dispositivo,
        nombre.trim(),
        numeroSerie.trim(),
        ubicacion.trim() || undefined,
        descripcion.trim() || undefined
      );

      if (result.success) {
        setSuccess(true);
        Alert.alert("Éxito", "Dispositivo actualizado correctamente", [
          {
            text: "OK",
            onPress: () => {
              setModalVisible(false);
              // Refrescar los datos del dispositivo
              const recargar = async () => {
                const data = await getDispositivoById(id_dispositivo);
                if (data) {
                  setDispositivo(data);
                }
              };
              recargar();
            },
          },
        ]);
      } else {
        setError(result.message || "Error al actualizar dispositivo");
      }
    } catch (err) {
      console.log("Error:", err);
      setError("Error de red al actualizar dispositivo");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarDispositivo = () => {
    InteractionManager.runAfterInteractions(() => {
      setMenuVisible(false);
      setDeleteModalVisible(true);
    });
  };

  const confirmarEliminar = async () => {
    setLoading(true);
    try {
      console.log("Iniciando eliminación del dispositivo:", id_dispositivo);
      const result = await deleteDispositivo(id_dispositivo);
      console.log("Resultado de eliminación:", result);
      
      if (result.success) {
        setDeleteModalVisible(false);
        Alert.alert("Éxito", "Dispositivo eliminado correctamente", [
          {
            text: "OK",
            onPress: () => {
              console.log("Navegando hacia atrás");
              navigation.goBack();
            },
          },
        ]);
      } else {
        setError(result.message || "Error al eliminar dispositivo");
      }
    } catch (err) {
      console.log("Error en catch:", err);
      setError("Error de red al eliminar dispositivo");
    } finally {
      setLoading(false);
    }
  };

  const cancelarEliminar = () => {
    setDeleteModalVisible(false);
    setError(null);
  };

  const openEditModal = () => {
    InteractionManager.runAfterInteractions(() => {
      setMenuVisible(false);
      setError(null);
      setSuccess(false);
      setModalVisible(true);
    });
  };

  if (loadingData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Cargando dispositivo...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020817" translucent />
      <View style={[styles.customHeader, { paddingTop: (insets.top || 0) + 12, paddingBottom: 12 }]}> 
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#22c55e" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <View style={styles.deviceIconContainer}>
            <Ionicons name="flash" size={24} color="#22c55e" />
          </View>
          <View style={styles.headerTitleText}>
            <Text style={styles.headerSubtitle}>Dispositivo</Text>
            <Text style={styles.headerMainTitle}>{dispositivo?.nombre_dispositivo || nombre_dispositivo}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(!menuVisible)}>
          <Ionicons name="settings" size={24} color="#22c55e" />
        </TouchableOpacity>
      </View>

      
      {menuVisible && (
        <View style={[styles.dropdownMenu, { position: 'absolute', top: (insets.top || 0) + 12 + 48, right: 12, zIndex: 50, elevation: 50 }]}> 
          <TouchableOpacity style={styles.menuItem} onPress={openEditModal}>
            <Ionicons name="pencil" size={18} color="#22c55e" />
            <Text style={styles.menuItemText}>Editar</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem} onPress={handleEliminarDispositivo}>
            <Ionicons name="trash" size={18} color="#ef4444" />
            <Text style={[styles.menuItemText, { color: "#ef4444" }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.scrollArea} contentContainerStyle={[styles.content, { paddingTop: verticalPad, paddingBottom: verticalPad }]}>
        <View style={[styles.contentCard, { marginVertical: verticalPad / 2 }] }>
          <View style={styles.illustrationContainer}>
            <Ionicons name="flash" size={64} color="#22c55e" />
          </View>
          <Text style={styles.contentTitle}>Mediciones</Text>
          <Text style={styles.contentSubtitle}>Lectura en tiempo real del dispositivo</Text>

                  
          {mediciones && mediciones.length > 0 ? (
            (() => {
              const latest = mediciones[0];
              const potencia = Number(latest.potencia) || 0;
              const voltaje = Number(latest.voltaje) || 0;
              const corriente = Number(latest.corriente) || 0;
              const fecha = latest.fecha_hora || latest.fecha_medicion || '';
              const maxPower = 2000; // valor para normalizar la barra (W) — ajustar según hardware
              const pct = Math.min(1, potencia / maxPower);

              return (
                <>
                  <View style={styles.gaugeContainer}>
                    <Text style={styles.potenciaValue}>{potencia.toFixed(1)} W</Text>
                    <View style={styles.gaugeBarBackground}>
                      <View style={[styles.gaugeBarFill, { width: `${pct * 100}%` }]} />
                    </View>
                    <Text style={styles.gaugeSub}>Voltaje: {voltaje} V  •  Corriente: {corriente} A</Text>
                    {fecha ? <Text style={styles.timestamp}>Última: {new Date(fecha).toLocaleString()}</Text> : null}
                  </View>

                  
                  <View style={styles.historyContainer}>
                    <Text style={styles.historyTitle}>Historial reciente</Text>
                    {mediciones.slice(0, 6).map((m: any) => (
                      <View key={m.id_medicion} style={styles.historyRow}>
                        <Text style={styles.historyText}>{new Date(m.fecha_hora || m.fecha_medicion || '').toLocaleTimeString()}</Text>
                        <Text style={styles.historyText}>{m.potencia}W • {m.voltaje}V • {m.corriente}A</Text>
                      </View>
                    ))}
                  </View>

                  
                  <View style={styles.consumoContainer}>
                    <Text style={styles.consumoLabel}>Consumo estimado (área aproximada)</Text>
                    <Text style={styles.consumoValue}>{consumoWh !== null ? `${consumoWh} Wh` : '—'}</Text>

                    <View style={styles.sparklineContainer}>
                      {(mediciones.slice(0, 20).reverse()).map((m: any, idx: number) => {
                        const p = Number(m.potencia) || 0;
                        const h = Math.min(1, p / 800);
                        return <View key={idx} style={[styles.sparkBar, { height: `${Math.max(6, h * 60)}%` }]} />;
                      })}
                    </View>

                    
                  </View>
                </>
              );
            })()
          ) : (
            <Text style={styles.placeholderText}>Esperando mediciones del dispositivo...</Text>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Estado</Text>
              <Text style={[styles.statValue, isConnected ? { color: '#22c55e' } : { color: '#ef4444' }]}>{isConnected ? 'Conectado' : 'Desconectado'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>ID</Text>
              <Text style={styles.statValue}>{id_dispositivo}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={28} color="#e5e7eb" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Editar Dispositivo</Text>
                <View style={{ width: 28 }} />
              </View>

              {error && <Text style={styles.error}>{error}</Text>}
              {success && (
                <Text style={styles.successMessage}>
                  ¡Dispositivo actualizado exitosamente!
                </Text>
              )}

              
              <Text style={styles.label}>Nombre del Dispositivo</Text>
              <TextInput
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ej: Panel Solar 01"
                placeholderTextColor="#6b7280"
                style={styles.input}
                editable={!loading}
              />

              
              <Text style={styles.label}>Número de Serie</Text>
              <TextInput
                value={numeroSerie}
                onChangeText={setNumeroSerie}
                placeholder="Ej: SN-123456789"
                placeholderTextColor="#6b7280"
                style={styles.input}
                editable={!loading}
              />

              
              <Text style={styles.label}>Ubicación</Text>
              <TextInput
                value={ubicacion}
                onChangeText={setUbicacion}
                placeholder="Ej: Techo, Garaje, etc."
                placeholderTextColor="#6b7280"
                style={styles.input}
                editable={!loading}
              />

              
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Detalles adicionales"
                placeholderTextColor="#6b7280"
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={4}
                editable={!loading}
              />

              
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.buttonDisabled]}
                onPress={handleEditarDispositivo}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#020817" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={18} color="#020817" />
                    <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      
      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent
        onRequestClose={cancelarEliminar}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalHeader}>
              <Ionicons name="trash" size={32} color="#ef4444" />
              <Text style={styles.deleteModalTitle}>Eliminar Dispositivo</Text>
            </View>

            <Text style={styles.deleteModalMessage}>
              ¿Estás seguro de que deseas eliminar "{nombre_dispositivo}"?
            </Text>
            <Text style={styles.deleteModalSubtext}>
              Esta acción no se puede deshacer.
            </Text>

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.cancelButton]}
                onPress={cancelarEliminar}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteModalButton, styles.confirmButton, loading && styles.buttonDisabled]}
                onPress={confirmarEliminar}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="trash" size={16} color="#fff" />
                    <Text style={styles.confirmButtonText}>Eliminar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020817",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 12,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#22c55e22",
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: "#020817",
    borderBottomWidth: 1,
    borderBottomColor: "#22c55e22",
    gap: 12,
    zIndex: 30,
    elevation: 30,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deviceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#22c55e15",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleText: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  headerMainTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e5e7eb",
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
  },
  dropdownMenu: {
    backgroundColor: "#111827",
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#22c55e33",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  menuItemText: {
    color: "#22c55e",
    fontSize: 14,
    fontWeight: "500",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#1e293b",
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  scrollArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#22c55e33",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    width: "100%",
  },
  illustrationContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#22c55e15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#22c55e",
    marginBottom: 8,
  },
  contentSubtitle: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  gaugeContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  potenciaValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#22c55e',
    marginBottom: 8,
  },
  gaugeBarBackground: {
    width: '100%',
    height: 14,
    backgroundColor: '#0b1220',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  gaugeBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  gaugeSub: {
    color: '#9ca3af',
    marginTop: 8,
  },
  timestamp: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 6,
  },
  historyContainer: {
    width: '100%',
    marginTop: 12,
  },
  historyTitle: {
    color: '#9ca3af',
    fontWeight: '700',
    marginBottom: 8,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#0f1620',
  },
  historyText: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  consumoContainer: {
    width: '100%',
    marginTop: 14,
    alignItems: 'center',
  },
  consumoLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 6,
  },
  consumoValue: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  sparklineContainer: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 8,
  },
  sparkBar: {
    width: 6,
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  verifyButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#22c55e33',
  },
  verifyButtonText: {
    color: '#22c55e',
    fontWeight: '600',
  },
  statsContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22c55e",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#1e293b",
  },
  placeholder: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#22c55e33",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  placeholderText: {
    color: "#9ca3af",
    fontSize: 16,
    textAlign: "center",
  },
  deviceId: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 12,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#071021",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#22c55e",
  },
  label: {
    color: "#e5e7eb",
    fontWeight: "600",
    marginTop: 14,
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#0b1220",
    color: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
    fontSize: 14,
  },
  textArea: {
    textAlignVertical: "top",
    paddingTop: 10,
  },
  saveButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    flexDirection: "row",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#020817",
    fontWeight: "600",
    fontSize: 16,
  },
  error: {
    color: "#ff6b6b",
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#ff6b6b20",
    borderRadius: 6,
  },
  successMessage: {
    color: "#22c55e",
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#22c55e20",
    borderRadius: 6,
  },
  // Estilos para modal de eliminación
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteModalContent: {
    backgroundColor: "#071021",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 350,
    alignItems: "center",
  },
  deleteModalHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ef4444",
    marginTop: 12,
  },
  deleteModalMessage: {
    fontSize: 16,
    color: "#e5e7eb",
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 8,
  },
  deleteModalSubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 20,
  },
  deleteModalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  cancelButton: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#3f4758",
  },
  cancelButtonText: {
    color: "#e5e7eb",
    fontWeight: "600",
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: "#ef4444",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default MedicionesScreen;
