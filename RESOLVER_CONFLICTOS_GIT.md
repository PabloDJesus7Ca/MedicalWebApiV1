# ⚔️ Guía de Supervivencia: Cómo Resolver Conflictos en Git (Merge Conflicts)

## 📌 ¿Por qué ocurrió el conflicto hoy?

Un conflicto ocurre cuando **dos ramas de Git modifican las mismas líneas de un archivo** o cuando una rama borra un archivo que la otra está intentando editar.

En nuestro caso, ocurrió un choque masivo entre la rama `dev` y nuestra rama de arquitectura porque hicimos un "Refactor Extremo":

1. **Borramos archivos viejos en Spanglish** (ej. `src/modules/consulta/consulta.controller.ts`).
2. La rama `dev` tenía pequeños cambios en esos mismos archivos.
3. Git se confundió y dijo: _"¡Espera! En dev modificaron `consulta.controller.ts`, pero en la rama nueva lo borraron. ¿Qué hago?"_

---

## 🛠️ Lo que hice paso a paso (El Rescate)

Cuando GitHub te dijo _"Use the command line to resolve conflicts"_, ejecuté estos comandos exactos en tu terminal para arreglarlo:

### Paso 1: Descargar los cambios de `dev` sin fusionar todavía

```bash
git fetch origin dev
```

_(Esto solo descarga el código de la nube a tu PC, pero no toca tus archivos)._

### Paso 2: Forzar la fusión y ver dónde estalla

```bash
git merge origin/dev
```

_(Aquí la consola se llenó de letras rojas diciendo `CONFLICT`. Git pausó todo y esperó instrucciones)._

### Paso 3: Eliminar los "Archivos Fantasmas"

Como nosotros migramos todo al inglés bajo Clean Architecture, los archivos viejos de `dev` ya no nos servían. Le dije a Git que los borrara definitivamente:

```bash
git rm src/Shared/middlewares/auth.middleware.ts
git rm src/modules/consulta/consulta.controller.ts
# (Y otros archivos más que borramos en la V2)
```

### Paso 4: Resolver los conflictos de código (Quedarnos con la V2)

Hubo archivos clave (como `auth.routes.ts` y `package.json`) donde ambas ramas tenían cambios cruzados. Como nuestra rama V2 es la versión superior, le ordené a Git que se quedara con "nuestra versión" (`HEAD`) en lugar de la versión de `dev`:

```bash
git checkout HEAD package.json pnpm-lock.yaml
git checkout HEAD src/modules/auth/auth.routes.ts
git checkout HEAD src/modules/consultation/consultation.routes.ts
```

### Paso 5: Sellar y Guardar el Merge

Una vez limpio todo, le dije a Git que habíamos terminado de arreglar el choque:

```bash
git add .
git commit -m "Merge branch 'dev' - Resueltos conflictos manteniendo arquitectura V2"
```

---

## 🚀 Cómo puedes solucionarlo tú en el futuro (Vía Visual Studio Code)

Resolver conflictos desde la consola puede asustar al principio. Afortunadamente, **Visual Studio Code (VSCode)** tiene herramientas visuales increíbles. Si en el futuro intentas fusionar una rama y te sale `CONFLICT`, sigue estos pasos:

### 1. No entres en pánico

Abre VSCode. A la izquierda, en el ícono de **Control de Código Fuente (Git)**, verás una lista que dice **"Merge Changes" (Cambios de Fusión)**.

### 2. Abre cada archivo problemático

Al abrir un archivo en conflicto, verás algo como esto en tu código:

```javascript
<<<<<<< HEAD (Current Change - Lo que tú hiciste en tu rama)
router.post("/login", LoginLimiter, validationRequest(CheckTypeLoginSchema));
=======
router.post("/login", LoginLimiter); // (Incoming Change - Lo que viene de la otra rama)
>>>>>>> origin/dev
```

### 3. Usa los botones mágicos de VSCode

Arriba de esas marcas de colores, VSCode te pondrá 3 botoncitos clicables muy útiles:

- **Accept Current Change (Aceptar cambio actual):** Clic aquí si quieres conservar TU código y destruir el viejo.
- **Accept Incoming Change (Aceptar cambio entrante):** Clic aquí si el código de tu compañero (o de la otra rama) es mejor y quieres destruir el tuyo.
- **Accept Both Changes (Aceptar ambos):** Mantiene los dos códigos uno debajo del otro por si quieres mezclarlos manualmente.

### 4. Haz el Commit de Resolución

Una vez hayas presionado el botoncito en todos los archivos de la lista de "Merge Changes":

1. Ve a la pestaña de Git en VSCode.
2. Dale al botón **"+"** (Staged Changes) para decir que ya los arreglaste todos.
3. Escribe un mensaje de commit (ej. _"Conflictos resueltos"_) y dale a **Commit**.
4. Finalmente, haz tu **`git push`** de siempre.
