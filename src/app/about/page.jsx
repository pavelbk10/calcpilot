import Localized from "../../components/Localized";
export const metadata = { title: "אודות" };
export default function Page() {
  return (
    <main className="page">
      <article className="prose">
        <Localized
          ru={<><div className="eyebrow">О КАЛЬКПИЛОТ</div><h1>Ясность до обязательств.</h1><p>КалькПилот объединяет расчёты ипотеки, кредитов, накоплений, автомобиля, налогов на недвижимость и обмена валют с учётом семейных расходов.</p><h2>Понятные расчёты</h2><p>Инструменты показывают данные, результаты и допущения. Кредитные планы поддерживают сохранение сценария, графики и печать. Ипотечный планировщик моделирует ставки и инфляцию, финансовый калькулятор рассчитывает стоимость денег, дисконтированные потоки и доходность.</p><h2>Ваши данные на вашем устройстве</h2><p>Записи и сценарии сохраняются в браузере. Учётной записи, подключения к банку и облачной синхронизации нет. Можно экспортировать и восстанавливать копии. Очистка браузера удаляет записи.</p><h2>Язык и валюта</h2><p>Интерфейс и руководства доступны на русском, английском и иврите. На иврите суммы отображаются в шекелях. Выбор валюты отображения не конвертирует числа; отдельный конвертер использует справочный или ручной курс. Израильские налоги рассчитываются в шекелях. Ставки и доли платежей являются допущениями пользователя, а не проверкой нормативного соответствия.</p></>}
          he={
            <>
              <div className="eyebrow">אודות קאלקפיילוט</div>
              <h1>בהירות לפני התחייבות.</h1>
              <p>
                קאלקפיילוט מרכז חישובי משכנתא, הלוואות, חיסכון ורכב לצד מעקב
                הוצאות הבית. המטרה היא להציג בצורה ברורה את ההנחות שמאחורי כל
                החלטה פיננסית.
              </p>
              <h2>חישובים שאפשר להבין</h2>
              <p>
                כל מחשבון מציג נתונים, תוצאות שמתעדכנות והנחות חישוב. אפשר לשמור
                תרחיש להשוואה, להוריד לוחות סילוקין ולהדפיס תוצאות. מתכנן
                המשכנתא כולל תחזיות ריבית ומדד, והמחשבון הפיננסי כולל ערך כסף
                לאורך זמן, ערך נוכחי נקי ושיעור תשואה פנימי.
              </p>
              <h2>הנתונים שלך, במכשיר שלך</h2>
              <p>
                הוצאות ותרחישים נשמרים בדפדפן. אין חשבון משתמש, חיבור לבנק או
                סנכרון בענן. ניתן לייצא ולשחזר גיבויים. מחיקת אחסון הדפדפן מוחקת
                את הרשומות המקומיות.
              </p>
              <h2>שפה ומטבע</h2>
              <p>
                הממשק והמדריכים תומכים בעברית, באנגלית וברוסית. בעברית הסכומים מוצגים בשקלים.
                בחירת מטבע תצוגה אינה ממירה סכומים; מחשבון ההמרה הנפרד משתמש בשער ייחוס או בשער ידני.
                המסים הישראליים מחושבים בשקלים. שיעורי ההחזר והריבית מוזנים על ידי המשתמש ואינם בדיקת
                עמידה בכללי אשראי מקומיים.
              </p>
            </>
          }
        >
          <div className="eyebrow">ABOUT CALCPILOT</div>
          <h1>Clarity before commitment.</h1>
          <p>
            CalcPilot brings mortgage, lending, savings and vehicle calculations
            together with simple household expense tracking. Our purpose is to
            make the assumptions behind a money decision easier to see.
          </p>
          <h2>Tools you can understand</h2>
          <p>
            Every calculator shows its inputs, live results and calculation
            assumptions. Loan planning tools support a saved comparison
            scenario, downloadable schedules and printable results. The mortgage
            mix simulator adds adjustable interest and inflation assumptions,
            and the financial workbench includes TVM, NPV and IRR.
          </p>
          <h2>Your data, on your device</h2>
          <p>
            Expense records and saved scenarios are stored in your browser. No
            account, bank connection or cloud synchronization is included. You
            can export and restore dashboard backups. Clearing browser storage
            deletes local records.
          </p>
          <h2>For an international audience</h2>
          <p>
            The interface and guides support English, Hebrew and Russian. Hebrew uses shekels.
            Display currency selection does not convert values; the separate converter uses a reference or manual rate.
            Israeli taxes are calculated in shekels. Loan ratios and rates are entered by the user; the
            tools do not enforce country-specific lending regulations.
          </p>
        </Localized>
      </article>
    </main>
  );
}
