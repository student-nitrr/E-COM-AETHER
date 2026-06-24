"use client";

import { DollarSign, ShoppingCart, Package, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const REVENUE_DATA = [
  { name: "Jan", total: 4500 },
  { name: "Feb", total: 5200 },
  { name: "Mar", total: 4800 },
  { name: "Apr", total: 6100 },
  { name: "May", total: 5900 },
  { name: "Jun", total: 8400 },
  { name: "Jul", total: 9200 },
];

const RECENT_ORDERS = [
  { id: "ORD-001", customer: "John Doe", date: "2023-10-24", total: 125.00, status: "Delivered" },
  { id: "ORD-002", customer: "Jane Smith", date: "2023-10-24", total: 45.00, status: "Processing" },
  { id: "ORD-003", customer: "Robert Johnson", date: "2023-10-23", total: 210.00, status: "Shipped" },
  { id: "ORD-004", customer: "Emily Davis", date: "2023-10-23", total: 85.00, status: "Delivered" },
  { id: "ORD-005", customer: "Michael Wilson", date: "2023-10-22", total: 320.00, status: "Processing" },
];

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-10 pb-12">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-light uppercase tracking-[0.2em] text-foreground">Dashboard</h1>
        <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-foreground-secondary mt-2">Overview of your store's performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-none border border-card-border flex flex-col gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-center text-foreground-secondary">
            <span className="text-[10px] font-sans uppercase tracking-widest">Total Revenue</span>
            <DollarSign className="h-4 w-4 text-accent" />
          </div>
          <span className="text-2xl font-sans tracking-wider text-foreground font-semibold">{formatCurrency(44100)}</span>
          <span className="text-[9px] font-sans uppercase tracking-widest text-success/90 font-semibold">+20.1% from last month</span>
        </div>
        
        <div className="bg-white p-6 rounded-none border border-card-border flex flex-col gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-center text-foreground-secondary">
            <span className="text-[10px] font-sans uppercase tracking-widest">Orders</span>
            <ShoppingCart className="h-4 w-4 text-accent" />
          </div>
          <span className="text-2xl font-sans tracking-wider text-foreground font-semibold">+2,350</span>
          <span className="text-[9px] font-sans uppercase tracking-widest text-success/90 font-semibold">+15% from last month</span>
        </div>

        <div className="bg-white p-6 rounded-none border border-card-border flex flex-col gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-center text-foreground-secondary">
            <span className="text-[10px] font-sans uppercase tracking-widest">Products</span>
            <Package className="h-4 w-4 text-accent" />
          </div>
          <span className="text-2xl font-sans tracking-wider text-foreground font-semibold">142</span>
          <span className="text-[9px] font-sans uppercase tracking-widest text-success/90 font-semibold">+4 new this week</span>
        </div>

        <div className="bg-white p-6 rounded-none border border-card-border flex flex-col gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-center text-foreground-secondary">
            <span className="text-[10px] font-sans uppercase tracking-widest">Active Users</span>
            <Users className="h-4 w-4 text-accent" />
          </div>
          <span className="text-2xl font-sans tracking-wider text-foreground font-semibold">+573</span>
          <span className="text-[9px] font-sans uppercase tracking-widest text-foreground-secondary/70 font-semibold">Since last hour</span>
        </div>
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-none border border-card-border shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <h2 className="font-serif text-base uppercase tracking-widest font-light text-foreground mb-8">Revenue Overview</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REVENUE_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EFEA" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7A7975', fontSize: 10, fontFamily: 'var(--font-inter)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7A7975', fontSize: 10, fontFamily: 'var(--font-inter)' }} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '0px', border: '1px solid #E8E7E3', boxShadow: 'none', backgroundColor: '#FCFCFB' }}
                  formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                />
                <Line type="monotone" dataKey="total" stroke="#C5A880" strokeWidth={2} dot={{ r: 3, fill: '#C5A880' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-none border border-card-border shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col">
          <h2 className="font-serif text-base uppercase tracking-widest font-light text-foreground mb-8">Recent Orders</h2>
          <div className="flex-1 flex flex-col gap-5">
            {RECENT_ORDERS.map((order) => (
              <div key={order.id} className="flex justify-between items-center pb-4 border-b border-card-border/50 last:border-0 last:pb-0">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-foreground font-sans uppercase tracking-wider">{order.customer}</span>
                  <span className="text-[9px] font-sans uppercase tracking-widest text-foreground-secondary/70">{order.id}</span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs font-semibold text-foreground tracking-wider">{formatCurrency(order.total)}</span>
                  <span className={`text-[8px] font-sans uppercase tracking-widest font-semibold px-2 py-0.5 border rounded-none ${
                    order.status === 'Delivered' ? 'bg-green-50 border-green-200 text-green-700' :
                    order.status === 'Processing' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                    'bg-background-secondary border-card-border text-foreground-secondary'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
