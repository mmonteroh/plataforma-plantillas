import React, {useState} from 'react'


export default function TemplateEditor({onSave}){
const [name,setName]=useState('')
const [category,setCategory]=useState('')
const [content,setContent]=useState('')


function save(){
if(!content) return alert('Contenido requerido')
const tpl = { id:'tpl_'+Date.now(), name: name||'Plantilla sin nombre', category, content, fields: detectFields(content), created: Date.now() }
onSave(tpl); setName(''); setCategory(''); setContent('')
}


function detectFields(text){
const re = /{{\s*([a-zA-Z0-9_\- ]+)\s*}}/g
const map=new Map(); let m
while((m=re.exec(text))){ map.set(m[1].trim(), true) }
return Array.from(map.keys())
}


return (
<div style={{marginBottom:16}}>
<h3>Crear / Pegar plantilla</h3>
<input placeholder='Nombre' value={name} onChange={e=>setName(e.target.value)} />
<input placeholder='Categoría' value={category} onChange={e=>setCategory(e.target.value)} />
<textarea placeholder='Plantilla con {{campo}}' value={content} onChange={e=>setContent(e.target.value)} style={{width:'100%',height:160}} />
<div style={{display:'flex',gap:8}}>
<button onClick={save}>Guardar plantilla</button>
</div>
</div>
)
}