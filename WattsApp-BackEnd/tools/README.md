Simuladores para WattsApp

Este directorio contiene utilidades para simular dispositivos que envían mediciones al backend.

Archivos:
- simula_dispositivo.py: script que envía POST a /api/mediciones con corriente, voltaje y potencia.
- requirements.txt: dependencias Python (requests, python-dotenv opcional).

Uso rápido (PowerShell):

1) Crear y activar entorno virtual:

```powershell
cd .\WattsApp-BackEnd\tools
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2) Ejecutar el simulador:

```powershell
python simula_dispositivo.py --host http://192.168.1.80:3000/api --id 4 --interval 2 --anomaly 0.05
```

Ajusta `--host` al `API_BASE` de tu backend. Si prefieres, puedes definir `API_BASE` en un archivo `.env` dentro de este folder y el script la usará por defecto.
