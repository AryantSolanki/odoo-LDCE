import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  CreditCard,
  Building2,
  Utensils,
  Ticket,
  Plane,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { apiService } from '../../services/apiService';
import { useToast } from '../../hooks/useToast';

export const BudgetDashboard = ({ trip, onBudgetUpdated }) => {
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('Meals');
  const [newAmount, setNewAmount] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState(trip?.startDate || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addToast } = useToast();

  const loadBudget = async () => {
    if (!trip?.id) return;
    setLoading(true);
    try {
      const data = await apiService.getTripBudget(trip.id);
      setBudgetData(data);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to calculate trip budget.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudget();
  }, [trip]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newAmount || Number(newAmount) <= 0) {
      addToast({ type: 'warning', title: 'Invalid Amount', message: 'Please enter a valid amount.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.addExpense(trip.id, {
        category: newCategory,
        amount: Number(newAmount),
        description: newDesc || `${newCategory} expense`,
        date: newDate || trip.startDate,
      });

      addToast({ type: 'success', title: 'Expense Logged', message: 'Custom expense added to trip budget.' });
      setIsAddExpenseOpen(false);
      setNewAmount('');
      setNewDesc('');
      loadBudget();
      if (onBudgetUpdated) onBudgetUpdated();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to log expense.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await apiService.deleteExpense(trip.id, expenseId);
      addToast({ type: 'success', title: 'Expense Removed', message: 'Logged item removed.' });
      loadBudget();
      if (onBudgetUpdated) onBudgetUpdated();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete expense.' });
    }
  };

  if (loading || !budgetData) {
    return (
      <div className="space-y-4 py-8 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Analyzing and calculating trip budget...</p>
      </div>
    );
  }

  const {
    budget_limit,
    total_estimated_cost,
    average_daily_cost,
    target_daily_budget,
    total_days,
    transport,
    stay,
    activities,
    meals,
    other_expenses,
    over_budget,
    budget_difference,
    categories,
    dailySpending,
    overBudgetDays,
    expenses,
  } = budgetData;

  const budgetUsagePercent = Math.min(100, Math.round((total_estimated_cost / (budget_limit || 1)) * 100));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner: Total Estimated Cost vs Budget Limit */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Total Estimated Cost
            </span>
            <Badge variant={over_budget ? 'danger' : 'success'} showDot>
              {over_budget ? 'Over Budget' : 'Within Budget Target'}
            </Badge>
          </div>

          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              ${total_estimated_cost.toLocaleString()}
            </h2>
            <span className="text-xs sm:text-sm text-slate-500 font-medium">
              of ${budget_limit.toLocaleString()} budget limit
            </span>
          </div>

          <div className="w-full max-w-md pt-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>{budgetUsagePercent}% allocated</span>
              <span>
                {over_budget
                  ? `+$${Math.abs(budget_difference).toLocaleString()} over limit`
                  : `$${budget_difference.toLocaleString()} buffer remaining`}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  over_budget ? 'bg-rose-500' : budgetUsagePercent > 85 ? 'bg-amber-500' : 'bg-brand-600'
                }`}
                style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-center min-w-[130px]">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Cost / Day</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">${average_daily_cost}</p>
            <p className="text-[10px] text-slate-400 font-medium">Target: ${target_daily_budget}/day</p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddExpenseOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Log Custom Expense
          </Button>
        </div>
      </div>

      {/* Over-Budget Day Alert Warning Notice */}
      {overBudgetDays.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              {overBudgetDays.length} {overBudgetDays.length === 1 ? 'Day Exceeds' : 'Days Exceed'} Target Daily Budget (${target_daily_budget}/day)
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              {overBudgetDays.map((d) => `${d.dayLabel} in ${d.cityName} ($${d.total})`).join(' • ')}
            </p>
          </div>
        </div>
      )}

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Stay & Hotel</span>
            <Building2 className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-lg font-black text-slate-900">${stay.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 font-medium">{Math.round((stay / (total_estimated_cost || 1)) * 100)}% of total</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Transport</span>
            <Plane className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-lg font-black text-slate-900">${transport.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 font-medium">{Math.round((transport / (total_estimated_cost || 1)) * 100)}% of total</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Meals & Food</span>
            <Utensils className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-black text-slate-900">${meals.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 font-medium">{Math.round((meals / (total_estimated_cost || 1)) * 100)}% of total</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Activities</span>
            <Ticket className="w-4 h-4 text-travel-500" />
          </div>
          <p className="text-lg font-black text-slate-900">${activities.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 font-medium">{Math.round((activities / (total_estimated_cost || 1)) * 100)}% of total</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Other Logs</span>
            <CreditCard className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-lg font-black text-slate-900">${other_expenses.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 font-medium">{Math.round((other_expenses / (total_estimated_cost || 1)) * 100)}% of total</p>
        </div>
      </div>

      {/* Visualizations Row: Recharts Donut & Daily Spending Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recharts Donut Chart */}
        <Card className="lg:col-span-5 border border-slate-200/80 shadow-subtle p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-sm font-extrabold text-slate-900">Category Distribution</CardTitle>
              <CardDescription className="text-xs">Proportional spending breakdown</CardDescription>
            </div>
            <PieIcon className="w-4 h-4 text-brand-600" />
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories.filter((c) => c.amount > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="amount"
                  nameKey="category"
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Clean Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {categories.map((cat) => (
              <div key={cat.category} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-slate-600 truncate">{cat.category}</span>
                <span className="font-bold text-slate-900 ml-auto">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recharts Daily Spending Bar Chart */}
        <Card className="lg:col-span-7 border border-slate-200/80 shadow-subtle p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-sm font-extrabold text-slate-900">Daily Spending & Targets</CardTitle>
              <CardDescription className="text-xs">
                Estimated daily cost vs target threshold (${target_daily_budget}/day)
              </CardDescription>
            </div>
            <BarChart3 className="w-4 h-4 text-travel-500" />
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySpending} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="dayLabel"
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  interval={0}
                  tickFormatter={(val) => val.split(' ')[0]}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 min-w-[160px]">
                          <p className="font-bold text-brand-300">{data.dayLabel} • {data.cityName}</p>
                          <div className="flex justify-between text-slate-200">
                            <span>Stay:</span>
                            <span>${data.stay}</span>
                          </div>
                          <div className="flex justify-between text-slate-200">
                            <span>Meals:</span>
                            <span>${data.meals}</span>
                          </div>
                          {data.transport > 0 && (
                            <div className="flex justify-between text-slate-200">
                              <span>Transit:</span>
                              <span>${data.transport}</span>
                            </div>
                          )}
                          {data.activities > 0 && (
                            <div className="flex justify-between text-slate-200">
                              <span>Activities:</span>
                              <span>${data.activities}</span>
                            </div>
                          )}
                          <div className="pt-1.5 border-t border-slate-700 flex justify-between font-bold text-white">
                            <span>Daily Total:</span>
                            <span>${data.total}</span>
                          </div>
                          {data.isOverBudget && (
                            <p className="text-[10px] text-amber-400 font-bold mt-1">
                              Over target threshold (${data.targetDailyBudget})
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={target_daily_budget}
                  stroke="#F59E0B"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Daily Target',
                    position: 'insideTopRight',
                    fill: '#F59E0B',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {dailySpending.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={entry.isOverBudget ? '#F59E0B' : '#4F46E5'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-brand-600" />
                Standard Day
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                Over Daily Target
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              *Bars reflect stay + meals + transit + scheduled tours
            </span>
          </div>
        </Card>
      </div>

      {/* Itemized Logged Expenses List */}
      <Card className="border border-slate-200/80 shadow-subtle p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <CardTitle className="text-sm font-extrabold text-slate-900">Custom Logged Expenses</CardTitle>
            <CardDescription className="text-xs">
              Ad-hoc receipts, SIM cards, local transit passes, and miscellaneous purchases
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddExpenseOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Expense
          </Button>
        </div>

        {expenses.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs space-y-1">
            <CreditCard className="w-6 h-6 mx-auto opacity-50 text-slate-400" />
            <p>No custom expenses logged yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {expenses.map((exp) => (
              <div key={exp.id} className="py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-slate-100 text-slate-600">
                    <CreditCard className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{exp.description || exp.category}</p>
                    <p className="text-[11px] text-slate-400">
                      {exp.category} • {exp.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-900">${exp.amount}</span>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Custom Expense Modal */}
      <Modal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        title="Log Trip Expense"
        description="Add out-of-pocket receipts or custom expenses to your trip budget."
      >
        <form onSubmit={handleAddExpense} className="space-y-4 pt-1">
          <Input
            label="Expense Description / Vendor"
            placeholder="e.g. Metro Pass, Airport eSIM, Dinner Wine"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <Select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                options={[
                  { label: 'Meals & Dining', value: 'Meals' },
                  { label: 'Transport & Transit', value: 'Transport' },
                  { label: 'Shopping & Souvenirs', value: 'Shopping' },
                  { label: 'Tours & Entertainment', value: 'Activities' },
                  { label: 'Emergency / Buffer', value: 'Other' },
                ]}
              />
            </div>

            <Input
              label="Amount ($)"
              type="number"
              placeholder="e.g. 45"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              required
            />
          </div>

          <Input
            label="Expense Date"
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddExpenseOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} leftIcon={<Plus className="w-4 h-4" />}>
              Save Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
