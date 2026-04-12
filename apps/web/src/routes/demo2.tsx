import { getRequestURL } from "@solidjs/start/http";
import { useAtomRefresh, useAtomResource } from "@effect/atom-solid";
import { Cause, Schema } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { AsyncResult, Atom, AtomHttpApi } from "effect/unstable/reactivity";
import type { JSX } from "solid-js";
import { createMemo, For, Show, Suspense } from "solid-js";
import { isServer } from "solid-js/web";
import { Button } from "~/components/ui/button";
import { demoApi, ErrorsResponse, MyErrorResponse } from "~/server/effect";

type ErrorsData = Schema.Schema.Type<typeof ErrorsResponse>;
type ErrorsError = Schema.Schema.Type<typeof MyErrorResponse>;
type ErrorsViewModel =
	| { _tag: "Success"; data: ErrorsData }
	| { _tag: "ApiError"; error: ErrorsError }
	| { _tag: "UnexpectedError"; message: string };

const isMyErrorResponse = Schema.is(MyErrorResponse);

export default function Demo2Page() {
	const errorsAtom = createMemo(() => {
		const client = AtomHttpApi.Service()("DemoAtomClient", {
			api: demoApi,
			httpClient: FetchHttpClient.layer,
			baseUrl: getBaseUrl(),
		});

		return client.query("demo", "errors", {});
	});
	const errorsViewAtom = createMemo(() =>
		Atom.map(errorsAtom(), (result): AsyncResult.AsyncResult<ErrorsViewModel, never> =>
			AsyncResult.matchWithError(result, {
				onInitial: () => AsyncResult.initial(),
				onSuccess: (success) =>
					AsyncResult.success({
						_tag: "Success",
						data: success.value,
					}),
				onError: (error) =>
					isMyErrorResponse(error)
						? AsyncResult.success({
							_tag: "ApiError",
							error,
						})
						: AsyncResult.success({
							_tag: "UnexpectedError",
							message: formatUnexpectedError(error),
						}),
				onDefect: (defect) =>
					AsyncResult.success({
						_tag: "UnexpectedError",
						message: formatUnexpectedError(defect),
					}),
			}),
		),
	);
	const [data] = useAtomResource(errorsViewAtom);
	const refresh = useAtomRefresh(errorsAtom);

	return (
		<div class="min-h-screen bg-stone-50 px-6 py-16 text-stone-900">
			<div class="mx-auto max-w-2xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
				<p class="mb-3 text-xs uppercase tracking-[0.2em] text-stone-400">Effect Atom Demo</p>
				<h1 class="text-3xl font-light tracking-tight text-stone-900">Typed `/api/errors` with Solid atoms</h1>
				<p class="mt-3 text-sm leading-6 text-stone-500">
					This page uses `AtomHttpApi.query` and `@effect/atom-solid` to fetch the existing
					 Effect HttpApi endpoint. Both the success payload and the API error payload are rendered
					 from the endpoint schemas.
				</p>

				<div class="mt-6 flex items-center gap-3">
					<Button onClick={refresh}>Refetch</Button>
					<Show when={data.loading}>
						<p class="text-sm text-stone-500">Refreshing typed atom state...</p>
					</Show>
				</div>

				<Suspense
					fallback={
						<div class="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-500">
							Loading `/api/errors`...
						</div>
					}
				>
					<Show when={data()}>
						{(value) => renderResult(value())}
					</Show>
				</Suspense>
			</div>
		</div>
	);
}

function getBaseUrl() {
	return isServer ? getRequestURL().origin : window.location.origin;
}

function SuccessView(props: { data: ErrorsData }) {
	return (
		<div class="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
			<p class="text-sm font-medium text-emerald-800">Typed success</p>
			<p class="mt-2 text-sm">Message: {props.data.message}</p>
			<pre class="mt-4 overflow-x-auto rounded-xl bg-stone-900 p-4 text-sm text-stone-100">
				{JSON.stringify(props.data, null, 2)}
			</pre>
		</div>
	);
}

function ErrorView(props: { error: ErrorsError }) {
	return (
		<div class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
			<p class="text-sm font-medium text-amber-800">Typed API error</p>
			<p class="mt-2 text-sm">Tag: {props.error._tag}</p>
			<p class="mt-1 text-sm">Message: {props.error.message}</p>
			<div class="mt-4">
				<p class="text-sm font-medium text-amber-800">Issues</p>
				<ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
					<For each={props.error.issues}>{(issue) => <li>{issue}</li>}</For>
				</ul>
			</div>
			<pre class="mt-4 overflow-x-auto rounded-xl bg-stone-900 p-4 text-sm text-stone-100">
				{JSON.stringify(props.error, null, 2)}
			</pre>
		</div>
	);
}

function UnexpectedFailureView(props: { message: string }) {
	return (
		<div class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900">
			<p class="text-sm font-medium text-red-700">Unexpected failure</p>
			<p class="mt-2 text-sm leading-6">
				The endpoint did not fail with its declared schema-backed error payload.
			</p>
			<pre class="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl bg-stone-900 p-4 text-sm text-stone-100">
				{props.message}
			</pre>
		</div>
	);
}

function renderResult(result: ErrorsViewModel): JSX.Element {
	switch (result._tag) {
		case "Success":
			return <SuccessView data={result.data} />;
		case "ApiError":
			return <ErrorView error={result.error} />;
		case "UnexpectedError":
			return <UnexpectedFailureView message={result.message} />;
	}
}

function formatUnexpectedError(error: unknown): string {
	if (Cause.isCause(error)) {
		return Cause.pretty(error);
	}

	if (error instanceof Error) {
		return error.message;
	}

	return typeof error === "string" ? error : JSON.stringify(error, null, 2);
}
