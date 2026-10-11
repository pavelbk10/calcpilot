import Link from "next/link";
import Localized from "../components/Localized";
export default function Page() {
  return (
    <main className="page">
      <div className="page-title">
        <div className="eyebrow">404</div>
        <h1>
          <Localized ru="Страница не найдена." he="העמוד לא נמצא.">A different route?</Localized>
        </h1>
        <p>
          <Localized ru="Этой страницы нет. Найдите инструмент в каталоге калькуляторов." he="העמוד המבוקש אינו קיים. אפשר למצוא את הכלי המתאים בקטלוג המחשבונים.">
            This page does not exist. Explore the toolkit to find what you need.
          </Localized>
        </p>
        <Link className="primary" href="/calculators/">
          <Localized ru="Найти калькулятор" he="חיפוש מחשבון">Find a calculator</Localized>
        </Link>
      </div>
    </main>
  );
}
