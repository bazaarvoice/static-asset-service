'use strict';

function forEach (arr, fn) {
  if (!arr) {
    return;
  }

  for (var i = 0; i < arr.length; i++) {
    fn(arr[i], i, arr);
  }
}

function map (arr, fn) {
  var ret = [];

  forEach(arr, function (val, i, originalArray) {
    ret.push(fn(val, i, originalArray));
  });

  return ret;
}

module.exports = function (config) {
  var scriptLoader = config.loader;
  var ns = config.namespace;
  var baseUrl = config.baseUrl;

  if (!ns) {
    throw new Error('Cannot initialize SDK without a namespace');
  }

  if (!baseUrl) {
    throw new Error('Cannot initialize SDK without a baseUrl');
  }

  if (!scriptLoader) {
    throw new Error('Cannot initialize SDK without a script loader');
  }

  var NS = window[ns] = window[ns] || {};

  var registry = NS._staticAssetRegistry = NS._staticAssetRegistry || {
    requests : {},
    responses : {},
    define : _define
  };

  function makeURL (requests) {
    return baseUrl + encodeURIComponent(requests.sort().join('+')) + '.js';
  }

  function _define (name, deps, value) {
    // There are no dependencies, so this is easy.
    if (!value) {
      value = deps;
      registry.responses[name] = [ value ];
    }
    else {
      registry.responses[name] = [ deps, value ];
    }

    forEach(registry.requests[name], function (fn) {
      fn(registry.responses[name]);
    });

    registry.requests[name] = null;
  }

  var sdk = {
    /**
     * Require the assets you need, and provide a callback
     * to be called when they are resolved.
     *
     * @param  {Array}   assets    An array of supported assets.
     * @param  {Function} callback The callback to be called when the
     *                             assets are resolved, with the assets
     *                             as its arguments in the same order
     *                             as the provided assets array.
     */
    require : function (assets, callback) {
      if (!baseUrl) {
        throw new Error('Base URL must be specified to require assets');
      }

      // The objects we will actually respond with.
      var responses = {};

      // The things we need to request.
      var requests = [];

      // How many things we have received.
      var count = 0;

      // This function runs when a dependency arrives.
      function makeHandler (asset) {
        return function (arr) {
          responses[asset] = arr;

          count++;
          callbackIfComplete();
        };
      }

      function callbackIfComplete () {
        if (assets.length !== count) {
          return;
        }

        callback.apply(null, map(assets, resolveAsset));
      }

      function resolveAsset (asset) {
        var response = responses[asset];
        var deps = response[0];
        var fn = response[1];

        if (!fn) {
          fn = deps;
          deps = [];
        }

        return fn.apply(null, map(deps, resolveAsset));
      }

      forEach(assets, function (asset) {
        var handler = makeHandler(asset);

        if (registry.responses[asset]) {
          // There is already a fulfilled request for this asset
          handler(registry.responses[asset]);
          return;
        }

        if (registry.requests[asset]) {
          // There is already a pending request for this asset.
          // We want to be notified when that request completes.
          registry.requests[asset].push(makeHandler(asset));
          return;
        }

        // There is no pending request; we need to register our
        // interest in the asset, and queue it for requesting.
        registry.requests[asset] = [ makeHandler(asset) ];

        requests.push(asset);
      });

      // If we queued any requests, now we need to make them.
      if (requests.length) {
        scriptLoader(makeURL(requests), function () {
          throw new Error('Failed to load ' + requests.join(', '));
        });
      }
    },

    define : _define
  };

  registry.require = sdk.require;

  return sdk;
};
