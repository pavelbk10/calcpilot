'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Accessibility, X, Play, Pause, Square, RotateCcw, Volume2, Type, Palette, MousePointer2, BookOpen, Minus, Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { usePrefs } from './Shell';
import { locales } from '../lib/i18n.mjs';
import { accessibilityDefaults, normalizeAccessibility, speechChunks } from '../lib/accessibility.mjs';

export default function AccessibilityMenu({ onOpen, disabled = false }) {
  const { t, lang } = usePrefs();
  const pathname = usePathname();
  const [settings, setSettings] = useState(accessibilityDefaults);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const [voiceId, setVoiceId] = useState('');
  const [speechState, setSpeechState] = useState('idle');
  const [progress, setProgress] = useState('');
  const [notice, setNotice] = useState('');
  const [hasSelection, setHasSelection] = useState(false);
  const dialog = useRef(null);
  const launcher = useRef(null);
  const selection = useRef('');
  const speechSession = useRef(0);
  const utterance = useRef(null);

  const stop = () => {
    speechSession.current += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    utterance.current = null;
    setSpeechState('idle');
    setProgress('');
  };
  useEffect(() => {
    try { setSettings(normalizeAccessibility(JSON.parse(localStorage.getItem('cp-accessibility-v1')))); } catch {}
    setReady(true);
    const canSpeak = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    setSupported(canSpeak);
    const updateVoices = () => setVoices(window.speechSynthesis.getVoices());
    if (canSpeak) { updateVoices(); window.speechSynthesis.addEventListener('voiceschanged', updateVoices); }
    const captureSelection = () => {
      const selected = window.getSelection();
      const anchor = selected?.anchorNode;
      const focus = selected?.focusNode;
      if (anchor && focus && document.querySelector('main')?.contains(anchor) && document.querySelector('main')?.contains(focus)) {
        selection.current = selected.toString().trim();
        setHasSelection(Boolean(selection.current));
      } else if (!dialog.current?.contains(anchor)) {
        selection.current = '';
        setHasSelection(false);
      }
    };
    document.addEventListener('selectionchange', captureSelection);
    return () => {
      document.removeEventListener('selectionchange', captureSelection);
      speechSession.current += 1;
      if (canSpeak) { window.speechSynthesis.cancel(); window.speechSynthesis.removeEventListener('voiceschanged', updateVoices); }
    };
  }, []);
  useEffect(() => { stop(); selection.current = ''; setHasSelection(false); setVoiceId(''); }, [pathname, lang]);
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.dataset.a11yFont = settings.font;
    root.dataset.a11yTheme = settings.theme;
    root.style.setProperty('--a11y-text-scale', String(settings.textSize / 100));
    root.style.setProperty('--a11y-line-height', String(settings.lineHeight));
    root.dataset.a11yText = String(settings.textSize !== 100);
    for (const key of ['grayscale', 'underlineLinks', 'highlightHeadings', 'strongFocus', 'largeCursor', 'reduceMotion', 'hideDecorations', 'readingGuide', 'readingMask']) {
      root.classList.toggle('a11y-' + key, settings[key]);
    }
    try { localStorage.setItem('cp-accessibility-v1', JSON.stringify(settings)); }
    catch { setNotice(t('Preferences could not be saved on this device.', 'לא ניתן לשמור העדפות במכשיר הזה.', 'Не удалось сохранить настройки на устройстве.')); }
  }, [settings, ready]);
  useEffect(() => {
    if (!settings.readingGuide && !settings.readingMask) return;
    const move = event => {
      if (!dialog.current?.contains(event.target)) document.documentElement.style.setProperty('--a11y-guide-y', event.clientY + 'px');
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [settings.readingGuide, settings.readingMask]);
  useEffect(() => {
    if (open && !dialog.current.open) { dialog.current.showModal(); dialog.current.querySelector('button')?.focus(); }
    if (!open && dialog.current.open) dialog.current.close();
  }, [open]);

  const change = (key, value) => setSettings(previous => normalizeAccessibility({ ...previous, [key]: value }));
  const close = () => { if (dialog.current?.open) dialog.current.close(); setOpen(false); launcher.current?.focus(); };
  const start = source => {
    stop();
    if (!supported) return;
    const text = source === 'selection' ? selection.current : document.querySelector('main')?.innerText || '';
    if (!text.trim()) { setNotice(t('No text is available to read.', 'אין טקסט זמין להקראה.', 'Нет текста для чтения.')); return; }
    const chunks = speechChunks(text.slice(0, 25000));
    const session = speechSession.current;
    const voice = voices.find(item => item.voiceURI === voiceId);
    setNotice(text.length > 25000 ? t('Reading the first 25,000 characters.', 'מוקראים 25,000 התווים הראשונים.', 'Читаются первые 25 000 символов.') : '');
    setSpeechState('playing');
    const speak = index => {
      if (speechSession.current !== session) return;
      if (index >= chunks.length) { setSpeechState('idle'); setProgress(''); utterance.current = null; return; }
      const part = new SpeechSynthesisUtterance(chunks[index]);
      part.lang = locales[lang];
      part.rate = settings.speechRate;
      if (voice) part.voice = voice;
      part.onend = () => speak(index + 1);
      part.onerror = event => {
        if (speechSession.current !== session || ['canceled', 'interrupted'].includes(event.error)) return;
        speechSession.current += 1;
        setSpeechState('idle'); setProgress('');
        setNotice(t('Speech could not start. Check device voices or try another browser.', 'ההקראה לא הצליחה. בדקו קולות במכשיר או נסו דפדפן אחר.', 'Чтение не удалось. Проверьте голоса устройства или другой браузер.'));
      };
      utterance.current = part;
      setProgress((index + 1) + ' / ' + chunks.length);
      window.speechSynthesis.speak(part);
    };
    speak(0);
  };
  const pauseOrResume = () => {
    if (speechState === 'paused') { window.speechSynthesis.resume(); setSpeechState('playing'); }
    else { window.speechSynthesis.pause(); setSpeechState('paused'); }
  };
  const options = voices.filter(voice => voice.lang.toLowerCase().split('-')[0] === lang);
  const toggles = [
    ['underlineLinks', 'Underline links', 'קו תחתון לקישורים', 'Подчёркивание ссылок'],
    ['highlightHeadings', 'Highlight headings', 'הדגשת כותרות', 'Выделение заголовков'],
    ['strongFocus', 'Enhanced keyboard focus', 'מיקוד מקלדת מוגבר', 'Усиленный фокус клавиатуры'],
    ['largeCursor', 'Large pointer', 'סמן עכבר מוגדל', 'Крупный указатель'],
    ['reduceMotion', 'Reduce motion', 'הפחתת תנועה', 'Уменьшение движения'],
    ['hideDecorations', 'Hide decorative illustrations', 'הסתרת איורים דקורטיביים', 'Скрыть декоративные иллюстрации'],
    ['readingGuide', 'Reading guide', 'קו עזר לקריאה', 'Линия для чтения'],
    ['readingMask', 'Reading mask', 'מסכת קריאה', 'Маска для чтения'],
    ['grayscale', 'Grayscale', 'גווני אפור', 'Оттенки серого'],
  ];
  return <>
    <div className="accessibility-floating">
      {speechState !== 'idle' && <button className="accessibility-stop" onClick={stop} title={t('Stop reading', 'עצירת הקראה', 'Остановить чтение')} aria-label={t('Stop reading', 'עצירת הקראה', 'Остановить чтение')}><Square size={18}/></button>}
      <button ref={launcher} className="accessibility-launcher" disabled={disabled} onMouseDown={event => event.preventDefault()} aria-label={t('Accessibility menu', 'תפריט נגישות', 'Меню доступности')} title={t('Accessibility menu', 'תפריט נגישות', 'Меню доступности')} aria-haspopup="dialog" aria-controls="accessibility-menu" aria-expanded={open} onClick={() => { onOpen?.(); setOpen(true); }}><Accessibility size={28}/></button>
    </div>
    <div className="accessibility-reading-guide" aria-hidden="true"/>
    <div className="accessibility-reading-mask" aria-hidden="true"/>
    <dialog ref={dialog} id="accessibility-menu" className="accessibility-dialog" aria-labelledby="accessibility-title" onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); } }} onCancel={event => { event.preventDefault(); close(); }} onClose={close} onClick={event => { if (event.target === dialog.current) { const bounds = dialog.current.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close(); } }}>
      <header className="accessibility-header"><div><Accessibility size={21}/><h2 id="accessibility-title">{t('Accessibility', 'נגישות', 'Доступность')}</h2></div><button className="text-button" onClick={close} title={t('Close', 'סגירה', 'Закрыть')} aria-label={t('Close accessibility menu', 'סגירת תפריט הנגישות', 'Закрыть меню доступности')}><X size={21}/></button></header>
      <div className="accessibility-body">
        <section aria-labelledby="accessibility-text"><h3 id="accessibility-text"><Type size={18}/>{t('Text and font', 'טקסט וגופן', 'Текст и шрифт')}</h3>
          <label className="accessibility-range">{t('Text size', 'גודל טקסט', 'Размер текста')}<output aria-hidden="true">{settings.textSize}%</output><div><button disabled={settings.textSize <= 100} aria-label={t('Decrease text size', 'הקטנת טקסט', 'Уменьшить текст')} title={t('Decrease text size', 'הקטנת טקסט', 'Уменьшить текст')} onClick={() => change('textSize', settings.textSize - 10)}><Minus size={16}/></button><input aria-label={t('Text size', 'גודל טקסט', 'Размер текста')} aria-valuetext={settings.textSize+'%'} type="range" min="100" max="180" step="10" value={settings.textSize} onChange={event => change('textSize', +event.target.value)}/><button disabled={settings.textSize >= 180} aria-label={t('Increase text size', 'הגדלת טקסט', 'Увеличить текст')} title={t('Increase text size', 'הגדלת טקסט', 'Увеличить текст')} onClick={() => change('textSize', settings.textSize + 10)}><Plus size={16}/></button></div></label>
          <label>{t('Font family', 'משפחת גופן', 'Семейство шрифта')}<select aria-label={t('Font family', 'משפחת גופן', 'Семейство шрифта')} value={settings.font} onChange={event => change('font', event.target.value)}>{[['default', 'Site font', 'גופן האתר', 'Шрифт сайта'], ['readable', 'Simple sans-serif', 'גופן פשוט ללא תגיות', 'Простой без засечек'], ['serif', 'Serif', 'גופן עם תגיות', 'С засечками'], ['mono', 'Monospaced', 'גופן ברוחב אחיד', 'Моноширинный']].map(([value, en, he, ru]) => <option key={value} value={value}>{t(en, he, ru)}</option>)}</select></label>
          <label className="accessibility-range">{t('Line height', 'גובה שורות', 'Высота строк')}<output aria-hidden="true">{settings.lineHeight.toFixed(2)}</output><input aria-label={t('Line height', 'גובה שורות', 'Высота строк')} type="range" min="1.5" max="2.5" step=".05" value={settings.lineHeight} onChange={event => change('lineHeight', +event.target.value)}/></label>
        </section>
        <section aria-labelledby="accessibility-colors"><h3 id="accessibility-colors"><Palette size={18}/>{t('Colors and contrast', 'צבעים וניגודיות', 'Цвета и контраст')}</h3><div className="accessibility-themes">{[['default', 'Original colors', 'צבעי האתר', 'Цвета сайта'], ['dark', 'Dark colors', 'צבעים כהים', 'Тёмные цвета'], ['contrast', 'High contrast', 'ניגודיות גבוהה', 'Высокий контраст'], ['light', 'Light contrast', 'ניגודיות בהירה', 'Светлый контраст']].map(([value, en, he, ru]) => <button key={value} data-theme={value} aria-pressed={settings.theme === value} onClick={() => change('theme', value)}><span aria-hidden="true">Aa</span>{t(en, he, ru)}</button>)}</div></section>
        <section aria-labelledby="accessibility-reading"><h3 id="accessibility-reading"><MousePointer2 size={18}/>{t('Reading and navigation', 'קריאה וניווט', 'Чтение и навигация')}</h3><div className="accessibility-toggles">{toggles.map(([key, en, he, ru]) => <label key={key}><span>{t(en, he, ru)}</span><input type="checkbox" checked={settings[key]} onChange={event => change(key, event.target.checked)}/></label>)}</div></section>
        <section aria-labelledby="accessibility-speech"><h3 id="accessibility-speech"><Volume2 size={18}/>{t('Read aloud', 'הקראה', 'Чтение вслух')}</h3>
          {supported ? <>
            <label>{t('Voice', 'קול', 'Голос')}<select value={voiceId} disabled={speechState !== 'idle'} onChange={event => setVoiceId(event.target.value)}><option value="">{t('Automatic device voice', 'קול אוטומטי של המכשיר', 'Автоматический голос устройства')}</option>{options.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} · {voice.lang}{voice.localService ? '' : ' · '+t('Online voice', 'קול מקוון', 'Онлайн-голос')}</option>)}</select></label>
            {!options.length && <p className="accessibility-note">{t('No matching voice was reported. Availability and pronunciation depend on your device; install a voice for this language if needed.', 'לא דווח קול תואם לשפה. הזמינות וההגייה תלויות במכשיר; ייתכן שיש להתקין קול בשפה זו.', 'Голос этого языка не найден. Доступность и произношение зависят от устройства; при необходимости установите голос.')}</p>}
            <label className="accessibility-range">{t('Reading speed', 'מהירות הקראה', 'Скорость чтения')}<output aria-hidden="true">{settings.speechRate.toFixed(1)}×</output><input aria-label={t('Reading speed', 'מהירות הקראה', 'Скорость чтения')} disabled={speechState !== 'idle'} type="range" min=".5" max="1.5" step=".1" value={settings.speechRate} onChange={event => change('speechRate', +event.target.value)}/></label>
            <div className="accessibility-speech-actions"><button className="secondary" onClick={() => start('page')}><Play size={16}/>{t('Read page', 'הקראת העמוד', 'Читать страницу')}</button><button className="secondary" disabled={!hasSelection} onClick={() => start('selection')}><BookOpen size={16}/>{t('Read selected text', 'הקראת טקסט מסומן', 'Читать выделенное')}</button><button className="secondary" disabled={speechState === 'idle'} onClick={pauseOrResume}>{speechState === 'paused' ? <Play size={16}/> : <Pause size={16}/>} {speechState === 'paused' ? t('Resume', 'המשך', 'Продолжить') : t('Pause', 'השהיה', 'Пауза')}</button><button className="secondary" disabled={speechState === 'idle'} onClick={stop}><Square size={16}/>{t('Stop', 'עצירה', 'Остановить')}</button></div>
            <p role="status" className="accessibility-note">{speechState !== 'idle' ? t(speechState === 'paused' ? 'Paused' : 'Reading', speechState === 'paused' ? 'מושהה' : 'מקריא', speechState === 'paused' ? 'Приостановлено' : 'Чтение')+' · '+progress : t('Ready to read', 'מוכן להקראה', 'Готово к чтению')}</p>
          </> : <p className="accessibility-note">{t('Speech synthesis is unavailable in this browser. Use your device screen reader.', 'הקראה אינה זמינה בדפדפן זה. ניתן להשתמש בקורא המסך של המכשיר.', 'Синтез речи недоступен в этом браузере. Используйте экранный диктор устройства.')}</p>}
          <p className="accessibility-note">{t('Reading starts only on request. Your browser or operating system may use an online voice service. Avoid reading private financial information on shared devices. This is not a screen reader.', 'ההקראה מופעלת רק לפי בקשה. הדפדפן או מערכת ההפעלה עשויים להשתמש בשירות קולי מקוון. הימנעו מהקראת מידע פיננסי פרטי במכשיר משותף. כלי זה אינו קורא מסך.', 'Чтение запускается только по запросу. Браузер или система могут использовать онлайн-сервис голоса. Не озвучивайте частные финансовые данные на общем устройстве. Это не экранный диктор.')}</p>
        </section>
        {notice && <p role="status" className="accessibility-note">{notice}</p>}
      </div>
      <footer className="accessibility-footer"><button className="secondary" onClick={() => { stop(); setSettings({ ...accessibilityDefaults }); setNotice(''); }}><RotateCcw size={16}/>{t('Reset accessibility settings', 'איפוס הגדרות נגישות', 'Сбросить настройки')}</button><Link href="/accessibility/" onClick={close}>{t('Accessibility statement', 'הצהרת נגישות', 'Заявление о доступности')}</Link></footer>
    </dialog>
  </>;
}