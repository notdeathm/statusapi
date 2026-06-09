(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,16260,(e,t,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0});var a={formatUrl:function(){return i},formatWithValidation:function(){return c},urlObjectKeys:function(){return l}};for(var s in a)Object.defineProperty(n,s,{enumerable:!0,get:a[s]});let r=e.r(81883)._(e.r(74548)),o=/https?|ftp|gopher|file/;function i(e){let{auth:t,hostname:n}=e,a=e.protocol||"",s=e.pathname||"",i=e.hash||"",l=e.query||"",c=!1;t=t?encodeURIComponent(t).replace(/%3A/i,":")+"@":"",e.host?c=t+e.host:n&&(c=t+(~n.indexOf(":")?`[${n}]`:n),e.port&&(c+=":"+e.port)),l&&"object"==typeof l&&(l=String(r.urlQueryToSearchParams(l)));let u=e.search||l&&`?${l}`||"";return a&&!a.endsWith(":")&&(a+=":"),e.slashes||(!a||o.test(a))&&!1!==c?(c="//"+(c||""),s&&"/"!==s[0]&&(s="/"+s)):c||(c=""),i&&"#"!==i[0]&&(i="#"+i),u&&"?"!==u[0]&&(u="?"+u),s=s.replace(/[?#]/g,encodeURIComponent),u=u.replace("#","%23"),`${a}${c}${s}${u}${i}`}let l=["auth","hash","host","hostname","href","path","pathname","port","protocol","query","search","slashes"];function c(e){return i(e)}},94513,(e,t,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"useMergedRef",{enumerable:!0,get:function(){return s}});let a=e.r(66220);function s(e,t){let n=(0,a.useRef)(null),s=(0,a.useRef)(null);return(0,a.useCallback)(a=>{if(null===a){let e=n.current;e&&(n.current=null,e());let t=s.current;t&&(s.current=null,t())}else e&&(n.current=r(e,a)),t&&(s.current=r(t,a))},[e,t])}function r(e,t){if("function"!=typeof e)return e.current=t,()=>{e.current=null};{let n=e(t);return"function"==typeof n?n:()=>e(null)}}("function"==typeof n.default||"object"==typeof n.default&&null!==n.default)&&void 0===n.default.__esModule&&(Object.defineProperty(n.default,"__esModule",{value:!0}),Object.assign(n.default,n),t.exports=n.default)},57990,(e,t,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"isLocalURL",{enumerable:!0,get:function(){return r}});let a=e.r(94709),s=e.r(30059);function r(e){if(!(0,a.isAbsoluteUrl)(e))return!0;try{let t=(0,a.getLocationOrigin)(),n=new URL(e,t);return n.origin===t&&(0,s.hasBasePath)(n.pathname)}catch(e){return!1}}},64481,(e,t,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"errorOnce",{enumerable:!0,get:function(){return a}});let a=e=>{}},67549,(e,t,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0});var a={default:function(){return y},useLinkStatus:function(){return b}};for(var s in a)Object.defineProperty(n,s,{enumerable:!0,get:a[s]});let r=e.r(81883),o=e.r(60437),i=r._(e.r(66220)),l=e.r(16260),c=e.r(43066),u=e.r(94513),d=e.r(94709),p=e.r(78245);e.r(72787);let h=e.r(50628),f=e.r(19843),m=e.r(57990),v=e.r(56797);function y(t){var n,a;let s,r,y,[b,g]=(0,i.useOptimistic)(f.IDLE_LINK_STATUS),x=(0,i.useRef)(null),{href:N,as:w,children:k,prefetch:P=null,passHref:S,replace:O,shallow:_,scroll:T,onClick:$,onMouseEnter:C,onTouchStart:R,legacyBehavior:E=!1,onNavigate:I,transitionTypes:U,ref:A,unstable_dynamicOnHover:D,...L}=t;s=k,E&&("string"==typeof s||"number"==typeof s)&&(s=(0,o.jsx)("a",{children:s}));let M=i.default.useContext(c.AppRouterContext),B=!1!==P,K=!1!==P?null===(a=P)||"auto"===a?v.FetchStrategy.PPR:v.FetchStrategy.Full:v.FetchStrategy.PPR,q="string"==typeof(n=w||N)?n:(0,l.formatUrl)(n);if(E){if(s?.$$typeof===Symbol.for("react.lazy"))throw Object.defineProperty(Error("`<Link legacyBehavior>` received a direct child that is either a Server Component, or JSX that was loaded with React.lazy(). This is not supported. Either remove legacyBehavior, or make the direct child a Client Component that renders the Link's `<a>` tag."),"__NEXT_ERROR_CODE",{value:"E863",enumerable:!1,configurable:!0});r=i.default.Children.only(s)}let F=E?r&&"object"==typeof r&&r.ref:A,J=i.default.useCallback(e=>(null!==M&&(x.current=(0,f.mountLinkInstance)(e,q,M,K,B,g)),()=>{x.current&&((0,f.unmountLinkForCurrentNavigation)(x.current),x.current=null),(0,f.unmountPrefetchableInstance)(e)}),[B,q,M,K,g]),z={ref:(0,u.useMergedRef)(J,F),onClick(t){E||"function"!=typeof $||$(t),E&&r.props&&"function"==typeof r.props.onClick&&r.props.onClick(t),!M||t.defaultPrevented||function(t,n,a,s,r,o,l){if("u">typeof window){let c,{nodeName:u}=t.currentTarget;if("A"===u.toUpperCase()&&((c=t.currentTarget.getAttribute("target"))&&"_self"!==c||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey||t.nativeEvent&&2===t.nativeEvent.which)||t.currentTarget.hasAttribute("download"))return;if(!(0,m.isLocalURL)(n)){s&&(t.preventDefault(),location.replace(n));return}if(t.preventDefault(),o){let e=!1;if(o({preventDefault:()=>{e=!0}}),e)return}let{dispatchNavigateAction:d}=e.r(63926);i.default.startTransition(()=>{d(n,s?"replace":"push",!1===r?h.ScrollBehavior.NoScroll:h.ScrollBehavior.Default,a.current,l)})}}(t,q,x,O,T,I,U)},onMouseEnter(e){E||"function"!=typeof C||C(e),E&&r.props&&"function"==typeof r.props.onMouseEnter&&r.props.onMouseEnter(e),M&&B&&(0,f.onNavigationIntent)(e.currentTarget,!0===D)},onTouchStart:function(e){E||"function"!=typeof R||R(e),E&&r.props&&"function"==typeof r.props.onTouchStart&&r.props.onTouchStart(e),M&&B&&(0,f.onNavigationIntent)(e.currentTarget,!0===D)}};return(0,d.isAbsoluteUrl)(q)?z.href=q:E&&!S&&("a"!==r.type||"href"in r.props)||(z.href=(0,p.addBasePath)(q)),y=E?i.default.cloneElement(r,z):(0,o.jsx)("a",{...L,...z,children:s}),(0,o.jsx)(j.Provider,{value:b,children:y})}e.r(64481);let j=(0,i.createContext)(f.IDLE_LINK_STATUS),b=()=>(0,i.useContext)(j);("function"==typeof n.default||"object"==typeof n.default&&null!==n.default)&&void 0===n.default.__esModule&&(Object.defineProperty(n.default,"__esModule",{value:!0}),Object.assign(n.default,n),t.exports=n.default)},88845,(e,t,n)=>{t.exports=e.r(61681)},70001,e=>{"use strict";var t=e.i(60437),n=e.i(67549),a=e.i(88845);e.s(["default",0,function(){let e=(0,a.usePathname)();return(0,t.jsx)("nav",{children:(0,t.jsx)("div",{className:"container",children:(0,t.jsxs)("div",{className:"nav-inner",children:[(0,t.jsxs)(n.default,{href:"/",className:"nav-logo",children:[(0,t.jsx)("div",{className:"nav-logo-mark",children:"S"}),(0,t.jsxs)("div",{children:[(0,t.jsx)("div",{className:"nav-title",children:"Status"}),(0,t.jsx)("div",{className:"nav-sub",children:"by NotDeath"})]})]}),(0,t.jsxs)("div",{className:"nav-links",children:[(0,t.jsxs)("div",{className:"nav-live-badge",children:[(0,t.jsx)("span",{className:"nav-live-dot"}),"LIVE"]}),(0,t.jsx)(n.default,{href:"/",className:`nav-link${"/"===e||"/statusapi"===e||"/statusapi/"===e?" active":""}`,children:"Dashboard"}),(0,t.jsx)(n.default,{href:"/api-docs",className:`nav-link${e?.includes("api-docs")?" active":""}`,children:"API Docs"})]})]})})})}])},17224,e=>{"use strict";var t=e.i(60437),n=e.i(66220),a=e.i(67549),s=e.i(70001);let r="https://notdeathm.github.io/statusapi";function o({method:e="GET",path:a,description:s,tabs:r,responsePreview:i,note:l}){let[c,u]=(0,n.useState)(r[0].key),d=r.find(e=>e.key===c)?.code??"";return(0,t.jsxs)("div",{className:"endpoint-card",children:[(0,t.jsxs)("div",{className:"endpoint-header",children:[(0,t.jsx)("span",{className:"method-badge",children:e}),(0,t.jsx)("span",{className:"endpoint-path",children:a}),(0,t.jsx)("span",{className:"endpoint-desc",children:s})]}),(0,t.jsxs)("div",{className:"endpoint-body",children:[l&&(0,t.jsx)("p",{style:{color:"var(--text-muted)",fontSize:13,marginBottom:14},children:l}),(0,t.jsx)("div",{className:"endpoint-section-title",children:"Command"}),(0,t.jsx)("div",{className:"tab-group",children:r.map(e=>(0,t.jsx)("button",{className:`tab-btn${c===e.key?" active":""}`,onClick:()=>u(e.key),children:e.label},e.key))}),(0,t.jsx)("div",{className:"code-block",children:d}),(0,t.jsx)("div",{className:"endpoint-section-title",children:"Response Preview"}),(0,t.jsx)("pre",{className:"code-block",children:i})]})]})}e.s(["default",0,function(){return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(s.default,{}),(0,t.jsx)("main",{children:(0,t.jsxs)("div",{className:"container",children:[(0,t.jsxs)("section",{className:"api-page-hero",children:[(0,t.jsx)(a.default,{href:"/",className:"back-link",children:"← Back to Dashboard"}),(0,t.jsx)("h1",{className:"api-page-title",children:"API Reference"}),(0,t.jsx)("p",{className:"api-page-desc",children:"Integrate status data into your own tools using these static JSON endpoints. All endpoints are publicly accessible — no API key required."})]}),(0,t.jsx)(o,{path:`${r}/status.json`,description:"Current status of all monitored services",note:"Returns the real-time status, response times, and 30-day uptime for each service.",tabs:[{key:"curl",label:"cURL",code:`curl -s ${r}/status.json | jq .`},{key:"wget",label:"wget",code:`wget -qO- ${r}/status.json`},{key:"js",label:"JavaScript",code:`const res = await fetch('${r}/status.json');
const data = await res.json();
console.log(data.allOperational ? 'All systems OK' : 'Issues detected');`},{key:"python",label:"Python",code:`import httpx
data = httpx.get('${r}/status.json').json()
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
}`}),(0,t.jsx)(o,{path:`${r}/history.json`,description:"30-day uptime history for all services",note:"Contains day-by-day uptime history for the last 30 days. Useful for trend analysis.",tabs:[{key:"curl",label:"cURL",code:`curl -s ${r}/history.json | jq .`},{key:"wget",label:"wget",code:`wget -qO- ${r}/history.json`},{key:"js",label:"JavaScript",code:`const res = await fetch('${r}/history.json');
const data = await res.json();
data.services.forEach(s => console.log(s.serviceName, s.overallUptime30d + '%'));`},{key:"python",label:"Python",code:`import httpx
data = httpx.get('${r}/history.json').json()
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
}`}),(0,t.jsx)(o,{path:`${r}/maintenance.json`,description:"Active maintenance windows",note:"Contains any active or scheduled maintenance windows. Empty object means no maintenance is scheduled.",tabs:[{key:"curl",label:"cURL",code:`curl -s ${r}/maintenance.json | jq .`},{key:"wget",label:"wget",code:`wget -qO- ${r}/maintenance.json`},{key:"js",label:"JavaScript",code:`const res = await fetch('${r}/maintenance.json');
const data = await res.json();
const active = Object.entries(data.services)
  .filter(([, v]) => v.isDown);
console.log(active.length, 'services in maintenance');`},{key:"python",label:"Python",code:`import httpx
data = httpx.get('${r}/maintenance.json').json()
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
}`}),(0,t.jsxs)("div",{className:"section-card",style:{marginBottom:40},children:[(0,t.jsx)("div",{className:"section-card-title",children:"Quick Integration Example"}),(0,t.jsx)("p",{style:{color:"var(--text-muted)",fontSize:13,marginBottom:14},children:"Embed a live status indicator in your own project:"}),(0,t.jsx)("pre",{className:"code-block",children:`// Fetch and display current status
async function checkStatus() {
  const res = await fetch('${r}/status.json');
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

checkStatus();`})]})]})}),(0,t.jsx)("footer",{children:(0,t.jsx)("div",{className:"container",children:(0,t.jsx)("div",{className:"footer-inner",children:(0,t.jsxs)("span",{className:"footer-text",children:["© ",new Date().getFullYear()," Status API · Made by"," ",(0,t.jsx)("a",{href:"https://notdeath.vercel.app",target:"_blank",rel:"noopener noreferrer",children:"NotDeath"})," · ",(0,t.jsx)("a",{href:"https://github.com/notdeathm/statusapi",target:"_blank",rel:"noopener noreferrer",children:"Open source"})]})})})})]})}])}]);