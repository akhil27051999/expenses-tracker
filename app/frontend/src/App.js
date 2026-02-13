"import { useState, useEffect } from \"react\";
import \"@/App.css\";
import axios from \"axios\";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, Wallet, Target, AlertCircle } from 'lucide-react';
import { Button } from \"@/components/ui/button\";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from \"@/components/ui/card\";
import { Input } from \"@/components/ui/input\";
import { Label } from \"@/components/ui/label\";
import { Tabs, TabsContent, TabsList, TabsTrigger } from \"@/components/ui/tabs\";
import { toast } from \"sonner\";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

function App() {
  const [monthlyIncome, setMonthlyIncome] = useState(92000);
  const [expenses, setExpenses] = useState([
    { category: \"Savings\", subcategory: \"SIP\", amount: 4000, frequency: \"monthly\" },
    { category: \"Savings\", subcategory: \"LIC\", amount: 4000, frequency: \"monthly\" },
    { category: \"Education\", subcategory: \"Scaler EMI\", amount: 7600, frequency: \"monthly\" },
    { category: \"Education\", subcategory: \"Anu Fee's\", amount: 10000, frequency: \"monthly\" },
    { category: \"My Home Spending\", subcategory: \"Supermarket Bill\", amount: 3000, frequency: \"monthly\" },
    { category: \"My Home Spending\", subcategory: \"Electricity\", amount: 1000, frequency: \"monthly\" },
    { category: \"My Home Spending\", subcategory: \"Cooking Gas\", amount: 1000, frequency: \"bimonthly\" },
    { category: \"My Home Spending\", subcategory: \"Recharges\", amount: 1000, frequency: \"monthly\" },
    { category: \"My Home Spending\", subcategory: \"Shopping / Others\", amount: 1000, frequency: \"monthly\" },
    { category: \"Room Spending's\", subcategory: \"Room (Rent + Maid) Share\", amount: 7200, frequency: \"monthly\" },
    { category: \"Room Spending's\", subcategory: \"Room Expenses(Food + Electricity + Internet)\", amount: 5000, frequency: \"monthly\" },
    { category: \"Bike Expenses\", subcategory: \"Royal Enfield EMI\", amount: 5000, frequency: \"monthly\" },
    { category: \"Bike Expenses\", subcategory: \"Royal Enfield Fuel\", amount: 2000, frequency: \"monthly\" },
    { category: \"Personal Spending\", subcategory: \"Sports\", amount: 1000, frequency: \"monthly\" },
    { category: \"Personal Spending\", subcategory: \"Movies\", amount: 500, frequency: \"monthly\" },
    { category: \"Personal Spending\", subcategory: \"Personal Shopping\", amount: 1000, frequency: \"monthly\" },
    { category: \"Personal Spending\", subcategory: \"Outings\", amount: 1000, frequency: \"monthly\" }
  ]);
  
  const [projection, setProjection] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateProjection();
  }, []);

  const calculateProjection = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/calculate-projection`, {
        monthly_income: monthlyIncome,
        expenses: expenses
      });
      setProjection(response.data);
    } catch (error) {
      console.error(\"Error calculating projection:\", error);
      toast.error(\"Failed to calculate projection\");
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseChange = (index, field, value) => {
    const newExpenses = [...expenses];
    newExpenses[index][field] = field === 'amount' ? parseFloat(value) || 0 : value;
    setExpenses(newExpenses);
  };

  const handleRecalculate = () => {
    calculateProjection();
    toast.success(\"Projection updated!\");
  };

  const handleDownloadExcel = async () => {
    try {
      toast.info(\"Generating Excel file...\");
      const response = await axios.post(`${API}/export-excel`, {
        monthly_income: monthlyIncome,
        expenses: expenses
      }, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'expense_tracker.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(\"Excel file downloaded successfully!\");
    } catch (error) {
      console.error(\"Error downloading Excel:\", error);
      toast.error(\"Failed to download Excel file\");
    }
  };

  if (!projection) {
    return (
      <div className=\"min-h-screen flex items-center justify-center bg-slate-50\">
        <div className=\"text-xl\">Loading...</div>
      </div>
    );
  }

  // Prepare chart data
  const categoryData = Object.entries(projection.expenses_by_category).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  }));

  const monthlyData = [
    { name: 'Income', amount: projection.monthly_income },
    { name: 'Expenses', amount: projection.total_expenses },
    { name: 'Savings', amount: projection.monthly_savings }
  ];

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50\" data-testid=\"expense-tracker-app\">
      <div className=\"container mx-auto px-4 py-8 max-w-7xl\">
        {/* Header */}
        <div className=\"text-center mb-8\">
          <h1 className=\"text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3\">
            Monthly Expense Tracker
          </h1>
          <p className=\"text-slate-600 text-lg\">Track your expenses and plan your path to ₹1 Crore</p>
        </div>

        {/* Key Metrics Cards */}
        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8\">
          <Card className=\"bg-white shadow-lg border-l-4 border-l-green-500\">
            <CardHeader className=\"pb-3\">
              <CardTitle className=\"text-sm font-medium text-slate-600 flex items-center gap-2\">
                <Wallet className=\"w-4 h-4\" />
                Monthly Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=\"text-2xl font-bold text-slate-900\">₹{projection.monthly_income.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className=\"bg-white shadow-lg border-l-4 border-l-red-500\">
            <CardHeader className=\"pb-3\">
              <CardTitle className=\"text-sm font-medium text-slate-600 flex items-center gap-2\">
                <TrendingUp className=\"w-4 h-4\" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=\"text-2xl font-bold text-slate-900\">₹{projection.total_expenses.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className=\"bg-white shadow-lg border-l-4 border-l-blue-500\">
            <CardHeader className=\"pb-3\">
              <CardTitle className=\"text-sm font-medium text-slate-600 flex items-center gap-2\">
                <Target className=\"w-4 h-4\" />
                Monthly Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${projection.monthly_savings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{projection.monthly_savings.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className=\"bg-white shadow-lg border-l-4 border-l-purple-500\">
            <CardHeader className=\"pb-3\">
              <CardTitle className=\"text-sm font-medium text-slate-600 flex items-center gap-2\">
                <AlertCircle className=\"w-4 h-4\" />
                {projection.shortfall > 0 ? 'Shortfall' : 'Surplus'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${projection.shortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{Math.abs(projection.shortfall).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goal Progress */}
        <Card className=\"mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl\">
          <CardHeader>
            <CardTitle className=\"text-2xl flex items-center gap-2\">
              <Target className=\"w-6 h-6\" />
              5-Year Goal: ₹1 Crore
            </CardTitle>
            <CardDescription className=\"text-blue-100\">
              Required Monthly Savings: ₹{projection.required_monthly_savings.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className=\"space-y-3\">
              <div>
                <div className=\"flex justify-between text-sm mb-2\">
                  <span>Progress at current rate</span>
                  <span>{((projection.monthly_savings * 60 / projection.target_amount) * 100).toFixed(1)}%</span>
                </div>
                <div className=\"w-full bg-blue-900/40 rounded-full h-3\">
                  <div 
                    className=\"bg-green-400 h-3 rounded-full transition-all duration-500\"
                    style={{ width: `${Math.min(((projection.monthly_savings * 60 / projection.target_amount) * 100), 100)}%` }}
                  />
                </div>
              </div>
              <p className=\"text-sm text-blue-100\">
                {projection.shortfall > 0 
                  ? `Increase your monthly savings by ₹${projection.shortfall.toLocaleString()} to reach your goal in 5 years.`
                  : `Great! You're on track to exceed your goal. Keep up the excellent work!`
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue=\"charts\" className=\"space-y-6\">
          <TabsList className=\"grid w-full grid-cols-2 lg:w-auto lg:inline-grid\" data-testid=\"tabs-list\">
            <TabsTrigger value=\"charts\" data-testid=\"charts-tab\">Charts & Analytics</TabsTrigger>
            <TabsTrigger value=\"expenses\" data-testid=\"expenses-tab\">Edit Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value=\"charts\" data-testid=\"charts-content\">
            <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
              {/* Pie Chart */}
              <Card className=\"bg-white shadow-lg\">
                <CardHeader>
                  <CardTitle>Expense Distribution</CardTitle>
                  <CardDescription>Category-wise breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width=\"100%\" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx=\"50%\"
                        cy=\"50%\"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill=\"#8884d8\"
                        dataKey=\"value\"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bar Chart */}
              <Card className=\"bg-white shadow-lg\">
                <CardHeader>
                  <CardTitle>Monthly Overview</CardTitle>
                  <CardDescription>Income vs Expenses vs Savings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width=\"100%\" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray=\"3 3\" />
                      <XAxis dataKey=\"name\" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Bar dataKey=\"amount\" fill=\"#3b82f6\" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Breakdown Table */}
              <Card className=\"lg:col-span-2 bg-white shadow-lg\">
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                  <CardDescription>Detailed expense analysis by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className=\"overflow-x-auto\">
                    <table className=\"w-full\">
                      <thead>
                        <tr className=\"border-b\">
                          <th className=\"text-left py-3 px-4\">Category</th>
                          <th className=\"text-right py-3 px-4\">Amount</th>
                          <th className=\"text-right py-3 px-4\">% of Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(projection.expenses_by_category)
                          .sort(([, a], [, b]) => b - a)
                          .map(([category, amount], index) => (
                          <tr key={index} className=\"border-b hover:bg-slate-50\">
                            <td className=\"py-3 px-4\">{category}</td>
                            <td className=\"text-right py-3 px-4\">₹{amount.toLocaleString()}</td>
                            <td className=\"text-right py-3 px-4\">
                              {((amount / projection.total_expenses) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value=\"expenses\" data-testid=\"expenses-content\">
            <Card className=\"bg-white shadow-lg\">
              <CardHeader>
                <CardTitle>Edit Your Expenses</CardTitle>
                <CardDescription>Modify amounts to see how changes affect your savings goal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className=\"space-y-4 mb-6\">
                  <div>
                    <Label htmlFor=\"income\">Monthly Income (₹)</Label>
                    <Input
                      id=\"income\"
                      type=\"number\"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
                      data-testid=\"income-input\"
                    />
                  </div>
                </div>

                <div className=\"space-y-4 mb-6 max-h-96 overflow-y-auto\">
                  {expenses.map((expense, index) => (
                    <div key={index} className=\"grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg\">
                      <div>
                        <Label className=\"text-xs\">Category</Label>
                        <Input
                          value={expense.category}
                          onChange={(e) => handleExpenseChange(index, 'category', e.target.value)}
                          className=\"mt-1\"
                        />
                      </div>
                      <div>
                        <Label className=\"text-xs\">Subcategory</Label>
                        <Input
                          value={expense.subcategory}
                          onChange={(e) => handleExpenseChange(index, 'subcategory', e.target.value)}
                          className=\"mt-1\"
                        />
                      </div>
                      <div>
                        <Label className=\"text-xs\">Amount (₹)</Label>
                        <Input
                          type=\"number\"
                          value={expense.amount}
                          onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)}
                          className=\"mt-1\"
                          data-testid={`expense-amount-${index}`}
                        />
                      </div>
                      <div>
                        <Label className=\"text-xs\">Frequency</Label>
                        <select
                          value={expense.frequency}
                          onChange={(e) => handleExpenseChange(index, 'frequency', e.target.value)}
                          className=\"w-full mt-1 px-3 py-2 border border-slate-300 rounded-md\"
                        >
                          <option value=\"monthly\">Monthly</option>
                          <option value=\"bimonthly\">Bi-monthly</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div className=\"flex gap-4\">
                  <Button 
                    onClick={handleRecalculate} 
                    className=\"flex-1\"
                    data-testid=\"recalculate-button\"
                  >
                    <TrendingUp className=\"w-4 h-4 mr-2\" />
                    Recalculate
                  </Button>
                  <Button 
                    onClick={handleDownloadExcel} 
                    variant=\"outline\"
                    className=\"flex-1\"
                    data-testid=\"download-excel-button\"
                  >
                    <Download className=\"w-4 h-4 mr-2\" />
                    Download Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
"
