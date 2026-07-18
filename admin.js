(function () {
  "use strict";

  const SUPABASE_URL = "https://iuldhmfjxgmytjvodoaw.supabase.co";
  const SUPABASE_KEY = "sb_publishable_iQVoLxKT-aWZIQ22nmcPng_BGRzjBAH";
  const ADMIN_EMAIL = "bichphuong2561@gmail.com";
  const ROW_ID = "main";
  const ROOT_KEY = "Cụ tổ Đỗ Húy Công Húy Hỗ__1";
  const blankData = () => ({ edits: {}, added: [], deleted: [], history: { title: "Lịch sử dòng họ Đỗ", content: "Nội dung lịch sử dòng họ đang được gia đình bổ sung và hoàn thiện." } });
  let data = blankData();
  let session = null;
  let applying = false;
  let applyTimer = null;

  const style = document.createElement("style");
  style.textContent = `
    .gp-admin-launch{position:fixed;right:18px;bottom:18px;z-index:9998;border:0;border-radius:999px;background:#8f2f25;color:#fff;padding:12px 18px;font:600 13px Arial;box-shadow:0 7px 24px #42201540;cursor:pointer}
    .gp-admin-launch.is-admin{background:#35633c}.gp-node-actions{display:flex;gap:5px;margin-top:8px}.gp-node-actions button{border:1px solid #b98a4e;background:#fff8ed;color:#7b352b;border-radius:4px;padding:4px 8px;font:600 10px Arial;cursor:pointer}.gp-node-actions button:hover{background:#8f2f25;color:#fff}.gp-added-badge{display:inline-block;color:#35633c!important;background:#e3f2e5;padding:2px 6px;border-radius:10px}
    .gp-overlay{position:fixed;inset:0;z-index:10000;background:#271a1499;display:grid;place-items:center;padding:18px}.gp-modal{width:min(560px,100%);max-height:92vh;overflow:auto;background:#fffaf2;border:1px solid #b98a4e;box-shadow:0 24px 70px #0005;padding:24px}.gp-modal h2{font:700 25px 'Times New Roman',serif;color:#67271f;margin:0 0 7px}.gp-modal>p{color:#756357;font:13px/1.5 Arial;margin:0 0 18px}.gp-field{display:block;margin:13px 0}.gp-field span{display:block;color:#53392d;font:600 12px Arial;margin-bottom:6px}.gp-field input,.gp-field textarea{box-sizing:border-box;width:100%;border:1px solid #cbb18d;background:#fff;padding:10px 11px;font:14px/1.45 Arial;color:#2e251f;outline:none}.gp-field textarea{min-height:82px;resize:vertical}.gp-field input:focus,.gp-field textarea:focus{border-color:#8f2f25;box-shadow:0 0 0 2px #8f2f2518}.gp-row{display:flex;gap:9px;justify-content:flex-end;margin-top:18px;flex-wrap:wrap}.gp-btn{border:1px solid #8f2f25;background:#8f2f25;color:#fff;padding:9px 15px;font:600 12px Arial;cursor:pointer}.gp-btn.secondary{background:#fff;color:#6b3128}.gp-btn.danger{background:#fff;color:#a51f1f;border-color:#c95757;margin-right:auto}.gp-message{padding:9px 11px;background:#f3eadc;color:#604b3d;font:12px/1.45 Arial;margin:10px 0}.gp-message.error{background:#fde6e2;color:#921f17}.gp-login-email{font-weight:700}.gp-saving{opacity:.6;pointer-events:none}@media(max-width:600px){.gp-admin-launch{right:10px;bottom:10px}.gp-modal{padding:18px}.gp-row .gp-btn{flex:1}}
    .gp-memorial-alert{grid-column:1/-1;border:1px solid #d5a450;background:#fff3cf;color:#5b3820;padding:14px 17px;margin:0;font:13px/1.55 Arial}.gp-memorial-alert strong{display:block;color:#932f24;font:700 17px 'Times New Roman',serif;margin-bottom:5px}.gp-memorial-alert span{display:block}.gp-upcoming{display:inline-block!important;background:#b13b2e;color:#fff!important;border-radius:999px;padding:4px 9px;margin-top:9px;font:700 10px Arial!important}.memorial-grid article.gp-soon{background:#49352b!important;box-shadow:inset 4px 0 0 #e4b34e}.gp-solar-date{display:block;color:#d9c7b3!important;font-size:10px!important;margin-top:4px}
    .gp-parent-node,.gp-parent-node>details,.gp-parent-node>details>ul,.gp-original-root,.gp-original-root>details{box-sizing:border-box;width:100%!important;max-width:none!important}.gp-parent-node>details>summary,.gp-original-root>details>summary{position:relative!important;text-align:center!important;justify-content:center!important}.gp-parent-node>details>summary>.gene-main,.gp-original-root>details>summary>.gene-main{box-sizing:border-box;width:100%!important;text-align:center!important;padding-left:34px!important;padding-right:34px!important}.gp-parent-node>details>summary>.branch-toggle,.gp-original-root>details>summary>.branch-toggle{position:absolute!important;left:18px!important;top:50%!important;transform:translateY(-50%)!important}.gp-original-root>details>summary .spouse{box-sizing:border-box;width:max-content;max-width:calc(100% - 68px);margin-left:auto!important;margin-right:auto!important;text-align:center!important}.gp-parent-node>details>ul{display:block!important;grid-template-columns:none!important;margin:14px 0 0!important;padding:0!important;border-left:0!important}.gp-parent-node>details>ul>.gp-original-root:before{display:none!important}.gp-original-root>details>summary{max-width:520px;margin:0 auto;background:#922f25!important;border:3px double #e7c99f!important}.gp-original-root>details>summary .gene-main>strong,.gp-original-root>details>summary .gene-main>small,.gp-original-root>details>summary .gene-main>em,.gp-original-root>details>summary .spouse b,.gp-original-root>details>summary .spouse small{color:#fff!important}@media(min-width:950px){.gp-original-root>details>ul{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:12px;width:100%!important;margin:18px 0 0!important;padding:0!important;border-left:0!important}.gp-original-root>details>ul>li{min-width:0!important}.gp-original-root>details>ul>li:before{display:none}.gp-original-root>details>ul>li>details>summary{box-sizing:border-box;width:100%;height:100%;min-height:112px;padding:10px}.gp-original-root>details>ul>li .gene-main>strong{font-size:15px}}
    .detailed-tree .gene-root ul>li:last-child:after{content:"";position:absolute;z-index:1;left:-29px;top:26px;bottom:-1px;width:3px;background:#f3eadc}.detailed-tree .gene-root ul>li:last-child>details{position:relative;z-index:2}
    .gp-history-section{scroll-margin-top:88px;display:grid;grid-template-columns:minmax(210px,.7fr) minmax(0,1.6fr);gap:64px;padding:82px max(7vw,28px);background:#f7efe1;border-top:1px solid #d7c09c;border-bottom:1px solid #d7c09c;color:#3b2a22}.gp-history-heading .eyebrow{margin:0 0 14px;color:#9a3025;font:700 12px/1.4 Arial;letter-spacing:.18em;text-transform:uppercase}.gp-history-heading h2{margin:0;color:#35251e;font:700 clamp(34px,4vw,58px)/1.05 'Times New Roman',serif}.gp-history-body{border-left:3px solid #bd8740;padding:4px 0 4px 30px}.gp-history-content p{margin:0 0 16px;font:17px/1.8 Georgia,'Times New Roman',serif;color:#5d493d;text-align:justify}.gp-history-content p:last-child{margin-bottom:0}.gp-history-edit{margin-top:22px;border:1px solid #8f2f25;background:#8f2f25;color:#fff;padding:9px 15px;font:600 12px Arial;cursor:pointer}.gp-history-edit:hover{background:#6f251d}@media(max-width:720px){.gp-history-section{grid-template-columns:1fr;gap:28px;padding:52px 24px}.gp-history-body{padding-left:20px}.gp-history-content p{font-size:16px;text-align:left}}
  `;
  document.head.appendChild(style);

  function authHeaders(token) {
    return { apikey: SUPABASE_KEY, Authorization: `Bearer ${token || SUPABASE_KEY}`, "Content-Type": "application/json" };
  }

  function parseSession() {
    const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
    const access = hash.get("access_token");
    const refresh = hash.get("refresh_token");
    if (access) {
      localStorage.setItem("gp_access_token", access);
      if (refresh) localStorage.setItem("gp_refresh_token", refresh);
      history.replaceState(null, "", location.pathname + location.search);
    }
    return localStorage.getItem("gp_access_token");
  }

  async function getCurrentUser() {
    const token = parseSession();
    if (!token) return null;
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: authHeaders(token) });
    if (!res.ok) {
      localStorage.removeItem("gp_access_token");
      localStorage.removeItem("gp_refresh_token");
      return null;
    }
    const user = await res.json();
    return String(user.email || "").toLowerCase() === ADMIN_EMAIL ? { token, user } : null;
  }

  async function loadData() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/genealogy_site?id=eq.${ROW_ID}&select=data`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Không tải được dữ liệu chỉnh sửa");
    const rows = await res.json();
    data = { ...blankData(), ...(rows[0]?.data || {}) };
  }

  async function saveData() {
    if (!session) throw new Error("Phiên đăng nhập đã hết hạn");
    const res = await fetch(`${SUPABASE_URL}/rest/v1/genealogy_site?id=eq.${ROW_ID}`, {
      method: "PATCH",
      headers: { ...authHeaders(session.token), Prefer: "return=minimal" },
      body: JSON.stringify({ data, updated_at: new Date().toISOString() })
    });
    if (!res.ok) throw new Error((await res.text()) || "Không lưu được thay đổi");
  }

  function direct(el, selector) { return Array.from(el.children).filter(x => x.matches(selector)); }
  function keyNodes() {
    const counts = {};
    document.querySelectorAll(".gene-main").forEach(main => {
      if (main.closest(".gp-added-node")) return;
      const name = direct(main, "strong")[0]?.textContent.trim() || "Không tên";
      const original = main.dataset.gpOriginal || name;
      main.dataset.gpOriginal = original;
      counts[original] = (counts[original] || 0) + 1;
      main.dataset.gpKey = `${original}__${counts[original]}`;
    });
  }

  function makeSpouse(item) {
    const box = document.createElement("div"); box.className = "spouse gp-managed-spouse";
    const b = document.createElement("b"); b.textContent = `Phối ngẫu: ${item.name || "Chưa rõ tên"}`; box.appendChild(b);
    if (item.info) { const s = document.createElement("small"); s.textContent = item.info; box.appendChild(s); }
    if (item.memorial) { const e = document.createElement("em"); e.textContent = `Giỗ ${item.memorial}`; box.appendChild(e); }
    return box;
  }

  function applyEdit(main, edit) {
    if (!edit) return;
    const strong = direct(main, "strong")[0]; if (strong && edit.name) strong.textContent = edit.name;
    direct(main, "small, em, .spouse").forEach(x => x.remove());
    if (Array.isArray(edit.info)) edit.info.forEach(text => { if (!text) return; const s=document.createElement("small"); s.className="gp-managed-info"; s.textContent=text; main.insertBefore(s, main.querySelector(".spouse,.gp-node-actions")); });
    if (edit.memorial) { const e=document.createElement("em"); e.className="gp-managed-memorial"; e.textContent=`Giỗ ${edit.memorial}`; main.insertBefore(e, main.querySelector(".spouse,.gp-node-actions")); }
    if (Array.isArray(edit.spouses)) edit.spouses.forEach(s => main.insertBefore(makeSpouse(s), main.querySelector(".gp-node-actions")));
  }

  function addActions(main, key, isAdded) {
    main.querySelector(":scope > .gp-node-actions")?.remove();
    if (!session) return;
    const actions = document.createElement("div"); actions.className = "gp-node-actions";
    const edit = document.createElement("button"); edit.type="button"; edit.textContent="Sửa"; edit.onclick=e=>{e.preventDefault();e.stopPropagation();openEditor(key,isAdded);};
    const add = document.createElement("button"); add.type="button"; add.textContent="+ Thêm con"; add.onclick=e=>{e.preventDefault();e.stopPropagation();openAdd(key,"child");};
    actions.append(edit,add);
    if(key===ROOT_KEY){
      const parent=document.createElement("button");parent.type="button";parent.textContent="↑ Thêm đời trên";parent.onclick=e=>{e.preventDefault();e.stopPropagation();openAdd(key,"parent");};actions.append(parent);
    }else{
      const above=document.createElement("button");above.type="button";above.textContent="↑ Nhánh trên";above.onclick=e=>{e.preventDefault();e.stopPropagation();openAdd(key,"above");};
      const below=document.createElement("button");below.type="button";below.textContent="↓ Nhánh dưới";below.onclick=e=>{e.preventDefault();e.stopPropagation();openAdd(key,"below");};
      actions.append(above,below);
    }
    main.appendChild(actions);
  }

  function renderAdded() {
    document.querySelectorAll(".gp-parent-node").forEach(parent=>{const original=parent.querySelector(":scope > details > ul > li:not(.gp-added-node)");if(original)parent.before(original);});
    document.querySelectorAll(".gp-added-node").forEach(x => x.remove());
    (data.added || []).forEach(item => {
      const li=document.createElement("li"); li.className="gp-added-node";
      const d=document.createElement("details"); d.open=true;
      const summary=document.createElement("summary"); const toggle=document.createElement("span"); toggle.className="gene-toggle"; toggle.textContent="·";
      const main=document.createElement("div"); main.className="gene-main"; main.dataset.gpKey=item.id;
      const strong=document.createElement("strong"); strong.textContent=item.name||"Thành viên mới"; main.appendChild(strong);
      (item.info||[]).forEach(t=>{const s=document.createElement("small");s.textContent=t;main.appendChild(s);});
      if(item.memorial){const e=document.createElement("em");e.textContent=`Giỗ ${item.memorial}`;main.appendChild(e);}
      (item.spouses||[]).forEach(s=>main.appendChild(makeSpouse(s)));
      addActions(main,item.id,true); summary.append(toggle,main); d.appendChild(summary); li.appendChild(d);
      if(item.placement==="parent"){
        const anchorMain=document.querySelector(`.gene-main[data-gp-key="${CSS.escape(item.anchorKey)}"]`),anchorLi=anchorMain?.closest("li");if(!anchorLi)return;
        li.classList.add("gp-parent-node","gene-level-0");anchorLi.classList.add("gp-original-root");const childList=document.createElement("ul");d.appendChild(childList);anchorLi.before(li);childList.appendChild(anchorLi);
      }else if(item.anchorKey){
        const anchorMain=document.querySelector(`.gene-main[data-gp-key="${CSS.escape(item.anchorKey)}"]`),anchorLi=anchorMain?.closest("li");if(!anchorLi)return;
        if(item.placement==="above")anchorLi.before(li);else anchorLi.after(li);
      }else{
        const parent=document.querySelector(`.gene-main[data-gp-key="${CSS.escape(item.parentKey)}"]`),details=parent?.closest("details");if(!details)return;
        let ul=direct(details,"ul")[0];if(!ul){ul=document.createElement("ul");details.appendChild(ul);}ul.appendChild(li);
      }
    });
  }

  function applyAll() {
    if (applying) return; applying=true;
    try {
      keyNodes();
      document.querySelectorAll(".gene-main:not(.gp-added-node .gene-main)").forEach(main => {
        const key=main.dataset.gpKey; const li=main.closest("li");
        if(li) li.style.display=(key!==ROOT_KEY&&(data.deleted||[]).includes(key))?"none":"";
        applyEdit(main,(data.edits||{})[key]); addActions(main,key,false);
      });
      renderAdded();
      renderHistory();
      updateMemorialCalendar();
    } finally { applying=false; }
  }

  function renderHistory() {
    const nav=document.querySelector(".topbar nav");
    if(nav&&!nav.querySelector('a[href="#lichsu"]')){const link=document.createElement("a");link.href="#lichsu";link.textContent="Lịch sử";nav.appendChild(link);}
    let section=document.getElementById("lichsu");
    if(!section){
      section=document.createElement("section");section.id="lichsu";section.className="gp-history-section";
      section.innerHTML='<div class="gp-history-heading"><p class="eyebrow">Nguồn cội dòng họ</p><h2></h2></div><div class="gp-history-body"><div class="gp-history-content"></div></div>';
      const note=document.querySelector("section.note"),footer=document.querySelector("footer");
      if(note)note.before(section);else if(footer)footer.before(section);else document.querySelector("main")?.appendChild(section);
    }
    const history={...blankData().history,...(data.history||{})};
    const h2=section.querySelector("h2");if(h2&&h2.textContent!==history.title)h2.textContent=history.title;
    const content=section.querySelector(".gp-history-content"),signature=history.content||"";
    if(content&&content.dataset.text!==signature){content.dataset.text=signature;content.replaceChildren();const parts=signature.split(/\n\s*\n|\n/).map(x=>x.trim()).filter(Boolean);(parts.length?parts:["Nội dung lịch sử dòng họ đang được bổ sung."]).forEach(text=>{const p=document.createElement("p");p.textContent=text;content.appendChild(p);});}
    let edit=section.querySelector(".gp-history-edit");
    if(session&&!edit){edit=document.createElement("button");edit.type="button";edit.className="gp-history-edit";edit.textContent="Chỉnh sửa lịch sử";edit.onclick=openHistoryEditor;section.querySelector(".gp-history-body")?.appendChild(edit);}else if(!session&&edit)edit.remove();
  }

  function openHistoryEditor(){
    const current={...blankData().history,...(data.history||{})};
    const ov=modal('<h2>Chỉnh sửa lịch sử dòng họ</h2><p>Nội dung sau khi lưu sẽ được hiển thị công khai trong tab Lịch sử.</p><label class="gp-field"><span>Tiêu đề</span><input name="title"></label><label class="gp-field"><span>Nội dung lịch sử</span><textarea name="content" style="min-height:260px" placeholder="Nhập nội dung lịch sử dòng họ..."></textarea></label><div class="gp-row"><button class="gp-btn secondary" data-cancel>Hủy</button><button class="gp-btn" data-save>Lưu nội dung</button></div>');
    const box=ov.querySelector(".gp-modal");box.querySelector('[name="title"]').value=current.title;box.querySelector('[name="content"]').value=current.content;box.querySelector("[data-cancel]").onclick=()=>ov.remove();box.querySelector("[data-save]").onclick=async()=>{const title=box.querySelector('[name="title"]').value.trim(),content=box.querySelector('[name="content"]').value.trim();if(!title){message(box,"Vui lòng nhập tiêu đề.",true);return;}box.classList.add("gp-saving");try{data.history={title,content};await saveData();ov.remove();renderHistory();}catch(e){box.classList.remove("gp-saving");message(box,e.message,true);}};
  }

  function jdFromDate(dd,mm,yy){let a=Math.floor((14-mm)/12),y=yy+4800-a,m=mm+12*a-3,jd=dd+Math.floor((153*m+2)/5)+365*y+Math.floor(y/4)-Math.floor(y/100)+Math.floor(y/400)-32045;if(jd<2299161)jd=dd+Math.floor((153*m+2)/5)+365*y+Math.floor(y/4)-32083;return jd;}
  function jdToDate(jd){let a,b,c;if(jd>2299160){a=jd+32044;b=Math.floor((4*a+3)/146097);c=a-Math.floor(b*146097/4);}else{b=0;c=jd+32082;}let d=Math.floor((4*c+3)/1461),e=c-Math.floor(1461*d/4),m=Math.floor((5*e+2)/153);return[e-Math.floor((153*m+2)/5)+1,m+3-12*Math.floor(m/10),b*100+d-4800+Math.floor(m/10)];}
  function newMoon(k){const T=k/1236.85,T2=T*T,T3=T2*T,dr=Math.PI/180;let Jd1=2415020.75933+29.53058868*k+0.0001178*T2-0.000000155*T3;Jd1+=0.00033*Math.sin((166.56+132.87*T-0.009173*T2)*dr);const M=359.2242+29.10535608*k-0.0000333*T2-0.00000347*T3,Mpr=306.0253+385.81691806*k+0.0107306*T2+0.00001236*T3,F=21.2964+390.67050646*k-0.0016528*T2-0.00000239*T3;let C1=(0.1734-0.000393*T)*Math.sin(M*dr)+0.0021*Math.sin(2*dr*M)-0.4068*Math.sin(Mpr*dr)+0.0161*Math.sin(2*dr*Mpr)-0.0004*Math.sin(3*dr*Mpr)+0.0104*Math.sin(2*dr*F)-0.0051*Math.sin((M+Mpr)*dr)-0.0074*Math.sin((M-Mpr)*dr)+0.0004*Math.sin((2*F+M)*dr)-0.0004*Math.sin((2*F-M)*dr)-0.0006*Math.sin((2*F+Mpr)*dr)+0.001*Math.sin((2*F-Mpr)*dr)+0.0005*Math.sin((2*Mpr+M)*dr);let deltaT=T<-.11?0.001+0.000839*T+0.0002261*T2-0.00000845*T3-0.000000081*T*T3:-0.000278+0.000265*T+0.000262*T2;return Jd1+C1-deltaT;}
  function sunLongitude(jdn){const T=(jdn-2451545)/36525,T2=T*T,dr=Math.PI/180,M=357.5291+35999.0503*T-0.0001559*T2-0.00000048*T*T2,L0=280.46645+36000.76983*T+0.0003032*T2,DL=(1.9146-0.004817*T-0.000014*T2)*Math.sin(dr*M)+(0.019993-0.000101*T)*Math.sin(2*dr*M)+0.00029*Math.sin(3*dr*M);let L=(L0+DL)*dr;L-=Math.PI*2*Math.floor(L/(Math.PI*2));return L;}
  function getNewMoonDay(k,tz=7){return Math.floor(newMoon(k)+0.5+tz/24);}
  function getSunLongitude(dayNumber,tz=7){return Math.floor(sunLongitude(dayNumber-0.5-tz/24)/Math.PI*6);}
  function getLunarMonth11(yy,tz=7){const off=jdFromDate(31,12,yy)-2415021,k=Math.floor(off/29.530588853),nm=getNewMoonDay(k,tz);return getSunLongitude(nm,tz)>=9?getNewMoonDay(k-1,tz):nm;}
  function getLeapMonthOffset(a11,tz=7){const k=Math.floor(0.5+(a11-2415021.076998695)/29.530588853);let last=0,i=1,arc=getSunLongitude(getNewMoonDay(k+i,tz),tz);do{last=arc;i++;arc=getSunLongitude(getNewMoonDay(k+i,tz),tz);}while(arc!==last&&i<14);return i-1;}
  function lunarToSolar(day,month,year,leap=0,tz=7){let a11,b11;if(month<11){a11=getLunarMonth11(year-1,tz);b11=getLunarMonth11(year,tz);}else{a11=getLunarMonth11(year,tz);b11=getLunarMonth11(year+1,tz);}const k=Math.floor(0.5+(a11-2415021.076998695)/29.530588853);let off=month-11;if(off<0)off+=12;if(b11-a11>365){const leapOff=getLeapMonthOffset(a11,tz);let leapMonth=leapOff-2;if(leapMonth<0)leapMonth+=12;if(leap&&month!==leapMonth)return null;if(leap||off>=leapOff)off++;}return jdToDate(getNewMoonDay(k+off,tz)+day-1);}
  function parseLunar(text){const clean=String(text||"").toLowerCase().replace(/giỗ/g,"").trim();let m=clean.match(/(\d{1,2})\s*[\/.-]\s*(\d{1,2})/);if(m)return{day:+m[1],month:+m[2]};const names={"giêng":1,"một":1,"hai":2,"ba":3,"tư":4,"bốn":4,"năm":5,"sáu":6,"bảy":7,"tám":8,"chín":9,"mười":10,"mười một":11,"chạp":12,"mười hai":12};m=clean.match(/(\d{1,2})\s*tháng\s*(giêng|chạp|mười hai|mười một|mười|một|hai|ba|tư|bốn|năm|sáu|bảy|tám|chín)/);return m?{day:+m[1],month:names[m[2]]}:null;}
  function nextSolarOccurrence(day,month){const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate());let best=null;for(let ly=now.getFullYear()-1;ly<=now.getFullYear()+1;ly++){const out=lunarToSolar(day,month,ly);if(!out)continue;const d=new Date(out[2],out[1]-1,out[0]);if(d>=today&&(!best||d<best))best=d;}return best;}
  function formatSolar(d){return`${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;}
  function syncMemorialCards(grid){
    const setText=(el,value)=>{if(el&&el.textContent!==value)el.textContent=value;};
    const edits=data.edits||{},directByName={};Object.entries(edits).forEach(([key,value])=>{directByName[key.replace(/__\d+$/,"")]=value;});
    const spouseByName={};Object.values(edits).forEach(value=>(value.spouses||[]).forEach(s=>{if(s.name)spouseByName[s.name]=s;}));
    grid.querySelectorAll(":scope > article").forEach(article=>{
      const title=article.querySelector("h3"),time=article.querySelector("time"),info=article.querySelector("p");if(!title||!time)return;
      article.dataset.gpOriginalName ||= title.textContent.trim();article.dataset.gpOriginalTime ||= time.textContent.trim();article.dataset.gpOriginalInfo ||= info?.textContent.trim()||"";
      const edit=directByName[article.dataset.gpOriginalName]||spouseByName[article.dataset.gpOriginalName];
      if(!edit){setText(title,article.dataset.gpOriginalName);setText(time,article.dataset.gpOriginalTime);setText(info,article.dataset.gpOriginalInfo);article.style.display="";return;}
      setText(title,edit.name||article.dataset.gpOriginalName);setText(time,edit.memorial||"");setText(info,Array.isArray(edit.info)?edit.info.join(" · "):(edit.info||""));article.style.display=edit.memorial?"":"none";
    });
    const added=(data.added||[]).filter(x=>x.memorial),addedSignature=JSON.stringify(added.map(x=>[x.id,x.name,x.memorial,x.info]));if(grid.dataset.gpAddedMemorial!==addedSignature){grid.dataset.gpAddedMemorial=addedSignature;grid.querySelectorAll(".gp-added-memorial").forEach(x=>x.remove());added.forEach(item=>{const article=document.createElement("article");article.className="gp-added-memorial";article.innerHTML=`<time>${item.memorial}</time><h3></h3><p></p>`;article.querySelector("h3").textContent=item.name||"Thành viên mới";article.querySelector("p").textContent=(item.info||[]).join(" · ");grid.appendChild(article);});}
  }
  function updateMemorialCalendar(){
    const grid=document.querySelector(".memorial-grid");if(!grid)return;syncMemorialCards(grid);const articles=Array.from(grid.querySelectorAll(":scope > article")).filter(x=>x.style.display!=="none");if(!articles.length)return;
    const today=new Date();today.setHours(0,0,0,0);const signature=articles.map(a=>a.querySelector("time")?.textContent.trim()).join("|")+`_${today.toDateString()}`;if(grid.dataset.gpCalendar===signature)return;grid.dataset.gpCalendar=signature;
    const rows=articles.map((article,index)=>({article,index,lunar:parseLunar(article.querySelector("time")?.textContent)}));rows.sort((a,b)=>(a.lunar?.month??99)-(b.lunar?.month??99)||(a.lunar?.day??99)-(b.lunar?.day??99)||a.index-b.index);rows.forEach(x=>grid.appendChild(x.article));
    const upcoming=[];rows.forEach(({article,lunar})=>{article.querySelectorAll(".gp-upcoming,.gp-solar-date").forEach(x=>x.remove());article.classList.remove("gp-soon");if(!lunar)return;const next=nextSolarOccurrence(lunar.day,lunar.month);if(!next)return;const days=Math.ceil((next-today)/86400000),solar=document.createElement("small");solar.className="gp-solar-date";solar.textContent=`Năm nay: ${formatSolar(next)} dương lịch`;article.querySelector("time")?.after(solar);if(days>=0&&days<=30){article.classList.add("gp-soon");const badge=document.createElement("span");badge.className="gp-upcoming";badge.textContent=days===0?"Hôm nay là ngày giỗ":`Còn ${days} ngày`;article.appendChild(badge);upcoming.push({name:article.querySelector("h3")?.textContent.trim()||"Chưa rõ tên",days,date:formatSolar(next),lunar});}});
    document.querySelector(".gp-memorial-alert")?.remove();if(upcoming.length){upcoming.sort((a,b)=>a.days-b.days);const alert=document.createElement("div");alert.className="gp-memorial-alert";alert.innerHTML=`<strong>Nhắc ngày giỗ trong 30 ngày tới</strong>${upcoming.map(x=>`<span>• ${x.name}: ${String(x.lunar.day).padStart(2,"0")}/${String(x.lunar.month).padStart(2,"0")} âm lịch — ${x.date} dương lịch (${x.days===0?"hôm nay":`còn ${x.days} ngày`})</span>`).join("")}`;grid.prepend(alert);}
  }

  function modal(html) {
    const overlay=document.createElement("div"); overlay.className="gp-overlay"; overlay.innerHTML=`<div class="gp-modal">${html}</div>`;
    overlay.addEventListener("mousedown",e=>{if(e.target===overlay)overlay.remove();}); document.body.appendChild(overlay); return overlay;
  }
  function message(box,text,error=false){let el=box.querySelector(".gp-message");if(!el){el=document.createElement("div");el.className="gp-message";box.querySelector(".gp-row")?.before(el);}el.classList.toggle("error",error);el.textContent=text;}
  function parseSpouses(text){return text.split("\n").map(x=>x.trim()).filter(Boolean).map(line=>{const [name="",info="",memorial=""]=line.split("|").map(x=>x.trim());return{name,info,memorial};});}
  function spouseText(list){return(list||[]).map(s=>[s.name,s.info,s.memorial].filter(Boolean).join(" | ")).join("\n");}

  function originalValues(main){
    return { name:direct(main,"strong")[0]?.textContent.trim()||"", info:direct(main,"small").filter(x=>!x.classList.contains("gp-added-badge")).map(x=>x.textContent.trim()), memorial:(direct(main,"em")[0]?.textContent||"").replace(/^Giỗ\s*/,""), spouses:direct(main,".spouse").map(s=>({name:(s.querySelector("b")?.textContent||"").replace(/^Phối ngẫu:\s*/,""),info:s.querySelector("small")?.textContent||"",memorial:(s.querySelector("em")?.textContent||"").replace(/^Giỗ\s*/,"")})) };
  }

  function openEditor(key,isAdded){
    const main=document.querySelector(`.gene-main[data-gp-key="${CSS.escape(key)}"]`); if(!main)return;
    const current=isAdded?(data.added||[]).find(x=>x.id===key):((data.edits||{})[key]||originalValues(main));
    const ov=modal(`<h2>Chỉnh sửa thành viên</h2><p>Thông tin sẽ được cập nhật cho mọi người xem sau khi lưu.</p><label class="gp-field"><span>Họ và tên</span><input name="name"></label><label class="gp-field"><span>Thông tin — mỗi dòng một ý</span><textarea name="info"></textarea></label><label class="gp-field"><span>Ngày giỗ</span><input name="memorial" placeholder="Ví dụ: 09/03 âm lịch"></label><label class="gp-field"><span>Vợ/chồng — mỗi người một dòng: Tên | thông tin | ngày giỗ</span><textarea name="spouses"></textarea></label><div class="gp-row"><button class="gp-btn danger" data-delete>Ẩn/xóa</button><button class="gp-btn secondary" data-cancel>Hủy</button><button class="gp-btn" data-save>Lưu thay đổi</button></div>`);
    const box=ov.querySelector(".gp-modal"); box.querySelector('[name="name"]').value=current.name||""; box.querySelector('[name="info"]').value=(current.info||[]).join("\n"); box.querySelector('[name="memorial"]').value=current.memorial||""; box.querySelector('[name="spouses"]').value=spouseText(current.spouses);
    if(key===ROOT_KEY)box.querySelector("[data-delete]").style.display="none";
    box.querySelector("[data-cancel]").onclick=()=>ov.remove();
    box.querySelector("[data-save]").onclick=async()=>{const val={name:box.querySelector('[name="name"]').value.trim(),info:box.querySelector('[name="info"]').value.split("\n").map(x=>x.trim()).filter(Boolean),memorial:box.querySelector('[name="memorial"]').value.trim(),spouses:parseSpouses(box.querySelector('[name="spouses"]').value)};box.classList.add("gp-saving");try{if(isAdded){Object.assign(data.added.find(x=>x.id===key),val);}else{data.edits[key]=val;}await saveData();ov.remove();applyAll();}catch(e){box.classList.remove("gp-saving");message(box,e.message,true);}};
    box.querySelector("[data-delete]").onclick=async()=>{if(key===ROOT_KEY){message(box,"Không thể xóa cụ tổ vì đây là gốc của toàn bộ cây.",true);return;}const displayName=box.querySelector('[name="name"]').value.trim();if(!confirm(`Bạn chắc chắn muốn ẩn “${displayName}” và toàn bộ hậu duệ bên dưới khỏi cây?`))return;box.classList.add("gp-saving");try{if(isAdded)data.added=data.added.filter(x=>x.id!==key);else if(!data.deleted.includes(key))data.deleted.push(key);await saveData();ov.remove();applyAll();}catch(e){box.classList.remove("gp-saving");message(box,e.message,true);}};
  }

  function openAdd(targetKey,placement="child"){
    const descriptions={child:"Người mới sẽ được đặt làm con trực tiếp của thành viên đang chọn.",above:"Người mới sẽ được thêm cùng cấp, ngay phía trên nhánh đang chọn.",below:"Người mới sẽ được thêm cùng cấp, ngay phía dưới nhánh đang chọn.",parent:"Người mới sẽ được đặt ở một đời phía trên Cụ tổ. Toàn bộ cây hiện tại vẫn được giữ làm hậu duệ bên dưới."};
    const ov=modal(`<h2>Thêm thành viên</h2><p>${descriptions[placement]}</p><label class="gp-field"><span>Họ và tên</span><input name="name" autofocus></label><label class="gp-field"><span>Thông tin — mỗi dòng một ý</span><textarea name="info"></textarea></label><label class="gp-field"><span>Ngày giỗ</span><input name="memorial"></label><label class="gp-field"><span>Vợ/chồng — Tên | thông tin | ngày giỗ</span><textarea name="spouses"></textarea></label><div class="gp-row"><button class="gp-btn secondary" data-cancel>Hủy</button><button class="gp-btn" data-save>Thêm vào cây</button></div>`);
    const box=ov.querySelector(".gp-modal");box.querySelector("[data-cancel]").onclick=()=>ov.remove();box.querySelector("[data-save]").onclick=async()=>{const name=box.querySelector('[name="name"]').value.trim();if(!name){message(box,"Vui lòng nhập họ tên",true);return;}const item={id:`added_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,name,info:box.querySelector('[name="info"]').value.split("\n").map(x=>x.trim()).filter(Boolean),memorial:box.querySelector('[name="memorial"]').value.trim(),spouses:parseSpouses(box.querySelector('[name="spouses"]').value)};if(placement==="child")item.parentKey=targetKey;else{item.anchorKey=targetKey;item.placement=placement;}box.classList.add("gp-saving");try{data.added.push(item);await saveData();ov.remove();applyAll();}catch(e){data.added=data.added.filter(x=>x.id!==item.id);box.classList.remove("gp-saving");message(box,e.message,true);}};
  }

  async function signInWithPassword(box){
    const password=box.querySelector('[name="password"]').value;
    if(!password){message(box,"Vui lòng nhập mật khẩu quản trị.",true);return;}
    box.classList.add("gp-saving");
    try{
      const res=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:"POST",headers:authHeaders(),body:JSON.stringify({email:ADMIN_EMAIL,password})});
      const result=await res.json();
      if(!res.ok)throw new Error(result.error_description||result.msg||result.message||"Đăng nhập không thành công");
      localStorage.setItem("gp_access_token",result.access_token);
      if(result.refresh_token)localStorage.setItem("gp_refresh_token",result.refresh_token);
      location.reload();
    }catch(e){box.classList.remove("gp-saving");const invalid=/invalid login|invalid credentials/i.test(e.message);message(box,invalid?"Email hoặc mật khẩu chưa đúng. Hãy kiểm tra tài khoản đã được tạo và xác nhận trong Supabase.":e.message,true);}
  }
  function openLogin(){
    if(session){const hidden=(data.deleted||[]).length;const ov=modal(`<h2>Quản trị gia phả</h2><p>Đang đăng nhập bằng <span class="gp-login-email">${ADMIN_EMAIL}</span>.</p>${hidden?`<div class="gp-message">Đang có ${hidden} mục bị ẩn khỏi cây.</div>`:""}<div class="gp-row">${hidden?'<button class="gp-btn secondary" data-restore>Khôi phục mục đã ẩn</button>':""}<button class="gp-btn secondary" data-close>Đóng</button><button class="gp-btn danger" data-logout>Đăng xuất</button></div>`);ov.querySelector("[data-close]").onclick=()=>ov.remove();ov.querySelector("[data-logout]").onclick=()=>{localStorage.removeItem("gp_access_token");localStorage.removeItem("gp_refresh_token");location.reload();};const restore=ov.querySelector("[data-restore]");if(restore)restore.onclick=async()=>{const box=ov.querySelector(".gp-modal");box.classList.add("gp-saving");try{data.deleted=[];await saveData();ov.remove();applyAll();}catch(e){box.classList.remove("gp-saving");message(box,e.message,true);}};return;}
    const ov=modal(`<h2>Đăng nhập quản trị</h2><p>Chỉ tài khoản <span class="gp-login-email">${ADMIN_EMAIL}</span> được phép chỉnh sửa cây gia phả.</p><label class="gp-field"><span>Mật khẩu quản trị</span><input name="password" type="password" autocomplete="current-password" placeholder="Nhập mật khẩu đã đặt trong Supabase"></label><div class="gp-message">Mật khẩu được gửi thẳng tới Supabase để xác thực, website không lưu mật khẩu.</div><div class="gp-row"><button class="gp-btn secondary" data-close>Đóng</button><button class="gp-btn" data-login>Đăng nhập</button></div>`);const box=ov.querySelector(".gp-modal");box.querySelector("[data-close]").onclick=()=>ov.remove();box.querySelector("[data-login]").onclick=()=>signInWithPassword(box);box.querySelector('[name="password"]').addEventListener("keydown",e=>{if(e.key==="Enter")signInWithPassword(box);});
  }
  function launchButton(){const b=document.createElement("button");b.className="gp-admin-launch"+(session?" is-admin":"");b.textContent=session?"✓ Đang chỉnh sửa":"Quản trị";b.onclick=openLogin;document.body.appendChild(b);}

  async function init(){
    try{session=await getCurrentUser();await loadData();launchButton();applyAll();const observer=new MutationObserver(()=>{if(applying)return;clearTimeout(applyTimer);applyTimer=setTimeout(applyAll,120);});observer.observe(document.body,{childList:true,subtree:true});}catch(e){console.error("Gia phả admin:",e);launchButton();}
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
