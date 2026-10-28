import {chromium} from "playwright";
(async()=>{
  const b = await chromium.launch();
  const p1 = await b.newPage();
  const c1 = [];
  p1.on("console", m => {
    const t = m.type();
    if (t === "error" || t === "warning") c1.push({t, txt: m.text()});
  });
  await p1.goto("http://localhost:3000/", {waitUntil:"domcontentloaded"});
  const t1 = await p1.title();
  const g1 = await p1.$("#generated-password") !== null;
  const gt1 = await p1.$("script[src*=\"googletagmanager.com/gtm.js?id=GTM-TXRRC7RB\"]") !== null;
  const p2 = await b.newPage();
  const c2 = [];
  p2.on("console", m => {
    const t = m.type();
    if (t === "error" || t === "warning") c2.push({t, txt: m.text()});
  });
  await p2.goto("http://localhost:3000/faq", {waitUntil:"domcontentloaded"});
  const t2 = await p2.title();
  const d2 = await p2.$$eval("details", els => els.length);
  const gt2 = await p2.$("script[src*=\"googletagmanager.com/gtm.js?id=GTM-TXRRC7RB\"]") !== null;
  console.log(JSON.stringify({port:3000,p1:{title:t1,hasGeneratedPassword:g1,gtm:gt1,console:c1},p2:{title:t2,detailsCount:d2,gtm:gt2,console:c2}}));
  await b.close();
})();
