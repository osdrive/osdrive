import { query } from "@solidjs/router";
import { useQuery } from "@tanstack/solid-query";
import { Effect, Schema } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { HttpApiClient } from "effect/unstable/httpapi";
import { Show, Suspense, createSignal } from "solid-js";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { demoApi, ErrorsResponse, MyErrorResponse } from "~/server/effect";

type HelloResult = {
	message: string;
	name: string;
};

type ErrorsResult = Schema.Schema.Type<typeof ErrorsResponse>;
type ApiErrorResult = Schema.Schema.Type<typeof MyErrorResponse>;
type UnexpectedQueryError = {
	_tag: "UnexpectedQueryError";
	message: string;
};

type ApiQueryError = ApiErrorResult | UnexpectedQueryError;

const demoClient = HttpApiClient.make(demoApi).pipe(
	Effect.provide(FetchHttpClient.layer),
);

const isMyErrorResponse = Schema.is(MyErrorResponse);

function toApiQueryError(cause: unknown): ApiQueryError {
	if (isMyErrorResponse(cause)) {
		return cause;
	}

	return {
		_tag: "UnexpectedQueryError",
		message: cause instanceof Error ? cause.message : "The demo request failed.",
	};
}

const myEffectQuery = query(async (): Promise<ErrorsResult> => {
	"use server";

	const client = await Effect.runPromise(demoClient);

	try {
		return await Effect.runPromise(
			client.demo.errors({}).pipe(Effect.withSpan("demo.page.call-errors-api")),
		);
	} catch (cause) {
		throw toApiQueryError(cause);
	}
}, "demo.errors");

export default function DemoPage() {
	const [name, setName] = createSignal("");
	const [pending, setPending] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);
	const [result, setResult] = createSignal<HelloResult | null>(null);

	const handleSubmit = async (event: SubmitEvent) => {
		event.preventDefault();

		const trimmedName = name().trim();
		if (!trimmedName) {
			setError("Enter a name to call the demo API.");
			setResult(null);
			return;
		}

		setPending(true);
		setError(null);
		setResult(null);

		try {
			const client = await Effect.runPromise(demoClient);
			const response = await Effect.runPromise(
				client.demo.hello({
					params: { name: trimmedName },
				}).pipe(Effect.withSpan("demo.page.call-demo-api")),
			);

			setResult(response);
		} catch (cause) {
			const message = cause instanceof Error ? cause.message : "The demo request failed.";
			setError(message);
		} finally {
			setPending(false);
		}
	};

	return (
		<div class="min-h-screen bg-stone-50 px-6 py-16 text-stone-900">
			<div class="mx-auto max-w-2xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
				<p class="mb-3 text-xs uppercase tracking-[0.2em] text-stone-400">Effect Demo</p>
				<h1 class="text-3xl font-light tracking-tight text-stone-900">Client call with trace propagation</h1>
				<p class="mt-3 text-sm leading-6 text-stone-500">
					This page calls the demo Effect HttpApi endpoint from the browser using the generated Effect client.
					 The request runs inside a client span so the API receives distributed tracing headers.
				</p>

				<form onSubmit={handleSubmit} class="mt-8 space-y-4">
					<div class="space-y-1.5">
						<label for="demo-name" class="text-sm font-medium text-stone-700">
							Name
						</label>
						<Input
							id="demo-name"
							type="text"
							required
							placeholder="Ada Lovelace"
							value={name()}
							onInput={(event) => setName(event.currentTarget.value)}
							class="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-colors"
						/>
					</div>

					<div class="flex items-center gap-3">
						<Button type="submit" disabled={pending()} class="rounded-xl px-5">
							{pending() ? "Calling API..." : "Call demo API"}
						</Button>
						<Show when={pending()}>
							<p class="text-sm text-stone-500">Sending `traceparent` with the request.</p>
						</Show>
					</div>
				</form>

				<Show when={error()}>
					{(message) => (
						<div class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
							{message()}
						</div>
					)}
				</Show>

				<Show when={result()}>
					{(value) => (
						<div class="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5">
							<p class="text-sm font-medium text-stone-700">Response</p>
							<pre class="mt-3 overflow-x-auto rounded-xl bg-stone-900 p-4 text-sm text-stone-100">
								{JSON.stringify(value(), null, 2)}
							</pre>
						</div>
					)}
				</Show>

				<FetchingDemo />
			</div>
		</div>
	);
}

function FetchingDemo() {
	const data = useQuery<ErrorsResult, ApiQueryError>(() => ({
		queryKey: ["demo", "errors"],
		queryFn: () => myEffectQuery(),
		staleTime: 30_000,
		retry: false,
	}));

	return (
		<div class="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5">
			<p class="text-sm font-medium text-stone-700">TanStack Query</p>
			<p class="mt-2 text-sm leading-6 text-stone-500">
				This uses a cached Solid server query to call the typed Effect endpoint and return either the
				success payload or a typed error object.
			</p>

			<Suspense fallback={<p class="mt-4 text-sm text-stone-500">Loading...</p>}>
				<Show when={data.error}>
					{(queryError) => (
						<div class="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
							<pre class="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(queryError(), null, 2)}</pre>
						</div>
					)}
				</Show>

				<Show when={data.data}>
					{(value) => (
						<pre class="mt-4 overflow-x-auto rounded-xl bg-stone-900 p-4 text-sm text-stone-100">
							{JSON.stringify(value(), null, 2)}
						</pre>
					)}
				</Show>

				<div class="mt-4 flex gap-3">
					<Button onClick={() => data.refetch()}>Refetch</Button>
				</div>
			</Suspense>
		</div>
	);
}
