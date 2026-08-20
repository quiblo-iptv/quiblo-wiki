/**
 * What Quiblo is, told to a search engine in the one format it does not have to guess at.
 *
 * Everything else on this site describes the software to a person. This describes it to a
 * machine, in schema.org's vocabulary, and it is the difference between a search engine
 * inferring that "Quiblo" might be a product and being told that it is one — with a licence,
 * a platform, a price of zero and a repository to check.
 *
 * **It is deliberately one block, written once, in the document head.** Structured data that
 * disagrees with the visible page is worse than none: search engines treat a mismatch as a
 * reason to distrust the whole document. Every field here is a fact stated somewhere on the
 * site in words, and nothing here is a claim the site does not also make out loud.
 *
 * Injected at boot rather than baked into `index.html` because the values come from the same
 * constants the pages use, and two copies of a version number is one copy that goes stale.
 */

/** The public origin. Everything schema.org needs an id for hangs off this. */
export const SITE_ORIGIN = 'https://quiblo-iptv.github.io/quiblo-wiki';

export const REPOSITORY = 'https://github.com/quiblo-iptv/quiblo-app';

/** 1200x630, the size every social card reader expects. Built by `tools/og-image.mjs`. */
export const SOCIAL_IMAGE = `${SITE_ORIGIN}/og-image.png`;

/**
 * The sentence the site leads with, and the one a search result will show.
 *
 * Under 160 characters on purpose — past that a search engine truncates, and a description
 * cut mid-clause reads as a page that could not say what it was.
 */
export const SITE_DESCRIPTION =
  'Quiblo is a free, open source IPTV player for Android phones and Android TV. ' +
  'Bring your own M3U or Xtream playlist — no ads, no accounts, no tracking.';

/**
 * Three linked entities rather than one.
 *
 * A `SoftwareApplication` says what the thing is. An `Organization` says who publishes it,
 * which is what a brand query resolves against. A `WebSite` carries the search action and the
 * name a result should be labelled with. They reference each other by `@id` so a crawler reads
 * them as one graph rather than three unrelated claims about the same page.
 */
export function siteGraph(): unknown {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_ORIGIN}/#software`,
        name: 'Quiblo',
        alternateName: 'Quiblo IPTV Player',
        description: SITE_DESCRIPTION,
        applicationCategory: 'MultimediaApplication',
        applicationSubCategory: 'IPTV player',
        operatingSystem: 'Android 11+, Android TV, Google TV',
        url: SITE_ORIGIN,
        downloadUrl: `${REPOSITORY}/releases/latest`,
        installUrl: `${REPOSITORY}/releases/latest`,
        codeRepository: REPOSITORY,
        programmingLanguage: 'Kotlin',
        license: 'https://www.gnu.org/licenses/gpl-3.0.html',
        image: SOCIAL_IMAGE,
        // Zero, stated as a price rather than left out. "Free" is the single most searched
        // word attached to this category, and an absent offer reads as an unknown one.
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        featureList: [
          'M3U and M3U8 playlists, by URL or local file',
          'Xtream Codes accounts',
          'Live TV, films and series with seasons and episodes',
          'Programme guide with now, next and a full timeline',
          'Subtitles and multiple audio tracks',
          'Android TV and Google TV, driven by a remote',
          'Continue watching, favourites and local profiles',
          'No ads, no accounts, no tracking and no backend',
        ],
        isAccessibleForFree: true,
        publisher: { '@id': `${SITE_ORIGIN}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_ORIGIN}/#organization`,
        name: 'Quiblo',
        url: SITE_ORIGIN,
        logo: SOCIAL_IMAGE,
        description: SITE_DESCRIPTION,
        // The front door is the canonical Organization; this one points at it so the two are
        // read as the same publisher rather than as two outfits with one name.
        sameAs: [
          'https://quiblo-iptv.github.io/',
          REPOSITORY,
          'https://github.com/quiblo-iptv',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_ORIGIN}/#website`,
        name: 'Quiblo',
        url: SITE_ORIGIN,
        description: SITE_DESCRIPTION,
        inLanguage: 'en',
        publisher: { '@id': `${SITE_ORIGIN}/#organization` },
        about: { '@id': `${SITE_ORIGIN}/#software` },
      },
    ],
  };
}

/**
 * The questions people actually type, answered where a search engine can read them.
 *
 * Kept short and honest. **Two of these answers say no**, and that is the point: "does it come
 * with channels" is the most common thing anybody asks this project, the answer is no, and a
 * page that dodges it collects exactly the audience it has to turn away.
 */
export function faqGraph(): unknown {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
}

/** Shown on the page and given to search engines, from one list, so they cannot disagree. */
export const FAQ: readonly { question: string; answer: string }[] = [
  {
    question: 'Is Quiblo free?',
    answer:
      'Yes. Quiblo is free software under the GPLv3, with no paid tier, no advertising and ' +
      'nothing paywalled. Every feature is in the build everybody gets.',
  },
  {
    question: 'Does Quiblo come with channels?',
    answer:
      'No. Quiblo ships with no channels, no films and no way to find any, and this project ' +
      'will not help you find a provider. It is a player, in the same category as VLC: you ' +
      'supply an M3U playlist or an Xtream Codes account that you already have.',
  },
  {
    question: 'What playlists does Quiblo support?',
    answer:
      'M3U and M3U8 playlists, either from a URL or a file on the device, and Xtream Codes ' +
      'accounts. It plays HLS, DASH, raw MPEG-TS and progressive MP4 or MKV.',
  },
  {
    question: 'Does Quiblo work on Android TV?',
    answer:
      'Yes. There is a separate television build with its own interface driven entirely by a ' +
      'remote, alongside the phone and tablet build. Both are in every release.',
  },
  {
    question: 'Does Quiblo track me?',
    answer:
      'No. There is no account, no telemetry and no server of ours anywhere in the path. ' +
      'Quiblo makes no network request to any host you did not configure yourself.',
  },
  {
    question: 'Where do I download Quiblo?',
    answer:
      'From the releases page on GitHub. Each release carries two APKs — one for phones and ' +
      'tablets, one for Android TV and Google TV — and they are signed with the same key.',
  },
];
