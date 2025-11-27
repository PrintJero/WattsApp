const bd = require("../config/bd");

const getMedicionesByUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const [mediciones] = await bd.query(
      `
      SELECT 
        m.id_medicion,
        m.id_dispositivo,
        d.nombre_dispositivo,
        m.corriente,
        m.voltaje,
        m.potencia,
        m.fecha_hora
      FROM mediciones m
      INNER JOIN dispositivos d ON m.id_dispositivo = d.id_dispositivo
      WHERE d.id_usuario = ?
      ORDER BY m.fecha_hora DESC;
    `,
      [id_usuario]
    );

    res.json({ success: true, data: mediciones });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener las mediciones",
      error: error.message,
    });
  }
};

const getMedicionesByDispositivo = async (req, res) => {
  try {
    const { id_dispositivo } = req.params;

    const [mediciones] = await bd.query(
      `
      SELECT * FROM mediciones
      WHERE id_dispositivo = ?
      ORDER BY fecha_hora DESC
    `,
      [id_dispositivo]
    );

    res.json({ success: true, data: mediciones });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener las mediciones",
      error: error.message,
    });
  }
};

const createMedicion = async (req, res) => {
  try {
    const { id_dispositivo, corriente, voltaje, potencia } = req.body;

    if (
      !id_dispositivo ||
      corriente == null ||
      voltaje == null ||
      potencia == null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "id_dispositivo, corriente, voltaje y potencia son obligatorios",
      });
    }

    const [result] = await bd.query(
      `INSERT INTO mediciones (id_dispositivo, corriente, voltaje, potencia)
       VALUES (?, ?, ?, ?)`,
      [id_dispositivo, corriente, voltaje, potencia]
    );

    // Después de guardar la medición, comprobar si el dispositivo tiene un umbral
    // y crear una notificación si la potencia supera ese umbral.
    try {
      const [deviceRows] = await bd.query('SELECT * FROM dispositivos WHERE id_dispositivo = ?', [id_dispositivo]);
      if (deviceRows && deviceRows.length) {
        const device = deviceRows[0];
        // Si el dispositivo estaba marcado como offline, ahora lo marcamos online y generamos notificación 'connect'
        try {
          const prevOnline = Number(device.is_online || 0);
          if (prevOnline !== 1) {
            await bd.query('UPDATE dispositivos SET is_online = 1, ultimo_estado = NOW() WHERE id_dispositivo = ?', [id_dispositivo]);
            const title = 'Dispositivo conectado';
            const body = `${device.nombre_dispositivo} ha conectado (detección por medición)`;
            try {
              await bd.query(
                `INSERT INTO notifications (id_usuario, id_dispositivo, type, title, body, data)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [device.id_usuario, id_dispositivo, 'connect', title, body, JSON.stringify({ detected_by: 'medicion' })]
              );
              console.log('[notifications] inserted connect for device', id_dispositivo);
            } catch (err) {
              console.error('Error al insertar notificación connect:', err.message);
            }
          } else {
            // actualizar ultimo_estado si ya estaba online
            await bd.query('UPDATE dispositivos SET ultimo_estado = NOW() WHERE id_dispositivo = ?', [id_dispositivo]);
          }
        } catch (err) {
          console.error('Error actualizando estado online del dispositivo:', err.message);
        }
        // Si el dispositivo tiene un campo threshold_w y no es null, compararlo
        if (typeof device.threshold_w !== 'undefined' && device.threshold_w !== null) {
          const threshold = Number(device.threshold_w);
          const measured = Number(potencia);
          if (!isNaN(threshold) && !isNaN(measured) && measured > threshold) {
            // crear notificación over_threshold
            const title = 'Consumo por encima del umbral';
            const body = `${device.nombre_dispositivo} registró ${measured} W (umbral ${threshold} W)`;
            try {
              await bd.query(
                `INSERT INTO notifications (id_usuario, id_dispositivo, type, title, body, data)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [device.id_usuario, id_dispositivo, 'over_threshold', title, body, JSON.stringify({ potencia: measured, threshold })]
              );
            } catch (err) {
              console.error('Error al insertar notificación over_threshold:', err.message);
            }
          }
        } else {
          // Si no hay threshold definido, detectar picos comparando con la última medición
          try {
            const [lastTwo] = await bd.query(
              `SELECT potencia, fecha_hora FROM mediciones WHERE id_dispositivo = ? ORDER BY fecha_hora DESC LIMIT 2`,
              [id_dispositivo]
            );
            if (lastTwo && lastTwo.length >= 2) {
              const prev = Number(lastTwo[1].potencia || 0);
              const measured = Number(potencia);
              // si la lectura actual es significativamente mayor que la anterior (ej. 1.8x), considerar anomalía
              if (prev > 0 && measured / prev >= 1.8) {
                const title = 'Consumo por encima del umbral (pico detectado)';
                const body = `${device.nombre_dispositivo} registró ${measured} W, previo ${prev} W`;
                try {
                  await bd.query(
                    `INSERT INTO notifications (id_usuario, id_dispositivo, type, title, body, data)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [device.id_usuario, id_dispositivo, 'over_threshold', title, body, JSON.stringify({ potencia: measured, prev })]
                  );
                  console.log('[notifications] inserted over_threshold (spike) for device', id_dispositivo);
                } catch (err) {
                  console.error('Error al insertar notificación over_threshold (spike):', err.message);
                }
              }
            }
          } catch (err) {
            console.error('Error comprobando mediciones previas para detectar picos:', err.message);
          }
        }
      }
    } catch (err) {
      // No bloquear la creación de la medición si falla la comprobación
      console.error('Error comprobando umbral del dispositivo:', err.message);
    }

    res.status(201).json({
      success: true,
      data: {
        id_medicion: result.insertId,
        id_dispositivo,
        corriente,
        voltaje,
        potencia,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear medición",
      error: error.message,
    });
  }
};

module.exports = {
  getMedicionesByUsuario,
  getMedicionesByDispositivo,
  createMedicion,
};