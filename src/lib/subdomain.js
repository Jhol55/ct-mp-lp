export function getSubdomainFromHost(hostHeader) {
  if (!hostHeader) return "";

  let host = String(hostHeader).trim().toLowerCase();

  // Drop port (e.g. admin.localhost:3000). Support IPv6 ([::1]:3000).
  if (host.startsWith("[")) {
    const end = host.indexOf("]");
    if (end !== -1) host = host.slice(1, end);
  } else {
    host = host.split(":")[0] ?? host;
  }

  // Remove trailing dot if any.
  if (host.endsWith(".")) host = host.slice(0, -1);

  if (!host) return "";

  // IPs do not have subdomains.
  const isIPv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  const isIPv6 = host.includes(":");
  if (isIPv4 || isIPv6) return "";

  const baseDomains = ["maodepedra.com.br", "localhost"];

  for (const base of baseDomains) {
    if (host === base) return "";
    if (host === `www.${base}`) return "";

    const suffix = `.${base}`;
    if (host.endsWith(suffix)) {
      let sub = host.slice(0, -suffix.length);
      // Strip leading www (e.g. www.admin.localhost)
      if (sub === "www") return "";
      if (sub.startsWith("www.")) sub = sub.slice(4);
      return sub;
    }
  }

  // Fallback: best-effort for unexpected hosts.
  const firstLabel = host.split(".")[0] ?? "";
  if (!firstLabel || firstLabel === "www") return "";
  return firstLabel;
}

