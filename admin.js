let token = sessionStorage.getItem("rknAdminToken");
const loginPanel = document.getElementById("loginPanel"), dashboard = document.getElementById("dashboard");
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function load(){
 if(!token){loginPanel.hidden=false;dashboard.hidden=true;return;}
 try{
  const r=await fetch("/api/bookings",{headers:{Authorization:`Bearer ${token}`}});
  if(!r.ok) throw new Error("Session expired");
  const rows=await r.json();loginPanel.hidden=true;dashboard.hidden=false;
  document.getElementById("bookingList").innerHTML=rows.length?rows.map(b=>`
  <article class="booking-item"><div><h3>RKN-${b.id} · ${esc(b.name)}</h3>
  <p><b>Phone:</b> ${esc(b.phone)} · <b>Service:</b> ${esc(b.serviceType)}</p>
  <p><b>Brand/model:</b> ${esc(b.brand)} ${esc(b.model)}</p><p><b>Problem:</b> ${esc(b.issue)}</p>
  <p><b>Address:</b> ${esc(b.address)}</p><p><b>Preferred date:</b> ${esc(b.preferredDate||"Not specified")}</p>
  <p><b>Received:</b> ${esc(b.createdAt)}</p><p><a href="https://wa.me/${String(b.phone).replace(/\D/g,"")}" target="_blank" rel="noopener">WhatsApp customer</a></p></div>
  <div><label>Status<select id="status-${b.id}">${["New","Contacted","In Progress","Completed","Cancelled"].map(s=>`<option ${b.status===s?"selected":""}>${s}</option>`).join("")}</select></label>
  <label>Warranty details<input id="warranty-${b.id}" value="${esc(b.warranty||"")}" placeholder="e.g. 30 days on board repair"></label>
  <label>Warranty start<input id="start-${b.id}" type="date" value="${esc(b.warrantyStart||"")}"></label>
  <label>Warranty end<input id="end-${b.id}" type="date" value="${esc(b.warrantyEnd||"")}"></label>
  <button onclick="save(${b.id})">Save updates</button><p id="msg-${b.id}"></p></div></article>`).join(""):"<p>No bookings yet.</p>";
 }catch(e){token=null;sessionStorage.removeItem("rknAdminToken");loginPanel.hidden=false;dashboard.hidden=true;}
}
window.save=async id=>{
 const body={status:document.getElementById(`status-${id}`).value,warranty:document.getElementById(`warranty-${id}`).value,warrantyStart:document.getElementById(`start-${id}`).value,warrantyEnd:document.getElementById(`end-${id}`).value};
 const r=await fetch(`/api/bookings/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify(body)});
 document.getElementById(`msg-${id}`).textContent=r.ok?"Updated successfully.":"Could not save changes.";
};
document.getElementById("loginForm").addEventListener("submit",async e=>{
 e.preventDefault();const f=Object.fromEntries(new FormData(e.target).entries());
 const r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(f)});
 const d=await r.json();if(!r.ok){document.getElementById("loginMsg").textContent=d.error||"Login failed.";return;}
 token=d.token;sessionStorage.setItem("rknAdminToken",token);load();
});
document.getElementById("logout").addEventListener("click",()=>{token=null;sessionStorage.removeItem("rknAdminToken");load();});
load();