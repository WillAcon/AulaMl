import { browser, dev } from '$app/env';

/**
 * Google Analytics 4 — integración opcional.
 *
 * Se activa solo si existe PUBLIC_GA_MEASUREMENT_ID. En desarrollo no se carga
 * salvo que PUBLIC_GA_FORCE=true. Todos los eventos son no-op si GA no está activo,
 * así que se pueden llamar libremente desde cualquier componente.
 */

const GA_ID = String(import.meta.env.PUBLIC_GA_MEASUREMENT_ID ?? '').trim();
const FORCE_DEV = import.meta.env.PUBLIC_GA_FORCE === 'true';

export type AnalyticsParams = Record<string, string | number | boolean>;

interface QueuedEvent {
	name: string;
	params: AnalyticsParams;
}

const queue: QueuedEvent[] = [];
let initialized = false;
let active = false;
let lastPageKey = '';

declare global {
	interface Window {
		dataLayer: unknown[];
		gtag?: (...args: unknown[]) => void;
	}
}

/** Indica si hay un ID configurado (aunque no se haya cargado todavía). */
export function analyticsConfigured(): boolean {
	return GA_ID.length > 0 && !GA_ID.includes('XXXXXXXX');
}

/** Inicializa gtag una sola vez. Devuelve true si quedó activo. */
export function initAnalytics(): boolean {
	if (!browser || !analyticsConfigured() || initialized) return active;
	if (dev && !FORCE_DEV) return false;

	initialized = true;
	window.dataLayer = window.dataLayer || [];
	window.gtag = function gtag(...args: unknown[]) {
		window.dataLayer.push(args);
	};
	window.gtag('js', new Date());
	window.gtag('config', GA_ID, {
		send_page_view: false,
		anonymize_ip: true,
		debug_mode: dev
	});

	const script = document.createElement('script');
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
	document.head.appendChild(script);

	active = true;

	trackPageView(location.pathname + location.search, document.title);

	for (const event of queue.splice(0)) {
		window.gtag('event', event.name, event.params);
	}

	return true;
}

/** Registra una vista de página en navegaciones SPA. */
export function trackPageView(path: string, title?: string): void {
	if (!browser || !active) return;
	const key = path.split('#')[0];
	if (key === lastPageKey) return;
	lastPageKey = key;
	window.gtag?.('event', 'page_view', {
		page_path: path,
		page_location: location.href,
		page_title: title ?? document.title
	});
}

/** Envía un evento personalizado a GA4. */
export function trackEvent(name: string, params: AnalyticsParams = {}): void {
	if (!browser || !analyticsConfigured()) return;
	if (!active) {
		if (queue.length < 25) queue.push({ name, params });
		return;
	}
	window.gtag?.('event', name, params);
}
