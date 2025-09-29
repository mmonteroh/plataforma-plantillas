import React from 'react'


export default function TemplateList({templates,onLoad,onDelete}){
return (
<div>
<h4>Plantillas guardadas</h4>
<ul>
{templates.map(t=> (
<li key={t.id} style={{marginBottom:8}}>
<strong>{t.name}</strong> — {t.category} — <button onClick={()=>onLoad(t)}>Cargar</button> <button onClick={()=>onDelete(t.id)}>Eliminar</button>
</li>
))}
</ul>
</div>
)
}