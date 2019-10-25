/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

// List of projects/orgs using your project for the users page.
const users = [
  {
    caption: 'Bodastage Solutions',
    // You will need to prepend the image path with your baseUrl
    // if it is not '/', like: '/test-site/img/image.jpg'.
    image: '/bts-ce-lite/img/bodastage_logo.png',
    infoLink: 'https://www.bodastage.com',
    pinned: true,
  },
];

const siteConfig = {
  title: 'Boda-Lite', // Title for your website.
  tagline: 'Multi-vendor/technology desktop telecommunication management app',
  url: 'https://bodastage.org', // Your website URL
  baseUrl: '/bts-ce-lite/', // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: 'bts-ce-lite',
  organizationName: 'bodastage',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    {doc: 'index', label: 'Docs'},
    {blog: true, label: 'Blog'},
	{page: 'users', label: 'Users'},
	{
      href: 'https://github.com/bodastage/bts-ce-lite',
      label: 'GitHub',
    }
    //{page: 'help', label: 'Help'},

  ],

  // If you have users set above, you add it here:
  users,

  /* path to images for header/footer */
  headerIcon: 'img/favicon.ico',
  footerIcon: 'img/favicon.ico',
  favicon: 'img/favicon.ico',

  /* Colors for website */
  colors: {
    primaryColor: '#829B47',
    secondaryColor: '#01783c',
  },

  /* Custom fonts for website */
  
  fonts: {
    myFont: [
		"-apple-system", 
		"BlinkMacSystemFont",
		"Segoe UI",
		"Roboto",
		"Helvetica Neue",
		"Arial",
		"sans-serif",
		"Apple Color Emoji",
		"Segoe UI Emoji",
		"Segoe UI Symbol"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },
  

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} Bodastage Solutions`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'default',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ['https://buttons.github.io/buttons.js'],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: 'img/undraw_online.svg',
  twitterImage: 'img/undraw_tweetstorm.svg',

  // For sites with a sizable amount of content, set collapsible to true.
  // Expand/collapse the links and subcategories under categories.
  // docsSideNavCollapsible: true,

  // Show documentation's last contributor's name.
  enableUpdateBy: true,

  // Show documentation's last update time.
  // enableUpdateTime: true,

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  repoUrl: 'https://github.com/bodastage/bts-ce-lite',
  scrollToTop: true,
  scrollToTopOptions: {
    zIndex: 100,
  },
  
  defaultVersionShown: '0.4.1',
  editUrl: 'https://github.com/bodastage/bts-ce-lite/edit/master/docs/',
};

module.exports = siteConfig;
