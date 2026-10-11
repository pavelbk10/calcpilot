import Localized from "../../components/Localized";
export const metadata = { title: "מדיניות פרטיות" };
export default function Page() {
  return (
    <main className="page">
      <article className="prose">
        <Localized
          ru={<><h1>Политика конфиденциальности</h1><p>Версия: 11 октября 2026 года. Политика описывает приложение КалькПилот.</p><h2>Финансовые записи</h2><p>Вычисления выполняются в браузере. Записи, настройки, история и сценарии хранятся локально на текущем устройстве. Приложение не передаёт записи своему серверу. Копии находятся под вашим контролем. Хранилище не шифруется приложением; не вводите чувствительные данные на общем устройстве.</p><h2>Технические запросы</h2><p>Хостинг может обрабатывать сетевые адреса и журналы запросов. Google Fonts может получать технические сведения. Активная аналитика и реклама в предоставленном проекте отключены.</p><h2>Курсы валют</h2><p>Конвертер запрашивает таблицу справочных курсов к USD у Frankfurter в трёх ежедневных окнах или по ручному запросу. Суммы и финансовые записи не передаются. Таблица и время запроса сохраняются локально; также используется публичный снимок из развёртывания. Поставщик обрабатывает запросы по своим условиям. Ручной режим не инициирует новый запрос курса.</p><h2>Удаление и перенос</h2><p>Удаляйте записи в журналах или очищайте хранилище сайта для удаления всех данных. Перед очисткой и сменой устройства создайте копию. Облачного восстановления нет.</p><h2>Будущая реклама</h2><p>При включении рекламы или аналитики оператор должен обновить политику, указать поставщиков и реализовать необходимые механизмы согласия до загрузки скриптов.</p><h2>Контакты</h2><p>Контакты оператора находятся на странице связи. Оператор должен указать личность и контактные данные до публичного запуска.</p></>}
          he={
            <>
              <h1>מדיניות פרטיות</h1>
              <p>
                גרסה: 11 באוקטובר 2026. מדיניות זו מתארת את יישום קאלקפיילוט.
              </p>
              <h2>רשומות פיננסיות</h2>
              <p>
                החישובים מתבצעים בדפדפן. רשומות הבית והרכב, העדפות, היסטוריית
                חישובים ותרחישים נשמרים באחסון המקומי במכשיר הנוכחי. היישום אינו
                שולח רשומות פיננסיות אלה לשרת היישום. גיבויים וקובצי נתונים
                שיוצאו נמצאים בשליטתך. האחסון המקומי אינו מוצפן על ידי היישום;
                הימנעו מהזנת מידע רגיש במכשיר משותף.
              </p>
              <h2>בקשות טכניות</h2>
              <p>
                ספק האירוח עשוי לעבד כתובות רשת ויומני בקשות בעת טעינת עמודים.
                טעינת גופנים מגוגל עשויה להעביר מידע טכני לגוגל. בפרויקט המסופק
                אין כלי ניתוח שימוש או פרסום פעילים.
              </p>
              <h2>שערי מטבעות</h2><p>מחשבון ההמרה מבקש טבלת שערי ייחוס מבוססת דולר משירות Frankfurter בשלושה חלונות בדיקה יומיים, או ברענון ידני. הסכום והרשומות הפיננסיות אינם נשלחים בבקשה. טבלת השערים ומועד שליפתה נשמרים במכשיר, ויכולים להגיע גם מקובץ ציבורי שהופק בפריסה. הספק ותשתיתו מעבדים בקשת רשת בהתאם לתנאיהם. במצב שער ידני לא מתבצעת בקשת שער חדשה.</p>
              <h2>מחיקה והעברה של נתונים</h2>
              <p>
                אפשר למחוק רשומות בנפרד במסכי המעקב, או למחוק את אחסון האתר
                בדפדפן כדי להסיר את כל הנתונים המקומיים. יש לגבות לפני מחיקה,
                החלפת דפדפן או מעבר מכשיר. אין שחזור מהענן.
              </p>
              <h2>פרסום עתידי</h2>
              <p>
                אם מפעיל האתר יפעיל פרסום או ניתוח שימוש, יש לעדכן את המדיניות
                בהתאם לספקים ולעיבוד בפועל וליישם את מנגנוני ההסכמה הנדרשים לפני
                טעינתם.
              </p>
              <h2>יצירת קשר</h2>
              <p>
                פרטי הקשר המוגדרים של מפעיל האתר מופיעים בעמוד יצירת הקשר. על
                המפעיל להגדיר את זהותו ואת פרטי הקשר לפני השקה לציבור.
              </p>
            </>
          }
        >
          <h1>Privacy policy</h1>
          <p>
            Version: October 11, 2026. This policy describes the included
            CalcPilot application.
          </p>
          <h2>Financial records</h2>
          <p>
            Calculations run in your browser. Household and vehicle records,
            preferences, calculation history and saved scenarios are stored in
            localStorage on the current device. The application does not
            transmit these financial entries to an application server. Exported
            backups and CSV files are controlled by you. Browser storage is not
            encrypted by this application; avoid entering sensitive information
            on a shared device.
          </p>
          <h2>Technical requests</h2>
          <p>
            The hosting provider may process IP addresses and request logs when
            pages are loaded. Google Fonts requests may transmit technical
            information to Google. No analytics or advertising scripts are
            enabled in the supplied project.
          </p>
          <h2>Exchange rates</h2><p>The converter requests a USD-based reference rate table from Frankfurter in three daily refresh windows or on manual refresh. Amounts and financial records are not included. The table and retrieval time are saved on this device, or loaded from a public deployment snapshot. The provider and its infrastructure process network requests under their own terms. Manual mode does not initiate a new rate request.</p>
          <h2>Deleting and moving your data</h2>
          <p>
            Delete individual records in the dashboards or clear this site's
            browser storage to remove all local data. Back up before clearing
            storage, changing browser or moving device. No cloud recovery is
            available.
          </p>
          <h2>Future advertising</h2>
          <p>
            If an operator enables ads or analytics, this policy must be updated
            to describe the actual providers and processing, and the required
            consent controls must be implemented before loading those scripts.
          </p>
          <h2>Contact</h2>
          <p>
            Use the contact page to find the configured operator contact
            address. The operator must set their identity and contact details
            before public launch.
          </p>
        </Localized>
        <Localized he={<><h2>שמירה אוטומטית ושיתוף</h2><p>נתוני מחשבונים תקינים נשמרים אוטומטית במכשיר, בנפרד מתרחישים בעלי שם. שיתוף מתבצע רק אחרי בחירת שדות ויצירת קישור. הערכים נכללים בחלק שאחרי # ואינם פרמטר בקשת שרת, אך כל מי שמחזיק בקישור יכול לקרוא אותם. אין הצפנה בקישור; אל תשתפו מידע אישי. קובצי גיבוי מכילים נתונים פרטיים ויש לשמור אותם באופן בטוח.</p><h2>אפליקציה ושימוש לא מקוון</h2><p>גרסת ההפצה שומרת קובצי אתר וטבלת שערים ציבורית במטמון הדפדפן. לאחר התקנה ראשונית אפשר להשתמש בכלים מקומיים ללא רשת. שער שמור אינו שער עדכני מובטח. ניקוי אחסון האתר מסיר רשומות, שמירות ומטמון. שינוי דומיין או דפדפן אינו מעביר נתונים.</p></>} ru={<><h2>Автосохранение и обмен</h2><p>Корректные данные калькуляторов автоматически сохраняются на устройстве отдельно от именованных сценариев. Обмен требует выбора полей и создания ссылки. Значения находятся после # и не являются параметром серверного запроса, но доступны каждому с ссылкой. Ссылка не зашифрована; не делитесь личными сведениями. Резервные копии содержат частные данные и требуют безопасного хранения.</p><h2>Приложение и офлайн-режим</h2><p>Версия для публикации сохраняет файлы сайта и общедоступную таблицу курсов в браузере. После первоначальной загрузки локальные инструменты доступны без сети. Сохранённый курс не гарантирует актуальность. Очистка хранилища удаляет записи, сохранения и кэш. Смена домена или браузера не переносит данные.</p><h2>Обновление механизма курсов</h2><p>Вместо отдельных валютных пар загружается таблица курсов к USD в трёх ежедневных окнах или по ручному запросу. Суммы не отправляются. Таблица и время запроса сохраняются локально; также используется публичный снимок из развёртывания.</p></>}><h2>Automatic saving and sharing</h2><p>Valid calculator inputs are saved automatically on this device, separately from named scenarios. Sharing requires selecting fields and creating a link. Values appear after #, not as a server query parameter, but anyone holding the link can read them. Links are not encrypted; do not share personal information. Backup files contain private data and need safe storage.</p><h2>App and offline use</h2><p>The production app caches site files and the public exchange table in your browser. Local tools work offline after the initial installation. A saved rate is not guaranteed current. Clearing site storage removes records, saves and cache. Changing domain or browser does not transfer data.</p></Localized>
        <Localized he={<><h2>כלי נגישות והקראה — עדכון 12.10.2026</h2><p>העדפות גופן, גודל טקסט, צבעים וכלי קריאה נשמרות במכשיר במפתח cp-accessibility-v1. איפוס בתפריט מחזיר אותן לברירת המחדל ואינו מוחק מידע פיננסי. כלי הנגישות אינו שומר טקסט שנבחר להקראה. ההקראה מופעלת רק בפעולה מפורשת באמצעות הדפדפן או מערכת ההפעלה; הקול עשוי להשתמש בשירות מקוון בהתאם להגדרות המכשיר ולתנאי הספק. אין להקריא מידע רגיש במכשיר משותף.</p></>} ru={<><h2>Доступность и чтение — обновление 12.10.2026</h2><p>Настройки шрифта, размера, цветов и чтения сохраняются на устройстве под ключом cp-accessibility-v1. Сброс возвращает настройки по умолчанию и не удаляет финансовые данные. Инструмент не сохраняет выделенный для чтения текст. Озвучивание запускается явно через браузер или систему; голос может использовать онлайн-сервис согласно настройкам и условиям поставщика. Не озвучивайте чувствительные данные на общем устройстве.</p></>}><h2>Accessibility and speech — updated October 12, 2026</h2><p>Font, size, color and reading preferences are saved on your device under cp-accessibility-v1. Reset returns them to defaults without deleting financial data. Selected speech text is not stored by this tool. Reading starts only on explicit request through your browser or operating system; voices may use an online service under device settings and provider terms. Avoid reading sensitive information on shared devices.</p></Localized>
      </article>
    </main>
  );
}
