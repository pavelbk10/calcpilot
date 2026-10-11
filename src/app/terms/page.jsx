import Localized from "../../components/Localized";
export const metadata = { title: "תנאי שימוש" };
export default function Page() {
  return (
    <main className="page">
      <article className="prose">
        <Localized
          ru={<><h1>Условия использования</h1><p>КалькПилот предоставляет образовательные инструменты, а не персональные инвестиционные, налоговые, юридические или кредитные рекомендации.</p><h2>Ограничения расчётов</h2><p>Результаты зависят от данных. Если не указано иное, кредитная модель использует постоянную номинальную ставку, ежемесячное начисление и равные платежи. Комиссии, страховка, налоги, индексация и изменения ставок исключены. Доходность накоплений является допущением, а не обещанием.</p><h2>Независимая проверка</h2><p>Проверяйте предложения и правила у кредитора или квалифицированного специалиста. Результат не означает одобрения кредита. Выбор валюты отображения меняет только представление суммы.</p><h2>Налоги и конвертация</h2><p>Налоговый инструмент предоставляет ограниченную оценку, не определяет льготы и не заменяет официальную оценку. Курсы справочные, не являются предложением сделки и могут быть недоступны или устареть. Проверяйте дату, комиссии и допущения.</p><h2>Локальные записи</h2><p>Пользователь отвечает за резервные копии. Очистка браузера и смена устройства могут привести к потере данных. Учётной записи и синхронизации нет.</p><h2>Оператор</h2><p>Перед запуском оператор должен указать юридическую личность, контакты и проверить условия по применимому законодательству.</p></>}
          he={
            <>
              <h1>תנאי שימוש</h1>
              <p>
                קאלקפיילוט מספק כלים ללמידה כללית ואינו מספק ייעוץ אישי בתחומי
                השקעות, מס, משפט או אשראי.
              </p>
              <h2>מגבלות החישוב</h2>
              <p>
                התוצאות להמחשה ותלויות בנתונים שהוזנו. אלא אם נאמר אחרת, חישובי
                הלוואות מניחים ריבית נומינלית קבועה, ריבית דריבית חודשית
                ותשלומים חודשיים שווים. עמלות, ביטוח, מסים, הצמדה וריבית משתנה
                אינם כלולים. תשואות החיסכון הן הנחות ולא תחזית או הבטחה.
              </p>
              <h2>בדיקה עצמאית</h2>
              <p>
                יש לבדוק הצעות, יכולת החזר וכללים רלוונטיים עם המלווה או בעל
                מקצוע מוסמך. שום תוצאה אינה אישור אשראי. בחירת מטבע משנה תצוגה
                בלבד ואינה ממירה סכומים.
              </p>
              <h2>מיסוי והמרה</h2><p>כלי המס מספק אומדן מוגבל, אינו קובע פטורים ואינו מחליף שומה רשמית. שערי המטבע הם שערי ייחוס ולא הצעת עסקה, ועלולים להיות לא זמינים או לא עדכניים. יש לבדוק תאריך שער, עמלות והנחות לפני שימוש.</p>
              <h2>רשומות מקומיות</h2>
              <p>
                האחריות לגיבוי הרשומות המקומיות היא שלך. הנתונים עלולים להימחק
                בעת ניקוי נתוני הדפדפן או החלפת מכשיר. אין חשבון משתמש או סנכרון
                בין מכשירים.
              </p>
              <h2>מפעיל האתר</h2>
              <p>
                על מפעיל האתר להגדיר את זהותו המשפטית ופרטי הקשר ולבחון את
                התנאים לפי הדין באזור הפעילות לפני השקה לציבור.
              </p>
            </>
          }
        >
          <h1>Terms of use</h1>
          <p>
            CalcPilot provides general educational tools. It does not provide
            personalized investment, tax, legal or lending advice.
          </p>
          <h2>Calculation limits</h2>
          <p>
            Results are illustrative and depend on user inputs. Unless stated
            otherwise, loan calculations assume fixed nominal interest, monthly
            compounding and equal monthly installments. Fees, insurance, taxes,
            indexation and changing interest rates are excluded. Savings returns
            are assumptions rather than predictions or guarantees.
          </p>
          <h2>Independent verification</h2>
          <p>
            Verify offers, affordability and applicable rules with the lender or
            an appropriately qualified professional. No result is a lending
            approval. Currency selection changes the symbol only.
          </p>
          <h2>Taxes and conversion</h2><p>The tax tool provides a limited estimate, does not determine exemptions and does not replace an official assessment. Exchange rates are reference rates, not transaction offers, and may be unavailable or stale. Verify dates, fees and assumptions before use.</p>
          <h2>Local records</h2>
          <p>
            You are responsible for backing up local records. They can be lost
            when browser data is cleared or the device changes. This project
            includes no account or cross-device synchronization.
          </p>
          <h2>Operator</h2>
          <p>
            The deploying operator must configure their legal identity and
            contact address and review these terms for the jurisdiction where
            the service operates before public launch.
          </p>
        </Localized>
      </article>
    </main>
  );
}
