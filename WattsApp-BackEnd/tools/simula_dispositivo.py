#!/usr/bin/env python3
"""
Simulador de dispositivo para WattsApp
- Envía POST a /api/mediciones con corriente, voltaje y potencia
- Uso: python simula_dispositivo.py --id 4 --host http://192.168.1.174:3000/api --interval 2
"""
import time
import random
import requests
import argparse
import os
from datetime import datetime

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    # dotenv es opcional
    pass


def generar_lectura(base_volt=120.0, base_corr=1.0, anomaly_prob=0.0):
    voltaje = random.uniform(base_volt - 5, base_volt + 5)
    corriente = random.uniform(max(0.01, base_corr * 0.2), base_corr * 3.0)
    potencia = round(voltaje * corriente, 2)
    # pequeña posibilidad de anomalía (picos)
    if random.random() < anomaly_prob:
        factor = random.uniform(1.5, 3.0)
        potencia = round(potencia * factor, 2)
        corriente = round(corriente * factor, 3)
    return {
        "corriente": round(corriente, 3),
        "voltaje": round(voltaje, 2),
        "potencia": round(potencia, 2)
    }


def enviar(api_base, id_dispositivo, payload, timeout=5):
    url = f"{api_base.rstrip('/')}/mediciones"
    body = {
        "id_dispositivo": id_dispositivo,
        "corriente": payload["corriente"],
        "voltaje": payload["voltaje"],
        "potencia": payload["potencia"]
    }
    try:
        r = requests.post(url, json=body, timeout=timeout)
        if r.status_code in (200, 201):
            print(f"[{datetime.now().isoformat()}] OK -> {body}")
        else:
            print(f"[{datetime.now().isoformat()}] HTTP {r.status_code} -> {r.text}")
    except Exception as e:
        print(f"[{datetime.now().isoformat()}] ERROR -> {e}")


def parse_args():
    parser = argparse.ArgumentParser(description="Simulador de dispositivo que envía mediciones al backend WattsApp")
    parser.add_argument("--host", default=os.environ.get("API_BASE", "http://127.0.0.1:3000/api"), help="URL base de la API (ej: http://192.168.1.80:3000/api)")
    parser.add_argument("--id", type=int, required=True, help="id_dispositivo a simular")
    parser.add_argument("--interval", type=float, default=2.0, help="segundos entre envíos")
    parser.add_argument("--base-current", type=float, default=1.0, help="corriente base en A")
    parser.add_argument("--anomaly", type=float, default=0.0, help="probabilidad de anomalía por lectura (0-1)")
    parser.add_argument("--seed", type=int, default=None, help="seed para reproducibilidad (opcional)")
    return parser.parse_args()


def main():
    args = parse_args()
    if args.seed is not None:
        random.seed(args.seed)

    print("Simulador inicializado")
    print("API:", args.host)
    print("Device ID:", args.id)
    print("Interval (s):", args.interval)
    print("Base current (A):", args.base_current)
    print("Anomaly prob:", args.anomaly)

    try:
        while True:
            lect = generar_lectura(base_volt=120.0, base_corr=args.base_current, anomaly_prob=args.anomaly)
            enviar(args.host, args.id, lect)
            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("Simulador detenido por teclado")


if __name__ == "__main__":
    main()
