# PayDesk

Aplicación personal para organizar gastos mensuales, vencimientos, tarjetas, dólares y expensas.

## Desarrollo

Requiere Node.js y un archivo de variables de entorno con la configuración de Firebase.

```sh
npm install
npm run dev
```

## Producción

```sh
npm run build
npm run preview
```

La compilación lista para publicar se genera en `dist/`.

## Variables de entorno

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
