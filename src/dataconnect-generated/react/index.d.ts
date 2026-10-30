import { UpsertAlumnoData, UpsertAlumnoVariables, InscribirmeData, InscribirmeVariables, ListCursosData, ListAlumnosData, MisInscripcionesData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useUpsertAlumno(options?: useDataConnectMutationOptions<UpsertAlumnoData, FirebaseError, UpsertAlumnoVariables>): UseDataConnectMutationResult<UpsertAlumnoData, UpsertAlumnoVariables>;
export function useUpsertAlumno(dc: DataConnect, options?: useDataConnectMutationOptions<UpsertAlumnoData, FirebaseError, UpsertAlumnoVariables>): UseDataConnectMutationResult<UpsertAlumnoData, UpsertAlumnoVariables>;

export function useInscribirme(options?: useDataConnectMutationOptions<InscribirmeData, FirebaseError, InscribirmeVariables>): UseDataConnectMutationResult<InscribirmeData, InscribirmeVariables>;
export function useInscribirme(dc: DataConnect, options?: useDataConnectMutationOptions<InscribirmeData, FirebaseError, InscribirmeVariables>): UseDataConnectMutationResult<InscribirmeData, InscribirmeVariables>;

export function useListCursos(options?: useDataConnectQueryOptions<ListCursosData>): UseDataConnectQueryResult<ListCursosData, undefined>;
export function useListCursos(dc: DataConnect, options?: useDataConnectQueryOptions<ListCursosData>): UseDataConnectQueryResult<ListCursosData, undefined>;

export function useListAlumnos(options?: useDataConnectQueryOptions<ListAlumnosData>): UseDataConnectQueryResult<ListAlumnosData, undefined>;
export function useListAlumnos(dc: DataConnect, options?: useDataConnectQueryOptions<ListAlumnosData>): UseDataConnectQueryResult<ListAlumnosData, undefined>;

export function useMisInscripciones(options?: useDataConnectQueryOptions<MisInscripcionesData>): UseDataConnectQueryResult<MisInscripcionesData, undefined>;
export function useMisInscripciones(dc: DataConnect, options?: useDataConnectQueryOptions<MisInscripcionesData>): UseDataConnectQueryResult<MisInscripcionesData, undefined>;
