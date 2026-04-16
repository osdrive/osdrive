import Dexie, { type Table } from "dexie";
import { Effect } from "effect";
import {
  createMutation,
  createQuery,
  mutationOptions,
  type QueryFunctionContext,
  type CreateMutationResult,
  type CreateQueryOptions,
  type CreateQueryResult,
  type SolidMutationOptions,
  type SolidQueryOptions,
} from "@tanstack/solid-query";
import { hashKey, type QueryKey } from "@tanstack/solid-query";
import { HttpApi } from "effect/unstable/httpapi";
import type { HttpApiClient } from "effect/unstable/httpapi";
import type { Accessor } from "solid-js";
import { ApiClient, runApi } from "~/lib/client";
import { osDriveApi } from "~/server/domain";

type ApiClientShape = HttpApiClient.ForApi<typeof osDriveApi>;
type GroupName = Extract<keyof ApiClientShape, string>;
type GroupShape<G extends GroupName> = ApiClientShape[G];
type EndpointName<G extends GroupName> = Extract<keyof GroupShape<G>, string>;
type EndpointFn<G extends GroupName, E extends EndpointName<G>> = GroupShape<G>[E] extends (
  ...args: infer _Args
) => infer _Return
  ? GroupShape<G>[E]
  : never;
type RequestOf<Fn> = Fn extends (request: infer Request) => any ? Request : never;
type HasOptionalRequest<Fn> = undefined extends RequestOf<Fn>
  ? true
  : void extends RequestOf<Fn>
    ? true
    : false;
type RequestArgsOf<Fn> = HasOptionalRequest<Fn> extends true
  ? [request?: RequestOf<Fn>]
  : [request: RequestOf<Fn>];
type DataOf<Fn> = Fn extends (...args: any[]) => infer Result ? import("effect/Effect").Success<Result> : never;
type ErrorOf<Fn> = Fn extends (...args: any[]) => infer Result ? import("effect/Effect").Error<Result> : never;
type QueryKeyOf<G extends GroupName, E extends EndpointName<G>, Fn> = readonly [
  "api",
  G,
  E,
  RequestOf<Fn> | null,
];

type QueryInput<
  G extends GroupName,
  E extends EndpointName<G>,
  Fn,
  TData = DataOf<Fn>,
> = Accessor<
  Omit<SolidQueryOptions<DataOf<Fn>, ErrorOf<Fn>, TData, QueryKeyOf<G, E, Fn>>, "queryKey" | "queryFn"> &
    (HasOptionalRequest<Fn> extends true
      ? { request?: RequestOf<Fn> }
      : { request: RequestOf<Fn> })
>;

type MutationInput<Fn> = Accessor<
  Omit<SolidMutationOptions<DataOf<Fn>, ErrorOf<Fn>, RequestOf<Fn>, unknown>, "mutationFn"> & {
    mutationKey?: QueryKey;
  }
>;

type EndpointHelper<G extends GroupName, E extends EndpointName<G>, Fn> = {
  useQuery<TData = DataOf<Fn>>(input: QueryInput<G, E, Fn, TData>): CreateQueryResult<TData, ErrorOf<Fn>>;
  query<TData = DataOf<Fn>>(input: QueryInput<G, E, Fn, TData>): CreateQueryResult<TData, ErrorOf<Fn>>;
  queryOptions<TData = DataOf<Fn>>(
    input: QueryInput<G, E, Fn, TData>,
  ): CreateQueryOptions<DataOf<Fn>, ErrorOf<Fn>, TData, QueryKeyOf<G, E, Fn>>;
  useMutation(
    input: MutationInput<Fn>,
  ): CreateMutationResult<DataOf<Fn>, ErrorOf<Fn>, RequestOf<Fn>, unknown>;
  mutation(
    input: MutationInput<Fn>,
  ): CreateMutationResult<DataOf<Fn>, ErrorOf<Fn>, RequestOf<Fn>, unknown>;
  mutationOptions(
    input: MutationInput<Fn>,
  ): SolidMutationOptions<DataOf<Fn>, ErrorOf<Fn>, RequestOf<Fn>, unknown>;
  key(...args: RequestArgsOf<Fn>): QueryKeyOf<G, E, Fn>;
  fetch(...args: RequestArgsOf<Fn>): Promise<DataOf<Fn>>;
  execute(...args: RequestArgsOf<Fn>): Promise<DataOf<Fn>>;
};

type GroupHelpers<G extends GroupName> = {
  [E in EndpointName<G>]: EndpointHelper<G, E, EndpointFn<G, E>>;
};

type PersistedQuery = {
  hash: string;
  key: QueryKey;
  group: string;
  endpoint: string;
  data: unknown;
  updatedAt: number;
  version: number;
};

const CACHE_VERSION = 1;
const NON_PERSISTED_QUERIES = new Set(["Drive.getEntryContent", "Share.getShareContent"]);

class TanstackQueryDatabase extends Dexie {
  declare queries: Table<PersistedQuery, string>;

  constructor() {
    super("osdrive-tanstack");
    this.version(1).stores({
      queries: "hash, group, endpoint, updatedAt, version",
    });
  }
}

let queryDatabase: TanstackQueryDatabase | undefined;

function getQueryDatabase() {
  if (typeof indexedDB === "undefined") {
    return undefined;
  }

  queryDatabase ??= new TanstackQueryDatabase();
  return queryDatabase;
}

function buildQueryKey<G extends GroupName, E extends EndpointName<G>, Fn>(
  group: G,
  endpoint: E,
  request: RequestOf<Fn> | undefined,
): QueryKeyOf<G, E, Fn> {
  return ["api", group, endpoint, request ?? null] as QueryKeyOf<G, E, Fn>;
}

async function executeEndpoint<G extends GroupName, E extends EndpointName<G>>(
  group: G,
  endpoint: E,
  request: RequestOf<EndpointFn<G, E>> | undefined,
) {
  return runApi(
    Effect.gen(function* () {
      const client = yield* ApiClient;
      return yield* (client as any)[group][endpoint](request);
    }),
  ) as Promise<DataOf<EndpointFn<G, E>>>;
}

async function restorePersistedQuery<TData>(
  method: string,
  group: string,
  endpoint: string,
  queryKey: QueryKey,
  client: { getQueryState: (key: QueryKey) => { dataUpdatedAt: number } | undefined; setQueryData: any },
) {
  const database = getQueryDatabase();
  if (method !== "GET" || !database || NON_PERSISTED_QUERIES.has(`${group}.${endpoint}`)) {
    return undefined;
  }

  const entry = await database.queries.get(hashKey(queryKey));
  if (!entry || entry.version !== CACHE_VERSION) {
    return undefined;
  }

  const currentUpdatedAt = client.getQueryState(queryKey)?.dataUpdatedAt ?? 0;
  if (entry.updatedAt > currentUpdatedAt) {
    client.setQueryData(queryKey, entry.data as TData, { updatedAt: entry.updatedAt });
  }

  return entry.data as TData;
}

async function persistQueryResult(method: string, group: string, endpoint: string, queryKey: QueryKey, data: unknown) {
  const database = getQueryDatabase();
  if (method !== "GET" || !database || NON_PERSISTED_QUERIES.has(`${group}.${endpoint}`)) {
    return;
  }

  await database.queries.put({
    hash: hashKey(queryKey),
    key: queryKey,
    group,
    endpoint,
    data,
    updatedAt: Date.now(),
    version: CACHE_VERSION,
  });
}

function makeQueryHelper<G extends GroupName, E extends EndpointName<G>>(
  group: G,
  endpoint: E,
  method: string,
): Pick<EndpointHelper<G, E, EndpointFn<G, E>>, "useQuery" | "query" | "queryOptions" | "key" | "fetch"> {
  type Fn = EndpointFn<G, E>;

  const accessorFor = <TData = DataOf<Fn>>(
    input: QueryInput<G, E, Fn, TData>,
  ): CreateQueryOptions<DataOf<Fn>, ErrorOf<Fn>, TData, QueryKeyOf<G, E, Fn>> =>
    () => {
      const { request, ...rest } = input() as ReturnType<typeof input>;
      const queryKey = buildQueryKey<G, E, Fn>(group, endpoint, request);

      return {
        ...rest,
        queryKey,
        queryFn: async (context: QueryFunctionContext<QueryKeyOf<G, E, Fn>>) => {
          const networkPromise = executeEndpoint(group, endpoint, request);
          const cached = await restorePersistedQuery<DataOf<Fn>>(method, group, endpoint, queryKey, context.client as any);

          if (cached !== undefined) {
            // Return cached data immediately to release suspense, update with fresh network data in the background
            networkPromise.then((data) => {
              (context.client as any).setQueryData(queryKey, data);
              void persistQueryResult(method, group, endpoint, queryKey, data);
            });
            return cached;
          }

          const data = await networkPromise;
          void persistQueryResult(method, group, endpoint, queryKey, data);
          return data;
        },
      };
    };

  const queryOptionsFor = <TData = DataOf<Fn>>(input: QueryInput<G, E, Fn, TData>) =>
    accessorFor(input) as unknown as CreateQueryOptions<
      DataOf<Fn>,
      ErrorOf<Fn>,
      TData,
      QueryKeyOf<G, E, Fn>
    >;

  const useQuery = <TData = DataOf<Fn>>(input: QueryInput<G, E, Fn, TData>) =>
    createQuery<DataOf<Fn>, ErrorOf<Fn>, TData, QueryKeyOf<G, E, Fn>>(accessorFor(input) as any);

  return {
    useQuery,
    query: useQuery,
    queryOptions: queryOptionsFor,
    key: (...args: RequestArgsOf<Fn>) => buildQueryKey<G, E, Fn>(group, endpoint, args[0]),
    fetch: (...args: RequestArgsOf<Fn>) => executeEndpoint(group, endpoint, args[0]),
  };
}

function makeMutationHelper<G extends GroupName, E extends EndpointName<G>>(
  group: G,
  endpoint: E,
): Pick<EndpointHelper<G, E, EndpointFn<G, E>>, "useMutation" | "mutation" | "mutationOptions" | "execute"> {
  type Fn = EndpointFn<G, E>;

  const mutationOptionsFor = (input: MutationInput<Fn>) =>
    mutationOptions<DataOf<Fn>, ErrorOf<Fn>, RequestOf<Fn>, unknown>({
      ...input(),
      mutationFn: (request) => executeEndpoint(group, endpoint, request),
    });

  const useMutation = (input: MutationInput<Fn>) =>
    createMutation<DataOf<Fn>, ErrorOf<Fn>, RequestOf<Fn>, unknown>(() => mutationOptionsFor(input));

  return {
    useMutation,
    mutation: useMutation,
    mutationOptions: mutationOptionsFor,
    execute: (...args: RequestArgsOf<Fn>) => executeEndpoint(group, endpoint, args[0]),
  };
}

function createTanstackApi() {
  const groups: Record<string, Record<string, unknown>> = {};

  HttpApi.reflect(osDriveApi, {
    onGroup({ group }) {
      if (!group.topLevel) {
        groups[group.identifier] = {};
      }
    },
    onEndpoint({ group, endpoint }) {
      const groupHelpers = groups[group.identifier] ?? {};
      groupHelpers[endpoint.name] = {
        ...makeQueryHelper(group.identifier as GroupName, endpoint.name as never, endpoint.method),
        ...makeMutationHelper(group.identifier as GroupName, endpoint.name as never),
      };
      groups[group.identifier] = groupHelpers;
    },
  });

  return groups;
}

export const api: {
  [G in GroupName]: GroupHelpers<G>;
} = createTanstackApi() as {
  [G in GroupName]: GroupHelpers<G>;
};
