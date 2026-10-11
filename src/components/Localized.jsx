'use client';
import {usePrefs} from './Shell';
export default function Localized({children,he,ru}){const {lang}=usePrefs();return lang==='he'?he:lang==='ru'?(ru??children):children;}