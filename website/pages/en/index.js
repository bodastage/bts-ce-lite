/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

class HomeSplash extends React.Component {
  render() {
    const {siteConfig, language = ''} = this.props;
    const {baseUrl, docsUrl} = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    );

    const Logo = props => (
      <div className="projectLogo">
        <img src={props.img_src} alt="Project Logo" />
      </div>
    );

    const ProjectTitle = () => (
      <h2 className="projectTitle">
        {siteConfig.title}
        <small>{siteConfig.tagline}</small>
      </h2>
    );

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
        <Logo img_src={`${baseUrl}img/undraw_monitor.svg`} />
        <div className="inner">
          <ProjectTitle siteConfig={siteConfig} />
          <PromoSection>
            <Button href="https://github.com/bodastage/bts-ce-lite/releases/tag/v0.2.3">Download v0.2.3</Button>
            <Button href={docUrl('introduction.html#quick-start')}>Quick start</Button>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

class Index extends React.Component {
  render() {
    const {config: siteConfig, language = ''} = this.props;
    const {baseUrl} = siteConfig;

    const Block = props => (
      <Container
        padding={['bottom', 'top']}
        id={props.id}
        background={props.background}>
        <GridBlock
          align="center"
          contents={props.children}
          layout={props.layout}
        />
      </Container>
    );

    const FeatureCallout = () => (
      <div
        className="productShowcaseSection paddingBottom"
        style={{textAlign: 'center'}}>
        <h2><a href="https://github.com/bodastage/bts-ce-lite/releases">v0.3.0-alpha.5 is available for testing</a></h2>
        <MarkdownBlock>This is a pre-release version.</MarkdownBlock>
      </div>
    );

    const ReportsBlock = () => (
      <Block id="try">
        {[
          {
            content:
              'You have the ability to create an unlimited number of reports of various kinds. ' +
              'Boda-Lite also comes with a number of in-built useful reports such as key cell parameters',
            image: `${baseUrl}img/reports_module.png`,
            imageAlign: 'left',
            title: 'Creation of unlimited reports',
          },
        ]}
      </Block>
    );

    const GISBlock = () => (
      <Block background="dark">
        {[
          {
            content:
              'Provides intuitive interface for searching network entities (such as cells and relations) and displaying their parameters.',
            image: `${baseUrl}img/gis.jpeg`,
            imageAlign: 'right',
            title: 'Advanced GIS Module',
          },
        ]}
      </Block>
    );

    const ParseImportBlock = () => (
      <Block background="light">
        {[
          {
            content:
              'Boda-Lite processes configuraiton management(CM), performance management(PM), inventory, and fault management dumps.',
            image: `${baseUrl}img/parse_and_import.png`,
            imageAlign: 'right',
            title: 'Process various network dump formats',
          },
        ]}
      </Block>
    );

    const Features = () => (
      <Block layout="fourColumn">
        {[
          {
            content: 'Support for the leading vendors i.e. Ericsson, Huawei, ZTE, Nokia, and Motorola. And support for 2G, 3G, 4G, and 5G',
            imageAlign: 'top',
			image: `${baseUrl}img/undraw_good_team_m7uu.svg`,
            title: 'Multi-vendor/technology',
          },
          {
            content: 'Parsing and loading multi network configuration and performance management dump formats',
			image: `${baseUrl}img/undraw_blooming_jtv6.svg`,
            imageAlign: 'top',
            title: 'Network dump processing',
          },
          {
            content: 'Supports the creation of tabular, graphical and composite/dashboard-like reports',
			image: `${baseUrl}img/undraw_visual_data_b1wx.svg`,
            imageAlign: 'top',
            title: 'Reporting',
          },
          {
            content: 'The GIS module displays and searches network entities with ease',
			image: `${baseUrl}img/undraw_map_1r69.svg`,
            imageAlign: 'top',
            title: 'GIS',
          },
        ]}
      </Block>
    );

    const Showcase = () => {
      if ((siteConfig.users || []).length === 0) {
        return null;
      }

      const showcase = siteConfig.users
        .filter(user => user.pinned)
        .map(user => (
          <a href={user.infoLink} key={user.infoLink}>
            <img src={user.image} alt={user.caption} title={user.caption} />
          </a>
        ));

      const pageUrl = page => baseUrl + (language ? `${language}/` : '') + page;

      return (
        <div className="productShowcaseSection paddingBottom">
          <h2>Who is Using This?</h2>
          <p>This project is used by all these people</p>
          <div className="logos">{showcase}</div>
          <div className="more-users">
            <a className="button" href={pageUrl('users.html')}>
              More {siteConfig.title} Users
            </a>
          </div>
        </div>
      );
    };

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">
          <Features />
          <FeatureCallout />
          <ParseImportBlock />
          <ReportsBlock />
          <GISBlock />
          <Showcase />
        </div>
      </div>
    );
  }
}

module.exports = Index;
