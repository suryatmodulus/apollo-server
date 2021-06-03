import {
  ApolloServerPlugin,
  GraphQLServerListener,
} from 'apollo-server-plugin-base';

export interface ApolloServerPluginLandingPageDefaultOptions {
  /**
   * By default, the landing page plugin uses the latest version of the landing
   * page published to Apollo's CDN. If you'd like to pin the current version,
   * pass the SHA served at
   * https://apollo-server-landing-page.cdn.apollographql.com/_latest/version.txt
   * here.
   */
  version?: string;
  /**
   * If set, displays the prod version of the site instead of the local-dev
   * version. If you are calling ApolloServerPluginLandingPageDefault yourself,
   * the default is false; if ApolloServerPluginLandingPageDefault is being
   * installed implicitly then it is true if the `NODE_ENV` environment variable
   * is `production`.
   */
  isProd?: boolean;
  // For Apollo use only.
  __internal_apolloStudioEnv__?: string;
}

/**
 * A basic landing page plugin displaying some text and a link to Studio Sandbox.
 */
export function ApolloServerPluginLandingPageDefault(
  options?: ApolloServerPluginLandingPageDefaultOptions,
): ApolloServerPlugin {
  const { version, isProd, __internal_apolloStudioEnv__ } = {
    version: '_latest',
    ...options,
  };
  return {
    serverWillStart({ apollo }): GraphQLServerListener {
      const { graphRef } = apollo;
      return {
        renderLandingPage() {
          const config = {
            graphRef,
            isProd,
            apolloStudioEnv: __internal_apolloStudioEnv__,
          };
          // A triple encoding! Wow! First we use JSON.stringify to turn our
          // object into a string. Then we encodeURIComponent so we don't have
          // to stress about what would happen if the config contained
          // `</script>`. Finally, we JSON.stringify it again, which in practice
          // just wraps it in a pair of double quotes (since there shouldn't be
          // any backslashes left after encodeURIComponent). The consumer of
          // this needs to decodeURIComponent and then JSON.parse; there's only
          // one JSON.parse because the outermost JSON string is parsed by the
          // JS parser itself.
          const encodedConfig = JSON.stringify(
            encodeURIComponent(JSON.stringify(config)),
          );

          const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link
      rel="icon"
      href="https://apollo-server-landing-page.cdn.apollographql.com/${version}/assets/favicon.png"
    />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro&display=swap"
      rel="stylesheet"
    />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Apollo server landing page" />
    <link
      rel="apple-touch-icon"
      href="https://apollo-server-landing-page.cdn.apollographql.com/${version}/assets/favicon.png"
    />
    <link
      rel="manifest"
      href="https://apollo-server-landing-page.cdn.apollographql.com/${version}/manifest.json"
    />
    <title>Apollo Server</title>
  </head>
  <body style="margin: 0; overflow-x: hidden; overflow-y: hidden">
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="react-root" style="width: 100vw; height: 100vh"></div>
    <script>window.landingPage = ${encodedConfig};</script>
    <script src="https://apollo-server-landing-page.cdn.apollographql.com/${version}/static/js/main.js"></script>
  </body>
</html>
          `;
          return { html };
        },
      };
    },
  };
}
