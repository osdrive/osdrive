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

type QueryHelper<G extends GroupName, E extends EndpointName<G>, Fn> = {
  <TData = DataOf<Fn>>(input: QueryInput<G, E, Fn, TData>): CreateQueryResult<TData, ErrorOf<Fn>>;
  useQuery<TData = DataOf<Fn>>(input: QueryInput<G, E, Fn, TData>): CreateQueryResult<TData, ErrorOf<Fn>>;
  options<TData = DataOf<Fn>>(
    input: QueryInput<G, E, Fn, TData>,
  ): CreateQueryOptions<DataOf<Fn>, ErrorOf<Fn>, TData, QueryKeyOf<G, E, Fn>>;
  key(...args: RequestArgsOf<Fn>): QueryKeyOf<G, E, Fn>;
  fetch(...args: RequestArgsOf<Fn>): Promise<DataOf<Fn>>;
};

type MutationHelper<G extends GroupName, E extends EndpointName<G>, Fn> = {
  (input: MutationInput<Fn>): CreateMutationResult<DataOf<Fn>, ErrorOf<Fn>, RequestOf<Fn>, unknown>;
  useMutation(
    input: MutationInput<Fn>,
  ): CreateMutationResult<DataOf<Fn>, ErrorOf<Fn>, RequestOf<Fn>, unknown>;
  options(
    input: MutationInput<Fn>,
  ): SolidMutationOptions<DataOf<Fn>, ErrorOf<Fn>, RequestOf<Fn>, unknown>;
  key(): readonly ["api", G, E, "mutation"];
  execute(...args: RequestArgsOf<Fn>): Promise<DataOf<Fn>>;
};

type GroupHelpers<G extends GroupName> = {
  query: {
    [E in EndpointName<G>]: QueryHelper<G, E, EndpointFn<G, E>>;
  };
  mutation: {
    [E in EndpointName<G>]: MutationHelper<G, E, EndpointFn<G, E>>;
  };
};

type TanstackApi = {
  [G in GroupName]: GroupHelpers<G>;
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
  group: string,
  endpoint: string,
  queryKey: QueryKey,
  client: { getQueryState: (key: QueryKey) => { dataUpdatedAt: number } | undefined; setQueryData: any },
) {
  const database = getQueryDatabase();
  if (!database || NON_PERSISTED_QUERIES.has(`${group}.${endpoint}`)) {
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

async function persistQueryResult(group: string, endpoint: string, queryKey: QueryKey, data: unknown) {
  const database = getQueryDatabase();
  if (!database || NON_PERSISTED_QUERIES.has(`${group}.${endpoint}`)) {
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
): QueryHelper<G, E, EndpointFn<G, E>> {
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
          void restorePersistedQuery<DataOf<Fn>>(group, endpoint, queryKey, context.client as any);
          const data = await networkPromise;
          void persistQueryResult(group, endpoint, queryKey, data);
          return data;
        },
      };
    };

  const optionsFor = <TData = DataOf<Fn>>(input: QueryInput<G, E, Fn, TData>) =>
    accessorFor(input) as unknown as CreateQueryOptions<
      DataOf<Fn>,
      ErrorOf<Fn>,
      TData,
      QueryKeyOf<G, E, Fn>
    >;

  const useQuery = <TData = DataOf<Fn>>(input: QueryInput<G, E, Fn, TData>) =>
    createQuery<DataOf<Fn>, ErrorOf<Fn>, TData, QueryKeyOf<G, E, Fn>>(accessorFor(input) as any);

  const helper = Object.assign(useQuery, {
    useQuery,
    options: optionsFor,
    key: (...args: RequestArgsOf<Fn>) => buildQueryKey<G, E, Fn>(group, endpoint, args[0]),
    fetch: (...args: RequestArgsOf<Fn>) => executeEndpoint(group, endpoint, args[0]),
  });

  return helper as unknown as QueryHelper<G, E, Fn>;
}

function makeMutationHelper<G extends GroupName, E extends EndpointName<G>>(
  group: G,
  endpoint: E,
): MutationHelper<G, E, EndpointFn<G, E>> {
  type Fn = EndpointFn<G, E>;

  const mutationKey = ["api", group, endpoint, "mutation"] as const;

  const optionsFor = (input: MutationInput<Fn>) =>
    mutationOptions<DataOf<Fn>, ErrorOf<Fn>, RequestOf<Fn>, unknown>({
      mutationKey,
      ...input(),
      mutationFn: (request) => executeEndpoint(group, endpoint, request),
    });

  const useMutation = (input: MutationInput<Fn>) =>
    createMutation<DataOf<Fn>, ErrorOf<Fn>, RequestOf<Fn>, unknown>(() => optionsFor(input));

  const helper = Object.assign(useMutation, {
    useMutation,
    options: optionsFor,
    key: () => mutationKey,
    execute: (...args: RequestArgsOf<Fn>) => executeEndpoint(group, endpoint, args[0]),
  });

  return helper as MutationHelper<G, E, Fn>;
}

function createTanstackApi() {
  const groups: Record<string, { query: Record<string, unknown>; mutation: Record<string, unknown> }> = {};

  HttpApi.reflect(osDriveApi, {
    onGroup({ group }) {
      if (!group.topLevel) {
        groups[group.identifier] = { query: {}, mutation: {} };
      }
    },
    onEndpoint({ group, endpoint }) {
      const groupHelpers = groups[group.identifier] ?? { query: {}, mutation: {} };
      if (endpoint.method === "GET") {
        groupHelpers.query[endpoint.name] = makeQueryHelper(
          group.identifier as GroupName,
          endpoint.name as never,
        );
      } else {
        groupHelpers.mutation[endpoint.name] = makeMutationHelper(
          group.identifier as GroupName,
          endpoint.name as never,
        );
      }
      groups[group.identifier] = groupHelpers;
    },
  });

  return groups as TanstackApi;
}

export const api = createTanstackApi();
