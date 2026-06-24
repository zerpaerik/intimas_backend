#!/usr/bin/env python3
"""
Parsea el dump MySQL (phpMyAdmin) del Intimas viejo y produce un JSON con
pacientes / servicios / analisis mapeados al esquema nuevo.

Uso:
  python3 parse_intimas.py [ruta_dump.sql] [ruta_salida.json]
Por defecto:
  entrada: ~/Downloads/intimas.sql
  salida : ~/Downloads/intimas_import.json

El JSON resultante lo consume `prisma/import-legacy.ts`.
NO se versiona el .sql ni el .json (contienen datos personales de pacientes).
"""
import json
import os
import sys

PATH = os.path.expanduser(sys.argv[1]) if len(sys.argv) > 1 else os.path.expanduser("~/Downloads/intimas.sql")
OUT = os.path.expanduser(sys.argv[2]) if len(sys.argv) > 2 else os.path.expanduser("~/Downloads/intimas_import.json")

sql = open(PATH, encoding="utf-8", errors="replace").read()

ESCAPES = {"n": "\n", "t": "\t", "r": "\r", "0": "\0", "b": "\b"}


def parse_tuples(s, start):
    """Lee tuplas (..),(..); desde `start` (tras VALUES). Devuelve (tuplas, fin)."""
    tuples = []
    i, n = start, len(s)
    depth = 0
    cur, fields = [], []
    in_str = False
    is_str_field = False
    while i < n:
        c = s[i]
        if depth == 0:
            if c == "(":
                depth, cur, fields = 1, [], []
                is_str_field = False
            elif c == ";":
                i += 1
                break
            i += 1
            continue
        if in_str:
            if c == "\\":
                nxt = s[i + 1] if i + 1 < n else ""
                cur.append(ESCAPES.get(nxt, nxt))
                i += 2
                continue
            if c == "'":
                if i + 1 < n and s[i + 1] == "'":
                    cur.append("'")
                    i += 2
                    continue
                in_str = False
                i += 1
                continue
            cur.append(c)
            i += 1
            continue
        if c == "'":
            in_str = True
            is_str_field = True
            cur = []  # descarta espacios entre la coma y la comilla de apertura
        elif c == ",":
            fields.append(_finish(cur, is_str_field))
            cur, is_str_field = [], False
        elif c == ")":
            fields.append(_finish(cur, is_str_field))
            tuples.append(fields)
            depth = 0
        else:
            cur.append(c)
        i += 1
    return tuples, i


def _finish(chars, is_str):
    if is_str:
        return "".join(chars)
    tok = "".join(chars).strip()
    return None if tok == "" or tok.upper() == "NULL" else tok


def parse_table(table):
    marker = "INSERT INTO `%s`" % table
    rows, idx = [], 0
    while True:
        i = sql.find(marker, idx)
        if i == -1:
            break
        p = sql.find("(", i)
        q = sql.find(")", p)
        cols = [c.strip().strip("`") for c in sql[p + 1:q].split(",")]
        v = sql.find("VALUES", q)
        tuples, end = parse_tuples(sql, v + 6)
        for t in tuples:
            if len(t) == len(cols):
                rows.append(dict(zip(cols, t)))
        idx = end
    return rows


def num(x):
    if x is None:
        return 0
    try:
        return float(str(x).strip())
    except ValueError:
        return 0


def fecha(x):
    if not x:
        return None
    x = str(x).strip()
    if not x or x.startswith("0000") or x.upper() == "NULL":
        return None
    return x[:10]


SEXO = {"M": "Masculino", "F": "Femenino", "MASCULINO": "Masculino", "FEMENINO": "Femenino"}
# El edocivil viejo es un entero sin tabla de lookup en el dump; mapeo de mejor esfuerzo.
EDOCIVIL = {"1": "Soltero(a)", "2": "Casado(a)", "3": "Conviviente", "4": "Divorciado(a)", "5": "Viudo(a)"}


def map_paciente(r):
    return {
        "nombres": (r.get("nombres") or "").strip(),
        "apellidos": (r.get("apellidos") or "").strip(),
        "tipoDoc": (r.get("tipo_doc") or "DNI").strip() or "DNI",
        "numDoc": (r.get("dni") or "").strip(),
        "fechaNacimiento": fecha(r.get("fechanac")),
        "sexo": SEXO.get((r.get("sexo") or "").strip().upper()) or None,
        "telefono": (r.get("telefono") or "").strip() or None,
        "email": (r.get("email") or "").strip() or None,
        "ocupacion": (r.get("ocupacion") or "").strip() or None,
        "estadoCivil": EDOCIVIL.get(str(r.get("edocivil")).strip()) if r.get("edocivil") else None,
        "direccion": (r.get("direccion") or "").strip() or None,
    }


def map_servicio(r):
    return {
        "nombre": (r.get("nombre") or "").strip(),
        "tipo": (r.get("tipo") or "").strip() or None,
        "precio": num(r.get("precio")),
        "porcentajePers": num(r.get("porcentaje")),
        "porcentajeProf": num(r.get("porcentaje1")),
        "porcentajeTecn": num(r.get("porcentaje2")),
    }


def map_analisis(r):
    return {
        "nombre": (r.get("nombre") or "").strip(),
        "precio": num(r.get("precio")),
        "costo": num(r.get("costo")),
        "porcentaje": num(r.get("porcentaje")),
        "tiempo": (r.get("tiempo") or "").strip() or None,
        "material": (r.get("material") or "").strip() or None,
    }


def dedupe(rows, key):
    seen, out = set(), []
    for r in rows:
        k = (r[key] or "").strip().upper()
        if not k or k in seen:
            continue
        seen.add(k)
        out.append(r)
    return out


pac_raw = parse_table("pacientes")
ser_raw = parse_table("servicios")
ana_raw = parse_table("analisis")

pac = dedupe([map_paciente(r) for r in pac_raw if str(r.get("estatus")) != "0" and (r.get("dni") or "").strip()], "numDoc")
ser = dedupe([map_servicio(r) for r in ser_raw if str(r.get("estatus")) != "0" and (r.get("nombre") or "").strip().upper() != "SERVICIO"], "nombre")
ana = dedupe([map_analisis(r) for r in ana_raw if str(r.get("estatus")) != "0" and (r.get("nombre") or "").strip().upper() != "LABORATORIO"], "nombre")

json.dump({"pacientes": pac, "servicios": ser, "analisis": ana}, open(OUT, "w"), ensure_ascii=False, indent=1)

print(f"Entrada: {PATH}")
print(f"Salida : {OUT}")
print("RAW   -> pacientes:%d servicios:%d analisis:%d" % (len(pac_raw), len(ser_raw), len(ana_raw)))
print("FINAL -> pacientes:%d servicios:%d analisis:%d" % (len(pac), len(ser), len(ana)))
