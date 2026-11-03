import { ArrowUpRight } from "lucide-react";
import {
  resolveProvider,
  SERVICES,
  canonicalProviderId,
} from "@/services/providers";
import type { Provider } from "@/lib/types";
export function ProviderLauncher({
  provider,
  title,
  direct,
}: {
  provider: Provider;
  title: string;
  direct?: string;
}) {
  const resolved = resolveProvider(provider.provider_id, title, direct);
  const s = SERVICES.find(
    (p) => p.id === canonicalProviderId(provider.provider_id),
  );
  return (
    <div className="provider-launch">
      <span
        className="service-mark"
        style={{ background: s?.color || "#3c414d" }}
      >
        {s?.mark || provider.provider_name.slice(0, 2)}
      </span>
      <strong>{provider.provider_name}</strong>
      {resolved ? (
        <a
          className="button small"
          href={resolved.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {resolved.label}
          <ArrowUpRight size={15} />
        </a>
      ) : (
        <span className="muted">Enlace oficial no disponible</span>
      )}
    </div>
  );
}
