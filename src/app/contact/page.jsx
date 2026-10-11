import Localized from "../../components/Localized";
export const metadata = { title: "יצירת קשר" };
export default function Page() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  return (
    <main className="page">
      <article className="prose">
        <Localized
          ru={<><div className="eyebrow">СВЯЗАТЬСЯ С НАМИ</div><h1>Улучшения начинаются с обратной связи.</h1><p>Есть вопрос, ошибка расчёта или предложение инструмента? Укажите название калькулятора, данные и ожидаемый результат. Не отправляйте банковские пароли или чувствительные финансовые документы.</p></>}
          he={
            <>
              <div className="eyebrow">יצירת קשר</div>
              <h1>כלים טובים מתחילים במשוב.</h1>
              <p>
                יש שאלה, טעות בחישוב או הצעה למחשבון חדש? ציינו את שם המחשבון,
                הנתונים שהוזנו והתוצאה הצפויה. אין לשלוח פרטי כניסה לבנק או
                מסמכים פיננסיים רגישים.
              </p>
            </>
          }
        >
          <div className="eyebrow">GET IN TOUCH</div>
          <h1>Better tools start with feedback.</h1>
          <p>
            Have a question, found a calculation issue or want to suggest a new
            tool? Include the calculator name, inputs and expected result. Do
            not send banking credentials or sensitive financial documents.
          </p>
        </Localized>
        {email ? (
          <a className="primary" href={"mailto:" + email}>
            {email}
          </a>
        ) : (
          <div className="notice">
            <Localized ru="Оператор пока не настроил адрес электронной почты поддержки." he="מפעיל האתר טרם הגדיר כתובת דואר אלקטרוני לתמיכה.">
              The site's operator has not yet configured a support email
              address.
            </Localized>
          </div>
        )}
      </article>
    </main>
  );
}
