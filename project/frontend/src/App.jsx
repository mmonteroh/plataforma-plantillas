import React, {useState} from 'react'
import TemplateEditor from './components/TemplateEditor'
import TemplateList from './components/TemplateList'
import DynamicForm from './components/DynamicForm'
import axios from 'axios'


export default function App(){
const [token, setToken] = useState(localStorage.getItem('token')||'')
const [templates, setTemplates] = useState([])
const [loadedTpl, setLoadedTpl] = useState(null)


async function loginDemo(){
const email = prompt('Email (admin@empresa.com)') || 'admin@empresa.com'
const pass = prompt('Password (adminpass)') || 'adminpass'
try{ const r = await axios.post('/api/login',{email,password:pass}); setToken(r.data.token); localStorage.setItem('token', r.data.token); alert('Login OK') }catch(e){ alert('Login falló') }
}


async function fetchTemplates(){ if(!token) return alert('Login requerido'); const r = await axios.get('/api/templates',{ headers:{ Authorization: 'Bearer '+token } }); setTemplates(r.data.templates) }


return (
<div style={{padding:20,maxWidth:1100,margin:'0 auto'}}>
<h1>Plataforma Plantillas — React + Express</h1>
<div style={{display:'flex',gap:16}}>
<div style={{flex:1}}>
{!token ? <button onClick={loginDemo}>Iniciar sesión (demo)</button> : <button onClick={()=>{ setToken(''); localStorage.removeItem('token') }}>Logout</button>}
<TemplateEditor token={token} onSaved={()=>fetchTemplates()} />
<TemplateList templates={templates} onLoad={(t)=>setLoadedTpl(t)}