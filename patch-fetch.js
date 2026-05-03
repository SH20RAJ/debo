const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  console.log("GLOBAL FETCH INTERCEPT:", url);
  return originalFetch(url, options);
};
