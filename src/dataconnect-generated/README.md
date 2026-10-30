# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `cursos`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListCursos*](#listcursos)
  - [*ListAlumnos*](#listalumnos)
  - [*MisInscripciones*](#misinscripciones)
- [**Mutations**](#mutations)
  - [*UpsertAlumno*](#upsertalumno)
  - [*Inscribirme*](#inscribirme)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `cursos`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `cursos` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListCursos
You can execute the `ListCursos` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listCursos(options?: ExecuteQueryOptions): QueryPromise<ListCursosData, undefined>;

interface ListCursosRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCursosData, undefined>;
}
export const listCursosRef: ListCursosRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listCursos(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListCursosData, undefined>;

interface ListCursosRef {
  ...
  (dc: DataConnect): QueryRef<ListCursosData, undefined>;
}
export const listCursosRef: ListCursosRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listCursosRef:
```typescript
const name = listCursosRef.operationName;
console.log(name);
```

### Variables
The `ListCursos` query has no variables.
### Return Type
Recall that executing the `ListCursos` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListCursosData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListCursosData {
  cursos: ({
    id: UUIDString;
    titulo: string;
    nivel: string;
    horas: number;
    descripcion: string;
    cupo: number;
  } & Curso_Key)[];
}
```
### Using `ListCursos`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listCursos } from '@dataconnect/generated';


// Call the `listCursos()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listCursos();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listCursos(dataConnect);

console.log(data.cursos);

// Or, you can use the `Promise` API.
listCursos().then((response) => {
  const data = response.data;
  console.log(data.cursos);
});
```

### Using `ListCursos`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listCursosRef } from '@dataconnect/generated';


// Call the `listCursosRef()` function to get a reference to the query.
const ref = listCursosRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listCursosRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.cursos);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.cursos);
});
```

## ListAlumnos
You can execute the `ListAlumnos` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAlumnos(options?: ExecuteQueryOptions): QueryPromise<ListAlumnosData, undefined>;

interface ListAlumnosRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAlumnosData, undefined>;
}
export const listAlumnosRef: ListAlumnosRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAlumnos(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAlumnosData, undefined>;

interface ListAlumnosRef {
  ...
  (dc: DataConnect): QueryRef<ListAlumnosData, undefined>;
}
export const listAlumnosRef: ListAlumnosRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAlumnosRef:
```typescript
const name = listAlumnosRef.operationName;
console.log(name);
```

### Variables
The `ListAlumnos` query has no variables.
### Return Type
Recall that executing the `ListAlumnos` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAlumnosData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAlumnosData {
  alumnos: ({
    id: string;
    nombre: string;
    email: string;
  } & Alumno_Key)[];
}
```
### Using `ListAlumnos`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAlumnos } from '@dataconnect/generated';


// Call the `listAlumnos()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAlumnos();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAlumnos(dataConnect);

console.log(data.alumnos);

// Or, you can use the `Promise` API.
listAlumnos().then((response) => {
  const data = response.data;
  console.log(data.alumnos);
});
```

### Using `ListAlumnos`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAlumnosRef } from '@dataconnect/generated';


// Call the `listAlumnosRef()` function to get a reference to the query.
const ref = listAlumnosRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAlumnosRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.alumnos);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.alumnos);
});
```

## MisInscripciones
You can execute the `MisInscripciones` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
misInscripciones(options?: ExecuteQueryOptions): QueryPromise<MisInscripcionesData, undefined>;

interface MisInscripcionesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<MisInscripcionesData, undefined>;
}
export const misInscripcionesRef: MisInscripcionesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
misInscripciones(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<MisInscripcionesData, undefined>;

interface MisInscripcionesRef {
  ...
  (dc: DataConnect): QueryRef<MisInscripcionesData, undefined>;
}
export const misInscripcionesRef: MisInscripcionesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the misInscripcionesRef:
```typescript
const name = misInscripcionesRef.operationName;
console.log(name);
```

### Variables
The `MisInscripciones` query has no variables.
### Return Type
Recall that executing the `MisInscripciones` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `MisInscripcionesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface MisInscripcionesData {
  alumno?: {
    nombre: string;
    matriculas: ({
      fecha: TimestampString;
      curso: {
        id: UUIDString;
        titulo: string;
        nivel: string;
        horas: number;
      } & Curso_Key;
    })[];
  };
}
```
### Using `MisInscripciones`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, misInscripciones } from '@dataconnect/generated';


// Call the `misInscripciones()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await misInscripciones();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await misInscripciones(dataConnect);

console.log(data.alumno);

// Or, you can use the `Promise` API.
misInscripciones().then((response) => {
  const data = response.data;
  console.log(data.alumno);
});
```

### Using `MisInscripciones`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, misInscripcionesRef } from '@dataconnect/generated';


// Call the `misInscripcionesRef()` function to get a reference to the query.
const ref = misInscripcionesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = misInscripcionesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.alumno);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.alumno);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `cursos` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## UpsertAlumno
You can execute the `UpsertAlumno` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertAlumno(vars: UpsertAlumnoVariables): MutationPromise<UpsertAlumnoData, UpsertAlumnoVariables>;

interface UpsertAlumnoRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertAlumnoVariables): MutationRef<UpsertAlumnoData, UpsertAlumnoVariables>;
}
export const upsertAlumnoRef: UpsertAlumnoRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertAlumno(dc: DataConnect, vars: UpsertAlumnoVariables): MutationPromise<UpsertAlumnoData, UpsertAlumnoVariables>;

interface UpsertAlumnoRef {
  ...
  (dc: DataConnect, vars: UpsertAlumnoVariables): MutationRef<UpsertAlumnoData, UpsertAlumnoVariables>;
}
export const upsertAlumnoRef: UpsertAlumnoRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertAlumnoRef:
```typescript
const name = upsertAlumnoRef.operationName;
console.log(name);
```

### Variables
The `UpsertAlumno` mutation requires an argument of type `UpsertAlumnoVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertAlumnoVariables {
  nombre: string;
}
```
### Return Type
Recall that executing the `UpsertAlumno` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertAlumnoData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertAlumnoData {
  alumno_upsert: Alumno_Key;
}
```
### Using `UpsertAlumno`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertAlumno, UpsertAlumnoVariables } from '@dataconnect/generated';

// The `UpsertAlumno` mutation requires an argument of type `UpsertAlumnoVariables`:
const upsertAlumnoVars: UpsertAlumnoVariables = {
  nombre: ..., 
};

// Call the `upsertAlumno()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertAlumno(upsertAlumnoVars);
// Variables can be defined inline as well.
const { data } = await upsertAlumno({ nombre: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertAlumno(dataConnect, upsertAlumnoVars);

console.log(data.alumno_upsert);

// Or, you can use the `Promise` API.
upsertAlumno(upsertAlumnoVars).then((response) => {
  const data = response.data;
  console.log(data.alumno_upsert);
});
```

### Using `UpsertAlumno`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertAlumnoRef, UpsertAlumnoVariables } from '@dataconnect/generated';

// The `UpsertAlumno` mutation requires an argument of type `UpsertAlumnoVariables`:
const upsertAlumnoVars: UpsertAlumnoVariables = {
  nombre: ..., 
};

// Call the `upsertAlumnoRef()` function to get a reference to the mutation.
const ref = upsertAlumnoRef(upsertAlumnoVars);
// Variables can be defined inline as well.
const ref = upsertAlumnoRef({ nombre: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertAlumnoRef(dataConnect, upsertAlumnoVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.alumno_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.alumno_upsert);
});
```

## Inscribirme
You can execute the `Inscribirme` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
inscribirme(vars: InscribirmeVariables): MutationPromise<InscribirmeData, InscribirmeVariables>;

interface InscribirmeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: InscribirmeVariables): MutationRef<InscribirmeData, InscribirmeVariables>;
}
export const inscribirmeRef: InscribirmeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
inscribirme(dc: DataConnect, vars: InscribirmeVariables): MutationPromise<InscribirmeData, InscribirmeVariables>;

interface InscribirmeRef {
  ...
  (dc: DataConnect, vars: InscribirmeVariables): MutationRef<InscribirmeData, InscribirmeVariables>;
}
export const inscribirmeRef: InscribirmeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the inscribirmeRef:
```typescript
const name = inscribirmeRef.operationName;
console.log(name);
```

### Variables
The `Inscribirme` mutation requires an argument of type `InscribirmeVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface InscribirmeVariables {
  cursoId: UUIDString;
}
```
### Return Type
Recall that executing the `Inscribirme` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `InscribirmeData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface InscribirmeData {
  matricula_upsert: Matricula_Key;
}
```
### Using `Inscribirme`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, inscribirme, InscribirmeVariables } from '@dataconnect/generated';

// The `Inscribirme` mutation requires an argument of type `InscribirmeVariables`:
const inscribirmeVars: InscribirmeVariables = {
  cursoId: ..., 
};

// Call the `inscribirme()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await inscribirme(inscribirmeVars);
// Variables can be defined inline as well.
const { data } = await inscribirme({ cursoId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await inscribirme(dataConnect, inscribirmeVars);

console.log(data.matricula_upsert);

// Or, you can use the `Promise` API.
inscribirme(inscribirmeVars).then((response) => {
  const data = response.data;
  console.log(data.matricula_upsert);
});
```

### Using `Inscribirme`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, inscribirmeRef, InscribirmeVariables } from '@dataconnect/generated';

// The `Inscribirme` mutation requires an argument of type `InscribirmeVariables`:
const inscribirmeVars: InscribirmeVariables = {
  cursoId: ..., 
};

// Call the `inscribirmeRef()` function to get a reference to the mutation.
const ref = inscribirmeRef(inscribirmeVars);
// Variables can be defined inline as well.
const ref = inscribirmeRef({ cursoId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = inscribirmeRef(dataConnect, inscribirmeVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.matricula_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.matricula_upsert);
});
```

