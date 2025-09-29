// Backend principal: Express + upload DOCX + convert (mammoth) + render PDF (puppeteer) + auth JWT
const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const mammoth = require('mammoth')
const puppeteer = require('puppeteer')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const cors = require('cors')


const app = express()
app.use(express.json({ limit: '10mb' }))
app.use(cors())


const STORAGE_FILE = path.join(__dirname, 'storage.json')
function readStorage(){ try{return JSON.parse(fs.readFileSync(STORAGE_FILE,'utf8')||'{}')}catch(e){return {users:[],templates:[],history:[]}} }
function writeStorage(obj){ fs.writeFileSync(STORAGE_FILE, JSON.stringify(obj, null, 2)) }
if(!fs.existsSync(STORAGE_FILE)) writeStorage({ users:[], templates:[], history:[] })


// Config (en producción usa variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_plantillas'
const UPLOAD_DIR = path.join(__dirname,'uploads')
if(!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR)


// Multer
const upload = multer({ dest: UPLOAD_DIR, limits: { fileSize: 10*1024*1024 } })


// --- Auth demo: crear un usuario admin inicial si no existe ---
const storage = readStorage()
if(storage.users.length===0){
const hashed = bcrypt.hashSync('adminpass', 8)
storage.users.push({ id:'u_admin', email:'admin@empresa.com', password: hashed, role:'admin' })
writeStorage(storage)
console.log('Usuario admin creado: admin@empresa.com / adminpass (cámbialo)')
}


// Middleware auth
function authMiddleware(req,res,next){
const header = req.headers.authorization
if(!header) return res.status(401).json({error:'No token'})
const [type, token] = header.split(' ')
if(type!=='Bearer' || !token) return res.status(401).json({error:'Malformed token'})
try{ const payload = jwt.verify(token, JWT_SECRET); req.user = payload; next() }catch(e){ return res.status(401).json({error:'Invalid token'}) }
}


function roleGuard(roles){ return (req,res,next)=>{ if(!req.user) return res.status(401).json({error:'No auth'}); if(!roles.includes(req.user.role)) return res.status(403).json({error:'Forbidden'}); next() } }


// --- Auth endpoints ---
app.post('/api/login', (req,res)=>{
const { email, password } = req.body
const st = readStorage()
const user = st.users.find(u=>u.email===email)
if(!user) return res.status(401).json({error:'Credenciales inválidas'})
if(!bcrypt.compareSync(password, user.password)) return res.status(401).json({error:'Credenciales inválidas'})
const token = jwt.sign({ id:user.id, email:user.email, role:user.role }, JWT_SECRET, { expiresIn:'8h' })
res.json({ token, user: { id:user.id, email:user.email, role:user.role } })
})


app.post('/api/register', authMiddleware, roleGuard(['admin']), (req,res)=>{
const { email, password, role='editor' } = req.body
const st = readStorage()
if(st.users.find(u=>u.email===email)) return res.status(400).json({error:'Usuario ya existe'})
const hashed = bcrypt.hashSync(password, 8)
const user = { id:'u_'+Date.now(), email, password: hashed, role }
st.users.push(user); writeStorage(st)
res.json({ ok:true, user: { id:user.id, email:user.email, role:user.role } })
app.listen(PORT, ()=>console.log('Backend listening on http://localhost: