import { httpResource } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';

interface Address {
  city: string;
  zipCode: string;
}

interface Commune {
  nom: string;
  codesPostaux: string[];
}

function isCommune(value: unknown): value is Commune {
  return (
    !!value && typeof value === 'object' &&
    'nom' in value && typeof value.nom === 'string' &&
    'codesPostaux' in value && Array.isArray(value.codesPostaux) &&
    value.codesPostaux.every((code: unknown) =>
      typeof code === 'string' && /^\d{5}$/.test(code),
    )
  );
}

function normalizeCity(city: string): string {
  return city.normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[-’']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().toLowerCase();
}

@Injectable({ providedIn: 'root' })
export class PostalCodeService {
  private readonly query = signal<{ city: string; currentAddress: Address } | undefined>(undefined);
  private readonly city = computed(() => this.query()?.city);

  readonly postalCodes = httpResource(() => {
    const city = this.city();
    return city ? {
      url: 'https://geo.api.gouv.fr/communes',
      params: { nom: city, fields: 'nom,codesPostaux' },
      timeout: 10_000,
    } : undefined;
  }, {
    parse: (communes: unknown) => {
      if (!Array.isArray(communes) || !communes.every(isCommune)) {
        throw new Error('Postal-code lookup returned an invalid response');
      }
      return communes;
    },
  });

  readonly result = computed(() => {
    const query = this.query();
    if (!query || !this.postalCodes.hasValue()) return undefined;
    const communes = this.postalCodes.value();
    const matches: Address[] = communes
      .filter((commune) => normalizeCity(commune.nom) === normalizeCity(query.city))
      .flatMap((commune) => commune.codesPostaux.map((zipCode) => ({ city: commune.nom, zipCode })));
    const nearby = matches.filter((match) =>
      /^\d{5}$/.test(query.currentAddress.zipCode) &&
      match.zipCode.slice(0, 2) === query.currentAddress.zipCode.slice(0, 2),
    );
    const choices = matches.length === 1 ? matches : nearby;
    const address = choices.length === 1 ? choices[0] : null;
    return {
      status: address ? 'found' : matches.length ? 'ambiguous' : 'not_found',
      address,
      matches,
      currentAddress: query.currentAddress,
    };
  });

  lookup(city: string, currentAddress: Address): void {
    if (typeof city !== 'string' || !city.trim()) {
      throw new Error('A city name is required for the postal-code lookup');
    }
    const retry = this.city() === city.trim() && !!this.postalCodes.error();
    this.query.set({ city: city.trim(), currentAddress });
    if (retry) this.postalCodes.reload();
  }
}
