'use client';
import {useState} from 'react';

export default function NumberInput({value,onChange,onBlur,...props}){
  const [draft,setDraft]=useState(null);
  return <input {...props} type="number" value={draft??(typeof value==='number'&&!Number.isFinite(value)?'':value)} onChange={event=>{
    const text=event.target.value;
    setDraft(text);
    if(text!==''&&Number.isFinite(event.target.valueAsNumber))onChange?.(event);
  }} onBlur={event=>{
    onChange?.(event);
    setDraft(null);
    onBlur?.(event);
  }}/>;
}