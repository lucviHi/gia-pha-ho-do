(function () {
  "use strict";

  const SUPABASE_URL = "https://iuldhmfjxgmytjvodoaw.supabase.co";
  const SUPABASE_KEY = "sb_publishable_iQVoLxKT-aWZIQ22nmcPng_BGRzjBAH";
  const ADMIN_EMAIL = "bichphuong2561@gmail.com";
  const ROW_ID = "main";
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
    direct(main, "small.gp-managed-info, em.gp-managed-memorial, .gp-managed-spouse").forEach(x => x.remove());
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
        if(li) li.style.display=(data.deleted||[]).includes(key)?"none":"";
        applyEdit(main,(data.edits||{})[key]); addActions(main,key,false);
      });
      renderAdded();
    } finally { applying=false; }
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
    box.querySelector("[data-cancel]").onclick=()=>ov.remove();
    box.querySelector("[data-save]").onclick=async()=>{const val={name:box.querySelector('[name="name"]').value.trim(),info:box.querySelector('[name="info"]').value.split("\n").map(x=>x.trim()).filter(Boolean),memorial:box.querySelector('[name="memorial"]').value.trim(),spouses:parseSpouses(box.querySelector('[name="spouses"]').value)};box.classList.add("gp-saving");try{if(isAdded){Object.assign(data.added.find(x=>x.id===key),val);}else{data.edits[key]=val;}await saveData();ov.remove();applyAll();}catch(e){box.classList.remove("gp-saving");message(box,e.message,true);}};
    box.querySelector("[data-delete]").onclick=async()=>{if(!confirm("Bạn chắc chắn muốn ẩn/xóa người này khỏi cây?"))return;box.classList.add("gp-saving");try{if(isAdded)data.added=data.added.filter(x=>x.id!==key);else if(!data.deleted.includes(key))data.deleted.push(key);await saveData();ov.remove();applyAll();}catch(e){box.classList.remove("gp-saving");message(box,e.message,true);}};
  }

  function openAdd(parentKey){
    const ov=modal(`<h2>Thêm thành viên</h2><p>Người mới sẽ được đặt làm con trực tiếp của thành viên đang chọn.</p><label class="gp-field"><span>Họ và tên</span><input name="name" autofocus></label><label class="gp-field"><span>Thông tin — mỗi dòng một ý</span><textarea name="info"></textarea></label><label class="gp-field"><span>Ngày giỗ</span><input name="memorial"></label><label class="gp-field"><span>Vợ/chồng — Tên | thông tin | ngày giỗ</span><textarea name="spouses"></textarea></label><div class="gp-row"><button class="gp-btn secondary" data-cancel>Hủy</button><button class="gp-btn" data-save>Thêm vào cây</button></div>`);
    const box=ov.querySelector(".gp-modal");box.querySelector("[data-cancel]").onclick=()=>ov.remove();box.querySelector("[data-save]").onclick=async()=>{const name=box.querySelector('[name="name"]').value.trim();if(!name){message(box,"Vui lòng nhập họ tên",true);return;}const item={id:`added_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,parentKey,name,info:box.querySelector('[name="info"]').value.split("\n").map(x=>x.trim()).filter(Boolean),memorial:box.querySelector('[name="memorial"]').value.trim(),spouses:parseSpouses(box.querySelector('[name="spouses"]').value)};box.classList.add("gp-saving");try{data.added.push(item);await saveData();ov.remove();applyAll();}catch(e){data.added=data.added.filter(x=>x.id!==item.id);box.classList.remove("gp-saving");message(box,e.message,true);}};
  }

  async function sendLogin(box){
    box.classList.add("gp-saving");
    try{const res=await fetch(`${SUPABASE_URL}/auth/v1/otp`,{method:"POST",headers:authHeaders(),body:JSON.stringify({email:ADMIN_EMAIL,options:{emailRedirectTo:location.origin+location.pathname}})});if(!res.ok)throw new Error(await res.text());box.classList.remove("gp-saving");message(box,"Đã gửi liên kết đăng nhập. Hãy mở email và bấm liên kết, sau đó bạn sẽ quay lại trang này.");}catch(e){box.classList.remove("gp-saving");message(box,"Không gửi được email đăng nhập: "+e.message,true);}
  }
  function openLogin(){
    if(session){const ov=modal(`<h2>Quản trị gia phả</h2><p>Đang đăng nhập bằng <span class="gp-login-email">${ADMIN_EMAIL}</span>.</p><div class="gp-row"><button class="gp-btn secondary" data-close>Đóng</button><button class="gp-btn danger" data-logout>Đăng xuất</button></div>`);ov.querySelector("[data-close]").onclick=()=>ov.remove();ov.querySelector("[data-logout]").onclick=()=>{localStorage.removeItem("gp_access_token");localStorage.removeItem("gp_refresh_token");location.reload();};return;}
    const ov=modal(`<h2>Đăng nhập quản trị</h2><p>Chỉ tài khoản <span class="gp-login-email">${ADMIN_EMAIL}</span> được phép chỉnh sửa cây gia phả.</p><div class="gp-message">Supabase sẽ gửi một liên kết đăng nhập an toàn đến email của bạn.</div><div class="gp-row"><button class="gp-btn secondary" data-close>Đóng</button><button class="gp-btn" data-send>Gửi email đăng nhập</button></div>`);const box=ov.querySelector(".gp-modal");box.querySelector("[data-close]").onclick=()=>ov.remove();box.querySelector("[data-send]").onclick=()=>sendLogin(box);
  }
  function launchButton(){const b=document.createElement("button");b.className="gp-admin-launch"+(session?" is-admin":"");b.textContent=session?"✓ Đang chỉnh sửa":"Quản trị";b.onclick=openLogin;document.body.appendChild(b);}

  async function init(){
    try{session=await getCurrentUser();await loadData();launchButton();applyAll();const observer=new MutationObserver(()=>{if(applying)return;clearTimeout(applyTimer);applyTimer=setTimeout(applyAll,120);});observer.observe(document.body,{childList:true,subtree:true});}catch(e){console.error("Gia phả admin:",e);launchButton();}
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
