import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Alumno_Key {
  id: string;
  __typename?: 'Alumno_Key';
}

export interface Curso_Key {
  id: UUIDString;
  __typename?: 'Curso_Key';
}

export interface InscribirmeData {
  matricula_upsert: Matricula_Key;
}

export interface InscribirmeVariables {
  cursoId: UUIDString;
}

export interface ListAlumnosData {
  alumnos: ({
    id: string;
    nombre: string;
    email: string;
  } & Alumno_Key)[];
}

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

export interface Matricula_Key {
  alumnoId: string;
  cursoId: UUIDString;
  __typename?: 'Matricula_Key';
}

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

export interface UpsertAlumnoData {
  alumno_upsert: Alumno_Key;
}

export interface UpsertAlumnoVariables {
  nombre: string;
}

interface UpsertAlumnoRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertAlumnoVariables): MutationRef<UpsertAlumnoData, UpsertAlumnoVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertAlumnoVariables): MutationRef<UpsertAlumnoData, UpsertAlumnoVariables>;
  operationName: string;
}
export const upsertAlumnoRef: UpsertAlumnoRef;

export function upsertAlumno(vars: UpsertAlumnoVariables): MutationPromise<UpsertAlumnoData, UpsertAlumnoVariables>;
export function upsertAlumno(dc: DataConnect, vars: UpsertAlumnoVariables): MutationPromise<UpsertAlumnoData, UpsertAlumnoVariables>;

interface InscribirmeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: InscribirmeVariables): MutationRef<InscribirmeData, InscribirmeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: InscribirmeVariables): MutationRef<InscribirmeData, InscribirmeVariables>;
  operationName: string;
}
export const inscribirmeRef: InscribirmeRef;

export function inscribirme(vars: InscribirmeVariables): MutationPromise<InscribirmeData, InscribirmeVariables>;
export function inscribirme(dc: DataConnect, vars: InscribirmeVariables): MutationPromise<InscribirmeData, InscribirmeVariables>;

interface ListCursosRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCursosData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListCursosData, undefined>;
  operationName: string;
}
export const listCursosRef: ListCursosRef;

export function listCursos(options?: ExecuteQueryOptions): QueryPromise<ListCursosData, undefined>;
export function listCursos(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListCursosData, undefined>;

interface ListAlumnosRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAlumnosData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAlumnosData, undefined>;
  operationName: string;
}
export const listAlumnosRef: ListAlumnosRef;

export function listAlumnos(options?: ExecuteQueryOptions): QueryPromise<ListAlumnosData, undefined>;
export function listAlumnos(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAlumnosData, undefined>;

interface MisInscripcionesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<MisInscripcionesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<MisInscripcionesData, undefined>;
  operationName: string;
}
export const misInscripcionesRef: MisInscripcionesRef;

export function misInscripciones(options?: ExecuteQueryOptions): QueryPromise<MisInscripcionesData, undefined>;
export function misInscripciones(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<MisInscripcionesData, undefined>;

