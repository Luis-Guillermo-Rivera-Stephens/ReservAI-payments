# 📚 Documentación de API - ReservAI Stripe Service

## 🔐 Autenticación

Todos los endpoints (excepto `/health`) requieren autenticación mediante token en el header `Authorization`.

---

## 📋 Endpoints

### 1. Obtener mis suscripciones

**Método:** `GET`

**Endpoint:** `/api/status`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "token de acceso SIEMPRE"
}
```

**Body:**
```json
{
  
}
```
*No requiere body*

**Middlewares que pasa:**
1. `PathSecurityValidator` - Valida que no haya intentos de path traversal
2. `VerifyToken` - Verifica y valida el token de autorización
3. `AccountExistByID` - Verifica que la cuenta existe en la base de datos
4. `AccountIsAClient` - Verifica que la cuenta es de tipo 'client'
5. `CustomerExistByID` - Verifica que el customer existe en la base de datos

**Códigos y mensajes de salida:**

**418 - Token inválido o faltante:**
```json
{
  "error": "Token is required"
}
```
```json
{
  "error": "Invalid token"
}
```
```json
{
  "error": "Token error message"
}
```

**500 - Error interno del servidor:**
```json
{
  "error": "Internal server error"
}
```
*Ocurre cuando:*
- Error conectando a la base de datos
- Error obteniendo suscripciones de la base de datos

**400 - Cuenta no existe:**
```json
{
  "error": "Account does not exist"
}
```

**403 - Cuenta no es cliente:**
```json
{
  "error": "Account is not a client"
}
```

**404 - Customer no existe:**
```json
{
  "error": "Customer does not exist"
}
```

**200 - Request exitoso:**
```json
{
  "success": true,
  "message": "Suscripciones obtenidas correctamente",
  "subscriptions": [
    {
      "stripe_customer_id": "cus_xxxxx",
      "stripe_subscription_id": "sub_xxxxx",
      "stripe_product_id": "prod_xxxxx",
      "status": "active",
      "current_period_start": "2026-01-06T01:39:36.000Z",
      "current_period_end": "2026-02-06T01:39:36.000Z",
      "cancel_at_period_end": false,
      "plan_name": "Plan basico",
      "amount": 1699,
      "created_at": "2026-01-06T01:39:36.000Z",
      "account_id": "uuid-del-account",
      "stripe_customer_id": "cus_xxxxx"
    }
  ]
}
```

**403 - Path traversal detectado:**
```json
{
  "error": "Forbidden",
  "message": "Access to this resource is not allowed",
  "code": "FORBIDDEN_RESOURCE"
}
```

---

### 2. Crear customer en Stripe

**Método:** `POST`

**Endpoint:** `/api/customer`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "token de acceso SIEMPRE"
}
```

**Body:**
```json
{
  
}
```
*No requiere body - usa información del token*

**Middlewares que pasa:**
1. `PathSecurityValidator` - Valida que no haya intentos de path traversal
2. `VerifyToken` - Verifica y valida el token de autorización
3. `AccountExistByID` - Verifica que la cuenta existe en la base de datos
4. `AccountIsAClient` - Verifica que la cuenta es de tipo 'client'
5. `CustomerIsAvailable` - Verifica que el customer NO existe (para poder crearlo)

**Códigos y mensajes de salida:**

**418 - Token inválido o faltante:**
```json
{
  "error": "Token is required"
}
```
```json
{
  "error": "Invalid token"
}
```
```json
{
  "error": "Token error message"
}
```

**500 - Error interno del servidor:**
```json
{
  "error": "Internal server error"
}
```
*Ocurre cuando:*
- Error obteniendo instancia de Stripe
- Error creando customer en Stripe

**400 - Cuenta no existe:**
```json
{
  "error": "Account does not exist"
}
```

**403 - Cuenta no es cliente:**
```json
{
  "error": "Account is not a client"
}
```

**400 - Customer ya existe:**
```json
{
  "error": "Customer already exists"
}
```

**200 - Request exitoso:**
```json
{
  "message": "Customer created successfully",
  "customer": {
    "id": "cus_xxxxx",
    "object": "customer",
    "email": "usuario@example.com",
    "name": "Nombre Usuario",
    "metadata": {
      "account_id": "uuid-del-account"
    }
  }
}
```

**403 - Path traversal detectado:**
```json
{
  "error": "Forbidden",
  "message": "Access to this resource is not allowed",
  "code": "FORBIDDEN_RESOURCE"
}
```

---

### 3. Crear sesión del portal de facturación

**Método:** `GET`

**Endpoint:** `/api/portal`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "token de acceso SIEMPRE"
}
```

**Body:**
```json
{
  
}
```
*No requiere body*

**Middlewares que pasa:**
1. `PathSecurityValidator` - Valida que no haya intentos de path traversal
2. `VerifyToken` - Verifica y valida el token de autorización
3. `AccountExistByID` - Verifica que la cuenta existe en la base de datos
4. `AccountIsAClient` - Verifica que la cuenta es de tipo 'client'
5. `CustomerExistByID` - Verifica que el customer existe en la base de datos

**Códigos y mensajes de salida:**

**418 - Token inválido o faltante:**
```json
{
  "error": "Token is required"
}
```
```json
{
  "error": "Invalid token"
}
```
```json
{
  "error": "Token error message"
}
```

**500 - Error interno del servidor:**
```json
{
  "error": "Internal server error"
}
```
*Ocurre cuando:*
- Error obteniendo instancia de Stripe
- Error creando sesión del portal en Stripe

**400 - Cuenta no existe:**
```json
{
  "error": "Account does not exist"
}
```

**403 - Cuenta no es cliente:**
```json
{
  "error": "Account is not a client"
}
```

**404 - Customer no existe:**
```json
{
  "error": "Customer does not exist"
}
```

**200 - Request exitoso:**
```json
{
  "session": {
    "id": "cs_test_xxxxx",
    "object": "billing_portal.session",
    "created": 1234567890,
    "customer": "cus_xxxxx",
    "livemode": false,
    "return_url": "https://example.com/return",
    "url": "https://billing.stripe.com/p/session/xxxxx"
  }
}
```

**403 - Path traversal detectado:**
```json
{
  "error": "Forbidden",
  "message": "Access to this resource is not allowed",
  "code": "FORBIDDEN_RESOURCE"
}
```

---

### 4. Obtener links de pago

**Método:** `GET`

**Endpoint:** `/api/links`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "token de acceso SIEMPRE"
}
```

**Body:**
```json
{
  
}
```
*No requiere body*

**Middlewares que pasa:**
1. `PathSecurityValidator` - Valida que no haya intentos de path traversal
2. `VerifyToken` - Verifica y valida el token de autorización
3. `AccountExistByID` - Verifica que la cuenta existe en la base de datos
4. `AccountIsAClient` - Verifica que la cuenta es de tipo 'client'
5. `CustomerExistByID` - Verifica que el customer existe en la base de datos

**Códigos y mensajes de salida:**

**418 - Token inválido o faltante:**
```json
{
  "error": "Token is required"
}
```
```json
{
  "error": "Invalid token"
}
```
```json
{
  "error": "Token error message"
}
```

**500 - Error interno del servidor:**
```json
{
  "error": "Internal server error"
}
```
*Ocurre cuando:*
- Error obteniendo instancia de Stripe
- Error creando sesión del portal
- Error creando payment links

**400 - Cuenta no existe:**
```json
{
  "error": "Account does not exist"
}
```

**403 - Cuenta no es cliente:**
```json
{
  "error": "Account is not a client"
}
```

**404 - Customer no existe:**
```json
{
  "error": "Customer does not exist"
}
```

**500 - Error creando payment links:**
```json
{
  "error": "Error creating checkout sessions",
  "errors": "Detalles adicionales del error"
}
```
*Ocurre cuando:*
- `stripe_customer_id` no está disponible
- Price IDs no configurados en variables de entorno
- Error de Stripe al crear las sesiones

**200 - Request exitoso:**
```json
{
  "message": "Checkout sessions created successfully",
  "paymentLinks": {
    "basico": {
      "url": "https://checkout.stripe.com/c/pay/cs_test_xxxxx",
      "plan": "Plan basico",
      "session_id": "cs_test_xxxxx"
    },
    "premium": {
      "url": "https://checkout.stripe.com/c/pay/cs_test_yyyyy",
      "plan": "Plan premium",
      "session_id": "cs_test_yyyyy"
    }
  }
}
```

**403 - Path traversal detectado:**
```json
{
  "error": "Forbidden",
  "message": "Access to this resource is not allowed",
  "code": "FORBIDDEN_RESOURCE"
}
```

---

## 📝 Notas Importantes

### Orden de Validación de Middlewares

Los middlewares se ejecutan en el siguiente orden:

1. **PathSecurityValidator** - Valida seguridad de paths
2. **VerifyToken** - Valida autenticación
3. **AccountExistByID** - Verifica existencia de cuenta
4. **AccountIsAClient** - Verifica tipo de cuenta
5. **CustomerIsAvailable** (solo POST /customer) - Verifica que customer NO existe
6. **CustomerExistByID** (otros endpoints) - Verifica que customer existe
7. **Handler** - Ejecuta la lógica del endpoint

### Códigos de Estado HTTP

- **200** - Request exitoso
- **400** - Bad Request (cuenta no existe, customer ya existe, etc.)
- **403** - Forbidden (no es cliente, path traversal, etc.)
- **404** - Not Found (customer no existe, ruta no encontrada)
- **418** - I'm a teapot (token inválido o faltante - código custom)
- **500** - Internal Server Error (errores del servidor)

### Estructura de Respuestas

Todas las respuestas de error siguen el formato:
```json
{
  "error": "Mensaje de error descriptivo"
}
```

Las respuestas exitosas varían según el endpoint pero generalmente incluyen:
- `success`: boolean (cuando aplica)
- `message`: string descriptivo
- Datos específicos del endpoint

---

## 🔒 Seguridad

Todos los endpoints están protegidos por:
- ✅ Validación de tokens
- ✅ Validación de existencia de cuenta
- ✅ Validación de tipo de cuenta (solo clientes)
- ✅ Protección contra path traversal
- ✅ Validación de existencia de customer (cuando aplica)

