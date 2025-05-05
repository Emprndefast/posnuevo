// process polyfill
const process = {
  env: {},
  browser: true,
  version: '',
  platform: 'browser',
  nextTick: function(cb) {
    setTimeout(cb, 0);
  }
};

export default process; 