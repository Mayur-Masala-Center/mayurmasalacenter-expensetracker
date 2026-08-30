import Nav from "@/components/Nav";
import TxnPage from "@/components/TxnPage";
import QuickAdd from "@/components/QuickAdd";

export default function ExpensesPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Nav />
      <main className="flex-1 p-4 md:p-6 pb-24">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl md:text-2xl font-bold">Expenses</h1>
          <QuickAdd />
        </div>
        <TxnPage type="expense" title="Expenses" />
      </main>
    </div>
  );
}