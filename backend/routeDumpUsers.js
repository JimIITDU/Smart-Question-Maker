/* Temporary route dump utility for debugging.
   Run: node routeDumpUsers.js
*/
const app = require('./server');

function dump(stack, prefix = '') {
  for (const layer of stack) {
    if (layer.route && layer.route.path != null) {
      const methods = Object.keys(layer.route.methods || {}).filter((m) => layer.route.methods[m]);
      for (const method of methods) {
        const fullPath = prefix + String(layer.route.path);
        if (fullPath.startsWith('/api/users')) {
          console.log(method.toUpperCase(), fullPath);
        }
      }
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      // best-effort prefix reconstruction only when regexp is simple.
      // Express stores mount path in layer.regexp for some cases; for debugging we skip this.
      dump(layer.handle.stack, prefix);
    }
  }
}

dump(app._router.stack, '');

