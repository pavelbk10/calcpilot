import MortgagePlanner from "../../../components/MortgagePlanner";
import BasicCalculator from "../../../components/BasicCalculator";
import FinancialCalculator from "../../../components/FinancialCalculator";
import PropertyTaxCalculator from '../../../components/PropertyTaxCalculator';
import CurrencyConverter from '../../../components/CurrencyConverter';
import { tools } from "../../../lib/catalog.mjs";
import Calculator from "../../../components/Calculator";
import Link from "next/link";
import CalculatorIdentity from '../../../components/CalculatorIdentity';
export function generateStaticParams() {
  return tools.map((t) => ({ id: t.id }));
}
export async function generateMetadata({ params }) {
  const { id } = await params;
  const t = tools.find((t) => t.id === id);
  return { title: t.name, description: t.description };
}
export default async function Page({ params }) {
  const { id } = await params;
  const t = tools.find((t) => t.id === id);
  return (
    <main className="page">
      <CalculatorIdentity tool={t}/>
      {id === "mortgage" ? (
        <MortgagePlanner />
      ) : id === "basic" ? (
        <BasicCalculator />
      ) : id === "financial" ? (
        <FinancialCalculator />
      ) : id === 'property-tax' ? (
        <PropertyTaxCalculator />
      ) : id === 'currency' ? (
        <CurrencyConverter />
      ) : (
        <Calculator key={id} tool={t} />
      )}
    </main>
  );
}
