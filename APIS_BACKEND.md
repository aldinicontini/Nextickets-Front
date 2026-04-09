1. OBTENER TODOS LOS REPORTES (LISTAR)
---------------------------------------------------------
Método: GET
URL: http://172.19.36.208:3000/api/reports

*No requiere Body (Cuerpo)*

Respuesta esperada (Array completo):
[
  {
    "id": "1775176745100",
    "estacion": "DBC10",
    "seccion": "C",
    "categoria": "red",
    "categoriaLabel": "Fallas de Red / Internet",
    "subcategoria": "No hay conexión Wi-Fi",
    "comentarios": "Agregado desde Postman/Celular",
    "status": "pendiente",
    "fecha": "2026-04-08T20:45:00Z",
    "creadoEn": 1775176745100,
    "actualizadoEn": null
  }
]


2. CREAR UN NUEVO REPORTE
---------------------------------------------------------
Método: POST
URL: http://172.19.36.208:3000/api/reports

Body (Petición enviada desde Angular):
{
  "estacion": "DBC10",
  "seccion": "C",
  "categoria": "red",
  "categoriaLabel": "Fallas de Red / Internet",
  "subcategoria": "No hay conexión Wi-Fi",
  "comentarios": "Agregado desde Postman/Celular",
  "status": "pendiente",
  "fecha": "2026-04-08T20:45:00Z"
}

Respuesta esperada (El objeto guardado con su ID y fecha de creación generados por Backend):
{
  "id": "1775176745199",
  "estacion": "DBC10",
  "seccion": "C",
  "categoria": "red",
  "categoriaLabel": "Fallas de Red / Internet",
  "subcategoria": "No hay conexión Wi-Fi",
  "comentarios": "Agregado desde Postman/Celular",
  "status": "pendiente",
  "fecha": "2026-04-08T20:45:00Z",
  "creadoEn": 1775176746000,
  "actualizadoEn": null
}


3. ACTUALIZAR/EDITAR UN REPORTE
---------------------------------------------------------
Método: PUT
URL: http://172.19.36.208:3000/api/reports/{id}
Ejemplo: http://172.19.36.208:3000/api/reports/1775176745199

Body (Angular manda solo las llaves que cambiaron):
{
  "status": "en_progreso",
  "comentarios": "Ya envié al técnico de redes."
}

Respuesta esperada (El objeto completo con la información actualizada):
{
  "id": "1775176745199",
  "estacion": "DBC10",
  "seccion": "C",
  "categoria": "red",
  "categoriaLabel": "Fallas de Red / Internet",
  "subcategoria": "No hay conexión Wi-Fi",
  "comentarios": "Ya envié al técnico de redes.",
  "status": "en_progreso",
  "fecha": "2026-04-08T20:45:00Z",
  "creadoEn": 1775176746000,
  "actualizadoEn": 1775176800000
}


4. ELIMINAR UN REPORTE
---------------------------------------------------------
Método: DELETE
URL: http://172.19.36.208:3000/api/reports/{id}
Ejemplo: http://172.19.36.208:3000/api/reports/1775176745199

*No requiere Body (Cuerpo)*

Respuesta esperada: 
Código de éxito (Status 200 OK), sin necesidad de JSON.


5. OBTENER CATEGORÍAS PERSONALIZADAS DE OTROS
---------------------------------------------------------
Método: GET
URL: http://172.19.36.208:3000/api/otros-categories

Respuesta esperada:
[
  { "id": "custom_abc123", "label": "Mi categoría personalizada" }
]


6. AGREGAR CATEGORÍA PERSONALIZADA DE OTROS
---------------------------------------------------------
Método: POST
URL: http://172.19.36.208:3000/api/otros-categories

Body:
{ "label": "Mi categoría personalizada" }

Respuesta esperada:
{ "id": "custom_abc123", "label": "Mi categoría personalizada" }


7. EDITAR CATEGORÍA PERSONALIZADA DE OTROS
---------------------------------------------------------
Método: PUT
URL: http://172.19.36.208:3000/api/otros-categories/{id}

Body:
{ "label": "Nuevo nombre" }

Respuesta esperada:
{ "id": "custom_abc123", "label": "Nuevo nombre" }


8. ELIMINAR CATEGORÍA PERSONALIZADA DE OTROS
---------------------------------------------------------
Método: DELETE
URL: http://172.19.36.208:3000/api/otros-categories/{id}

Respuesta esperada:
Código de éxito (Status 200 OK), sin necesidad de JSON.


*No requiere Body (Cuerpo)*

Respuesta esperada (Array completo):
[
  {
    "id": "1775176745100",
    "estacion": "DBC10",
    "seccion": "C",
    "categoria": "red",
    "categoriaLabel": "Fallas de Red / Internet",
    "subcategoria": "No hay conexión Wi-Fi",
    "comentarios": "Agregado desde Postman/Celular",
    "status": "pendiente",
    "fecha": "2026-04-08T20:45:00Z",
    "creadoEn": 1775176745100,
    "actualizadoEn": null
  }
]


2. CREAR UN NUEVO REPORTE
---------------------------------------------------------
Método: POST
URL: http://172.19.36.155:3000/api/reports

Body (Petición enviada desde Angular):
{
  "estacion": "DBC10",
  "seccion": "C",
  "categoria": "red",
  "categoriaLabel": "Fallas de Red / Internet",
  "subcategoria": "No hay conexión Wi-Fi",
  "comentarios": "Agregado desde Postman/Celular",
  "status": "pendiente",
  "fecha": "2026-04-08T20:45:00Z"
}

Respuesta esperada (El objeto guardado con su ID y fecha de creación generados por Backend):
{
  "id": "1775176745199",
  "estacion": "DBC10",
  "seccion": "C",
  "categoria": "red",
  "categoriaLabel": "Fallas de Red / Internet",
  "subcategoria": "No hay conexión Wi-Fi",
  "comentarios": "Agregado desde Postman/Celular",
  "status": "pendiente",
  "fecha": "2026-04-08T20:45:00Z",
  "creadoEn": 1775176746000,
  "actualizadoEn": null
}


3. ACTUALIZAR/EDITAR UN REPORTE
---------------------------------------------------------
Método: PUT
URL: http://172.19.36.155:3000/api/reports/{id}
Ejemplo: http://172.19.36.155:3000/api/reports/1775176745199

Body (Angular manda solo las llaves que cambiaron):
{
  "status": "en_progreso",
  "comentarios": "Ya envié al técnico de redes."
}

Respuesta esperada (El objeto completo con la información actualizada):
{
  "id": "1775176745199",
  "estacion": "DBC10",
  "seccion": "C",
  "categoria": "red",
  "categoriaLabel": "Fallas de Red / Internet",
  "subcategoria": "No hay conexión Wi-Fi",
  "comentarios": "Ya envié al técnico de redes.",
  "status": "en_progreso",
  "fecha": "2026-04-08T20:45:00Z",
  "creadoEn": 1775176746000,
  "actualizadoEn": 1775176800000
}


4. ELIMINAR UN REPORTE
---------------------------------------------------------
Método: DELETE
URL: http://172.19.36.155:3000/api/reports/{id}
Ejemplo: http://172.19.36.155:3000/api/reports/1775176745199

*No requiere Body (Cuerpo)*

Respuesta esperada: 
Código de éxito (Status 200 OK), sin necesidad de JSON.
