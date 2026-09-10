const LOCS = ["Downtown","Midtown","Uptown","Airport","Westside"];

const LOC_COLORS = {
  Downtown:"#e8c882",
  Midtown:"#6bcb8b",
  Uptown:"#7aaddc",
  Airport:"#e07070",
  Westside:"#c97ad4"
};

const CATS = [
  "Produce","Dairy","Meat","Seafood",
  "Dry Goods","Beverages","Cleaning","Packaging"
];

const ROLES = [
  "Chef","Sous Chef","Server","Host",
  "Bartender","Dishwasher","Manager","Cashier"
];

let tab = "inv";
let activeLoc = "all";
let editId = null;

/*  INVENTORY DATA  */

let inventory = [
 {id:1,name:"Tomatoes",cat:"Produce",loc:"Downtown",qty:45,unit:"kg",price:2.5},
 {id:2,name:"Chicken Breast",cat:"Meat",loc:"Downtown",qty:12,unit:"kg",price:8},
 {id:3,name:"Mozzarella",cat:"Dairy",loc:"Midtown",qty:8,unit:"kg",price:11},
 {id:4,name:"Olive Oil",cat:"Dry Goods",loc:"Midtown",qty:6,unit:"L",price:9.5},
 {id:5,name:"Salmon",cat:"Seafood",loc:"Uptown",qty:0,unit:"kg",price:22},
 {id:6,name:"Flour",cat:"Dry Goods",loc:"Airport",qty:80,unit:"kg",price:1.2},
 {id:7,name:"Sparkling Water",cat:"Beverages",loc:"Westside",qty:3,unit:"cases",price:18},
 {id:8,name:"Dish Soap",cat:"Cleaning",loc:"Downtown",qty:20,unit:"bottles",price:3.5},
 {id:9,name:"Butter",cat:"Dairy",loc:"Uptown",qty:4,unit:"kg",price:7},
 {id:10,name:"Pasta",cat:"Dry Goods",loc:"Westside",qty:30,unit:"kg",price:2}
];

/*  EMPLOYEE DATA */

let employees = [
 {id:1,name:"Maria Santos",role:"Manager",loc:"Downtown",checkin:"08:00",checkout:"16:30",status:"present"},
 {id:2,name:"James Chen",role:"Chef",loc:"Downtown",checkin:"09:00",checkout:"",status:"present"},
 {id:3,name:"Aisha Patel",role:"Server",loc:"Midtown",checkin:"",checkout:"",status:"absent"},
 {id:4,name:"Luca Romano",role:"Bartender",loc:"Uptown",checkin:"12:00",checkout:"",status:"late"},
 {id:5,name:"Sofia Gupta",role:"Host",loc:"Airport",checkin:"07:30",checkout:"15:00",status:"present"}
];

let nextInvId = 11;
let nextEmpId = 6;

const today = new Date().toISOString().slice(0,10);

/*  HELPERS  */

function fmt(n){
 return n.toLocaleString("en-US",{
  minimumFractionDigits:2,
  maximumFractionDigits:2
 });
}

function invStatus(qty){
 if(qty===0) return "out";
 if(qty<5) return "low";
 return "ok";
}

function calcHours(ci,co){
 if(!ci || !co) return "—";

 const [h1,m1]=ci.split(":").map(Number);
 const [h2,m2]=co.split(":").map(Number);

 const hrs=((h2*60+m2)-(h1*60+m1))/60;
 return hrs>0 ? hrs.toFixed(1)+"h" : "—";
}

/*  NAVIGATION  */

function setLoc(loc,btn){
 activeLoc=loc;

 document.querySelectorAll(".loc-btn")
 .forEach(b=>b.classList.remove("active"));

 btn.classList.add("active");
 render();
}

function switchTab(t){

 tab=t;

 document.getElementById("inv-panel").style.display=t==="inv"?"":"none";
 document.getElementById("att-panel").style.display=t==="att"?"":"none";

 document.getElementById("nav-inv").className="nav-btn"+(t==="inv"?" active":"");
 document.getElementById("nav-att").className="nav-btn"+(t==="att"?" active":"");

 document.getElementById("topbar-title").textContent=
 t==="inv"?"Inventory Management":"Attendance Tracking";

 document.getElementById("topbar-sub").textContent=
 t==="inv"?"Track stock across all locations":"Monitor staff attendance";

 document.getElementById("add-btn-label").textContent=
 t==="inv"?"Add Item":"Add Employee";

 document.getElementById("date-wrap").style.display=t==="att"?"":"none";

 render();
}

function render(){
 if(tab==="inv") renderInventory();
 else renderAttendance();
}

/* INVENTORY  */

function renderInventory(){

 const q=document.getElementById("search-box").value.toLowerCase();

 const items=inventory.filter(i=>
  (activeLoc==="all" || i.loc===activeLoc) &&
  (i.name.toLowerCase().includes(q) ||
   i.cat.toLowerCase().includes(q))
 );

 const total=items.reduce((s,i)=>s+i.qty*i.price,0);

 const low=items.filter(i=>i.qty>0 && i.qty<5).length;
 const out=items.filter(i=>i.qty===0).length;

 document.getElementById("inv-metrics").innerHTML=`
 <div class="metric-card">
   <div class="metric-label">Items</div>
   <div class="metric-value">${items.length}</div>
 </div>

 <div class="metric-card">
   <div class="metric-label">Stock Value</div>
   <div class="metric-value accent">$${fmt(total)}</div>
 </div>

 <div class="metric-card">
   <div class="metric-label">Low</div>
   <div class="metric-value amber">${low}</div>
 </div>

 <div class="metric-card">
   <div class="metric-label">Out</div>
   <div class="metric-value red">${out}</div>
 </div>`;

 const tbody=document.getElementById("inv-tbody");

 tbody.innerHTML=items.map(i=>`
 <tr>
  <td class="bold">${i.name}</td>
  <td>${i.cat}</td>
  <td><span class="loc-chip">${i.loc}</span></td>
  <td class="mono">${i.qty}</td>
  <td>${i.unit}</td>
  <td>$${fmt(i.price)}</td>
  <td>$${fmt(i.qty*i.price)}</td>
  <td>
   <span class="badge badge-${invStatus(i.qty)}">
    ${invStatus(i.qty)==="ok"?"In Stock":
      invStatus(i.qty)==="low"?"Low":"Out"}
   </span>
  </td>
  <td class="action-cell">
    <button class="icon-btn" onclick="editInv(${i.id})">✏</button>
    <button class="icon-btn del" onclick="deleteInv(${i.id})">🗑</button>
  </td>
 </tr>
 `).join("");
}

/*  ATTENDANCE */

function renderAttendance(){

 const q=document.getElementById("search-box").value.toLowerCase();

 const emps=employees.filter(e=>
  (activeLoc==="all" || e.loc===activeLoc) &&
  (e.name.toLowerCase().includes(q) ||
   e.role.toLowerCase().includes(q))
 );

 const present=emps.filter(e=>e.status==="present").length;
 const absent=emps.filter(e=>e.status==="absent").length;

 document.getElementById("att-metrics").innerHTML=`
 <div class="metric-card">
   <div class="metric-label">Staff</div>
   <div class="metric-value">${emps.length}</div>
 </div>

 <div class="metric-card">
   <div class="metric-label">Present</div>
   <div class="metric-value green">${present}</div>
 </div>

 <div class="metric-card">
   <div class="metric-label">Absent</div>
   <div class="metric-value red">${absent}</div>
 </div>`;

 const tbody=document.getElementById("att-tbody");

 tbody.innerHTML=emps.map(e=>`
 <tr>
  <td class="bold">${e.name}</td>
  <td>${e.role}</td>
  <td><span class="loc-chip">${e.loc}</span></td>
  <td>${e.checkin||"—"}</td>
  <td>${e.checkout||"—"}</td>
  <td>${calcHours(e.checkin,e.checkout)}</td>
  <td>
    <span class="badge badge-${e.status}">
      ${e.status}
    </span>
  </td>
  <td class="action-cell">
    <button class="icon-btn" onclick="editEmp(${e.id})">✏</button>
    <button class="icon-btn del" onclick="deleteEmp(${e.id})">🗑</button>
  </td>
 </tr>
 `).join("");
}

/* MODAL  */

function openModal(data){

 editId=data?data.id:null;

 document.getElementById("modal-overlay").classList.add("open");

 const body=document.getElementById("modal-body");
 const title=document.getElementById("modal-title");

 if(tab==="inv"){

  title.textContent=data?"Edit Item":"Add Item";

  body.innerHTML=`
  <div class="form-row">
    <label>Item Name</label>
    <input id="f-name" value="${data?.name||""}">
  </div>

  <div class="form-grid">

    <div class="form-row">
      <label>Category</label>
      <select id="f-cat">
        ${CATS.map(c=>`<option ${data?.cat===c?"selected":""}>${c}</option>`).join("")}
      </select>
    </div>

    <div class="form-row">
      <label>Location</label>
      <select id="f-loc">
        ${LOCS.map(l=>`<option ${data?.loc===l?"selected":""}>${l}</option>`).join("")}
      </select>
    </div>

  </div>

  <div class="form-grid">

    <div class="form-row">
      <label>Quantity</label>
      <input id="f-qty" type="number" value="${data?.qty??0}">
    </div>

    <div class="form-row">
      <label>Unit</label>
      <input id="f-unit" value="${data?.unit||"kg"}">
    </div>

  </div>

  <div class="form-row">
    <label>Price</label>
    <input id="f-price" type="number" value="${data?.price??0}" step="0.01">
  </div>`;
 }

 else{

  title.textContent=data?"Edit Employee":"Add Employee";

  body.innerHTML=`
  <div class="form-row">
    <label>Name</label>
    <input id="f-name" value="${data?.name||""}">
  </div>

  <div class="form-row">
    <label>Role</label>
    <select id="f-role">
      ${ROLES.map(r=>`<option ${data?.role===r?"selected":""}>${r}</option>`).join("")}
    </select>
  </div>

  <div class="form-row">
    <label>Location</label>
    <select id="f-loc">
      ${LOCS.map(l=>`<option ${data?.loc===l?"selected":""}>${l}</option>`).join("")}
    </select>
  </div>

  <div class="form-grid">

    <div class="form-row">
      <label>Check In</label>
      <input id="f-checkin" type="time" value="${data?.checkin||""}">
    </div>

    <div class="form-row">
      <label>Check Out</label>
      <input id="f-checkout" type="time" value="${data?.checkout||""}">
    </div>

  </div>

  <div class="form-row">
    <label>Status</label>
    <select id="f-status">
      <option value="present">Present</option>
      <option value="absent">Absent</option>
      <option value="late">Late</option>
      <option value="leave">Leave</option>
    </select>
  </div>`;
 }
}

function saveModal(){

 if(tab==="inv"){

  const item={
   id:editId||nextInvId++,
   name:document.getElementById("f-name").value,
   cat:document.getElementById("f-cat").value,
   loc:document.getElementById("f-loc").value,
   qty:+document.getElementById("f-qty").value,
   unit:document.getElementById("f-unit").value,
   price:+document.getElementById("f-price").value
  };

  if(editId){
    inventory=inventory.map(i=>i.id===editId?item:i);
  }else{
    inventory.push(item);
  }

 }else{

  const emp={
   id:editId||nextEmpId++,
   name:document.getElementById("f-name").value,
   role:document.getElementById("f-role").value,
   loc:document.getElementById("f-loc").value,
   checkin:document.getElementById("f-checkin").value,
   checkout:document.getElementById("f-checkout").value,
   status:document.getElementById("f-status").value
  };

  if(editId){
    employees=employees.map(e=>e.id===editId?emp:e);
  }else{
    employees.push(emp);
  }
 }

 closeModal();
 render();
}

function editInv(id){
 openModal(inventory.find(i=>i.id===id));
}

function editEmp(id){
 openModal(employees.find(e=>e.id===id));
}

function deleteInv(id){
 inventory=inventory.filter(i=>i.id!==id);
 render();
}

function deleteEmp(id){
 employees=employees.filter(e=>e.id!==id);
 render();
}

function closeModal(){
 document.getElementById("modal-overlay").classList.remove("open");
 editId=null;
}

function overlayClick(e){
 if(e.target.id==="modal-overlay") closeModal();
}

/* START  */

document.addEventListener("DOMContentLoaded",()=>{
 document.getElementById("att-date").value=today;
 render();
});