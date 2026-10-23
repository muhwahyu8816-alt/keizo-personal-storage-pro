const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { google } = require("googleapis");

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const oauthPath = path.join(__dirname, process.env.GOOGLE_OAUTH_FILE || "client_secret_123456.json");
const DATA_DIR = path.join(__dirname, "data");
const TEMP_DIR = path.join(DATA_DIR, "upload-temp");
const HISTORY_FILE = path.join(DATA_DIR, "upload-history.json");
fs.mkdirSync(TEMP_DIR, {recursive:true});
// Bersihkan metadata sementara yang sudah selesai/dibatalkan atau sudah kedaluwarsa 30 hari.
// Sesi aktif yang lebih baru tetap dipertahankan agar upload bisa dilanjutkan.
function cleanupUploadTemp(){
  const now=Date.now(), maxAge=30*24*60*60*1000;
  try{
    for(const file of fs.readdirSync(TEMP_DIR)){
      if(!file.endsWith(".json"))continue;
      const full=path.join(TEMP_DIR,file);
      try{
        const m=JSON.parse(fs.readFileSync(full,"utf8"));
        const stamp=Date.parse(m.updatedAt||m.createdAt||"")||fs.statSync(full).mtimeMs;
        if(["success","cancelled"].includes(m.status)||(now-stamp)>maxAge)fs.unlinkSync(full);
      }catch(e){console.error("Gagal membersihkan metadata sementara:",file,e.message);}
    }
  }catch(e){console.error("Gagal memeriksa folder upload-temp:",e.message);}
}
cleanupUploadTemp();
if (!process.env.SESSION_SECRET) throw new Error("SESSION_SECRET belum diatur di .env");
if (!fs.existsSync(oauthPath)) throw new Error("File OAuth JSON tidak ditemukan: " + oauthPath);
const oauthConfig = JSON.parse(fs.readFileSync(oauthPath, "utf8"));
const credentials = oauthConfig.web || oauthConfig.installed;
if (!credentials?.client_id || !credentials?.client_secret) throw new Error("Format file OAuth JSON tidak sesuai.");
const redirectUri = `http://localhost:${PORT}/auth/google/callback`;
const oauth2Client = new google.auth.OAuth2(credentials.client_id, credentials.client_secret, redirectUri);
app.use(express.json({limit:"2mb"}));
app.use(express.urlencoded({extended:false}));
app.use(session({
  name:"keizo.sid", secret:process.env.SESSION_SECRET, resave:false, saveUninitialized:false,
  cookie:{httpOnly:true,sameSite:"lax",secure:false,maxAge:7*24*60*60*1000}
}));
app.use(express.static(path.join(__dirname,"public")));

function readHistory(){try{return JSON.parse(fs.readFileSync(HISTORY_FILE,"utf8"));}catch{return [];}}
function writeHistory(rows){fs.mkdirSync(DATA_DIR,{recursive:true});fs.writeFileSync(HISTORY_FILE,JSON.stringify(rows,null,2));}
function addHistory(row){const rows=readHistory();const i=rows.findIndex(x=>x.id===row.id);if(i>=0)rows[i]={...rows[i],...row,updatedAt:new Date().toISOString()};else rows.unshift({...row,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});writeHistory(rows.slice(0,500));}
function authFor(req){if(!req.session.googleTokens)return null;const auth=new google.auth.OAuth2(credentials.client_id,credentials.client_secret,redirectUri);auth.setCredentials(req.session.googleTokens);auth.on("tokens",t=>{req.session.googleTokens={...req.session.googleTokens,...t};});return auth;}
function getDrive(req){const auth=authFor(req);return auth?google.drive({version:"v3",auth}):null;}
function requireDrive(req,res,next){const d=getDrive(req);if(!d)return res.status(401).json({error:"Google Drive belum terhubung.",connected:false});req.drive=d;req.auth=authFor(req);next();}
function safeName(name){return String(name||"").trim().replace(/[\/\\\0]/g,"_").slice(0,240);}
function mimeFor(type){return type&&/^[\w.+-]+\/[\w.+-]+$/.test(type)?type:"application/octet-stream";}
function metaPath(id){return path.join(TEMP_DIR,id+".json");}
function readMeta(id){try{return JSON.parse(fs.readFileSync(metaPath(id),"utf8"));}catch{return null;}}
function saveMeta(m){m.updatedAt=new Date().toISOString();fs.writeFileSync(metaPath(m.id),JSON.stringify(m,null,2));}
function driveError(e){return e?.response?.data?.error?.message||e?.message||"Kesalahan Google Drive";}

app.get("/auth/google",(req,res)=>res.redirect(oauth2Client.generateAuthUrl({access_type:"offline",scope:["https://www.googleapis.com/auth/drive"],prompt:"consent"})));
app.get("/auth/google/callback",async(req,res)=>{if(!req.query.code)return res.status(400).send("Kode otorisasi Google tidak ditemukan.");try{const {tokens}=await oauth2Client.getToken(req.query.code);req.session.googleTokens=tokens;req.session.save(err=>{if(err)return res.status(500).send("Gagal menyimpan sesi login.");res.redirect("/");});}catch(e){console.error("OAuth:",e.message);res.status(500).send("Gagal menghubungkan Google Drive. Periksa Redirect URI http://localhost:3000/auth/google/callback di Google Cloud.");}});
app.post("/auth/logout",(req,res)=>req.session.destroy(()=>{res.clearCookie("keizo.sid");res.json({ok:true});}));
app.get("/api/status",(req,res)=>res.json({connected:Boolean(req.session.googleTokens)}));

app.get("/api/files",requireDrive,async(req,res)=>{try{const q=["trashed = false"];const parent=String(req.query.parent||"root");q.push(`'${parent.replace(/'/g,"\\'")}' in parents`);if(req.query.q)q.push(`name contains '${String(req.query.q).replace(/['\\]/g,"\\$&")}'`);const out=await req.drive.files.list({pageSize:100,orderBy:"folder,name",q:q.join(" and "),fields:"files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,parents),nextPageToken"});res.json({files:out.data.files||[],nextPageToken:out.data.nextPageToken||null});}catch(e){res.status(500).json({error:"Gagal memuat isi Google Drive: "+driveError(e)});}});
app.get("/api/storage",requireDrive,async(req,res)=>{try{const r=await req.drive.about.get({fields:"user(displayName,emailAddress),storageQuota(limit,usage,usageInDrive,usageInDriveTrash)"});res.json(r.data);}catch(e){res.status(500).json({error:"Informasi penyimpanan tidak tersedia."});}});
app.post("/api/folders",requireDrive,async(req,res)=>{const name=safeName(req.body.name);if(!name)return res.status(400).json({error:"Nama folder wajib diisi."});try{const r=await req.drive.files.create({requestBody:{name,mimeType:"application/vnd.google-apps.folder",parents:req.body.parent?[req.body.parent]:undefined},fields:"id,name,mimeType,parents"});res.json({file:r.data});}catch(e){res.status(500).json({error:"Gagal membuat folder: "+driveError(e)});}});
app.get("/api/history",(req,res)=>res.json({history:readHistory()}));

/* Create a genuine Google Drive resumable-upload session. The file bytes are never assembled into a full local file. */
app.post("/api/upload/init",requireDrive,async(req,res)=>{
 const name=safeName(req.body.name),size=Number(req.body.size),mimeType=mimeFor(req.body.type),parent=String(req.body.parent||"");
 if(!name||!Number.isSafeInteger(size)||size<1)return res.status(400).json({error:"Nama atau ukuran file tidak valid."});
 try{
  // Use native fetch for initiation so the Location header from Google Drive is preserved.
  // The googleapis/Gaxios wrapper can normalize or omit response headers in some setups.
  const tokenResult=await req.auth.getAccessToken();
  const accessToken=typeof tokenResult==="string"?tokenResult:tokenResult?.token;
  if(!accessToken)throw new Error("Token akses Google tidak tersedia. Keluar lalu hubungkan Google Drive kembali.");
  const response=await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType,size,parents,createdTime",{
   method:"POST",
   headers:{"Authorization":`Bearer ${accessToken}`,"Content-Type":"application/json; charset=UTF-8","X-Upload-Content-Type":mimeType,"X-Upload-Content-Length":String(size)},
   body:JSON.stringify({name,mimeType,parents:parent?[parent]:undefined})
  });
  const location=response.headers.get("location");
  if(!response.ok){let detail="";try{const body=await response.json();detail=body?.error?.message||JSON.stringify(body)}catch{try{detail=await response.text()}catch{}}throw new Error(`Google Drive HTTP ${response.status}${detail?": "+detail:""}`)}
  if(!location)throw new Error("Google Drive merespons "+response.status+" tetapi header Location kosong. Coba logout lalu login Google lagi.");
  const id=crypto.randomUUID();
  const meta={id,name,size,type:mimeType,parent,sessionUrl:location,received:0,status:"ready",createdAt:new Date().toISOString()};
  saveMeta(meta);addHistory({...meta,sessionUrl:undefined});
  res.json({id,chunkSize:8*1024*1024,received:0});
 }catch(e){console.error("Init upload:",driveError(e));res.status(500).json({error:"Gagal memulai upload resumable: "+driveError(e)});}
});
app.get("/api/upload/:id/status",requireDrive,async(req,res)=>{
 const id=String(req.params.id).replace(/[^a-f0-9-]/gi,""),m=readMeta(id);if(!m)return res.status(404).json({error:"Sesi upload tidak ditemukan di komputer ini."});
 try{
  const r=await req.auth.request({url:m.sessionUrl,method:"PUT",headers:{"Content-Length":"0","Content-Range":`bytes */${m.size}`},data:Buffer.alloc(0),validateStatus:s=>s===200||s===201||s===308||s>=400});
  const range=r.headers.range||r.headers.Range;let received=range?Number(range.match(/-(\d+)$/)?.[1])+1:0;
  if(r.status===200||r.status===201){m.status="success";m.received=m.size;addHistory({...m,sessionUrl:undefined,status:"success",driveFileId:r.data?.id});try{fs.unlinkSync(metaPath(m.id));}catch(e){console.error("Gagal menghapus metadata upload selesai:",e.message);}return res.json({received:m.size,done:true,file:r.data});}
  if(r.status===308){m.received=received;m.status="uploading";saveMeta(m);return res.json({received,done:false,status:m.status});}
  return res.status(410).json({error:"Sesi Google Drive sudah tidak berlaku. Mulai upload baru."});
 }catch(e){res.status(500).json({error:"Tidak bisa memeriksa status upload: "+driveError(e)});}
});
app.put("/api/upload/:id/chunk",requireDrive,express.raw({type:"application/octet-stream",limit:"16mb"}),async(req,res)=>{
 const id=String(req.params.id).replace(/[^a-f0-9-]/gi,""),m=readMeta(id);if(!m)return res.status(404).json({error:"Sesi upload tidak ditemukan."});
 const start=Number(req.headers["x-chunk-start"]),buf=Buffer.isBuffer(req.body)?req.body:Buffer.alloc(0);
 if(!buf.length||!Number.isSafeInteger(start)||start!==m.received||start+buf.length>m.size)return res.status(409).json({error:"Posisi bagian upload tidak sesuai.",received:m.received});
 const end=start+buf.length-1;
 try{
  const r=await req.auth.request({url:m.sessionUrl,method:"PUT",headers:{"Content-Type":m.type,"Content-Length":String(buf.length),"Content-Range":`bytes ${start}-${end}/${m.size}`},data:buf,validateStatus:s=>s===200||s===201||s===308||s>=400});
  if(r.status===200||r.status===201){m.received=m.size;m.status="success";addHistory({...m,sessionUrl:undefined,status:"success",driveFileId:r.data?.id});try{fs.unlinkSync(metaPath(m.id));}catch(e){console.error("Gagal menghapus metadata upload selesai:",e.message);}return res.json({received:m.size,done:true,file:r.data});}
  if(r.status===308){const range=r.headers.range||r.headers.Range;const confirmed=range?Number(range.match(/-(\d+)$/)?.[1])+1:end+1;m.received=confirmed;m.status="uploading";saveMeta(m);addHistory({...m,sessionUrl:undefined,status:"uploading"});return res.json({received:confirmed,done:false});}
  const msg=driveError({response:r});res.status(r.status).json({error:"Google Drive menolak bagian upload: "+msg});
 }catch(e){
  /* The server may not know whether the final request arrived. The status endpoint can reconcile the confirmed byte offset. */
  console.error("Chunk upload:",driveError(e));res.status(502).json({error:"Koneksi terputus saat mengirim bagian. Tekan Lanjut/Periksa Status untuk menyelaraskan posisi upload."});
 }
});
app.delete("/api/upload/:id",requireDrive,(req,res)=>{const id=String(req.params.id).replace(/[^a-f0-9-]/gi,""),m=readMeta(id);if(m){m.status="cancelled";saveMeta(m);addHistory({...m,sessionUrl:undefined,status:"cancelled"});}res.json({ok:true});});
app.post("/api/files/:id/rename",requireDrive,async(req,res)=>{const name=safeName(req.body.name);if(!name)return res.status(400).json({error:"Nama baru wajib diisi."});try{const r=await req.drive.files.update({fileId:req.params.id,requestBody:{name},fields:"id,name,mimeType,parents,size,modifiedTime"});res.json({file:r.data});}catch(e){res.status(500).json({error:"Gagal mengganti nama file."});}});
app.delete("/api/files/:id",requireDrive,async(req,res)=>{try{await req.drive.files.delete({fileId:req.params.id});res.json({ok:true});}catch(e){res.status(500).json({error:"Gagal menghapus file."});}});
app.get("/api/files/:id/preview",requireDrive,async(req,res)=>{try{const m=await req.drive.files.get({fileId:req.params.id,fields:"name,mimeType"});res.setHeader("Content-Type",m.data.mimeType||"application/octet-stream");res.setHeader("Content-Disposition","inline");const r=await req.drive.files.get({fileId:req.params.id,alt:"media"},{responseType:"stream"});r.data.on("error",()=>res.end());r.data.pipe(res);}catch(e){if(!res.headersSent)res.status(500).send("Preview tidak tersedia.");}});
app.get("/api/files/:id/download",requireDrive,async(req,res)=>{try{const m=await req.drive.files.get({fileId:req.params.id,fields:"name,mimeType"});res.setHeader("Content-Type",m.data.mimeType||"application/octet-stream");res.setHeader("Content-Disposition",`attachment; filename*=UTF-8''${encodeURIComponent(m.data.name||"file")}`);const r=await req.drive.files.get({fileId:req.params.id,alt:"media"},{responseType:"stream"});r.data.on("error",()=>res.end());r.data.pipe(res);}catch(e){if(!res.headersSent)res.status(500).send("Gagal mengunduh file.");}});
app.listen(PORT,()=>console.log(`Keizo Personal Storage Pro berjalan di http://localhost:${PORT}`));
