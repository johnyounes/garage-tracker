import { useState, useMemo, useEffect, useCallback } from "react";
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs";

const SUPA_URL  = "https://isliwfbgftjxaatafhzc.supabase.co";
const SUPA_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzbGl3ZmJnZnRqeGFhdGFmaHpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NzA5NjMsImV4cCI6MjA4OTM0Njk2M30.ZelhESeEbOHOKtqPEH2-gJ0qkZbH6nS8B_N6Z3wTves";

async function sbFetch(path, opts = {}) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      "apikey": SUPA_ANON,
      "Authorization": `Bearer ${SUPA_ANON}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`Supabase ${res.status}: ${t}`); }
  if (res.status === 204) return null;
  return res.json();
}

const PROP_MAP = {
  "Bancroft Place":"Bancroft Place Apartments","Boulder Pointe":"Boulder Pointe Townhomes",
  "Brent Village":"Brent Village","Copperleaf":"Copperleaf","Judee Estates":"Judee Estates",
  "Maple Park":"Maple Park Apartments","Sierra Gardens":"Sierra Gardens",
  "Stoneybrook":"Stoneybrook Apartments","Tall Oaks":"Tall Oaks",
  "The Preserve":"The Preserve","Villa Blanca":"Villa Blanca Apartments",
};
const PROP_TOTALS = {
  "Bancroft Place Apartments":52,"Boulder Pointe Townhomes":78,"Brent Village":87,
  "Copperleaf":14,"Judee Estates":60,"Maple Park Apartments":38,"Sierra Gardens":23,
  "Stoneybrook Apartments":8,"Tall Oaks":27,"The Preserve":78,"Villa Blanca Apartments":24,
};
const MGMT_HOLDS = [
  {property:"Copperleaf",garage_id:"G1",notes:"Management Hold"},
  {property:"Copperleaf",garage_id:"G13",notes:"Management Hold"},
  {property:"Tall Oaks",garage_id:"7001-G2",notes:"Management Hold – PGM Maintenance"},
  {property:"Tall Oaks",garage_id:"7005-G2",notes:"Management Hold – PGM Maintenance"},
  {property:"Stoneybrook Apartments",garage_id:"G-1",notes:"Management Hold – not empty"},
  {property:"Stoneybrook Apartments",garage_id:"S-2",notes:"Management Hold – office use",is_storage:true},
  {property:"Brent Village",garage_id:"G27",notes:"Management Hold – Storage"},
  {property:"Brent Village",garage_id:"G30",notes:"Management Hold – Shop"},
  {property:"Brent Village",garage_id:"G31",notes:"Management Hold – Shop"},
];
const STONEYBROOK_STORAGE = [
  {garage_id:"S-1",tenant:"Rosa Arambula",unit:"2806-3",price:50,status:"occupied",is_storage:true},
  {garage_id:"S-3",tenant:"Alfonso Orozco",unit:"2802-2",price:25,status:"occupied",is_storage:true},
  {garage_id:"S-4",tenant:"Rose Alvarez",unit:"2808-1",price:50,status:"occupied",is_storage:true},
];
const NON_RESIDENT_NAMES = ["Rick Scarborough","Thomas Wurtenberger","James Ruth","Becky Robertson","Coleen Bockelmann","Hanson","Sandy Hudspeth","Tim Logan"];

function getProp(desc){ for(const[k,v]of Object.entries(PROP_MAP)){if(String(desc).startsWith(k))return v;}return null; }
function firstTenant(t){ return t?String(t).split("\n")[0].trim():""; }
function getUnit(desc){ const m=String(desc).match(/-\s*([^\s|]+)\s*\|/);return m?m[1]:""; }
function isNonResident(tenant){ return NON_RESIDENT_NAMES.some(n=>(tenant||"").includes(n))||(tenant||"").toLowerCase().includes("non-resident"); }

function extractIds(g, prop){
  if(prop==="Tall Oaks"){
    const m=[...g.matchAll(/[Gg]arage[:\s]+(\d+)[-\s]+G(\w+)/g)];
    if(m.length)return m.map(x=>`${x[1]}-G${x[2]}`);
    const m2=[...g.matchAll(/[Gg]arage[:\s]+(\d+)\s+G(\w+)/g)];
    if(m2.length)return m2.map(x=>`${x[1]}-G${x[2]}`);
    const m3=[...g.matchAll(/[Gg]arage\s+(\d+-[A-Z])/g)];
    if(m3.length)return m3.map(x=>x[1]);
  }
  if(prop==="The Preserve"){
    const m=[...g.matchAll(/[Bb]ldg\s+([^\s-]+)\s*[-–]\s*G(\w+)/g)];
    if(m.length)return m.map(x=>`Bldg ${x[1]}-G${x[2]}`);
    const m2=[...g.matchAll(/[Bb]ldg\s+(\w+-G\w+)/g)];
    if(m2.length)return m2.map(x=>`Bldg ${x[1]}`);
  }
  if(prop==="Judee Estates"){
    const m=[...g.matchAll(/[Gg]arage[:\s]+(\d+-\d+)/g)];
    if(m.length)return m.map(x=>`G${x[1]}`);
  }
  if(prop==="Stoneybrook Apartments"){
    const m=g.match(/[Gg]arage\s+G?(\w+)/);
    if(m)return[`G-${m[1]}`];
  }
  if(prop==="Sierra Gardens"){
    const m=g.match(/[Cc]arport\s+(\d+)/);if(m)return[`Carport ${m[1]}`];
    const m2=g.match(/[Ss]pace\s+(\d+)/);if(m2)return[`Space ${m2[1]}`];
  }
  const gs=[...g.matchAll(/\bG(\d+)\b/g)];
  if(gs.length)return gs.map(x=>`G${x[1]}`);
  const ns=[...g.matchAll(/[Gg]arage\s*#?\s*(\d+)/g)];
  return ns.map(x=>`G${x[1]}`);
}

function parseGarage(raw, prop){
  if(!raw||String(raw).trim()===""||String(raw).toLowerCase()==="none")return[];
  const g=String(raw).trim();
  if(/included|not in lease|not charged/i.test(g)){
    const ids=extractIds(g,prop);
    return(ids.length?ids:["G-included"]).map(id=>({id,price:0,notes:"Included in rent"}));
  }
  // Villa Blanca "Garage X - $Y and Garage Z - $Y"
  if(/and\s+[Gg]arage\s+\d+\s*-\s*\$/.test(g)){
    const ms=[...g.matchAll(/[Gg]arage\s+(\d+)\s*-\s*\$\s*([\d.]+)/g)];
    if(ms.length)return ms.map(m=>({id:`G${m[1]}`,price:Math.round(parseFloat(m[2]))}));
  }
  // Per-garage price with /ea or ea.
  const eaM=g.match(/\$\s*([\d.]+)\s*\/?\s*ea/i);
  if(eaM){
    const p=Math.round(parseFloat(eaM[1]));
    return extractIds(g,prop).map(id=>({id,price:p}));
  }
  const ids=extractIds(g,prop);
  const prices=[...g.matchAll(/\$\s*([\d.]+)/g)].map(m=>Math.round(parseFloat(m[1])));
  if(ids.length===0){
    const pm=g.match(/\$\s*([\d.]+)/);
    return[{id:"G?",price:pm?Math.round(parseFloat(pm[1])):null,notes:"Garage # TBD – number not yet entered in Buildium"}];
  }
  if(ids.length===1)return[{id:ids[0],price:prices[0]??null}];
  // Boulder Pointe: 1st free, rest $50
  if(prop==="Boulder Pointe Townhomes")
    return ids.map((id,i)=>({id,price:i===0?0:50,notes:i===0?"Included (1st garage)":"2nd garage – $50/mo"}));
  // Multiple garages single price: split equally
  if(prices.length===1){
    const each=Math.round(prices[0]/ids.length);
    return ids.map(id=>({id,price:each,notes:`$${prices[0]} total ÷ ${ids.length}`}));
  }
  return ids.map((id,i)=>({id,price:prices[i]??null}));
}

function parseBuildium(buf){
  const wb=XLSX.read(buf,{type:"array",cellDates:true});
  const ws=wb.Sheets[wb.SheetNames[0]];
  const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
  let hr=-1;
  for(let i=0;i<rows.length;i++){if(String(rows[i][0]).includes("Lease description")){hr=i;break;}}
  if(hr===-1)throw new Error("Header row not found");
  const records=[];
  const seen=new Set();
  for(let i=hr+1;i<rows.length;i++){
    const[desc,,,,status,,,, tenants,garageRaw]=rows[i];
    if(!desc||String(status)!=="Active")continue;
    const prop=getProp(desc);if(!prop)continue;
    const tenant=firstTenant(tenants),unit=getUnit(desc);
    for(const g of parseGarage(garageRaw,prop)){
      if(!g.id)continue;
      const key=`${prop}::${g.id}`;
      if(seen.has(key)&&g.id!=="G?")continue;
      seen.add(key);
      records.push({property:prop,garage_id:g.id,tenant:tenant||null,unit:unit||null,
        price:g.price??null,status:"occupied",non_resident:isNonResident(tenant),
        notes:g.notes||null,is_storage:false});
    }
  }
  for(const h of MGMT_HOLDS){
    const key=`${h.property}::${h.garage_id}`;
    if(!seen.has(key)){seen.add(key);records.push({...h,tenant:"Management",unit:null,price:0,status:"mgmt_hold",non_resident:false,is_storage:h.is_storage||false});}
  }
  for(const s of STONEYBROOK_STORAGE){
    const key=`Stoneybrook Apartments::${s.garage_id}`;
    if(!seen.has(key)){seen.add(key);records.push({property:"Stoneybrook Apartments",...s});}
  }
  return records;
}

async function uploadToSupabase(records,filename){
  await sbFetch("garage_data?id=gte.0",{method:"DELETE"});
  for(let i=0;i<records.length;i+=200){
    await sbFetch("garage_data",{method:"POST",body:JSON.stringify(records.slice(i,i+200))});
  }
  await sbFetch("upload_log",{method:"POST",body:JSON.stringify({filename,records_parsed:records.length})});
}

async function fetchFromSupabase(){
  const[garages,logs]=await Promise.all([
    sbFetch("garage_data?select=*&order=property,garage_id"),
    sbFetch("upload_log?select=*&order=uploaded_at.desc&limit=1"),
  ]);
  return{garages:garages||[],lastUpload:logs?.[0]||null};
}

const COLORS={"Bancroft Place Apartments":"#e63946","Boulder Pointe Townhomes":"#7209b7","Brent Village":"#f72585","Copperleaf":"#fb8500","Judee Estates":"#06d6a0","Maple Park Apartments":"#f4d35e","Sierra Gardens":"#0096c7","Stoneybrook Apartments":"#80b918","Tall Oaks":"#9b5de5","The Preserve":"#f4a261","Villa Blanca Apartments":"#4cc9f0"};
const FLAGS_STATIC=[
  {prop:"Brent Village",garage:"G8",msg:"G8 & G9: Non-resident tenants still unidentified."},
  {prop:"Brent Village",garage:"G9",msg:"G8 & G9: Non-resident tenants still unidentified."},
  {prop:"Brent Village",garage:"G21",msg:"Ramon Garcia (G21+G73): no price in lease. Confirm rate."},
  {prop:"Judee Estates",garage:null,msg:"Only 8 of 60 garages confirmed. Verify remaining units."},
  {prop:"Stoneybrook Apartments",garage:"G-1",msg:"G-1 Management Hold noted as not empty. Still needed?"},
  {prop:"The Preserve",garage:"Bldg 4201-G6",msg:"Decarlos Brooks & Emma Kelly both listed at Bldg 4201-G6. Verify."},
];

function buildPropMap(records){const m={};for(const r of records){if(!m[r.property])m[r.property]=[];m[r.property].push(r);}return m;}
function getStats(recs,prop){
  const total=PROP_TOTALS[prop]||recs.length;
  const occ=recs.filter(r=>r.status==="occupied"&&!r.is_storage).length;
  const mgmt=recs.filter(r=>r.status==="mgmt_hold"&&!r.is_storage).length;
  const rev=recs.filter(r=>r.price>0).reduce((a,r)=>a+(r.price||0),0);
  const nonRes=recs.filter(r=>r.non_resident).length;
  return{total,occ,mgmt,vacant:Math.max(0,total-occ-mgmt),rev,nonRes};
}
function OccBar({occ,mgmt,total,color}){
  return(<div style={{height:5,borderRadius:3,background:"#1e293b",overflow:"hidden",display:"flex"}}>
    <div style={{width:`${total>0?(occ/total)*100:0}%`,background:color||"#22c55e"}}/>
    <div style={{width:`${total>0?(mgmt/total)*100:0}%`,background:"#f59e0b"}}/>
  </div>);
}

export default function App(){
  const[records,setRecords]=useState([]);
  const[lastUpload,setLastUpload]=useState(null);
  const[loading,setLoading]=useState(true);
  const[uploading,setUploading]=useState(false);
  const[uploadMsg,setUploadMsg]=useState("");
  const[sel,setSel]=useState(null);
  const[filter,setFilter]=useState("all");
  const[search,setSearch]=useState("");
  const[selGarage,setSelGarage]=useState(null);
  const[showUpload,setShowUpload]=useState(false);

  useEffect(()=>{
    fetchFromSupabase()
      .then(({garages,lastUpload})=>{setRecords(garages);setLastUpload(lastUpload);})
      .catch(e=>console.error(e))
      .finally(()=>setLoading(false));
  },[]);

  const propMap=useMemo(()=>buildPropMap(records),[records]);
  const propNames=Object.keys(COLORS);
  const totals=useMemo(()=>{
    let total=0,occ=0,mgmt=0,rev=0,nonRes=0;
    propNames.forEach(p=>{const s=getStats(propMap[p]||[],p);total+=s.total;occ+=s.occ;mgmt+=s.mgmt;rev+=s.rev;nonRes+=s.nonRes;});
    return{total,occ,mgmt,vacant:total-occ-mgmt,rev,nonRes};
  },[propMap]);
  const revenueData=useMemo(()=>propNames.map(p=>({name:p,rev:getStats(propMap[p]||[],p).rev,color:COLORS[p]})).filter(x=>x.rev>0).sort((a,b)=>b.rev-a.rev),[propMap]);

  const handleFile=useCallback(async(file)=>{
    if(!file)return;
    setUploading(true);setUploadMsg("Reading file…");
    try{
      const buf=await file.arrayBuffer();
      setUploadMsg("Parsing Buildium export…");
      const parsed=parseBuildium(buf);
      setUploadMsg(`Saving ${parsed.length} records…`);
      await uploadToSupabase(parsed,file.name);
      setUploadMsg("Refreshing…");
      const{garages,lastUpload}=await fetchFromSupabase();
      setRecords(garages);setLastUpload(lastUpload);
      setUploadMsg(`✅ Done — ${parsed.length} records loaded`);
      setTimeout(()=>{setShowUpload(false);setUploadMsg("");},2500);
    }catch(e){setUploadMsg(`❌ ${e.message}`);}
    finally{setUploading(false);}
  },[]);

  const propRecs=sel?(propMap[sel]||[]):[];
  const garageRecs=propRecs.filter(r=>!r.is_storage);
  const storageRecs=propRecs.filter(r=>r.is_storage);
  const pc=sel?(COLORS[sel]||"#3b82f6"):"#3b82f6";
  const pStats=sel?getStats(propRecs,sel):{};
  const propFlags=sel?FLAGS_STATIC.filter(f=>f.prop===sel):[];
  const tbdRecs=garageRecs.filter(r=>r.garage_id==="G?");
  const filtered=useMemo(()=>{
    let g=garageRecs;
    if(filter!=="all")g=g.filter(r=>r.status===filter);
    if(search){const q=search.toLowerCase();g=g.filter(r=>(r.tenant||"").toLowerCase().includes(q)||(r.garage_id||"").toLowerCase().includes(q)||(r.unit||"").toLowerCase().includes(q));}
    return g;
  },[garageRecs,filter,search]);

  const fmtDate=d=>d?new Date(d).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}):"Never";

  return(
    <div style={{fontFamily:"system-ui,sans-serif",background:"#070f1a",minHeight:"100vh",color:"#f1f5f9"}}>
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#1e293b}.gc:hover{opacity:.85;transform:translateY(-1px)}.pr:hover{background:#0f1f35!important}`}</style>

      {/* HEADER */}
      <div style={{background:"#050c17",borderBottom:"1px solid #0f1f35",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:9,letterSpacing:"0.2em",color:"#475569",textTransform:"uppercase"}}>Point Guard Management</div>
          <div style={{fontSize:18,fontWeight:800,letterSpacing:"-0.5px",marginTop:1}}>
            🚗 Garage Rental Tracker
            {lastUpload&&<span style={{fontSize:10,fontWeight:400,color:"#334155",marginLeft:10}}>Last updated {fmtDate(lastUpload.uploaded_at)} · {lastUpload.records_parsed} records</span>}
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          {[["Total",totals.total,"#94a3b8"],["Occupied",totals.occ,"#22c55e"],["Mgmt Hold",totals.mgmt,"#f59e0b"],["Vacant",totals.vacant,"#f87171"],["Non-Res",totals.nonRes,"#a78bfa"]].map(([l,v,c])=>(
            <div key={l} style={{background:"#0a1628",border:"1px solid #0f1f35",borderRadius:8,padding:"6px 12px",textAlign:"center",minWidth:64}}>
              <div style={{fontSize:16,fontWeight:800,color:c}}>{v}</div>
              <div style={{fontSize:9,color:"#475569",textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div>
            </div>
          ))}
          <div style={{background:"#0a1628",border:"1px solid #16a34a",borderRadius:8,padding:"6px 16px",textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:800,color:"#4ade80"}}>${totals.rev.toLocaleString()}/mo</div>
            <div style={{fontSize:9,color:"#475569",textTransform:"uppercase",letterSpacing:"0.1em"}}>Total Revenue</div>
          </div>
          <button onClick={()=>setShowUpload(true)} style={{background:"#2563eb",color:"white",border:"none",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer"}}>↑ Upload Lease Report</button>
        </div>
      </div>

      {loading&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"calc(100vh - 64px)",color:"#475569",fontSize:14}}>Loading dashboard…</div>}

      {!loading&&(
        <div style={{display:"flex",height:"calc(100vh - 64px)"}}>
          {/* SIDEBAR */}
          <div style={{width:255,flexShrink:0,background:"#080f1c",borderRight:"1px solid #0f1f35",overflowY:"auto",padding:10}}>
            {propNames.map(name=>{
              const s=getStats(propMap[name]||[],name),pct=s.total>0?Math.round(((s.occ+s.mgmt)/s.total)*100):0,c=COLORS[name],isSel=sel===name,pf=FLAGS_STATIC.filter(f=>f.prop===name).length;
              return(
                <div key={name} className="pr" onClick={()=>{setSel(isSel?null:name);setSelGarage(null);setSearch("");setFilter("all");}}
                  style={{borderRadius:10,padding:"9px 11px",cursor:"pointer",marginBottom:3,background:isSel?"#0f1f35":"transparent",border:isSel?`1px solid ${c}50`:"1px solid transparent",transition:"all .15s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:c}}/>
                    <div style={{fontSize:11,fontWeight:600,flex:1,color:isSel?"#f1f5f9":"#64748b",lineHeight:1.3}}>{name}</div>
                    <div style={{fontSize:12,fontWeight:800,color:c}}>{pct}%</div>
                    {pf>0&&<div style={{background:"#7c1d1d",color:"#fca5a5",borderRadius:5,padding:"1px 5px",fontSize:9,fontWeight:800}}>⚑{pf}</div>}
                  </div>
                  <OccBar occ={s.occ} mgmt={s.mgmt} total={s.total} color={c}/>
                  <div style={{display:"flex",gap:8,marginTop:4,fontSize:9,color:"#475569",justifyContent:"space-between"}}>
                    <span><span style={{color:"#22c55e"}}>{s.occ}</span> occ · {s.vacant} vac · {s.total} tot</span>
                    {s.rev>0&&<span style={{color:"#4ade80",fontWeight:700}}>${s.rev.toLocaleString()}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* MAIN */}
          <div style={{flex:1,overflowY:"auto",padding:18}}>
            {propFlags.length>0&&(
              <div style={{background:"#1c0a00",border:"1px solid #c2410c",borderRadius:12,padding:"12px 16px",marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:800,color:"#fb923c",marginBottom:8}}>⚑ {propFlags.length} Items Need Attention</div>
                {propFlags.map((f,i)=><div key={i} style={{fontSize:11,color:"#fed7aa",paddingLeft:10,marginBottom:4,borderLeft:"2px solid #c2410c"}}>{f.msg}</div>)}
              </div>
            )}
            {tbdRecs.length>0&&(
              <div style={{background:"#1a1000",border:"1px solid #d97706",borderRadius:12,padding:"12px 16px",marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:800,color:"#fbbf24",marginBottom:6}}>⚠ {tbdRecs.length} Garage Number(s) TBD in Buildium</div>
                {tbdRecs.map((r,i)=>(
                  <div key={i} style={{fontSize:11,color:"#fde68a",paddingLeft:10,borderLeft:"2px solid #d97706",marginBottom:3}}>
                    {r.tenant} · Unit {r.unit}{r.price?` · $${r.price}/mo`:""} — Enter garage # in Buildium to resolve
                  </div>
                ))}
              </div>
            )}

            {!sel?(
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"#475569",marginBottom:14,textTransform:"uppercase",letterSpacing:"0.1em"}}>Portfolio Revenue Breakdown</div>
                <div style={{background:"#080f1c",border:"1px solid #0f1f35",borderRadius:14,padding:"18px 20px",marginBottom:20}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:16}}>
                    <div style={{fontSize:28,fontWeight:900,color:"#4ade80",letterSpacing:"-1px"}}>${totals.rev.toLocaleString()}<span style={{fontSize:14,fontWeight:400,color:"#475569"}}>/mo</span></div>
                    <div style={{fontSize:11,color:"#475569"}}>tracked revenue · {propNames.length} properties</div>
                  </div>
                  {revenueData.map(({name,rev,color})=>{
                    const pct=totals.rev>0?(rev/totals.rev)*100:0;
                    return(
                      <div key={name} style={{marginBottom:10,cursor:"pointer"}} onClick={()=>setSel(name)}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{width:8,height:8,borderRadius:"50%",background:color}}/>
                            <span style={{fontSize:11,fontWeight:600,color:"#94a3b8"}}>{name}</span>
                          </div>
                          <div style={{display:"flex",gap:12,alignItems:"center"}}>
                            <span style={{fontSize:10,color:"#475569"}}>{pct.toFixed(1)}%</span>
                            <span style={{fontSize:12,fontWeight:700,color:"#4ade80",minWidth:70,textAlign:"right"}}>${rev.toLocaleString()}/mo</span>
                          </div>
                        </div>
                        <div style={{height:6,borderRadius:3,background:"#1e293b",overflow:"hidden"}}>
                          <div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:3}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {records.length===0&&(
                  <div style={{textAlign:"center",padding:"40px 20px",color:"#334155"}}>
                    <div style={{fontSize:32,marginBottom:12}}>📂</div>
                    <div style={{fontSize:14,fontWeight:700,color:"#475569",marginBottom:6}}>No data loaded yet</div>
                    <div style={{fontSize:11}}>Click <strong style={{color:"#3b82f6"}}>↑ Upload Lease Report</strong> to get started</div>
                  </div>
                )}
              </div>
            ):(
              <>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:10,height:10,borderRadius:"50%",background:pc}}/>
                      <div style={{fontSize:16,fontWeight:800}}>{sel}</div>
                    </div>
                    <div style={{fontSize:10,color:"#475569",marginTop:2}}>{pStats.occ}/{pStats.total} occupied · {pStats.vacant} vacant{pStats.nonRes>0?` · ${pStats.nonRes} non-resident`:""}</div>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{background:"#0a1628",border:"1px solid #0f1f35",borderRadius:7,padding:"6px 10px",color:"#f1f5f9",fontSize:11,width:140,outline:"none"}}/>
                    {["all","occupied","mgmt_hold","vacant"].map(s=>(
                      <button key={s} onClick={()=>setFilter(s)} style={{padding:"6px 10px",borderRadius:7,fontSize:10,fontWeight:700,border:"none",cursor:"pointer",background:filter===s?pc:"#0a1628",color:filter===s?"white":"#475569"}}>
                        {s==="all"?"All":s==="mgmt_hold"?"Mgmt":s.charAt(0).toUpperCase()+s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:14}}>
                  {[["Monthly Revenue",`$${(pStats.rev||0).toLocaleString()}`,`${totals.rev>0?((pStats.rev/totals.rev)*100).toFixed(1):0}% of portfolio`,"#052e16","#16a34a","#4ade80"],
                    ["Occupied",`${pStats.occ}/${pStats.total}`,`${pStats.total>0?Math.round((pStats.occ/pStats.total)*100):0}% occupancy`,"#080f1c","#0f1f35","#22c55e"],
                    ["Vacant",`${pStats.vacant}`,"available to rent","#080f1c","#0f1f35","#f87171"],
                  ].map(([label,val,sub,bg,border,color])=>(
                    <div key={label} style={{background:bg,border:`1px solid ${border}`,borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:border==="#0f1f35"?"#475569":border,marginBottom:4}}>{label}</div>
                      <div style={{fontSize:20,fontWeight:900,color,letterSpacing:"-0.5px"}}>{val}</div>
                      <div style={{fontSize:9,color:"#475569",marginTop:2}}>{sub}</div>
                    </div>
                  ))}
                  {pStats.mgmt>0&&(
                    <div style={{background:"#1a1000",border:"1px solid #d97706",borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"#d97706",marginBottom:4}}>Mgmt Hold</div>
                      <div style={{fontSize:20,fontWeight:900,color:"#fbbf24"}}>{pStats.mgmt}</div>
                      <div style={{fontSize:9,color:"#92400e",marginTop:2}}>review if releasable</div>
                    </div>
                  )}
                </div>

                <div style={{background:"#080f1c",borderRadius:10,padding:"10px 14px",marginBottom:14,border:"1px solid #0f1f35"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:9,color:"#475569"}}>
                    <span style={{color:"#22c55e"}}>■ Occupied {pStats.occ}</span>
                    {pStats.mgmt>0&&<span style={{color:"#f59e0b"}}>■ Mgmt {pStats.mgmt}</span>}
                    <span>■ Vacant {pStats.vacant}</span>
                    <span style={{color:pc,fontWeight:800}}>{pStats.total>0?Math.round(((pStats.occ+pStats.mgmt)/pStats.total)*100):0}% utilized</span>
                  </div>
                  <OccBar occ={pStats.occ} mgmt={pStats.mgmt} total={pStats.total} color={pc}/>
                </div>

                <div style={{display:"flex",gap:12,marginBottom:12,fontSize:9,color:"#475569",flexWrap:"wrap"}}>
                  {[["#052e16","#16a34a","Resident"],["#1e1333","#7c3aed","★ Non-Resident"],["#1a1000","#d97706","🔧 Mgmt Hold"],["#080f1c","#1e293b","Vacant"],["#1a0f00","#ca8a04","? TBD"]].map(([bg,bdr,label])=>(
                    <div key={label} style={{display:"flex",alignItems:"center",gap:4}}>
                      <div style={{width:11,height:11,borderRadius:3,background:bg,border:`1.5px solid ${bdr}`}}/>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:7,marginBottom:18}}>
                  {filtered.map((g,idx)=>{
                    const occ=g.status==="occupied",mgmt=g.status==="mgmt_hold",nr=g.non_resident,tbd=g.garage_id==="G?";
                    const hasFlag=FLAGS_STATIC.some(f=>f.prop===sel&&f.garage===g.garage_id);
                    const isSel2=selGarage?.id===g.id;
                    return(
                      <div key={`${g.garage_id}-${idx}`} className="gc" onClick={()=>setSelGarage(isSel2?null:g)}
                        style={{background:tbd?"#1a0f00":nr?"#1e1333":mgmt?"#1a1000":occ?"#052e16":"#080f1c",border:`1.5px solid ${isSel2?pc:tbd?"#ca8a04":nr?"#7c3aed":mgmt?"#d97706":occ?"#16a34a":"#0f1f35"}`,borderRadius:9,padding:"8px 9px",cursor:"pointer",transition:"all .15s",position:"relative"}}>
                        {hasFlag&&<div style={{position:"absolute",top:4,right:4,width:6,height:6,borderRadius:"50%",background:"#f97316"}}/>}
                        <div style={{fontSize:9,fontWeight:700,color:"#475569",marginBottom:2,fontFamily:"monospace"}}>{g.garage_id}</div>
                        <div style={{fontSize:10,fontWeight:600,color:(occ||tbd)?"#f1f5f9":"#334155",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {g.status==="vacant"?<span style={{fontStyle:"italic",color:"#1e293b"}}>Vacant</span>
                            :mgmt?<span style={{color:"#fbbf24"}}>🔧 Mgmt</span>
                            :tbd?<span style={{color:"#fde68a"}}>? {g.tenant}</span>
                            :<>{nr&&<span style={{color:"#a78bfa"}}>★ </span>}{g.tenant}</>}
                        </div>
                        {g.unit&&<div style={{fontSize:8,color:"#1e3a5f",marginTop:1}}>Unit {g.unit}</div>}
                        {g.price!=null&&g.status!=="vacant"&&<div style={{fontSize:9,color:g.price>0?"#22c55e":"#334155",fontWeight:700,marginTop:1}}>{g.price===0?"Free":`$${g.price}/mo`}</div>}
                      </div>
                    );
                  })}
                </div>

                {storageRecs.length>0&&(
                  <div style={{background:"#080f1c",borderRadius:10,padding:"12px 14px",marginBottom:14,border:"1px solid #0f1f35"}}>
                    <div style={{fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#475569",marginBottom:10}}>Storage Units</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:7}}>
                      {storageRecs.map((g,i)=>(
                        <div key={i} style={{background:g.status==="mgmt_hold"?"#1a1000":"#052e16",border:`1.5px solid ${g.status==="mgmt_hold"?"#d97706":"#16a34a"}`,borderRadius:9,padding:"8px 9px"}}>
                          <div style={{fontSize:9,fontWeight:700,color:"#475569",marginBottom:2}}>{g.garage_id}</div>
                          <div style={{fontSize:10,fontWeight:600,color:"#f1f5f9"}}>{g.tenant||"Vacant"}</div>
                          {g.price!=null&&<div style={{fontSize:9,color:g.price>0?"#22c55e":"#334155",marginTop:1}}>{g.price===0?"Free":`$${g.price}/mo`}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {selGarage&&(
            <div style={{width:240,flexShrink:0,background:"#080f1c",borderLeft:"1px solid #0f1f35",padding:16,overflowY:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontWeight:800,fontSize:13,fontFamily:"monospace",color:pc}}>{selGarage.garage_id}</div>
                <button onClick={()=>setSelGarage(null)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer"}}>✕</button>
              </div>
              {[["Status",selGarage.status==="occupied"?(selGarage.non_resident?"★ Non-Resident":"Occupied"):selGarage.status==="mgmt_hold"?"🔧 Mgmt Hold":"Vacant"],
                ["Tenant",selGarage.tenant||"—"],["Unit",selGarage.unit||"—"],
                ["Rate",selGarage.price!=null?(selGarage.price===0?"Free / Included":`$${selGarage.price}/mo`):"—"],
                ["Notes",selGarage.notes||"—"],
              ].map(([l,v])=>(
                <div key={l} style={{background:"#0a1628",borderRadius:7,padding:"9px 11px",marginBottom:7}}>
                  <div style={{fontSize:8,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"#334155",marginBottom:2}}>{l}</div>
                  <div style={{fontSize:12,fontWeight:600,color:"#f1f5f9"}}>{v}</div>
                </div>
              ))}
              {selGarage.non_resident&&(
                <div style={{background:"#1e1333",borderRadius:7,padding:"9px 11px",border:"1px solid #7c3aed",marginTop:8}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#a78bfa"}}>★ Non-Resident Renter</div>
                  <div style={{fontSize:10,color:"#c4b5fd",marginTop:3}}>Does not live at this property.</div>
                </div>
              )}
              {FLAGS_STATIC.some(f=>f.prop===sel&&f.garage===selGarage.garage_id)&&(
                <div style={{background:"#1c0a00",borderRadius:7,padding:"9px 11px",border:"1px solid #c2410c",marginTop:8}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#fb923c",marginBottom:4}}>⚑ Flagged</div>
                  {FLAGS_STATIC.filter(f=>f.prop===sel&&f.garage===selGarage.garage_id).map((f,i)=>(
                    <div key={i} style={{fontSize:10,color:"#fed7aa"}}>{f.msg}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showUpload&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={()=>!uploading&&setShowUpload(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#080f1c",borderRadius:16,padding:28,width:460,maxWidth:"90vw",border:"1px solid #0f1f35"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
              <div style={{fontSize:16,fontWeight:800}}>Upload Lease Detail Report</div>
              {!uploading&&<button onClick={()=>setShowUpload(false)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:18}}>✕</button>}
            </div>
            <div style={{background:"#0a1628",border:"1px solid #0f1f35",borderRadius:10,padding:14,marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>Buildium Lease Details Export (.xlsx)</div>
              <div style={{fontSize:10,color:"#475569",marginBottom:12}}>Export from Buildium → Reports → Lease Details. Filter: Active leases only.</div>
              <label style={{display:"block",background:"#050c17",border:"2px dashed #1e293b",borderRadius:8,padding:"20px 10px",color:uploading?"#475569":"#3b82f6",fontSize:11,cursor:uploading?"not-allowed":"pointer",textAlign:"center"}}
                onDragOver={e=>e.preventDefault()}
                onDrop={e=>{e.preventDefault();if(!uploading)handleFile(e.dataTransfer.files[0]);}}>
                {uploading?uploadMsg:"+ Click or drag to upload .xlsx file"}
                <input type="file" accept=".xlsx,.xls" style={{display:"none"}} disabled={uploading} onChange={e=>handleFile(e.target.files[0])}/>
              </label>
            </div>
            {uploadMsg&&(
              <div style={{background:uploadMsg.startsWith("✅")?"#052e16":uploadMsg.startsWith("❌")?"#1c0a00":"#0a1628",border:`1px solid ${uploadMsg.startsWith("✅")?"#16a34a":uploadMsg.startsWith("❌")?"#dc2626":"#1e293b"}`,borderRadius:8,padding:"10px 14px",fontSize:11,color:uploadMsg.startsWith("✅")?"#4ade80":uploadMsg.startsWith("❌")?"#fca5a5":"#94a3b8"}}>
                {uploadMsg}
              </div>
            )}
            <div style={{marginTop:12,fontSize:9,color:"#334155",lineHeight:1.5}}>
              💡 Upload anytime — the dashboard updates for everyone viewing the link within seconds.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
