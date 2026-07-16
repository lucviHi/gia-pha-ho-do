(function () {
  "use strict";

  const SUPABASE_URL = "https://iuldhmfjxgmytjvodoaw.supabase.co";
  const SUPABASE_KEY = "sb_publishable_iQVoLxKT-aWZIQ22nmcPng_BGRzjBAH";
  const ADMIN_EMAIL = "bichphuong2561@gmail.com";
  const ROW_ID = "main";
  const ROOT_KEY = "Cụ tổ Đỗ Húy Công Húy Hỗ__1";
  const blankData = () => ({ edits: {}, added: [], deleted: [] });
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
    const add = document.createElement("button"); add.type="button"; add.textContent="+ Thêm con"; add.onclick=e=>{e.preventDefault();e.stopPropagation();openAdd(key);};
    actions.append(edit,add); main.appendChild(actions);
  }

  function renderAdded() {
    document.querySelectorAll(".gp-added-node").forEach(x => x.remove());
    (data.added || []).forEach(item => {
      const parent = document.querySelector(`.gene-main[data-gp-key="${CSS.escape(item.parentKey)}"]`);
      const details = parent?.closest("details"); if (!details) return;
      let ul = direct(details,"ul")[0]; if (!ul) { ul=document.createElement("ul"); details.appendChild(ul); }
      const li=document.createElement("li"); li.className="gp-added-node";
      const d=document.createElement("details"); d.open=true;
      const summary=document.createElement("summary"); const toggle=document.createElement("span"); toggle.className="gene-toggle"; toggle.textContent="·";
      const main=document.createElement("div"); main.className="gene-main"; main.dataset.gpKey=item.id;
      const strong=document.createElement("strong"); strong.textContent=item.name||"Thành viên mới"; main.appendChild(strong);
      const badge=document.createElement("small"); badge.className="gp-added-badge"; badge.textContent="Thông tin bổ sung"; main.appendChild(badge);
      (item.info||[]).forEach(t=>{const s=document.createElement("small");s.textContent=t;main.appendChild(s);});
      if(item.memorial){const e=document.createElement("em");e.textContent=`Giỗ ${item.memorial}`;main.appendChild(e);}
      (item.spouses||[]).forEach(s=>main.appendChild(makeSpouse(s)));
      addActions(main,item.id,true); summary.append(toggle,main); d.appendChild(summary); li.appendChild(d); ul.appendChild(li);
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
      updateMemorialCalendar();
    } finally { applying=false; }
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
  function updateMemorialCalendar(){
    const grid=document.querySelector(".memorial-grid");if(!grid)return;const articles=Array.from(grid.querySelectorAll(":scope > article"));if(!articles.length)return;
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

  function openAdd(parentKey){
    const ov=modal(`<h2>Thêm thành viên</h2><p>Người mới sẽ được đặt làm con trực tiếp của thành viên đang chọn.</p><label class="gp-field"><span>Họ và tên</span><input name="name" autofocus></label><label class="gp-field"><span>Thông tin — mỗi dòng một ý</span><textarea name="info"></textarea></label><label class="gp-field"><span>Ngày giỗ</span><input name="memorial"></label><label class="gp-field"><span>Vợ/chồng — Tên | thông tin | ngày giỗ</span><textarea name="spouses"></textarea></label><div class="gp-row"><button class="gp-btn secondary" data-cancel>Hủy</button><button class="gp-btn" data-save>Thêm vào cây</button></div>`);
    const box=ov.querySelector(".gp-modal");box.querySelector("[data-cancel]").onclick=()=>ov.remove();box.querySelector("[data-save]").onclick=async()=>{const name=box.querySelector('[name="name"]').value.trim();if(!name){message(box,"Vui lòng nhập họ tên",true);return;}const item={id:`added_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,parentKey,name,info:box.querySelector('[name="info"]').value.split("\n").map(x=>x.trim()).filter(Boolean),memorial:box.querySelector('[name="memorial"]').value.trim(),spouses:parseSpouses(box.querySelector('[name="spouses"]').value)};box.classList.add("gp-saving");try{data.added.push(item);await saveData();ov.remove();applyAll();}catch(e){data.added=data.added.filter(x=>x.id!==item.id);box.classList.remove("gp-saving");message(box,e.message,true);}};
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
