import React, {useState} from 'react'


export default function DynamicForm({template, onGenerated}){
const [formData,setFormData] = useState({})


function handleChange(k,v){ setFormData(prev=>({...prev,[k]:v})) }


async function generate(){
const filled = fillTemplate(template.content, formData)
// request backend to create PDF
const resp = await fetch('/api/generate-pdf', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ html: filled, templateName: template.name }) })
if(resp.ok){
const blob = await resp.blob(); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=(template.name||'document')+'.pdf'; a.click();
onGenerated({ templateId: template.id, templateName: template.name, created: Date.now(), data: formData })
} else { const err = await resp.json(); alert('Error: '+(err.error||'unknown')) }
}


function fillTemplate(content, data){
return content.replace(/{{\s*([a-zA-Z0-9_\- ]+)\s*}}/g, (m,g)=> data[g.trim()] || '')
}


return (
<div>
<h3>{template.name}</h3>
{template.fields.map(f=> (
<div key={f} style={{marginBottom:8}}>
<label>{f}</label>
<input onChange={e=>handleChange(f,e.target.value)} />
</div>
))}
<button onClick={generate}>Generar PDF</button>
</div>
)
}