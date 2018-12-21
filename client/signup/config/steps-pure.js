/** @format */

/**
 * External dependencies
 */
import { noop } from 'lodash';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';

export function generateSteps( {
	addPlanToCart = noop,
	createAccount = noop,
	createSite = noop,
	createSiteOrDomain = noop,
	createSiteWithCart = noop,
	currentPage = noop,
	setThemeOnSite = noop,
	removeUsernameTest = noop,
} = {} ) {
	return {
		survey: {
			stepName: 'survey',
			props: {
				surveySiteType:
					currentPage && currentPage.toString().match( /\/start\/(blog|delta-blog)/ )
						? 'blog'
						: 'site',
			},
			providesDependencies: [ 'surveySiteType', 'surveyQuestion' ],
		},

		themes: {
			stepName: 'themes',
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'themeSlugWithRepo' ],
		},

		'blog-themes': {
			stepName: 'blog-themes',
			props: {
				designType: 'blog',
			},
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'themeSlugWithRepo' ],
		},

		'website-themes': {
			stepName: 'website-themes',
			props: {
				designType: 'page',
			},
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'themeSlugWithRepo' ],
		},

		'portfolio-themes': {
			stepName: 'portfolio-themes',
			props: {
				designType: 'grid',
			},
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'themeSlugWithRepo' ],
		},

		// `themes` does not update the theme for an existing site as we normally
		// do this when the site is created. In flows where a site is merely being
		// updated, we need to use a different API request function.
		'themes-site-selected': {
			stepName: 'themes-site-selected',
			dependencies: [ 'siteSlug', 'themeSlugWithRepo' ],
			providesDependencies: [ 'themeSlugWithRepo' ],
			apiRequestFunction: setThemeOnSite,
			props: {
				headerText: i18n.translate( 'Choose a theme for your new site.' ),
			},
		},

		'plans-site-selected': {
			// This should be called plans-without-free
			stepName: 'plans-site-selected',
			apiRequestFunction: addPlanToCart,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
		},

		'design-type': {
			stepName: 'design-type',
			providesDependencies: [ 'designType', 'themeSlugWithRepo' ],
		},

		'design-type-with-store': {
			stepName: 'design-type-with-store',
			providesDependencies: [ 'designType', 'themeSlugWithRepo' ],
		},

		'design-type-with-store-nux': {
			stepName: 'design-type-with-store-nux',
			providesDependencies: [ 'designType', 'themeSlugWithRepo' ],
		},

		site: {
			stepName: 'site',
			apiRequestFunction: createSite,
			providesDependencies: [ 'siteSlug' ],
		},

		'rebrand-cities-welcome': {
			stepName: 'rebrand-cities-welcome',
			apiRequestFunction: createSiteWithCart,
			providesDependencies: [ 'siteId', 'siteSlug', 'domainItem', 'themeItem' ],
			props: {
				isDomainOnly: false,
			},
			delayApiRequestUntilComplete: true,
		},

		about: {
			stepName: 'about',
			providesDependencies: [ 'designType', 'themeSlugWithRepo', 'siteTitle', 'surveyQuestion' ],
		},

		user: {
			stepName: 'user',
			apiRequestFunction: createAccount,
			providesToken: true,
			providesDependencies: [ 'bearer_token', 'username' ],
			unstorableDependencies: [ 'bearer_token' ],
			props: {
				isSocialSignupEnabled: config.isEnabled( 'signup/social' ),
				displayNameInput: removeUsernameTest === 'hideUsername',
				displayUsernameInput: removeUsernameTest !== 'hideUsername',
			},
		},

		'site-title': {
			stepName: 'site-title',
			providesDependencies: [ 'siteTitle' ],
		},

		test: {
			stepName: 'test',
		},

		plans: {
			// There should be no changes required to this step
			stepName: 'plans',
			apiRequestFunction: addPlanToCart,
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'cartItem' ],
		},

		'plans-store-nux': {
			stepName: 'plans-store-nux',
			apiRequestFunction: addPlanToCart,
			dependencies: [ 'siteSlug', 'domainItem' ],
			providesDependencies: [ 'cartItem' ],
		},

		// This step is the source of a lot of problems. We should really separate the creation of the site from the domain selection.
		// The suggestions here aren't necessary to implement but they might be useful.
		domains: {
			stepName: 'domains',
			apiRequestFunction: createSiteWithCart,
			providesDependencies: [ 'siteId', 'siteSlug', 'domainItem', 'themeItem' ], // I don't understnad why this step provides a theme item
			props: {
				isDomainOnly: false, // This should be a default so we only need to specify it if it's true
			},
			dependencies: [ 'themeSlugWithRepo' ], // I can't see why this is needed. We shouldn't need to know a theme to create a site
			delayApiRequestUntilComplete: true,
		},

		'domains-site-selected': {
			stepName: 'domains-site-selected',
			apiRequestFunction: addItemToCart, // This is a new function we'll need to create
			providesDependencies: [ 'domainItem' ], // This step will only need to provide a domain
			dependencies: [ 'siteSlug' ], // This is needed to add the domain to the cart
			//delayApiRequestUntilComplete: true, I don't think this should be needed. The signup flow should always wait for the dependencies to be met before calling the API
		},

		'domain-only': {
			stepName: 'domain-only',
			providesDependencies: [ 'siteId', 'siteSlug', 'domainItem' ],
			props: {
				isDomainOnly: true,
			},
		},

		'domains-store': {
			stepName: 'domains',
			apiRequestFunction: createSiteWithCart,
			providesDependencies: [ 'siteId', 'siteSlug', 'domainItem', 'themeItem' ],
			props: {
				isDomainOnly: false,
				forceDesignType: 'store',
			},
			delayApiRequestUntilComplete: true,
		},

		'domains-theme-preselected': {
			stepName: 'domains-theme-preselected',
			apiRequestFunction: createSiteWithCart,
			providesDependencies: [ 'siteId', 'siteSlug', 'domainItem', 'themeItem' ],
			props: {
				isDomainOnly: false,
			},
			delayApiRequestUntilComplete: true,
		},

		'jetpack-user': {
			stepName: 'jetpack-user',
			apiRequestFunction: createAccount,
			providesToken: true,
			props: {
				headerText: i18n.translate( 'Create an account for Jetpack' ),
				subHeaderText: i18n.translate( "You're moments away from connecting Jetpack." ),
			},
			providesDependencies: [ 'bearer_token', 'username' ],
		},

		'oauth2-user': {
			stepName: 'oauth2-user',
			apiRequestFunction: createAccount,
			props: {
				oauth2Signup: true,
			},
			providesToken: true,
			providesDependencies: [ 'bearer_token', 'username', 'oauth2_client_id', 'oauth2_redirect' ],
		},

		'oauth2-name': {
			stepName: 'oauth2-name',
			apiRequestFunction: createAccount,
			providesToken: true,
			providesDependencies: [ 'bearer_token', 'username', 'oauth2_client_id', 'oauth2_redirect' ],
			props: {
				isSocialSignupEnabled: config.isEnabled( 'signup/social' ),
				oauth2Signup: true,
				displayNameInput: true,
				displayUsernameInput: false,
			},
		},

		displayname: {
			stepName: 'displayname',
			apiRequestFunction: createAccount,
			providesToken: true,
			providesDependencies: [ 'bearer_token', 'username' ],
			unstorableDependencies: [ 'bearer_token' ],
			props: {
				isSocialSignupEnabled: config.isEnabled( 'signup/social' ),
				displayNameInput: true,
				displayUsernameInput: false,
			},
		},

		'get-dot-blog-plans': {
			apiRequestFunction: createSiteWithCart,
			stepName: 'get-dot-blog-plans',
			dependencies: [ 'cartItem' ],
			providesDependencies: [ 'cartItem', 'siteSlug', 'siteId', 'domainItem', 'themeItem' ],
		},

		'get-dot-blog-themes': {
			stepName: 'get-dot-blog-themes',
			props: {
				designType: 'blog',
			},
			dependencies: [ 'siteSlug' ],
			providesDependencies: [ 'themeSlugWithRepo' ],
		},

		// Currently, these two steps explicitly submit other steps to skip them, and
		// should not be used outside of the `domain-first` flow.
		'site-or-domain': {
			stepName: 'site-or-domain',
			props: {
				headerText: i18n.translate( 'Choose how you want to use your domain.' ),
				subHeaderText: i18n.translate(
					"Don't worry you can easily add a site later if you're not ready."
				),
			},
			providesDependencies: [
				'designType',
				'siteId',
				'siteSlug',
				'siteUrl',
				'domainItem',
				'themeSlugWithRepo',
			],
		},
		'site-picker': {
			stepName: 'site-picker',
			apiRequestFunction: createSiteOrDomain,
			props: {
				headerText: i18n.translate( 'Choose your site?' ),
			},
			providesDependencies: [ 'siteId', 'siteSlug', 'domainItem', 'themeSlugWithRepo' ],
			dependencies: [ 'cartItem', 'designType', 'domainItem', 'siteUrl', 'themeSlugWithRepo' ],
			delayApiRequestUntilComplete: true,
		},

		'creds-complete': {
			stepName: 'creds-complete',
			providesDependencies: [],
		},

		'creds-confirm': {
			stepName: 'creds-confirm',
			providesDependencies: [ 'rewindconfig' ],
		},

		'creds-permission': {
			stepName: 'creds-permission',
			providesDependencies: [ 'rewindconfig' ],
		},

		'rewind-migrate': {
			stepName: 'rewind-migrate',
			providesDependencies: [ 'rewindconfig' ],
		},

		'rewind-were-backing': {
			stepName: 'rewind-were-backing',
			providesDependencies: [],
		},

		'rewind-add-creds': {
			stepName: 'rewind-add-creds',
			providesDependencies: [],
		},

		'rewind-form-creds': {
			stepName: 'rewind-form-creds',
			providesDependencies: [ 'rewindconfig' ],
		},

		'clone-start': {
			stepName: 'clone-start',
			providesDependencies: [ 'originSiteSlug', 'originSiteName', 'originBlogId' ],
		},

		'clone-destination': {
			stepName: 'clone-destination',
			providesDependencies: [ 'destinationSiteName', 'destinationSiteUrl' ],
		},

		'clone-credentials': {
			stepName: 'clone-credentials',
			providesDependencies: [ 'roleName' ],
		},

		'clone-point': {
			stepName: 'clone-point',
			providesDependencies: [ 'clonePoint' ],
		},

		'clone-jetpack': {
			stepName: 'clone-jetpack',
			providesDependencies: [ 'cloneJetpack' ],
		},

		'clone-ready': {
			stepName: 'clone-ready',
			providesDependencies: [],
		},

		'clone-cloning': {
			stepName: 'clone-cloning',
			providesDependencies: [],
		},

		/* Imports */
		'from-url': {
			stepName: 'from-url',
			providesDependencies: [ 'importSiteDetails', 'importUrl', 'themeSlugWithRepo' ],
		},

		'reader-landing': {
			stepName: 'reader-landing',
			providesDependencies: [],
		},

		/* Improved Onboarding */
		'site-type': {
			stepName: 'site-type',
			providesDependencies: [ 'siteType', 'themeSlugWithRepo' ],
		},

		'site-topic': {
			stepName: 'site-topic',
			providesDependencies: [ 'siteTopic' ],
		},

		'site-information': {
			stepName: 'site-information',
			providesDependencies: [ 'siteTitle', 'address', 'email', 'phone' ],
		},
	};
}

const steps = generateSteps();
export default steps;
