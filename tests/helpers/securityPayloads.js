const SQLI_PAYLOADS = {
  unionSelect: "1' UNION SELECT * FROM users--",
  dropTable: 'drop table accounts;',
  alwaysTrue: "admin' OR 1=1 --",
  sleep: 'sleep(5)',
  script: '<script>alert(1)</script>',
  orQuoted: "' or '1'='1",
};

const PATH_PAYLOADS = {
  traversal: '../etc/passwd',
  encodedTraversal: '..%2f..%2fetc/passwd',
  doubleEncoded: '%2e%2e%2fsecrets',
  nullByte: 'file%00.env',
  envFile: '/config/.env',
  packageJson: '/package.json',
  nodeModules: '/node_modules/express/index.js',
  systemEtc: '/etc/shadow',
};

const CLEAN_PAYLOADS = {
  body: { name: 'acme', email: 'user@example.com' },
  query: { page: '1', limit: '10' },
  path: '/portal',
};

module.exports = { SQLI_PAYLOADS, PATH_PAYLOADS, CLEAN_PAYLOADS };
