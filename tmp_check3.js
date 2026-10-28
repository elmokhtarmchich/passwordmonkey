const http = require("http");
function fetch(p){
  return new Promise((res,rej)=>{
    http.get("http://localhost:3000"+p, r=>{
      let data="";
      r.on("data",d=>data+=d);
      r.on("end",()=>res({status:r.statusCode, headers:r.headers, body:data}));
    }).on("error",rej);
  });
}
(async()=>{
  const r1 = await fetch("/");
  const r2 = await fetch("/faq");
  const hasGen = /id=["\']generated-password["\']/.test(r1.body);
  const details = (r2.body.match(/<details/g)||[]).length;
  const gtm1 = /googletagmanager\.com\/gtm\.js\?id=GTM-TXRRC7RB/.test(r1.body);
  const gtm2 = /googletagmanager\.com\/gtm\.js\?id=GTM-TXRRC7RB/.test(r2.body);
  console.log(JSON.stringify({p1:{hasGeneratedPassword:hasGen, gtm:gtm1}, p2:{detailsCount:details, gtm:gtm2}}));
})();
