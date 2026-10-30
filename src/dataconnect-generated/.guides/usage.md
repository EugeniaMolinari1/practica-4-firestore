# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useUpsertAlumno, useInscribirme, useListCursos, useListAlumnos, useMisInscripciones } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useUpsertAlumno(upsertAlumnoVars);

const { data, isPending, isSuccess, isError, error } = useInscribirme(inscribirmeVars);

const { data, isPending, isSuccess, isError, error } = useListCursos();

const { data, isPending, isSuccess, isError, error } = useListAlumnos();

const { data, isPending, isSuccess, isError, error } = useMisInscripciones();

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { upsertAlumno, inscribirme, listCursos, listAlumnos, misInscripciones } from '@dataconnect/generated';


// Operation UpsertAlumno:  For variables, look at type UpsertAlumnoVars in ../index.d.ts
const { data } = await UpsertAlumno(dataConnect, upsertAlumnoVars);

// Operation Inscribirme:  For variables, look at type InscribirmeVars in ../index.d.ts
const { data } = await Inscribirme(dataConnect, inscribirmeVars);

// Operation ListCursos: 
const { data } = await ListCursos(dataConnect);

// Operation ListAlumnos: 
const { data } = await ListAlumnos(dataConnect);

// Operation MisInscripciones: 
const { data } = await MisInscripciones(dataConnect);


```