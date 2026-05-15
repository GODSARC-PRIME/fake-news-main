## GitHub Copilot Chat

- Extension: 0.46.2 (prod)
- VS Code: 1.118.1 (034f571df509819cc10b0c8129f66ef77a542f0e)
- OS: win32 10.0.26200 x64
- GitHub Account: GODSARC-PRIME

## Network

User Settings:
```json
  "http.systemCertificatesNode": true,
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: Error (142 ms): getaddrinfo ENOTFOUND api.github.com
- DNS ipv6 Lookup: timed out after 10 seconds
- Proxy URL: None (1 ms)
- Electron fetch (configured): timed out after 10 seconds
- Node.js https: Error (37 ms): Error: getaddrinfo ENOTFOUND api.github.com
	at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
- Node.js fetch: Error (64 ms): TypeError: fetch failed
	at node:internal/deps/undici/undici:14902:13
	at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
	at async t._fetch (c:\Users\ENNY\AppData\Local\Programs\Microsoft VS Code\034f571df5\resources\app\extensions\copilot\dist\extension.js:5325:5229)
	at async t.fetch (c:\Users\ENNY\AppData\Local\Programs\Microsoft VS Code\034f571df5\resources\app\extensions\copilot\dist\extension.js:5325:4541)
	at async u (c:\Users\ENNY\AppData\Local\Programs\Microsoft VS Code\034f571df5\resources\app\extensions\copilot\dist\extension.js:5357:186)
	at async Pg._executeContributedCommand (file:///c:/Users/ENNY/AppData/Local/Programs/Microsoft%20VS%20Code/034f571df5/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:503:48675)
  Error: getaddrinfo ENOTFOUND api.github.com
  	at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)

Connecting to https://api.githubcopilot.com/_ping:
- DNS ipv4 Lookup: Error (1 ms): getaddrinfo ENOTFOUND api.githubcopilot.com
- DNS ipv6 Lookup: timed out after 10 seconds
- Proxy URL: None (22 ms)
- Electron fetch (configured): timed out after 10 seconds
- Node.js https: timed out after 10 seconds
- Node.js fetch: Error (36 ms): TypeError: fetch failed
	at node:internal/deps/undici/undici:14902:13
	at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
	at async t._fetch (c:\Users\ENNY\AppData\Local\Programs\Microsoft VS Code\034f571df5\resources\app\extensions\copilot\dist\extension.js:5325:5229)
	at async t.fetch (c:\Users\ENNY\AppData\Local\Programs\Microsoft VS Code\034f571df5\resources\app\extensions\copilot\dist\extension.js:5325:4541)
	at async u (c:\Users\ENNY\AppData\Local\Programs\Microsoft VS Code\034f571df5\resources\app\extensions\copilot\dist\extension.js:5357:186)
	at async Pg._executeContributedCommand (file:///c:/Users/ENNY/AppData/Local/Programs/Microsoft%20VS%20Code/034f571df5/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:503:48675)
  Error: getaddrinfo ENOTFOUND api.githubcopilot.com
  	at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)

Connecting to https://copilot-proxy.githubusercontent.com/_ping:
- DNS ipv4 Lookup: Error (1 ms): getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
- DNS ipv6 Lookup: timed out after 10 seconds
- Proxy URL: None (3 ms)
- Electron fetch (configured): timed out after 10 seconds
- Node.js https: Error (24 ms): Error: getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
	at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
- Node.js fetch: Error (58 ms): TypeError: fetch failed
	at node:internal/deps/undici/undici:14902:13
	at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
	at async t._fetch (c:\Users\ENNY\AppData\Local\Programs\Microsoft VS Code\034f571df5\resources\app\extensions\copilot\dist\extension.js:5325:5229)
	at async t.fetch (c:\Users\ENNY\AppData\Local\Programs\Microsoft VS Code\034f571df5\resources\app\extensions\copilot\dist\extension.js:5325:4541)
	at async u (c:\Users\ENNY\AppData\Local\Programs\Microsoft VS Code\034f571df5\resources\app\extensions\copilot\dist\extension.js:5357:186)
	at async Pg._executeContributedCommand (file:///c:/Users/ENNY/AppData/Local/Programs/Microsoft%20VS%20Code/034f571df5/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:503:48675)
  Error: getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
  	at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)

Connecting to https://mobile.events.data.microsoft.com: Error (7319 ms): Error: net::ERR_NAME_NOT_RESOLVED
	at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
	at SimpleURLLoaderWrapper.emit (node:events:519:28)
  {"is_request_error":true,"network_process_crashed":false}
Connecting to https://dc.services.visualstudio.com: timed out after 10 seconds
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: Error (22 ms): Error: getaddrinfo ENOTFOUND copilot-telemetry.githubusercontent.com
	at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: Error (39 ms): Error: getaddrinfo ENOTFOUND copilot-telemetry.githubusercontent.com
	at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
Connecting to https://default.exp-tas.com: Error (40 ms): Error: getaddrinfo ENOTFOUND default.exp-tas.com
	at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)

Number of system certificates: 80

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).
