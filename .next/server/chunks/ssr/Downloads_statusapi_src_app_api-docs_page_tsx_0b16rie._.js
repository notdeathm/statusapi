module.exports=[32172,a=>{"use strict";var b=a.i(41058),c=a.i(54679),d=a.i(25283),e=a.i(47977);let f="https://notdeathm.github.io/statusapi";function g({method:a="GET",path:d,description:e,tabs:f,responsePreview:h,note:i}){let[j,k]=(0,c.useState)(f[0].key),l=f.find(a=>a.key===j)?.code??"";return(0,b.jsxs)("div",{className:"endpoint-card",children:[(0,b.jsxs)("div",{className:"endpoint-header",children:[(0,b.jsx)("span",{className:"method-badge",children:a}),(0,b.jsx)("span",{className:"endpoint-path",children:d}),(0,b.jsx)("span",{className:"endpoint-desc",children:e})]}),(0,b.jsxs)("div",{className:"endpoint-body",children:[i&&(0,b.jsx)("p",{style:{color:"var(--text-muted)",fontSize:13,marginBottom:14},children:i}),(0,b.jsx)("div",{className:"endpoint-section-title",children:"Command"}),(0,b.jsx)("div",{className:"tab-group",children:f.map(a=>(0,b.jsx)("button",{className:`tab-btn${j===a.key?" active":""}`,onClick:()=>k(a.key),children:a.label},a.key))}),(0,b.jsx)("div",{className:"code-block",children:l}),(0,b.jsx)("div",{className:"endpoint-section-title",children:"Response Preview"}),(0,b.jsx)("pre",{className:"code-block",children:h})]})]})}a.s(["default",0,function(){return(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(e.default,{}),(0,b.jsx)("main",{children:(0,b.jsxs)("div",{className:"container",children:[(0,b.jsxs)("section",{className:"api-page-hero",children:[(0,b.jsx)(d.default,{href:"/",className:"back-link",children:"← Back to Dashboard"}),(0,b.jsx)("h1",{className:"api-page-title",children:"API Reference"}),(0,b.jsx)("p",{className:"api-page-desc",children:"Integrate status data into your own tools using these static JSON endpoints. All endpoints are publicly accessible — no API key required."})]}),(0,b.jsx)(g,{path:`${f}/status.json`,description:"Current status of all monitored services",note:"Returns the real-time status, response times, and 30-day uptime for each service.",tabs:[{key:"curl",label:"cURL",code:`curl -s ${f}/status.json | jq .`},{key:"wget",label:"wget",code:`wget -qO- ${f}/status.json`},{key:"js",label:"JavaScript",code:`const res = await fetch('${f}/status.json');
const data = await res.json();
console.log(data.allOperational ? 'All systems OK' : 'Issues detected');`},{key:"python",label:"Python",code:`import httpx
data = httpx.get('${f}/status.json').json()
print('All OK:', data['allOperational'])`}],responsePreview:`{
  "success": true,
  "timestamp": "2026-06-07T01:55:50.820Z",
  "services": [
    {
      "service": {
        "id": "notdeath-website",
        "name": "NotDeath Website",
        "description": "Personal portfolio website",
        "url": "https://notdeath.vercel.app",
        "type": "http"
      },
      "currentStatus": {
        "serviceId": "notdeath-website",
        "status": "up",
        "statusCode": 200,
        "responseTime": 96,
        "timestamp": "2026-06-07T01:55:50.917Z",
        "uptime": 100
      },
      "uptime30d": 100
    }
  ],
  "totalServices": 3,
  "allOperational": true
}`}),(0,b.jsx)(g,{path:`${f}/history.json`,description:"30-day uptime history for all services",note:"Contains day-by-day uptime history for the last 30 days. Useful for trend analysis.",tabs:[{key:"curl",label:"cURL",code:`curl -s ${f}/history.json | jq .`},{key:"wget",label:"wget",code:`wget -qO- ${f}/history.json`},{key:"js",label:"JavaScript",code:`const res = await fetch('${f}/history.json');
const data = await res.json();
data.services.forEach(s => console.log(s.serviceName, s.overallUptime30d + '%'));`},{key:"python",label:"Python",code:`import httpx
data = httpx.get('${f}/history.json').json()
for svc in data['services']:
    print(svc['serviceName'], svc['overallUptime30d'])`}],responsePreview:`{
  "success": true,
  "timestamp": "2026-06-07T01:55:50.820Z",
  "services": [
    {
      "serviceId": "notdeath-website",
      "serviceName": "NotDeath Website",
      "overallUptime30d": 99.9,
      "history": [
        {
          "date": "2026-06-06",
          "status": "up",
          "responseTime": 92,
          "uptime": 100,
          "incidents": 0
        }
      ]
    }
  ]
}`}),(0,b.jsx)(g,{path:`${f}/maintenance.json`,description:"Active maintenance windows",note:"Contains any active or scheduled maintenance windows. Empty object means no maintenance is scheduled.",tabs:[{key:"curl",label:"cURL",code:`curl -s ${f}/maintenance.json | jq .`},{key:"wget",label:"wget",code:`wget -qO- ${f}/maintenance.json`},{key:"js",label:"JavaScript",code:`const res = await fetch('${f}/maintenance.json');
const data = await res.json();
const active = Object.entries(data.services)
  .filter(([, v]) => v.isDown);
console.log(active.length, 'services in maintenance');`},{key:"python",label:"Python",code:`import httpx
data = httpx.get('${f}/maintenance.json').json()
for id, info in data['services'].items():
    if info['isDown']:
        print(id, '-', info['reason'])`}],responsePreview:`{
  "services": {
    "my-service": {
      "isDown": true,
      "reason": "Scheduled database migration",
      "startTime": "2026-06-06T10:00:00Z",
      "estimatedDowntime": "2 hours"
    }
  }
}`}),(0,b.jsxs)("div",{className:"section-card",style:{marginBottom:40},children:[(0,b.jsx)("div",{className:"section-card-title",children:"Quick Integration Example"}),(0,b.jsx)("p",{style:{color:"var(--text-muted)",fontSize:13,marginBottom:14},children:"Embed a live status indicator in your own project:"}),(0,b.jsx)("pre",{className:"code-block",children:`// Fetch and display current status
async function checkStatus() {
  const res = await fetch('${f}/status.json');
  const data = await res.json();

  const badge = document.getElementById('status-badge');
  if (data.allOperational) {
    badge.textContent = '✓ All Systems Operational';
    badge.className = 'status-green';
  } else {
    const down = data.services.filter(s => s.currentStatus.status !== 'up');
    badge.textContent = \`⚠ \${down.length} service(s) affected\`;
    badge.className = 'status-red';
  }
}

checkStatus();`})]})]})}),(0,b.jsx)("footer",{children:(0,b.jsx)("div",{className:"container",children:(0,b.jsx)("div",{className:"footer-inner",children:(0,b.jsxs)("span",{className:"footer-text",children:["© ",new Date().getFullYear()," Status API · Made by"," ",(0,b.jsx)("a",{href:"https://notdeath.vercel.app",target:"_blank",rel:"noopener noreferrer",children:"NotDeath"})," · ",(0,b.jsx)("a",{href:"https://github.com/notdeathm/statusapi",target:"_blank",rel:"noopener noreferrer",children:"Open source"})]})})})})]})}])}];

//# sourceMappingURL=Downloads_statusapi_src_app_api-docs_page_tsx_0b16rie._.js.map