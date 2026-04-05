// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";
import { isServer } from "solid-js/web";
import posthog from 'posthog-js'

if (!isServer && !import.meta.env.DEV)
	posthog.init("phc_orzhsp3dg7CQQ28DnSuvKYzYGnwr4zotjwnQEBMZcAFN", {
		api_host: "/ph_Klc1N",
		ui_host: "https://us.posthog.com",
		defaults: "2026-01-30",
		capture_exceptions: true,
	});

mount(() => <StartClient />, document.getElementById("app")!);
