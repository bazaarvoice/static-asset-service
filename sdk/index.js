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
  var NS = config.namespace;
  var baseUrl = config.baseUrl;

  if (!NS) {
    throw new Error('Cannot initialize SDK without a namespace');
  }

  if (!baseUrl) {
    throw new Error('Cannot initialize SDK without a baseUrl');
  }

  if (!scriptLoader) {
    throw new Error('Cannot initialize SDK without a script loader');
  }

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
      // Callback is optional; a script that is just priming
      // the asset cache may choose not to provide a callback.
      callback = callback || function () {};

      function callbackIfComplete () {
        var found = 0;

        forEach(assets, function (asset) {
          if (checkDeps(asset)) {
            found++;
          }
        });

        function checkDeps (asset) {
          var response = registry.responses[asset];
          var fulfilled = false;

          if (!response) {
            return false;
          }

          var deps = response.length === 2 ? response[0] : [];

          if (deps.length === 0) {
            return true;
          }

          forEach(deps, function (dep) {
            fulfilled = checkDeps(dep);
          });

          return fulfilled;
        }

        if (assets.length !== found) {
          return;
        }

        callback.apply(null, map(assets, resolveAsset));
      }

      function resolveAsset (asset) {
        var response = registry.responses[asset];

        var deps = response[0];
        var fn = response[1];

        if (!fn) {
          fn = deps;
          deps = [];
        }

        var result = map(deps, resolveAsset);

        return result.length ? fn.apply(null, result) : fn();
      }

      var assetsToBeRequested = [];

      forEach(assets, function (asset) {
        if (registry.responses[asset]) {
          // There is already a fulfilled request for this asset
          callbackIfComplete();
          return;
        }

        if (registry.requests[asset]) {
          // There is already a pending request for this asset.
          // We want to be notified when that request completes.
          registry.requests[asset].push(callbackIfComplete);
          return;
        }

        // There is no pending request; we need to register our
        // interest in the asset, and queue it for requesting.
        registry.requests[asset] = [ callbackIfComplete ];

        assetsToBeRequested.push(asset);
      });

      // If we queued any requests, now we need to make them.
      if (assetsToBeRequested.length) {
        scriptLoader(makeURL(assetsToBeRequested), function (err) {
          if (err) {
            throw new Error('Failed to load ' + assetsToBeRequested.join(', '));
          }
        });
      }
    },

    define : _define
  };

  registry.require = sdk.require;

  return sdk;
};
