# Intimas — Backend (API)

API REST del sistema clínico **Intimas**, construida con **NestJS + PostgreSQL + Prisma**.
Almacena los maestros (Archivos) y el registro de atenciones; pensada para desplegar en **Railway**.

## Stack
- **NestJS 11** + TypeScript · **PostgreSQL** · **Prisma 6** (ORM)
- **class-validator** (validación de DTOs) · **JWT + bcrypt** (auth)
- API bajo prefijo **`/api`**, CORS configurable.

## Correr en local

Requiere Node 20+ y un PostgreSQL. La forma rápida con Docker:

```bash
# 1) Postgres en Docker
docker run -d --name intimas-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=intimas -p 5433:5432 postgres:16

# 2) Variables (.env) — copia desde .env.example
cp .env.example .env

# 3) Dependencias + migración + datos de ejemplo
npm install
npm run prisma:migrate      # crea/aplica migraciones
npm run db:seed             # carga roles, usuarios y maestros

# 4) Levantar en desarrollo
npm run start:dev           # http://localhost:3001/api
```

**Usuarios demo** (contraseña `intimas123`): `admin@intimas.pe`, `finanzas@intimas.pe`,
`clinica@intimas.pe`, `laboratorio@intimas.pe`, `visitador@intimas.pe`, `gerencia@intimas.pe`.

## Endpoints

| Recurso | Rutas |
|---|---|
| **Auth** | `POST /api/auth/login` · `GET /api/auth/me` |
| **Maestros** (`pacientes`, `profesionales`, `servicios`, `analisis`, `laboratorios`, `paquetes`, `personal`, `centros`, `productos`, `material`) | `GET /api/{r}?search=` · `GET /api/{r}/:id` · `POST /api/{r}` · `PATCH /api/{r}/:id` · `DELETE /api/{r}/:id` |
| **Atenciones** | `GET /api/atenciones?scope=hoy\|anteriores\|todas&search=&desde=&hasta=` · `GET /api/atenciones/:id` · `POST` · `PATCH /:id` · `DELETE /:id` |

`POST /api/atenciones` recibe `{ pacienteId, origenTipo, origenValor?, observaciones?, items: [{kind,nombre,monto,abono,pago}] }`
y calcula automáticamente `total`, `abono`, `saldo` y `estado`.

## Variables de entorno
| Var | Descripción |
|---|---|
| `DATABASE_URL` | Conexión PostgreSQL (Railway la inyecta) |
| `JWT_SECRET` | Secreto para firmar los JWT |
| `PORT` | Puerto (Railway lo inyecta) |
| `CORS_ORIGIN` | Orígenes permitidos, coma-separados (dominio del frontend) |

## Despliegue en Railway
1. **New Project → Deploy from GitHub repo** → este repo.
2. **+ New → Database → PostgreSQL** (Railway crea `DATABASE_URL` y la comparte al servicio).
3. En el servicio del backend, añade variables: `JWT_SECRET` y `CORS_ORIGIN` (URL del frontend).
4. Deploy: `railway.json` corre `npm run build` y arranca con `npm run start:railway`
   (= `prisma migrate deploy && node dist/main`), aplicando las migraciones automáticamente.
5. La primera vez, carga datos de ejemplo desde la shell de Railway: `npm run db:seed`.
