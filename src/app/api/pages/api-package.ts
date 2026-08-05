import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LAYER_LABELS } from '../api.model';
import { API, findPackage } from '../content';

/** One package: what it is for, then every documented type in it. */
@Component({
  selector: 'api-package',
  imports: [RouterLink],
  templateUrl: './api-package.html',
  styleUrls: ['../../pages/wiki-page.scss', './api.scss'],
})
export class ApiPackageComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly id = input.required<string>();

  protected readonly pkg = computed(() => findPackage(this.id()));

  protected readonly layerLabel = computed(() => {
    const layer = this.pkg()?.layer;
    return layer ? LAYER_LABELS[layer] : '';
  });

  protected readonly detail = computed(() => {
    const html = this.pkg()?.detail;
    return html ? this.sanitizer.bypassSecurityTrustHtml(html) : null;
  });

  protected readonly types = computed(() =>
    (this.pkg()?.types ?? []).map((type) => ({
      ...type,
      anchor: anchorFor(type.name),
      detailHtml: type.detail
        ? this.sanitizer.bypassSecurityTrustHtml(type.detail)
        : null,
    })),
  );

  /** Previous and next package, so the reference can be read straight through. */
  protected readonly links = computed(() => {
    const at = API.findIndex((pkg) => pkg.id === this.id());
    return {
      previous: at > 0 ? API[at - 1] : undefined,
      next: at >= 0 && at < API.length - 1 ? API[at + 1] : undefined,
    };
  });
}

/**
 * A stable anchor for a type.
 *
 * Some entries name several related types at once ("SeriesDetails / Season / Episode"),
 * because documenting them apart would say the same thing three times. The slug keeps those
 * addressable rather than leaving them without an anchor.
 */
function anchorFor(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
