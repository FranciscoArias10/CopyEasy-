# ⚡ CopyEasy

**Transferencia ultrarrápida de archivos entre dispositivos sin complicaciones.**

CopyEasy es una aplicación multiplataforma (Web + Android) que permite compartir archivos, imágenes, textos y enlaces de forma instantánea entre cualquier dispositivo mediante salas temporales con códigos QR.

---

## 🚀 Características

### 📤 **Envío Instantáneo**
- Crea una sala con un código único
- Genera un código QR para acceso rápido
- Comparte el enlace directo con quien quieras

### 📥 **Recepción Flexible**
- Escanea el QR con la cámara
- Ingresa el código manualmente
- Accede desde cualquier navegador

### 📁 **Soporte Completo de Archivos**
- ✅ **Imágenes** (JPG, PNG, GIF) - Previsualización instantánea
- ✅ **Documentos** (PDF, Word, TXT) - Hasta 5MB
- ✅ **Texto** - Hasta 30,000 caracteres
- ✅ **Enlaces** - Detección automática y apertura directa

### 🔒 **Privacidad y Seguridad**
- 🗑️ **Auto-eliminación**: Las salas se destruyen automáticamente después de 24 horas de inactividad
- 🚪 **Última persona**: Si el último usuario sale, la sala se elimina inmediatamente
- 🔐 **Sin registro**: No se requiere cuenta ni datos personales
- 🌐 **Conexión cifrada**: Comunicación segura mediante Supabase Realtime

### 🎨 **Diseño Moderno**
- 🌙 Modo oscuro elegante
- ⚡ Interfaz neón con colores cyan y púrpura
- 📱 Totalmente responsive (móvil, tablet, desktop)
- 🎯 Grid inteligente en web, lista en móvil

---

## 🛠️ Tecnologías

- **Frontend**: React Native + Expo Router
- **Backend**: Supabase (Realtime Database + Presence)
- **Estilos**: React Native StyleSheet
- **Despliegue Web**: Netlify
- **Despliegue Móvil**: EAS Build (Expo Application Services)

---

## 📦 Instalación

### **Opción 1: Usar la Web (Recomendado)**
Accede directamente desde cualquier navegador:
```
https://tu-sitio.netlify.app
```

### **Opción 2: Instalar en Android**
Descarga el APK desde [GitHub Releases](https://github.com/FranciscoArias10/CopyEasy-/releases)

---

## 🧑‍💻 Desarrollo Local

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Configuración

1. **Clona el repositorio**
```bash
git clone https://github.com/FranciscoArias10/CopyEasy-.git
cd CopyEasy-
```

2. **Instala dependencias**
```bash
npm install
```

3. **Configura variables de entorno**
Crea un archivo `.env` en la raíz:
```env
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon
```

4. **Inicia el servidor de desarrollo**
```bash
# Web
npm run web

# Android/iOS
npm start
```

---

## 🏗️ Compilar para Producción

### **Web**
```bash
npx expo export --platform web
```
Los archivos se generarán en la carpeta `dist/`

### **Android APK**
```bash
eas build -p android --profile preview
```

---

## 📱 Capturas de Pantalla

### Pantalla Principal
- Botones grandes para Enviar/Recibir
- Descarga directa del APK (solo web)

### Sala de Transferencia
- Vista de tarjetas (web) / Lista (móvil)
- Previsualización de imágenes
- Botones de descarga/copiar/compartir

### Escáner QR
- Acceso rápido con la cámara
- Entrada manual alternativa

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

## � Apoyar el Proyecto

Si CopyEasy te ha sido útil y quieres apoyar su desarrollo, puedes invitarme un café ☕

[![Donar con PayPal](https://img.shields.io/badge/PayPal-Donar-FFD700?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/FranciscoArias10)

Tu apoyo ayuda a mantener el proyecto activo y a seguir mejorando CopyEasy. ¡Gracias! 🙏

---

## �👨‍💻 Autor

**Francisco Arias**
- GitHub: [@FranciscoArias10](https://github.com/FranciscoArias10)
- Email: fariasp2@unemi.edu.ec

---

**⚡ CopyEasy - Comparte sin límites**
