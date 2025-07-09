# Conexión con Backend ASP.NET Core

## Configuración

### 1. Puerto del Backend
Por defecto, la aplicación está configurada para conectarse al backend en `http://localhost:5000`. Si tu backend ASP.NET Core está ejecutándose en un puerto diferente, actualiza la configuración en:

- `src/api/config.ts` - para configuración global
- `vite.config.ts` - para el proxy de desarrollo

### 2. CORS en el Backend
Asegúrate de que tu backend ASP.NET Core tenga CORS configurado para permitir peticiones desde `http://localhost:5173` (puerto por defecto de Vite).

En tu `Program.cs` o `Startup.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// En el middleware
app.UseCors("AllowFrontend");
```

### 3. Estructura del API
El frontend espera que el backend tenga los siguientes endpoints:

- `GET /api/Clientes` - Obtener clientes paginados
- `GET /api/Clientes/{id}` - Obtener cliente por ID
- `POST /api/Clientes` - Crear nuevo cliente
- `PUT /api/Clientes/{id}` - Actualizar cliente
- `DELETE /api/Clientes/{id}` - Eliminar cliente

### 4. Regenerar API Client
Si cambias el esquema de tu API, puedes regenerar el cliente con:

```bash
npm run generate-api
```

## Uso

### Página de Clientes
La página de clientes (`src/features/clientes/pages/ClientesPage.tsx`) utiliza:

- **Hook personalizado**: `useClientes` para manejar el estado
- **Servicios**: Funciones que envuelven las llamadas al API generado
- **Componentes**: `ClienteCard` para mostrar cada cliente

### Servicios Disponibles
- `fetchClientes(pageNumber, pageSize)` - Obtener clientes paginados
- `fetchClienteById(id)` - Obtener cliente específico
- `createCliente(clienteData)` - Crear nuevo cliente
- `updateCliente(id, clienteData)` - Actualizar cliente
- `deleteCliente(id)` - Eliminar cliente

### Manejo de Errores
- Los errores de red se capturan y muestran en la UI
- Botón de "Reintentar" disponible cuando hay errores
- Estados de carga con skeletons

## Desarrollo

1. Asegúrate de que tu backend ASP.NET Core esté ejecutándose
2. Ejecuta el frontend con `npm run dev`
3. Navega a `http://localhost:5173` para ver la aplicación

## Próximos Pasos

1. Implementar autenticación si es necesaria
2. Agregar formularios para crear/editar clientes
3. Implementar paginación en la UI
4. Agregar filtros y búsqueda
5. Conectar otras entidades (Envíos, Vehículos, etc.)
