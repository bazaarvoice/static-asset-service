var registry = {
  requests : {},
  responses : {},
  define : define
};

function forEach (arr, fn) {
  if (!arr) {
    return;
  }

  for (var i = 0; i < arr.length; i++) {
    fn(arr[i], i, arr);
  }
}

function define (name, value) {
  registry.responses[name] = value;

  forEach(registry.requests[name], function (fn) {
    fn(value);
  });

  registry.requests[name] = null;
}

function callbackIfComplete (assets, responses, callback) {
  if (assets.length === responses.length) {
    callback.call(null, responses);
  }
}

module.exports = function (scriptLoader) {
  var baseUrl;

  function makeURL (requests) {
    return baseUrl + encodeURIComponent(requests.sort().join('+'));
  }

  var sdk = {
    setNamespace : function (ns) {
      var NS = window[ns] = window[ns] || {};

      NS._staticAssetRegistry = NS._staticAssetRegistry || {
        requests : {},
        responses : {},
        define : define
      };

      registry = NS._staticAssetRegistry;
    },

    setBaseURL : function (url) {
      baseUrl = url;
    },

    /**
     * Require the assets you need, and provide a callback
     * to be called when they are resolved.
     * @param  {Array}   assets    An array of supported assets.
     * @param  {Function} callback The callback to be called when the
     *                             assets are resolved, with the assets
     *                             as its arguments in the same order
     *                             as the provided assets array.
     * @return {[type]}            [description]
     */
    require : function (assets, callback) {
      if (!baseUrl) {
        throw new Error('Base URL must be specified to require assets');
      }

      var responses = [];
      var requests = [];
      var asset;
      var request;

      function makeHandler (i) {
        return function (a) {
          responses[i] = a;
          callbackIfComplete(assets, responses, callback);
        };
      }

      forEach(assets, function (asset, i) {
        if (responses[asset]) {
          // There is already a fulfilled request for this asset
          responses[i] = responses[asset];
          callbackIfComplete(assets, responses, callback);
          return;
        }

        if (registry.requests[asset]) {
          // There is already a pending request for this asset.
          // We want to be notified when that request completes.
          registry.requests[asset].push(makeHandler(i));
          return;
        }

        // There is no pending request; we need to register our
        // interest in the asset, and queue it for requesting.
        registry.requests[request] = [
          function (value) {
            responses[i] = value;
            callbackIfComplete(assets, responses, callback);
          }
        ];

        requests.push(asset);
      });

      // If we queued any requests, now we need to make them.
      if (requests.length) {
        scriptLoader(makeURL(requests), function () {
          throw new Error('Failed to load ' + requests.join(', '));
        });
      }
    },

    provide : define
  };

  return sdk;
};
