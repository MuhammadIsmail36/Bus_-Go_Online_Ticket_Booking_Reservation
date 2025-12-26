import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Dynamically load Umami analytics only when env variables are provided
const ANALYTICS_ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined;
const ANALYTICS_WEBSITE_ID = import.meta.env.VITE_ANALYTICS_WEBSITE_ID as string | undefined;

if (ANALYTICS_ENDPOINT && ANALYTICS_WEBSITE_ID) {
	try {
		const script = document.createElement("script");
		script.defer = true;
		// trim trailing slashes to avoid double slashes
		script.src = `${ANALYTICS_ENDPOINT.replace(/\/+$/g, "")}/umami`;
		(script as any).dataset.websiteId = ANALYTICS_WEBSITE_ID;
		document.head.appendChild(script);
	} catch (err) {
		// If analytics fails to load, don't block app
		// eslint-disable-next-line no-console
		console.warn("Failed to load analytics script:", err);
	}
}

createRoot(document.getElementById("root")!).render(<App />);
